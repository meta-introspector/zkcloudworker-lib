import { Cache, PrivateKey } from "o1js";
import { Cloud } from "./cloud";
import { makeString } from "../mina";
import { saveFile, loadFile, saveBinaryFile, loadBinaryFile } from "./files";
export class LocalCloud extends Cloud {
    constructor(params) {
        const { job, chain, cache, stepId, localWorker } = params;
        const { id, jobId, developer, repo, task, userId, args, metadata, taskId } = job;
        super({
            id: id,
            jobId: jobId,
            stepId: stepId ?? "stepId",
            taskId: taskId ?? "taskId",
            cache: cache ?? Cache.FileSystem("./cache"),
            developer: developer,
            repo: repo,
            task: task,
            userId: userId,
            args: args,
            metadata: metadata,
            isLocalCloud: true,
            chain,
        });
        this.localWorker = localWorker;
    }
    async getDeployer() {
        const deployer = process.env.DEPLOYER;
        return deployer === undefined ? undefined : PrivateKey.fromBase58(deployer);
    }
    async releaseDeployer(txsHashes) {
        console.log("LocalCloud: releaseDeployer", txsHashes);
    }
    async log(msg) {
        console.log("LocalCloud:", msg);
    }
    async getDataByKey(key) {
        const value = LocalStorage.data[key];
        return value;
    }
    async saveDataByKey(key, value) {
        if (value !== undefined)
            LocalStorage.data[key] = value;
        else
            delete LocalStorage.data[key];
    }
    async saveFile(filename, value) {
        await saveBinaryFile({ data: value, filename });
    }
    async loadFile(filename) {
        const data = await loadBinaryFile(filename);
        return data;
    }
    async loadEnvironment(password) {
        throw new Error("Method not implemented.");
    }
    static generateId() {
        return "local." + Date.now().toString() + "." + makeString(32);
    }
    static async addTransactions(transactions) {
        const timeReceived = Date.now();
        const txId = [];
        transactions.forEach((tx) => {
            const id = LocalCloud.generateId();
            LocalStorage.transactions[id] = { transaction: tx, timeReceived };
            txId.push(id);
        });
        return txId;
    }
    async deleteTransaction(txId) {
        if (LocalStorage.transactions[txId] === undefined)
            throw new Error(`deleteTransaction: Transaction ${txId} not found`);
        delete LocalStorage.transactions[txId];
    }
    async getTransactions() {
        const txs = Object.keys(LocalStorage.transactions).map((txId) => {
            const { transaction, timeReceived } = LocalStorage.transactions[txId];
            return {
                txId,
                transaction,
                timeReceived,
            };
        });
        return txs;
    }
    static async run(params) {
        const { command, data, chain, localWorker } = params;
        const { developer, repo, transactions, task, userId, args, metadata } = data;
        const timeCreated = Date.now();
        const jobId = LocalCloud.generateId();
        const job = {
            id: "local",
            jobId,
            developer,
            repo,
            task,
            userId,
            args,
            metadata,
            txNumber: command === "recursiveProof" ? transactions.length : 1,
            timeCreated,
            timeCreatedString: new Date(timeCreated).toISOString(),
            timeStarted: timeCreated,
            jobStatus: "started",
            maxAttempts: 0,
        };
        const cloud = new LocalCloud({
            job,
            chain,
            localWorker,
        });
        const worker = await localWorker(cloud);
        if (worker === undefined)
            throw new Error("worker is undefined");
        const result = command === "recursiveProof"
            ? await LocalCloud.sequencer({
                worker,
                data,
            })
            : command === "execute"
                ? await worker.execute(transactions)
                : undefined;
        const timeFinished = Date.now();
        if (result !== undefined) {
            job.jobStatus = "finished";
            job.timeFinished = timeFinished;
            job.result = result;
        }
        else {
            job.jobStatus = "failed";
            job.timeFailed = timeFinished;
        }
        job.maxAttempts = 1;
        job.billedDuration = timeFinished - timeCreated;
        LocalStorage.jobs[jobId] = job;
        return jobId;
    }
    async recursiveProof(data) {
        return await LocalCloud.run({
            command: "recursiveProof",
            data: {
                developer: this.developer,
                repo: this.repo,
                transactions: data.transactions,
                task: data.task ?? "recursiveProof",
                userId: data.userId,
                args: data.args,
                metadata: data.metadata,
            },
            chain: this.chain,
            localWorker: this.localWorker,
        });
    }
    async execute(data) {
        return await LocalCloud.run({
            command: "execute",
            data: {
                developer: this.developer,
                repo: this.repo,
                transactions: data.transactions,
                task: data.task,
                userId: data.userId,
                args: data.args,
                metadata: data.metadata,
            },
            chain: this.chain,
            localWorker: this.localWorker,
        });
    }
    async jobResult(jobId) {
        return LocalStorage.jobs[jobId];
    }
    async addTask(data) {
        const taskId = LocalCloud.generateId();
        LocalStorage.tasks[taskId] = {
            ...data,
            id: "local",
            taskId,
            timeCreated: Date.now(),
            developer: this.developer,
            repo: this.repo,
            chain: this.chain,
        };
        return taskId;
    }
    async deleteTask(taskId) {
        if (LocalStorage.tasks[taskId] === undefined)
            throw new Error(`deleteTask: Task ${taskId} not found`);
        delete LocalStorage.tasks[taskId];
    }
    async processTasks() {
        await LocalCloud.processLocalTasks({
            developer: this.developer,
            repo: this.repo,
            localWorker: this.localWorker,
            chain: this.chain,
        });
    }
    static async processLocalTasks(params) {
        const { developer, repo, localWorker, chain } = params;
        for (const taskId in LocalStorage.tasks) {
            const data = LocalStorage.tasks[taskId];
            const jobId = LocalCloud.generateId();
            const timeCreated = Date.now();
            if (data.startTime !== undefined && data.startTime < timeCreated)
                continue;
            const job = {
                id: "local",
                jobId: jobId,
                taskId: taskId,
                developer,
                repo,
                task: data.task,
                userId: data.userId,
                args: data.args,
                metadata: data.metadata,
                txNumber: 1,
                timeCreated: timeCreated,
                timeCreatedString: new Date(timeCreated).toISOString(),
                timeStarted: Date.now(),
                jobStatus: "started",
                maxAttempts: 0,
            };
            const cloud = new LocalCloud({
                job,
                chain,
                localWorker,
            });
            const worker = await localWorker(cloud);
            const result = await worker.task();
            job.timeFinished = Date.now();
            job.maxAttempts = 1;
            job.billedDuration = job.timeFinished - timeCreated;
            if (result !== undefined) {
                job.jobStatus = "finished";
                job.result = result;
            }
            else {
                job.jobStatus = "failed";
            }
            LocalStorage.jobs[jobId] = job;
        }
        let count = 0;
        for (const task in LocalStorage.tasks)
            count++;
        return count;
    }
    static async sequencer(params) {
        const { worker, data } = params;
        const { transactions } = data;
        if (transactions.length === 0)
            throw new Error("No transactions to process");
        const proofs = [];
        for (const transaction of transactions) {
            const result = await worker.create(transaction);
            if (result === undefined)
                throw new Error("Failed to create proof");
            proofs.push(result);
        }
        let proof = proofs[0];
        for (let i = 1; i < proofs.length; i++) {
            const result = await worker.merge(proof, proofs[i]);
            if (result === undefined)
                throw new Error("Failed to merge proofs");
            proof = result;
        }
        return proof;
    }
}
export class LocalStorage {
    static async saveData(name) {
        const data = {
            jobs: LocalStorage.jobs,
            data: LocalStorage.data,
            transactions: LocalStorage.transactions,
            tasks: LocalStorage.tasks,
        };
        const filename = name + ".cloud";
        await saveFile({ data, filename });
    }
    static async loadData(name) {
        const filename = name + ".cloud";
        const data = await loadFile(filename);
        if (data === undefined)
            return;
        LocalStorage.jobs = data.jobs;
        LocalStorage.data = data.data;
        LocalStorage.transactions = data.transactions;
        LocalStorage.tasks = data.tasks;
    }
}
LocalStorage.jobs = {};
LocalStorage.data = {};
LocalStorage.transactions = {};
LocalStorage.tasks = {};
//# sourceMappingURL=local.js.map