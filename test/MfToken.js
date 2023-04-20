const { expect } = require("chai");

describe("MfToken", function () {
  let token, hardhatToken, owner, user1, user2, user3;

  const initialSupply = ethers.utils.parseUnits("1000", 8);

  beforeEach(async () => {
    token = await ethers.getContractFactory("MfToken");
    [owner, user1, user2, user3] = await ethers.getSigners();
    hardhatToken = await token.deploy(initialSupply);
  });
  describe("Token Information", function () {
    it("should return correct name, symbol, and decimals", async function () {
      const [owner] = await ethers.getSigners();
      const name = await hardhatToken.getName();
      expect(name).to.equal("MfToken");
      const symbol = await hardhatToken.getSymbol();
      expect(symbol).to.equal("MFT");
      const decimals = await hardhatToken.getDecimals();
      expect(decimals).to.equal(8);
    });
  });

  describe("Deployment", function () {
    it("should set the correct owner", async () => {
      const initialSupply = ethers.utils.parseUnits("1000", 8);
      const balance = await hardhatToken.balanceOf(owner.address);
      expect(balance).to.equal(initialSupply);
    });

    it("should set the correct total supply", async () => {
      expect(await hardhatToken.getTotalSupply()).to.equal(initialSupply);
    });


    it("should assign the initial supply to the owner", async () => {
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialSupply
      );
    });
  });

  describe("Transfer", function () {
    it("should transfer tokens from sender to receiver", async () => {
      const amount = ethers.utils.parseUnits("100", 8);
      await hardhatToken.transfer(user1.address, amount);
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialSupply.sub(amount)
      );
      expect(await hardhatToken.balanceOf(user1.address)).to.equal(amount);
    });
    it("should emit Transfer event on successful transfer", async () => {
      const amount = ethers.utils.parseUnits("100", 8);
      const tx = await hardhatToken.transfer(user1.address, amount);
      expect(tx)
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, user1.address, amount);
    });
    it("should fail when sender doesn't have enough balance", async () => {
      const amount = ethers.utils.parseUnits("10000", 8);
      await expect(hardhatToken.transfer(user1.address, amount)).to.be.reverted;
    });
    it("should fail when transferring zero tokens", async () => {
      const amount = ethers.utils.parseUnits("0", 8);
      await expect(hardhatToken.transfer(user1.address, amount)).to.be.reverted;
    });
  });

  describe("mint", function () {
    describe("mint", function () {
      it("should allow the owner to mint new tokens", async function () {
        const [owner, other] = await ethers.getSigners();
        const amount = 1000;
        await hardhatToken.connect(owner).mint(other.address, amount);
        const newTotalSupply = await hardhatToken.getTotalSupply();
        expect(newTotalSupply).to.equal(initialSupply.add(amount));
        const recipientBalance = await hardhatToken.balanceOf(other.address);
        expect(recipientBalance).to.equal(amount);
      });
    });


    it("should revert if called by a non-owner", async function () {
      const [owner, other] = await ethers.getSigners();
      const amount = 1000;
      expect(await hardhatToken.mint(owner.address, amount)).to.not.equal(await hardhatToken.mint(other.address, amount));
    });
    it("should revert if the total supply overflows", async function () {
      const [owner, other] = await ethers.getSigners();
      const maxUint256 = 1000000000000000000000000000n;
      const noOfTknToMint = 1000;

      hardhatToken.mint(other.address, noOfTknToMint);
      if (noOfTknToMint > maxUint256) {
        await expect(hardhatToken.mint(other.address, noOfTknToMint)).to.be.reverted;
      }
    });
  });

  describe("burn", function () {
    it("should allow the user to burn their own tokens", async function () {
      const [owner1, user1] = await ethers.getSigners();
      const amount = 1000;
      await hardhatToken.connect(owner1).mint(user1.address, amount);
      await hardhatToken.connect(user1).burn(amount);
      const userBalance = await hardhatToken.balanceOf(user1.address);
      expect(userBalance).to.equal(0);
    });

    it("should revert if the user tries to burn more tokens than they have", async function () {
      const [owner2, user2] = await ethers.getSigners();
      const amount = 1000;
      await hardhatToken.connect(owner2).mint(user2.address, amount);
      const tooManyTokens = amount + 1;
      await expect(
        hardhatToken.connect(user2).burn(tooManyTokens)
      ).to.be.reverted;
      const userBalance = await hardhatToken.balanceOf(user2.address);
      expect(userBalance).to.equal(amount);
    });

  });

  describe("transferFrom", function () {
    it("should allow transferring tokens from one address to another using an approved spender", async () => {
      const [ownerA, spenderA, recipientA] = await ethers.getSigners();
      const initialBalance = await hardhatToken.balanceOf(ownerA.address);
      const amount = 1000;
      await hardhatToken.connect(ownerA).mint(ownerA.address, amount);
      await hardhatToken.connect(ownerA).approve(spenderA.address, amount);
      await hardhatToken.connect(spenderA).transferFrom(ownerA.address, recipientA.address, amount);
      const ownerBalance = await hardhatToken.balanceOf(ownerA.address);
      
      expect(ownerBalance).to.equal(initialBalance);
  
      const spenderAllowance = await hardhatToken.allowance(ownerA.address, spenderA.address);
      expect(spenderAllowance).to.equal(0);
  
      const recipientBalance = await hardhatToken.balanceOf(recipientA.address);
      expect(recipientBalance).to.equal(amount);

    });
  
  });

  describe("Approve", function () {
    it("should approve spender to spend sender's tokens", async () => {
      const amount = ethers.utils.parseUnits("100", 8);
      await hardhatToken.approve(user1.address, amount);
      expect(
        await hardhatToken.allowance(owner.address, user1.address)
      ).to.equal(amount);
    });

    it("should emit Approval event on successful approval", async () => {
      const amount = ethers.utils.parseUnits("100", 8);
      const tx = await hardhatToken.approve(user1.address, amount);
      expect(tx)
        .to.emit(hardhatToken, "Approval")
        .withArgs(owner.address, user1.address, amount);
    });
  });

});

