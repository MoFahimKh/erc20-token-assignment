/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, API_KEY } = process.env;
if (!PRIVATE_KEY || !API_KEY) {
  throw new Error("Please define PRIVATE_KEY and API_KEY in your .env file");
}

module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
};
