export class Cloud {
    constructor(params) {
        const { id, jobId, stepId, taskId, cache, developer, repo, task, userId, args, metadata, isLocalCloud, chain, } = params;
        this.id = id;
        this.jobId = jobId;
        this.stepId = stepId;
        this.taskId = taskId;
        this.cache = cache;
        this.developer = developer;
        this.repo = repo;
        this.task = task;
        this.userId = userId;
        this.args = args;
        this.metadata = metadata;
        this.isLocalCloud = isLocalCloud ?? false;
        this.chain = chain;
    }
}
export class zkCloudWorker {
    constructor(cloud) {
        this.cloud = cloud;
    }
    // To verify the SmartContract code
    async deployedContracts() {
        return [];
    }
    // Those methods should be implemented for recursive proofs calculations
    async create(transaction) {
        return undefined;
    }
    async merge(proof1, proof2) {
        return undefined;
    }
    // Those methods should be implemented for anything except for recursive proofs
    async execute(transactions) {
        return undefined;
    }
    // process the transactions received by the cloud
    async processTransactions(transactions) { }
    // process the task defined by the developer
    async task() {
        return undefined;
    }
}
//# sourceMappingURL=cloud.js.map