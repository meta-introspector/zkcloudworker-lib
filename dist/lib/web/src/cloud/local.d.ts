/// <reference types="node" />
import { Cloud, zkCloudWorker } from "./cloud";
import { JobData } from "./job";
import { TaskData } from "./task";
import { blockchain } from "../networks";
import { CloudTransaction, DeployerKeyPair } from "./cloud";
import { ApiCommand } from "../api/api";
/**
 * LocalCloud is a cloud that runs on the local machine for testing and development
 * It uses LocalStorage to store jobs, tasks, transactions, and data
 * It uses a localWorker to execute the tasks
 * It can be used to test the cloud functionality without deploying to the cloud
 * @param localWorker the worker to execute the tasks
 */
export declare class LocalCloud extends Cloud {
    readonly localWorker: (cloud: Cloud) => Promise<zkCloudWorker>;
    /**
     * Constructor for LocalCloud
     * @param params the parameters to create the LocalCloud
     * @param job the job data
     * @param chain the blockchain to execute the job on, can be any blockchain, not only local
     * @param cache the cache folder
     * @param stepId the step id
     * @param localWorker the worker to execute the tasks
     */
    constructor(params: {
        job: JobData;
        chain: blockchain;
        cache?: string;
        stepId?: string;
        localWorker: (cloud: Cloud) => Promise<zkCloudWorker>;
    });
    /**
     * Provides the deployer key pair for testing and development
     * @returns the deployer key pair
     */
    getDeployer(): Promise<DeployerKeyPair | undefined>;
    /**
     * Releases the deployer key pair
     */
    releaseDeployer(params: {
        publicKey: string;
        txsHashes: string[];
    }): Promise<void>;
    /**
     * Gets the data by key
     * @param key the key to get the data
     * @returns the data
     */
    getDataByKey(key: string): Promise<string | undefined>;
    /**
     * Saves the data by key
     * @param key the key to save the data
     * @param value the value to save
     */
    saveDataByKey(key: string, value: string | undefined): Promise<void>;
    /**
     * Saves the file
     * @param filename the filename to save
     * @param value the value to save
     */
    saveFile(filename: string, value: Buffer): Promise<void>;
    /**
     * Loads the file
     * @param filename
     * @returns the file data
     */
    loadFile(filename: string): Promise<Buffer | undefined>;
    /**
     * Loads the environment
     * @param password
     */
    loadEnvironment(password: string): Promise<void>;
    /**
     * Generates an id for local cloud
     * @returns generated unique id
     */
    private static generateId;
    /**
     * Adds transactions to the local cloud
     * @param transactions the transactions to add
     * @returns the transaction ids
     */
    static addTransactions(transactions: string[]): Promise<string[]>;
    /**
     * Deletes a transaction from the local cloud
     * @param txId the transaction id to delete
     */
    deleteTransaction(txId: string): Promise<void>;
    getTransactions(): Promise<CloudTransaction[]>;
    /**
     * Runs the worker in the local cloud
     * @param params the parameters to run the worker
     * @param params.command the command to run
     * @param params.data the data to use
     * @param params.data.developer the developer of the repo
     * @param params.data.repo the repo
     * @param params.data.transactions the transactions to process
     * @param params.data.task the task to execute
     * @param params.data.userId the user id
     * @param params.data.args the arguments for the job
     * @param params.data.metadata the metadata for the job
     * @param params.chain the blockchain to execute the job on
     * @param params.localWorker the worker to execute the tasks
     * @returns the job id
     */
    static run(params: {
        command: ApiCommand;
        data: {
            developer: string;
            repo: string;
            transactions: string[];
            task: string;
            userId?: string;
            args?: string;
            metadata?: string;
        };
        chain: blockchain;
        localWorker: (cloud: Cloud) => Promise<zkCloudWorker>;
    }): Promise<string>;
    /**
     * Runs the recursive proof in the local cloud
     * @param data the data to use
     * @param data.transactions the transactions to process
     * @param data.task the task to execute
     * @param data.userId the user id
     * @param data.args the arguments for the job
     * @param data.metadata the metadata for the job
     * @returns the job id
     */
    recursiveProof(data: {
        transactions: string[];
        task?: string;
        userId?: string;
        args?: string;
        metadata?: string;
    }): Promise<string>;
    /**
     * Executes the task in the local cloud
     * @param data the data to use
     * @param data.transactions the transactions to process
     * @param data.task the task to execute
     * @param data.userId the user id
     * @param data.args the arguments for the job
     * @param data.metadata the metadata for the job
     * @returns the job id
     */
    execute(data: {
        transactions: string[];
        task: string;
        userId?: string;
        args?: string;
        metadata?: string;
    }): Promise<string>;
    /**
     * Gets the job result
     * @param jobId the job id
     * @returns the job data
     */
    jobResult(jobId: string): Promise<JobData | undefined>;
    /**
     * Adds a task to the local cloud
     * @param data the data to use
     * @param data.task the task to execute
     * @param data.startTime the start time for the task
     * @param data.userId the user id
     * @param data.args the arguments for the job
     * @param data.metadata the metadata for the job
     * @returns the task id
     */
    addTask(data: {
        task: string;
        startTime?: number;
        userId?: string;
        args?: string;
        metadata?: string;
    }): Promise<string>;
    /**
     * Deletes a task from the local cloud
     * @param taskId the task id to delete
     */
    deleteTask(taskId: string): Promise<void>;
    /**
     * Processes the tasks in the local cloud
     */
    processTasks(): Promise<void>;
    /**
     * Processes the local tasks
     * @param params the parameters to process the local tasks
     * @param params.developer the developer of the repo
     * @param params.repo the repo
     * @param params.localWorker the worker to execute the tasks
     * @param params.chain the blockchain to execute the job on
     */
    static processLocalTasks(params: {
        developer: string;
        repo: string;
        localWorker: (cloud: Cloud) => Promise<zkCloudWorker>;
        chain: blockchain;
    }): Promise<number>;
    /**
     * Runs the sequencer in the local cloud
     * @param params the parameters to run the sequencer
     * @param params.worker the worker to execute the tasks
     * @param params.data the data to use
     * @param params.data.developer the developer of the repo
     * @param params.data.repo the repo
     * @param params.data.transactions the transactions to process
     * @param params.data.task the task to execute
     * @param params.data.userId the user id
     * @param params.data.args the arguments for the job
     * @param params.data.metadata the metadata for the job
     * @returns the proof
     */
    static sequencer(params: {
        worker: zkCloudWorker;
        data: {
            developer: string;
            repo: string;
            transactions: string[];
            task?: string;
            userId?: string;
            args?: string;
            metadata?: string;
        };
    }): Promise<string>;
}
/**
 * LocalStorage is a local storage for the local cloud
 * It stores jobs, tasks, transactions, and data
 * It can be used to test the cloud functionality without deploying to the cloud
 * @param jobs the jobs
 * @param data the data
 * @param transactions the transactions
 * @param tasks the tasks
 */
export declare class LocalStorage {
    static jobs: {
        [key: string]: JobData;
    };
    static data: {
        [key: string]: string;
    };
    static transactions: {
        [key: string]: {
            transaction: string;
            timeReceived: number;
        };
    };
    static tasks: {
        [key: string]: TaskData;
    };
    /**
     * Saves the data
     * @param name the name to save the data
     */
    static saveData(name: string): Promise<void>;
    /**
     * Loads the data
     * @param name the name to load the data
     */
    static loadData(name: string): Promise<void>;
}
