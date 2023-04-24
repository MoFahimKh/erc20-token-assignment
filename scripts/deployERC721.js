async function deployERC721() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying ERC721 token...`);
    const NFT = await ethers.getContractFactory('MfNft');
    const nft = await NFT.deploy("MfNft","MFT");
    console.log(`ERC721 token deployed at ${nft.address}`);
    return nft;
  }
  
  async function main() {
    const erc721Token = await deployERC721();
  }
  
  main().catch((error) => {
    console.error(error);
    process.exit(0);
  });