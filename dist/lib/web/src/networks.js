export { networks, Mainnet, Berkeley, Devnet, Zeko, TestWorld2, Lightnet, Local, };
const Mainnet = {
    mina: [],
    archive: [],
    chainId: "mainnet",
};
const Local = {
    mina: [],
    archive: [],
    chainId: "local",
};
const Berkeley = {
    mina: [
        "https://api.minascan.io/node/berkeley/v1/graphql",
        "https://proxy.berkeley.minaexplorer.com/graphql",
    ],
    archive: [
        "https://api.minascan.io/archive/berkeley/v1/graphql",
        "https://archive.berkeley.minaexplorer.com",
    ],
    explorerAccountUrl: "https://minascan.io/berkeley/account/",
    explorerTransactionUrl: "https://minascan.io/berkeley/tx/",
    chainId: "berkeley",
    name: "Berkeley",
};
const Devnet = {
    mina: [
        "https://api.minascan.io/node/devnet/v1/graphql",
        "https://proxy.devnet.minaexplorer.com/graphql",
    ],
    archive: [
        "https://api.minascan.io/archive/devnet/v1/graphql",
        "https://archive.devnet.minaexplorer.com",
    ],
    explorerAccountUrl: "https://minascan.io/devnet/account/",
    explorerTransactionUrl: "https://minascan.io/devnet/tx/",
    chainId: "devnet",
    name: "Devnet",
};
const Zeko = {
    mina: ["http://sequencer-zeko-dev.dcspark.io/graphql"],
    archive: [],
    chainId: "zeko",
};
const TestWorld2 = {
    mina: ["https://api.minascan.io/node/testworld/v1/graphql"],
    archive: ["https://archive.testworld.minaexplorer.com"],
    explorerAccountUrl: "https://minascan.io/testworld/account/",
    explorerTransactionUrl: "https://minascan.io/testworld/tx/",
    chainId: "testworld2",
    name: "TestWorld2",
};
const Lightnet = {
    mina: ["http://localhost:8080/graphql"],
    archive: ["http://localhost:8282"],
    accountManager: "http://localhost:8181",
    chainId: "lighnet",
    name: "Lightnet",
};
const networks = [
    Mainnet,
    Local,
    Berkeley,
    Devnet,
    Zeko,
    TestWorld2,
    Lightnet,
];
//# sourceMappingURL=networks.js.map