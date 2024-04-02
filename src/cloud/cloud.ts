import { Cache, PrivateKey, PublicKey, SmartContract } from "o1js";
import { blockchain } from "../networks";

export interface DeployedSmartContract {
  address: PublicKey;
  contract: SmartContract;
  chain: blockchain;
}
export abstract class Cloud {
  readonly jobId: string;
  readonly stepId: string;
  readonly cache: Cache;
  readonly developer: string;
  readonly repo: string;
  readonly task?: string;
  readonly userId?: string;
  readonly args?: string;
  readonly metadata?: string;
  readonly isLocalCloud: boolean;

  constructor(params: {
    jobId: string;
    stepId: string;
    cache: Cache;
    developer: string;
    repo: string;
    task?: string;
    userId?: string;
    args?: string;
    metadata?: string;
    isLocalCloud?: boolean;
  }) {
    const {
      jobId,
      stepId,
      cache,
      developer,
      repo,
      task,
      userId,
      args,
      metadata,
      isLocalCloud,
    } = params;
    this.jobId = jobId;
    this.stepId = stepId;
    this.cache = cache;
    this.developer = developer;
    this.repo = repo;
    this.task = task;
    this.userId = userId;
    this.args = args;
    this.metadata = metadata;
    this.isLocalCloud = isLocalCloud ?? false;
  }

  // TODO: change it to the sign method to protect the private key
  abstract getDeployer(): Promise<PrivateKey>;
  abstract log(msg: string): void;
  abstract getDataByKey(key: string): Promise<string | undefined>;
  abstract saveDataByKey(key: string, value: string): Promise<void>;
  abstract saveFile(filename: string, value: Buffer): Promise<void>;
  abstract loadFile(filename: string): Promise<Buffer | undefined>;
  abstract loadEnvironment(password: string): Promise<void>;
}

export abstract class zkCloudWorker {
  readonly cloud: Cloud;

  constructor(cloud: Cloud) {
    this.cloud = cloud;
  }

  // To verify the SmartContract code
  abstract deployedContracts(): Promise<DeployedSmartContract[]>;

  // Those methods should be implemented for recursive proofs calculations
  abstract create(transaction: string): Promise<string | undefined>;
  abstract merge(proof1: string, proof2: string): Promise<string | undefined>;

  // Those methods should be implemented for anything except for recursive proofs
  abstract execute(): Promise<string | undefined>;
}
