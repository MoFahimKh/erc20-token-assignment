const { expect, assert } = require("chai");

describe("myERC1155 , balanceOf", function () {
  let contract;
  let owner;
  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    contract = await MyERC1155.deploy("My Token", "MYT");
    [owner] = await ethers.getSigners();
    await contract.deployed();
  });
  it("should return 0 if owner has no tokens", async function () {
    const tokenId = 0;
    const balance = await contract.balanceOf(owner.address, tokenId);
    expect(balance).to.equal(0);
  });
  it("should return the balance of the specified token for the specified owner", async function () {
    const tokenId = 0;
    const amount = 10;
    await contract.mint(owner.address, tokenId, amount, "");
    const balance = await contract.balanceOf(owner.address, tokenId);
    expect(balance).to.equal(amount);
  });
  it("should revert if owner is the zero address", async function () {
    const owner = ethers.constants.AddressZero;
    const tokenId = 0;
    await expect(contract.balanceOf(owner, tokenId)).to.be.revertedWith(
      "Owner must not be zero address"
    );
  });
});

describe("myERC1155, balanceOfBatch", function () {
  let contract;
  let owner1;
  let owner2;
  let owner3;
  let owner4;

  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    contract = await MyERC1155.deploy("My Token", "MYT");
    [owner1, owner2, owner3, owner4] = await ethers.getSigners();
    await contract.deployed();
  });

  it("should return an array with 0s if all owners have no tokens", async function () {
    const owners = [owner1.address, owner2.address, owner3.address];
    const tokenIds = [0, 1, 2];
    const balances = await contract.balanceOfBatch(owners, tokenIds);
    expect(balances).to.deep.equal([0, 0, 0]);
  });

  it("should revert if accounts and tokenIds have different lengths", async function () {
    const owners = [owner1.address, owner2.address];
    const tokenIds = [0, 1, 2];
    await assert.isRejected(
      contract.balanceOfBatch(owners, tokenIds),
      /account's length must be equal to tokenId's length!/
    );
  });

  it("should return an array with the balances of the specified tokens for the specified owners", async function () {
    const owners = [
      owner1.address,
      owner2.address,
      owner3.address,
      owner4.address,
    ];
    const tokenIds = [0, 1, 1, 4];
    const amounts = [10, 5, 3, 2];
    for (let i = 0; i < owners.length; i++) {
      await contract.mint(owners[i], tokenIds[i], amounts[i], "");
    }
    const balances = await contract.balanceOfBatch(owners, tokenIds);
    expect(balances).to.deep.equal([10, 5, 3, 2]);
  });

  it("should revert if accounts and tokenIds have different lengths", async function () {
    const owners = [owner1.address, owner2.address];
    const tokenIds = [0];
    await expect(contract.balanceOfBatch(owners, tokenIds)).to.be.revertedWith(
      "account's length must be equal to tokenId's length!"
    );
  });

  describe("myERC1155, setApprovalForAll", function () {
    let contract;
    beforeEach(async function () {
      const MyERC1155 = await ethers.getContractFactory("myERC1155");
      contract = await MyERC1155.deploy("My Token", "MYT");
      await contract.deployed();
    });
    it("should set the approval status for the specified operator", async function () {
      const operator = accounts[1];
      const approved = true;
      await contract.setApprovalForAll(operator, approved);
      const approvalStatus = await contract.isApprovedForAll(
        accounts[0],
        operator
      );
      expect(approvalStatus).to.equal(
        approved,
        "Approval status was not set correctly"
      );
    });
  });

  describe("myERC1155, uri", function () {
    it("should return the URI for the specified token ID", async function () {
      const tokenId = 1;
      const expectedUri = "";

      const uri = await contract.uri(tokenId);
      expect(uri).to.equal(expectedUri, "URI was not returned correctly");
    });
  });
});

