export {
  initBlockchain,
  Memory,
  makeString,
  sleep,
  accountBalance,
  accountBalanceMina,
  formatTime,
  MinaNetworkInstance,
  currentNetwork,
  getNetworkIdHash,
  getCurrentNetwork,
  getDeployer,
};

import {
  Mina,
  PublicKey,
  PrivateKey,
  UInt64,
  fetchAccount,
  Field,
  Encoding,
  Poseidon,
  Lightnet,
} from "o1js";
import { networks, blockchain, MinaNetwork, Local } from "./networks";

interface MinaNetworkInstance {
  keys: Mina.TestPublicKey[];
  network: MinaNetwork;
  networkIdHash: Field;
}

let currentNetwork: MinaNetworkInstance | undefined = undefined;

function getNetworkIdHash(): Field {
  if (currentNetwork === undefined) {
    throw new Error("Network is not initialized");
  }
  return currentNetwork.networkIdHash;
}

function getCurrentNetwork(): MinaNetworkInstance {
  if (currentNetwork === undefined) {
    throw new Error("Network is not initialized");
  }
  return currentNetwork;
}

function getDeployer(): Mina.TestPublicKey | undefined {
  if (currentNetwork === undefined) {
    throw new Error("Network is not initialized");
  }
  if (currentNetwork.keys.length < 1) return undefined;
  return currentNetwork.keys[0];
}

async function initBlockchain(
  instance: blockchain,
  deployersNumber: number = 0
): Promise<MinaNetworkInstance> {
  if (instance === "mainnet") {
    throw new Error("Mainnet is not supported yet by zkApps");
  }
  const networkIdHash = Poseidon.hash(Encoding.stringToFields(instance));

  // await used for compatibility with future versions of o1js
  if (instance === "local") {
    const local = await Mina.LocalBlockchain({
      proofsEnabled: true,
    });
    Mina.setActiveInstance(local);
    if (deployersNumber > local.testAccounts.length)
      throw new Error("Not enough test accounts");
    currentNetwork = {
      keys: local.testAccounts,
      network: Local,
      networkIdHash,
    };
    return currentNetwork;
  }

  const network = networks.find((n) => n.chainId === instance);
  if (network === undefined) {
    throw new Error("Unknown network");
  }

  const networkInstance = Mina.Network({
    mina: network.mina,
    archive: network.archive,
    lightnetAccountManager: network.accountManager,
  });
  Mina.setActiveInstance(networkInstance);

  const keys: Mina.TestPublicKey[] = [];

  if (deployersNumber > 0) {
    if (instance === "lightnet") {
      for (let i = 0; i < deployersNumber; i++) {
        const keyPair = await Lightnet.acquireKeyPair();
        const key = Mina.TestPublicKey(keyPair.privateKey);
        keys.push(key);
      }
    } else {
      const deployers = process.env.DEPLOYERS;
      if (
        deployers === undefined ||
        Array.isArray(deployers) === false ||
        deployers.length < deployersNumber
      )
        throw new Error("Deployers are not set");
      for (let i = 0; i < deployersNumber; i++) {
        const privateKey = PrivateKey.fromBase58(deployers[i]);
        const key = Mina.TestPublicKey(privateKey);
        keys.push(key);
      }
    }
  }

  currentNetwork = {
    keys,
    network,
    networkIdHash,
  };
  return currentNetwork;
}

async function accountBalance(address: PublicKey): Promise<UInt64> {
  await fetchAccount({ publicKey: address });
  if (Mina.hasAccount(address)) return Mina.getBalance(address);
  else return UInt64.from(0);
}

async function accountBalanceMina(address: PublicKey): Promise<number> {
  return Number((await accountBalance(address)).toBigInt()) / 1e9;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeString(length: number): string {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  let outString: string = ``;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  const inOptions: string = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;

  for (let i = 0; i < length; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  return outString;
}

function formatTime(ms: number): string {
  if (ms === undefined) return "";
  if (ms < 1000) return ms.toString() + " ms";
  if (ms < 60 * 1000)
    return parseInt((ms / 1000).toString()).toString() + " sec";
  if (ms < 60 * 60 * 1000) {
    const minutes = parseInt((ms / 1000 / 60).toString());
    const seconds = parseInt(((ms - minutes * 60 * 1000) / 1000).toString());
    return minutes.toString() + " min " + seconds.toString() + " sec";
  } else {
    const hours = parseInt((ms / 1000 / 60 / 60).toString());
    const minutes = parseInt(
      ((ms - hours * 60 * 60 * 1000) / 1000 / 60).toString()
    );
    return hours.toString() + " h " + minutes.toString() + " min";
  }
}

class Memory {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  static rss: number = 0;
  constructor() {
    Memory.rss = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  public static info(description: string = ``, fullInfo: boolean = false) {
    const memoryData = process.memoryUsage();
    const formatMemoryUsage = (data: number) =>
      `${Math.round(data / 1024 / 1024)} MB`;
    const oldRSS = Memory.rss;
    Memory.rss = Math.round(memoryData.rss / 1024 / 1024);

    const memoryUsage = fullInfo
      ? {
          step: `${description}:`,
          rssDelta: `${(oldRSS === 0
            ? 0
            : Memory.rss - oldRSS
          ).toString()} MB -> Resident Set Size memory change`,
          rss: `${formatMemoryUsage(
            memoryData.rss
          )} -> Resident Set Size - total memory allocated`,
          heapTotal: `${formatMemoryUsage(
            memoryData.heapTotal
          )} -> total size of the allocated heap`,
          heapUsed: `${formatMemoryUsage(
            memoryData.heapUsed
          )} -> actual memory used during the execution`,
          external: `${formatMemoryUsage(
            memoryData.external
          )} -> V8 external memory`,
        }
      : `RSS memory ${description}: ${formatMemoryUsage(memoryData.rss)}${
          oldRSS === 0
            ? ``
            : `, changed by ` + (Memory.rss - oldRSS).toString() + ` MB`
        }`;

    console.log(memoryUsage);
  }
}
