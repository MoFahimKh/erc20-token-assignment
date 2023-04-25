const hre = require("hardhat");

async function main() {
    const myERC1155 = await ethers.getContractFactory('myERC1155');
    console.log('Compiling contract...');
    const contract = await myERC1155.deploy('My Token', 'MTK');
    await contract.deployed();
    console.log(`Contract deployed at address: ${contract.address}`);
  }
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