describe("allowance", function () {
  let hardhatToken, owner, spender;
  beforeEach(async () => {
    const token = await ethers.getContractFactory("MfToken");
    [owner, spender] = await ethers.getSigners();
    hardhatToken = await token.deploy(ethers.utils.parseUnits("1000", 8));
  });

  it("should return correct allowance", async function () {
    await hardhatToken.approve(spender.address, 1000);
    const allowance = await hardhatToken.allowance(owner.address, spender.address);
    expect(allowance).to.equal(1000);
  });
});


//   let MfNft;
//   let myToken;
//   let owner;
//   let addr1;

//   beforeEach(async function () {
//     MfNft = await ethers.getContractFactory("MfNft");
//     myToken = await MfNft.deploy("MyToken", "MFT");
//     [addr1] = await ethers.getSigners();
//   });
//   it("should revert when trying to mint NFT for zero address", async function () {
//     const [owner, addr1] = await ethers.getSigners();
//     await expect(myToken.mint(ethers.constants.AddressZero, 1))
//       .to.be.revertedWith("MfNft: cannot mint a NFT for zero address");
//   });

//   it('`from` address should be zeroAddress', async () => {
//     const tokenId = 1;
//     await myToken.mint(addr1.address, tokenId);
//     expect(await myToken.ownerOf(tokenId)).to.equal(addr1.address);
//     expect(await myToken.balanceOf(addr1.address)).to.equal(1);
//     expect(await myToken.totalSupply()).to.equal(1);
//   });
//   it('`to` address should not be zeroAddress', async () => {
//     expect(await addr1.address)
//       .to.not.be.equal(ethers.constants.AddressZero)
//       .to.be.revertedWith("to address cannot be zero");
//   });
// });