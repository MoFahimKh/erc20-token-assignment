// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
 const [deployer] = await ethers.getSigners();
const initialSupply =  ethers.utils.parseUnits("1000", 8);
 const Token = await ethers.getContractFactory('MfToken');
 const token = await Token.deploy(initialSupply);
 console.log(`Token address : ${token.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exit(0);
});