describe("myERC1155, balanceOfBatch", function () {
  let contract;
  let owner1;
  let owner2;
  let owner3;

  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    contract = await MyERC1155.deploy("My Token", "MYT");
    [owner1, owner2, owner3] = await ethers.getSigners();
    await contract.deployed();
  });

  it("should return an array with 0s if all owners have no tokens", async function () {
    const owners = [owner1.address, owner2.address, owner3.address];
    const tokenIds = [0, 1, 2];
    const balances = await contract.balanceOfBatch(owners, tokenIds);
    expect(balances).to.deep.equal([0, 0, 0]);
  });

  it("should revert if accounts and tokenIds have different lengths", async function () {
    const owners = [owner1.address, owner2.address];
    const tokenIds = [0, 1, 2];
    await assert.isRejected(
      contract.balanceOfBatch(owners, tokenIds),
      /account's length must be equal to tokenId's length!/
    );
  });

  it("should return the correct balances of tokens for each owner", async function () {
    const tokenIds = [0, 1, 2];
    const amounts = [10, 5, 20];
    const owners = [owner1.address, owner2.address, owner3.address];
    await contract.mintBatch(owners, tokenIds, amounts, ["", "", ""], {
      from: owner1.address,
    });
    const balances = await contract.balanceOfBatch(owners, tokenIds);
    expect(balances).to.deep.equal(amounts);
  });
});

describe("myERC1155, safeTransferFrom", function () {
  let contract;
  let owner;
  let sender;
  let recipient;
  let tokenId;
  let tokenAmount;
  let tokenData;

  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    contract = await MyERC1155.deploy("My Token", "MYT");

    [owner, sender, recipient] = await ethers.getSigners();
    await contract.deployed();
    tokenId = 1;
    tokenAmount = 10;
    tokenData = "0x00";
  });

  it("should transfer tokens from sender to recipient", async function () {
    await contract.mint(owner.address, tokenId, tokenAmount, tokenData);

    expect(await contract.balanceOf(owner.address, tokenId)).to.be.equal(
      tokenAmount
    );
    await contract.setApprovalForAll(owner.address, true);
    expect(
      await contract.isApprovedForAll(owner.address, owner.address)
    ).to.be.equal(true);
    await contract.safeTransferFrom(
      owner.address,
      recipient.address,
      tokenId,
      tokenAmount,
      tokenData
    );
    const senderBalance = await contract.balanceOf(owner.address, tokenId);
    const recipientBalance = await contract.balanceOf(
      recipient.address,
      tokenId
    );
    expect(senderBalance).to.equal(0);
    expect(recipientBalance).to.equal(tokenAmount);
  });

  it("should fail if sender does not have enough tokens", async function () {
    // Attempt to transfer tokens from sender to recipient without first minting them
    await contract.mint(owner.address, tokenId, tokenAmount, tokenData);
    await assert.isRejected(
      contract.safeTransferFrom(
        owner.address,
        recipient.address,
        tokenId,
        tokenAmount + 1,
        tokenData
      ),
      /Cannot transfer amount greater than balance/
    );
  });
  it("should fail if reciever address is zero address", async function () {
    // Attempt to transfer tokens from sender to recipient without first minting them
    await contract.mint(owner.address, tokenId, tokenAmount, tokenData);
    await assert.isRejected(
      contract.safeTransferFrom(
        owner.address,
        ethers.constants.AddressZero,
        tokenId,
        tokenAmount,
        tokenData
      ),
      "VM Exception while processing transaction: reverted with reason string 'Cannot transfer to zero address'"
    );
  });

  it("should fail if sender is not authorized to transfer tokens", async function () {
    // Mint tokens to sender
    await contract.mint(sender.address, tokenId, tokenAmount, tokenData);

    // Attempt to transfer tokens from sender to recipient without first authorizing the contract
    await assert.isRejected(
      contract.safeTransferFrom(
        sender.address,
        recipient.address,
        tokenId,
        tokenAmount,
        tokenData
      ),
      /not authorized/
    );
  });
});

