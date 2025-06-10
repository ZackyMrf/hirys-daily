require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    irysTestnet: {
      url: "https://testnet-rpc.irys.xyz/v1/execution-rpc",
      chainId: 1270,
      accounts: [process.env.PRIVATE_KEY],
      gas: 5000000,
      gasPrice: 1000000000, // 1 gwei
    },
  }
};
