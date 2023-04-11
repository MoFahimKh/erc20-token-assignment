require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const { PRIVATE_KEY, API_KEY } = process.env;

module.exports = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: `http://goerli.infura.io/v3/${API_KEY}`,
      accounts: ['5d4b74406a2f51fb75f66a26ae3cb27a2d8fcd2dc14c25ca6884002796b46b01'],
    },
  },
 
};
