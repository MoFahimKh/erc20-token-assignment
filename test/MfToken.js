const { expect } = require("chai");

describe("MfToken", function () {
  let token, hardhatToken, owner, user1, user2, user3;

  const initialSupply = ethers.utils.parseUnits("1000", 8);

  beforeEach(async () => {
    token = await ethers.getContractFactory("MfToken");
    [owner, user1, user2, user3] = await ethers.getSigners();
    hardhatToken = await token.deploy(initialSupply);
  });

  describe("Deployment", function () {
    it("should set the correct owner", async () => {
      const initialSupply = ethers.utils.parseUnits("1000", 8);
      const balance = await hardhatToken.balanceOf(owner.address);
      expect(balance).to.equal(initialSupply);
    });

    it("should set the correct total supply", async () => {
      expect(await hardhatToken.totalSupply()).to.equal(initialSupply);
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

  describe("TransferFrom", function () {
    it("should transfer tokens from approved sender to receiver", async () => {
      const amount = ethers.utils.parseUnits("100", 8);
      await hardhatToken.approve(user1.address, amount);
      await hardhatToken.transferFrom(owner.address, user2.address, amount, {
        from: user1.address,
      });
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialSupply.sub(amount)
      );
      expect(await hardhatToken.balanceOf(user2.address)).to.equal(amount);
    });
  });
});
