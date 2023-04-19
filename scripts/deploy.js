// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  //erc20 deploy script
 const [deployer] = await ethers.getSigners();
 console.log(`Deployer address : ${deployer.address}`);
const initialSupply =  1000000000000000; 
 const Token = await ethers.getContractFactory('MfToken');
 const token = await Token.deploy(initialSupply);
 console.log(`Token address : ${token.address}`);

  //erc721 deploy script
const NFT = await ethers.getContractFactory('MfNft');
 const nft = await NFT.deploy("MfNft","MFT");
 console.log(`NFT address : ${nft.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exit(0);
});