describe("ERC1155 , safeBatchTransferfrom", function () {
  let erc1155Token;
  let owner;
  let recipient;
  let sender;
  let tokenId;
  let tokenAmount;
  let tokenData;

  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    contract = await MyERC1155.deploy("My Token", "MYT");

    [owner, sender, recipient] = await ethers.getSigners();
    await contract.mint(owner.address, 1, 100, "");
    await contract.mint(owner.address, 2, 100, "");
    await contract.mint(owner.address, 3, 100, "");
  });

  it("should transfer tokens in batch safely", async function () {
    const ids = [1, 2, 3];
    const amounts = [10, 20, 30];
    const data = "0x00";

    await contract.connect(owner).setApprovalForAll(recipient.address, true);

    await contract
      .connect(recipient)
      .safeBatchTransferFrom(
        owner.address,
        recipient.address,
        ids,
        amounts,
        data
      );

    expect(await contract.balanceOf(recipient.address, 1)).to.equal(10);
    expect(await contract.balanceOf(recipient.address, 2)).to.equal(20);
    expect(await contract.balanceOf(recipient.address, 3)).to.equal(30);
  });

  it("should revert when transferring tokens in batch without approval", async function () {
    const ids = [1, 2, 3];
    const amounts = [10, 20, 30];
    const data = "0x";
    await expect(
      contract
        .connect(recipient)
        .safeBatchTransferFrom(
          owner.address,
          recipient.address,
          ids,
          amounts,
          data
        )
    ).to.be.revertedWith("not authorized");

    expect(ids.length).to.equal(amounts.length);
    if (amounts.length != ids.length) {
      await assert.isRejected(
        contract
          .connect(recipient)
          .safeBatchTransferFrom(
            owner.address,
            recipient.address,
            ids,
            amounts,
            data
          ),
        /but it reverted with reason amounts and ids count mismatch/
      );
    } else {
      await contract.safeBatchTransferFrom(
        owner.address,
        recipient.address,
        ids,
        amounts,
        data
      );
    }
  });
  it("should revert if amount and id length are not equal", async function () {
    const ids = [1, 2, 3];
    const amounts = [10, 30];
    const data = "0x";
    await contract.connect(owner).setApprovalForAll(recipient.address, true);
    await expect(
      contract
        .connect(recipient)
        .safeBatchTransferFrom(
          owner.address,
          recipient.address,
          ids,
          amounts,
          data
        )
    ).to.be.reverted;
  });
  it("should check for onERC1155Received implementation in receiver contract", async function () {
    const receiverContractAddress = "0x123..."; // Address of the contract that implements IERC1155Receiver
    const receiverContract = await ethers.getContractAt(
      "IERC1155Receiver",
      receiverContractAddress
    );
    await contract.mint(sender.address, tokenId, tokenAmount, tokenData);
    await contract.setApprovalForAll(sender.address, true);
    const data = "0x";
    const tx = await contract.safeTransferFrom(
      sender.address,
      receiverContract.address,
      tokenId,
      tokenAmount,
      data
    );
    await tx.wait();
    const senderBalance = await contract.balanceOf(sender.address, tokenId);
    const receiverBalance = await contract.balanceOf(
      receiverContract.address,
      tokenId
    );
    expect(senderBalance).to.equal(0);
    expect(receiverBalance).to.equal(tokenAmount);
    const receiverBalanceBefore = await receiverContract.balanceOf(tokenId);
    const receiverData = "0x01";
    const receiverTx = await receiverContract.onERC1155Received(
      sender.address,
      sender.address,
      tokenId,
      tokenAmount,
      receiverData
    );
    await receiverTx.wait();
    const receiverBalanceAfter = await receiverContract.balanceOf(tokenId);
    expect(receiverBalanceAfter).to.equal(
      receiverBalanceBefore.add(tokenAmount)
    );
  });
});

