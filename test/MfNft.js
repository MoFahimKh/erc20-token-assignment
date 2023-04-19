const { expect } = require("chai");

describe("MfNft", function () {
  let myToken;

  beforeEach(async function () {
    const MyToken = await ethers.getContractFactory("MfNft");
    myToken = await MyToken.deploy("MfNft", "MFT");
    await myToken.deployed();
  });

  it("should have the correct name", async function () {
    expect(await myToken.name()).to.equal("MfNft");
  });

  it("should have the correct symbol", async function () {
    expect(await myToken.symbol()).to.equal("MFT");
  });

  it("should have a total supply of 0 initially", async function () {
    expect(await myToken.totalSupply()).to.equal(0);
  });

  it("should return the correct balance for an address", async function () {
    const [owner, addr1] = await ethers.getSigners();
    // await myToken.transfer(addr1.address,1);
    await myToken.mint(owner.address, 1)
    expect(await myToken.balanceOf(owner.address)).to.equal(1);
    expect(await myToken.balanceOf(addr1.address)).to.equal(0);
  });

  it("should revert when querying balance for zero address", async function () {
    const zeroAddress = ethers.constants.AddressZero; //since passing string like 0x0 for zero add will fail
    await expect(myToken.balanceOf(zeroAddress)).to.be.revertedWith(
      "MfNft: balance query for the zero address"
    );
  });

});

describe("ownerOf", function () {
  let MfNft;
  let myToken;
  let owner;
  let addr1;

  beforeEach(async function () {
    MfNft = await ethers.getContractFactory("MfNft");
    myToken = await MfNft.deploy("MyToken", "MFT");
    [owner, addr1] = await ethers.getSigners();
  });

  it("should return the correct balance for an address", async function () {
    await myToken.mint(owner.address, 1)
    expect(await myToken.balanceOf(owner.address)).to.equal(1);
    expect(await myToken.balanceOf(addr1.address)).to.equal(0);
  });
  it("should give owner as zeroAddress when querying the owner of a nonexistent token ID", async function () {
    const nonexistentTokenId = 999;
    await myToken.mint(owner.address, 1)
    let ownerAddress = owner.address;
    expect(await myToken.ownerOf(nonexistentTokenId)).to.be.equal(ethers.constants.AddressZero);
    expect(await myToken.ownerOf(1)).to.be.equal(ownerAddress);
  });
});

describe("Mint NFT", function () {
  let MfNft;
  let myToken;
  let owner;
  let addr1;

  beforeEach(async function () {
    MfNft = await ethers.getContractFactory("MfNft");
    myToken = await MfNft.deploy("MyToken", "MFT");
    [addr1] = await ethers.getSigners();
  });
  it("should revert when trying to mint NFT for zero address", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await expect(myToken.mint(ethers.constants.AddressZero, 1))
      .to.be.revertedWith("MfNft: cannot mint a NFT for zero address");
  });

  it('`from` address should be zeroAddress', async () => {
    const tokenId = 1;
    await myToken.mint(addr1.address, tokenId);
    expect(await myToken.ownerOf(tokenId)).to.equal(addr1.address);
    expect(await myToken.balanceOf(addr1.address)).to.equal(1);
    expect(await myToken.totalSupply()).to.equal(1);
  });
  it('`to` address should not be zeroAddress', async () => {
    expect(await addr1.address)
      .to.not.be.equal(ethers.constants.AddressZero)
      .to.be.revertedWith("to address cannot be zero");
  });
});

describe("getApproved", function () {
  let MfNft;
  let myToken;
  let owner
  let approved;

  beforeEach(async function () {
    MfNft = await ethers.getContractFactory("MfNft");
    myToken = await MfNft.deploy("MyToken", "MFT");
    [owner, approved] = await ethers.getSigners();

  });
  it("should return the approved address for a token ID", async function () {
    const tokenId = 1;
    await myToken.mint(owner.address, tokenId);
    await myToken.approve(approved.address, tokenId);
    expect(await myToken.getApproved(tokenId)).to.equal(approved.address);
  });

  it("should revert when querying the approval for a nonexistent token ID", async function () {
    const nonexistentTokenId = 999;
    await expect(myToken.getApproved(nonexistentTokenId)).to.be.revertedWith(
      "MfNft: approved query for nonexistent token"
    );
  });
  it("approved address should not be owner address and zero address", async () => {
    const [a, b] = await ethers.getSigners();
    const tokenId = 1;
    await myToken.mint(a.address, tokenId);
    await myToken.approve(b.address, 1);
    const ownerA = await myToken.ownerOf(1);
    const approvedB = await myToken.getApproved(1);
    expect(approvedB).to.not.equal(ownerA);
    expect(approvedB).to.not.equal(ethers.constants.AddressZero);
  });
});

describe("setApprovalForAll", function () {
  let MfNft;
  let myToken;
  let owner;
  beforeEach(async function () {
    MfNft = await ethers.getContractFactory("MfNft");
    myToken = await MfNft.deploy("MyToken", "MFT");
    [owner, addr1] = await ethers.getSigners();
  });

  it("should set the approval for all tokens", async function () {
    const operator = addr1.address;
    const approved = true;
    await myToken.setApprovalForAll(operator, approved);
    const isApproved = await myToken.isApprovedForAll(owner.address, operator);
    expect(isApproved).to.be.true;
  });
});


describe("transferFrom", function () {
  let MfNft;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    MfNft = await ethers.getContractFactory("MfNft");
    myToken = await MfNft.deploy("MyToken", "MFT");
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("should transfer a token from one address to another", async function () {
    await myToken.mint(owner.address, 1);
    await myToken.approve(addr1.address, 1);
    await myToken.transferFrom(owner.address, addr2.address, 1);
    const balance1 = await myToken.balanceOf(owner.address);
    const balance2 = await myToken.balanceOf(addr2.address);
    const ownerOfToken = await myToken.ownerOf(1);
    expect(balance1).to.equal(0);
    expect(balance2).to.equal(1);
    expect(ownerOfToken).to.equal(addr2.address);
  });

  it("should revert if the token is not owned by the 'from' address", async function () {
    await myToken.mint(owner.address, 1);
    await myToken.approve(addr1.address, 1);
    await expect(myToken.transferFrom(addr2.address, addr1.address, 1)).to.be.revertedWith("MfNft: transfer of token that is not own");
  });

  it("should revert if the caller is not the owner or approved address", async function () {
    await expect(myToken.transferFrom(owner.address, addr1.address, 1)).to.be.revertedWith("MfNft: transfer caller is not owner nor approved");
  });

  it("should revert if transferring to the zero address", async function () {
    await expect(myToken.transferFrom(owner.address, ethers.constants.AddressZero, 1)).to.be.revertedWith("MfNft: transfer to the zero address");
  });
});



describe("_clearApproval", function () {
  let MfNft;
  let myToken;
  let owner;
  let addr1;
  beforeEach(async function () {
    MfNft = await ethers.getContractFactory("MfNft");
    myToken = await MfNft.deploy("MyToken", "MFT");
    [owner , addr1] = await ethers.getSigners();
  });

  it("should clear the approval for a token", async function () {
    await myToken.mint(owner.address, 1);
    await myToken.approve(addr1.address, 1);
    const approvedBefore = await myToken.getApproved(1);
    expect(approvedBefore).to.equal(addr1.address);
      await myToken.clearApproval(1) ;
    // const approvedAfter = await myToken.getApproved(1);
    // expect(approvedAfter).to.equal(address(0));
  });
});
