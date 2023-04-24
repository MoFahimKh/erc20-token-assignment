const hre = require("hardhat");

async function deployERC20(initialSupply) {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ERC20 token with initial supply of ${initialSupply}...`);
  const Token = await ethers.getContractFactory('MfToken');
  const token = await Token.deploy(initialSupply);
  console.log(`ERC20 token deployed at ${token.address}`);
  return token;
}


async function main() {
  const initialSupply = 1000000000000000;
  const erc20Token = await deployERC20(initialSupply);
}

main().catch((error) => {
  console.error(error);
  process.exit(0);
});