describe("ERC1155 , mint", function () {
  let erc1155Token;
  let owner;
  let recipient;

  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    contract = await MyERC1155.deploy("My Token", "MYT");

    [owner, recipient] = await ethers.getSigners();
  });

  it("should mint tokens correctly", async function () {
    const tokenId = 1;
    const amount = 100;
    const tokenUri = "";
    await contract
      .connect(owner)
      .mint(recipient.address, tokenId, amount, tokenUri);

    expect(await contract.balanceOf(recipient.address, tokenId)).to.equal(
      amount
    );
    expect(await contract.totalSupply(tokenId)).to.equal(amount);
    expect(await contract.nextTokenIdToMint()).to.equal(tokenId + 1);
  });

  it("should revert when minting to zero address", async function () {
    const tokenId = 1;
    const amount = 100;
    const tokenUri = "";
    await expect(
      contract.mint(ethers.constants.AddressZero, tokenId, amount, tokenUri)
    ).to.be.revertedWith("Cannot mint to zero address");
  });

  it("should revert when minting zero amount of tokens", async function () {
    const tokenId = 1;
    const amount = 0;
    const tokenUri = "";
    await expect(
      contract.connect(owner).mint(recipient.address, tokenId, amount, tokenUri)
    ).to.be.revertedWith("Cannot mint zero amount of tokens");
  });

  it("should revert when non-owner tries to mint tokens", async function () {
    const tokenId = 1;
    const amount = 100;
    const tokenUri = "";
    await expect(
      contract.connect(recipient).mint(owner.address, tokenId, amount, tokenUri)
    ).to.be.revertedWith("Only owner can mint tokens");
  });
});

describe("ERC1155 , mintBatch", function () {
  let owner;
  let notOwner;
  beforeEach(async function () {
    const MyERC1155 = await ethers.getContractFactory("myERC1155");
    const contract = await MyERC1155.deploy("My Token", "MYT");
    [owner, notOwner] = await ethers.getSigners();
  });
  it("should mint tokens in batch", async function () {
    const to = [owner.address, owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [10, 20, 30];
    const uris = ["uri1", "uri2", "uri3"];
    await contract.mint(to[0], tokenIds[0], amounts[0], uris[0]);
    await contract.mint(to[1], tokenIds[1], amounts[1], uris[1]);
    await contract.mint(to[2], tokenIds[2], amounts[2], uris[2]);

    expect(await contract.balanceOf(owner.address, 1)).to.equal(10);
    expect(await contract.balanceOf(owner.address, 2)).to.equal(20);
    expect(await contract.balanceOf(owner.address, 3)).to.equal(30);
    expect(await contract.uri(1)).to.equal("uri1");
    expect(await contract.uri(2)).to.equal("uri2");
    expect(await contract.uri(3)).to.equal("uri3");
  });

  it("should revert if ids and amount length mismatch ", async () => {
    const to = [owner.address, owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [10, 20];
    const uris = ["uri1", "uri2", "uri3"];
    await expect(contract.mintBatch(to, tokenIds, amounts, uris)).to.be
      .reverted;
  });
  it("should revert if ids and tokenURIs length mismatch ", async () => {
    const to = [owner.address, owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [10, 20, 30];
    const uris = ["uri1", "uri2"];
    await expect(contract.mintBatch(to, tokenIds, amounts, uris)).to.be
      .reverted;
  });
  it("should revert if to and tokenURIs length mismatch ", async () => {
    const to = [owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [10, 20, 30];
    const uris = ["uri1", "uri2", "uri3"];
    await expect(contract.mintBatch(to, tokenIds, amounts, uris)).to.be
      .reverted;
  });
  it("should revert if msg.sender is not owner ", async () => {
    const to = [owner.address, owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [10, 20, 30];
    const uris = ["uri1", "uri2", "uri3"];
    await expect(
      contract.connect(notOwner).mintBatch(to, tokenIds, amounts, uris)
    ).to.be.reverted;
  });
  it("should revert if `to[i]`address is zeroAddress ", async () => {
    const to = [ethers.constants.AddressZero, owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [0, 20, 30];
    const uris = ["uri1", "uri2", "uri3"];
    await expect(contract.mintBatch(to, tokenIds, amounts, uris)).to.be
      .reverted;
  });
  it("should revert if amount is less than zero ", async () => {
    const to = [owner.address, owner.address, owner.address];
    const tokenIds = [1, 2, 3];
    const amounts = [0, 20, 30];
    const uris = ["uri1", "uri2", "uri3"];
    await expect(contract.mintBatch(to, tokenIds, amounts, uris)).to.be
      .reverted;
  });
});
