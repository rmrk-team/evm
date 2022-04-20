import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

//TODO: Transfer - transfer now does double duty as removeChild

describe('Nesting', async () => {
  let owner: SignerWithAddress;
  let addrs: any[];
  let ownerChunky: Contract;
  let petMonkey: Contract;

  const name = 'ownerChunky';
  const symbol = 'CHNKY';
  const resourceName = 'ChunkyResource';

  const name2 = 'petMonkey';
  const symbol2 = 'MONKE';
  const resourceName2 = 'MonkeyResource';

  const mintNestData = ethers.utils.hexZeroPad('0xabcd', 8);
  const emptyData = ethers.utils.hexZeroPad('0x', 0);
  const partId = ethers.utils.hexZeroPad('0x0', 8);

  const CHILD_STATUS_UNKNOWN = 0;
  const CHILD_STATUS_PENDING = 1;
  const CHILD_STATUS_ACCEPTED = 2;


  beforeEach(async function () {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    const CHNKY = await ethers.getContractFactory('RMRKCoreMock');
    ownerChunky = await CHNKY.deploy(name, symbol, resourceName);
    await ownerChunky.deployed();

    const MONKY = await ethers.getContractFactory('RMRKCoreMock');
    petMonkey = await MONKY.deploy(name2, symbol2, resourceName2);
    await petMonkey.deployed();

    //Mint 20 ownerChunkys. These tests will simulate minting of petMonkeys to ownerChunkys.
    let i = 1;
    while (i <= 10) {
      await ownerChunky.doMint(addrs[0].address, i);
      i++;
    }
    i = 11;
    while (i <= 20) {
      await ownerChunky.doMint(addrs[1].address, i);
      i++;
    }
  });

  describe('Init', async function () {
    it('Name', async function () {
      expect(await ownerChunky.name()).to.equal(name);
      expect(await petMonkey.name()).to.equal(name2);
    });

    it('Symbol', async function () {
      expect(await ownerChunky.symbol()).to.equal(symbol);
      expect(await petMonkey.symbol()).to.equal(symbol2);
    });

    it('ownerChunky Ownership Test', async function () {
      expect(await ownerChunky.ownerOf(10)).to.equal(addrs[0].address);
      expect(await ownerChunky.ownerOf(20)).to.equal(addrs[1].address);
      expect(await ownerChunky.balanceOf(addrs[0].address)).to.equal(10);
      expect(await ownerChunky.balanceOf(addrs[1].address)).to.equal(10);
    });
  });

  describe('Minting', async function () {
    it('can mint with no destination', async function () {
      await petMonkey.connect(owner).doMint(owner.address, 1);
      expect(await petMonkey.ownerOf(1)).to.equal(owner.address);
      expect(await petMonkey.rmrkOwnerOf(1)).to.eql([
        owner.address,
        ethers.BigNumber.from(0),
        false,
      ]);
    });

    it('cannot mint already minted token', async function () {
      await petMonkey.connect(owner).doMint(owner.address, 1);
      await expect(
        petMonkey.connect(owner).doMint(owner.address, 1)
      ).to.be.revertedWith('RMRKCore: token already minted');
    });

    it('cannot mint to zero address', async function () {
      await expect(
        petMonkey.connect(owner).doMint('0x0000000000000000000000000000000000000000', 1)
      ).to.be.revertedWith('RMRKCore: mint to the zero address');
    });

    it('cannot nest mint to a non-contract destination', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest(owner.address, 1, 0, mintNestData),
      ).to.be.revertedWith('Is not contract');
    });

    it.skip('cannot nest mint to non rmrk core implementer', async function () {
      // FIXME: implement
    });

    it('cannot nest mint to a non-existent token', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest(ownerChunky.address, 1, 0, mintNestData),
      ).to.be.revertedWith('RMRKCore: owner query for nonexistent token');
    });

    it('cannot nest mint already minted token', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      //Mint petMonkey 1 into ownerChunky 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      await expect(
        petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData)
      ).to.be.revertedWith('RMRKCore: token already minted');
    });

    it('cannot nest mint already minted token to a different parent', async function () {
      // This test may seem dumb, but a bad implementation could open this hole.
      const childId = 1;
      const parentId = 12; // owner is addrs[1]

      //Mint petMonkey 1 into ownerChunky 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      await expect(
        petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData)
      ).to.be.revertedWith('RMRKCore: token already minted');
    });

    it('cannot nest mint to zero address', async function () {
      await expect(
        petMonkey.connect(owner).doMintNest('0x0000000000000000000000000000000000000000', 1, 10, mintNestData)
      ).to.be.revertedWith('RMRKCore: mint to the zero address');
    });

    it('can mint to contract and owners are ok', async function () {
      const childId = 1;
      const parentId = 11; // owner is addrs[1]

      //Mint petMonkey 1 into ownerChunky 11
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // owner is the same adress
      expect(await ownerChunky.ownerOf(parentId)).to.equal(addrs[1].address);
      expect(await petMonkey.ownerOf(childId)).to.equal(addrs[1].address);
    });

    it('can mint to contract and RMRK owners are ok', async function () {      
      const childId = 1;
      const parentId = 11;

      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // RMRK owner is an address for the parent
      expect(await ownerChunky.rmrkOwnerOf(parentId)).to.eql([
        addrs[1].address,
        ethers.BigNumber.from(0),
        false,
      ]);
      // RMRK owner is a contract for the child
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql([
        ownerChunky.address,
        ethers.BigNumber.from(parentId),
        true,
      ]);
    });

    it("can mint to contract and parent's children are ok", async function () {
      const childId = 1;
      const parentId = 11;

      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);

    });

    it('can mint multiple children', async function () {
      const childId_1 = 1;
      const childId_2 = 2;
      const parentId = 10;

      // Owner address mints a child
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId_1, parentId, mintNestData);
      expect(await petMonkey.ownerOf(childId_1)).to.equal(addrs[0].address);

      // Another address mints a second child
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, childId_2, parentId, mintNestData);
      expect(await petMonkey.ownerOf(childId_2)).to.equal(addrs[0].address);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(childId_1), petMonkey.address, 0, partId],
        [ethers.BigNumber.from(childId_2), petMonkey.address, 0, partId],
      ]);
    });

    it('can mint child into child', async function () {
      const parentId = 10;
      const childId = 1;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      // mint petMonkey token 21 into petMonkey token 1
      await petMonkey.connect(addrs[0]).doMintNest(petMonkey.address, granchildId, childId, mintNestData);

      const pendingChildrenOfChunky10 = await ownerChunky.pendingChildrenOf(parentId);
      const pendingChildrenOfMonkey1 = await petMonkey.pendingChildrenOf(childId);

      expect(pendingChildrenOfChunky10).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);
      expect(pendingChildrenOfMonkey1).to.eql([
        [ethers.BigNumber.from(granchildId), petMonkey.address, 0, partId],
      ]);

      // RMRK owner of pet 21 is pet 1
      expect(await petMonkey.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(childId),
        true,
      ]);

      // root owner of pet 21 should be owner address of chunky 10
      expect(await petMonkey.ownerOf(granchildId)).to.eql(addrs[0].address);
    });

    it('cannot add too many pending resources', async () => {
      const tokenId = 1;

      // First 127 should be fine.
      for (let i = 1; i <= 128; i++) {
        await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, i, tokenId, mintNestData);
      }

      await expect(
        petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 129, tokenId, mintNestData)
        ).to.be.revertedWith('RMRKCore: Max pending children reached');
    });

  });

  describe('Accept child', async function () {

    it('can accept child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // owner accepts the child at index 0 into the child array
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);
    });

    it('cannot accept not owned child', async function () {
      const childId = 1;
      const parentId = 11;

      // Another address can mint
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      // Another address cannot accept
      await expect(
        ownerChunky
        .connect(addrs[0])
        .acceptChild(parentId, 0)
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('can accept child from approved address (not owner)', async function () {
      const childId = 1;
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);

      // Another address can mint
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).acceptChild(parentId, 0);

      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);

      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);
    });

  });

  describe('Reject child', async function () {
    it('can reject one pending child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);

      await ownerChunky.connect(addrs[1]).rejectChild(parentId, 0);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject not owned pending child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(
        ownerChunky.connect(addrs[0]).rejectChild(parentId, 0)
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('can reject child from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).rejectChild(parentId, 0);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('can reject all pending children', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, parentId, mintNestData);

      let pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([
        [ethers.BigNumber.from(1), petMonkey.address, 0, partId],
        [ethers.BigNumber.from(2), petMonkey.address, 0, partId],
      ]);

      await ownerChunky.connect(addrs[1]).rejectAllChildren(parentId);
      pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject all pending children for not owned pending child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, parentId, mintNestData);

      // addrs[1] attempts to reject addrs[0]'s pending children
      await expect(ownerChunky.connect(addrs[0]).rejectAllChildren(parentId)).to.be.revertedWith(
        'RMRKCore: Not approved or owner',
      );
    });

    it('can reject all pending children from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 2, parentId, mintNestData);

      await ownerChunky.connect(approvedAddress).rejectAllChildren(parentId);
      const pendingChildren = await ownerChunky.pendingChildrenOf(parentId);
      expect(pendingChildren).to.eql([]);
    });

    it('cannot reject children for non existing index', async () => {
      const parentId = 11;
      await expect(
        ownerChunky.connect(addrs[1]).rejectChild(parentId, 0),
      ).to.be.revertedWith('RMRKcore: Pending child index out of range');
    });
  });

  describe('Remove child', async function () {
    it('can remove one child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      await ownerChunky.connect(addrs[1]).removeChild(parentId, 0);
      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);
    });

    it('cannot remove not owned child', async function () {
      const parentId = 11;
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      // addrs[1] attempts to remove addrs[0]'s children
      await expect(
        ownerChunky.connect(addrs[0]).removeChild(parentId, 0)
      ).to.be.revertedWith('RMRKCore: Not approved or owner');
    });

    it('can remove child from approved address (not owner)', async function () {
      const parentId = 11;
      const approvedAddress = addrs[2];

      await ownerChunky.connect(addrs[1]).approve(approvedAddress.address, parentId);
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, 1, parentId, mintNestData);
      await ownerChunky.connect(addrs[1]).acceptChild(parentId, 0);

      await ownerChunky.connect(approvedAddress).removeChild(parentId, 0);
      const children = await ownerChunky.childrenOf(parentId);
      expect(children).to.eql([]);
    });

    it('cannot remove children for non existing index', async () => {
      const parentId = 11;
      await expect(
        ownerChunky.connect(addrs[1]).removeChild(parentId, 0),
      ).to.be.revertedWith('RMRKcore: Child index out of range');
    });
  });

  describe('Burning', async function () {
    it('can burn token', async function () {
      const tokenId = 1;

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('cannot burn not owned token', async function () {
      const tokenId = 1;
      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await expect(petMonkey.connect(addrs[0]).burn(tokenId)).to.be.revertedWith(
        'RMRKCore: transfer caller is not owner nor approved',
      );
    });

    it('can burn token from approved address (not owner)', async function () {
      const tokenId = 1;
      const approvedAddress = addrs[2];

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).approve(approvedAddress.address, tokenId);

      await petMonkey.connect(approvedAddress).burn(tokenId);
      await expect(petMonkey.ownerOf(tokenId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('can burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      await petMonkey.connect(addrs[0]).burn(childId);

      // no owner for token
      await expect(petMonkey.ownerOf(childId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
      await expect(petMonkey.rmrkOwnerOf(childId)).to.be.revertedWith(
        'RMRKCore: owner query for nonexistent token',
      );
    });

    it('cannot burn not owned nested token', async function () {
      const childId = 1;
      const parentId = 10;
      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[1]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);

      await expect(petMonkey.connect(addrs[1]).burn(childId)).to.be.revertedWith(
        'RMRKCore: transfer caller is not owner nor approved',
      );
    });

    it('can recursively burn nested token', async function () {
      const childId = 1;
      const parentId = 10;
      const granchildId = 21;

      // mint petMonkey token 1 into ownerChunky token 10
      await petMonkey.connect(addrs[0]).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
      await ownerChunky.connect(addrs[0]).acceptChild(parentId, 0);
      // mint ownerChunky token 21 into petMonkey token 1
      await ownerChunky.connect(addrs[0]).doMintNest(petMonkey.address, granchildId, childId, mintNestData);
      await petMonkey.connect(addrs[0]).acceptChild(childId, 0);

      // ownership chain is now addrs[0] > ownerChunky[10] > petMonkey[1] > ownerChunky[21]
      const children1 = await ownerChunky.childrenOf(parentId);
      const children2 = await petMonkey.childrenOf(childId);

      expect(children1).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);

      expect(children2).to.eql([
        [ethers.BigNumber.from(granchildId), ownerChunky.address, 0, partId],
      ]);

      expect(await ownerChunky.rmrkOwnerOf(granchildId)).to.eql([
        petMonkey.address,
        ethers.BigNumber.from(childId),
        true,
      ]);

      await petMonkey.connect(addrs[0]).burn(childId);

      await expect(petMonkey.ownerOf(childId)).
        to.be.revertedWith('RMRKCore: owner query for nonexistent token');
      await expect(petMonkey.rmrkOwnerOf(childId)).
        to.be.revertedWith('RMRKCore: owner query for nonexistent token');

      await expect(ownerChunky.ownerOf(granchildId))
        .to.be.revertedWith('RMRKCore: owner query for nonexistent token');
      await expect(ownerChunky.rmrkOwnerOf(granchildId))
        .to.be.revertedWith('RMRKCore: owner query for nonexistent token');
    });
  });

  describe('Transfer', async function () {
    it('can transfer token', async function () {
      const tokenId = 1;
      const newOwner = addrs[2];

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await petMonkey.connect(addrs[1]).transfer(newOwner.address, tokenId);
      expect(await petMonkey.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('cannot transfer not owned token', async function () {
      const tokenId = 1;
      const newOwner = addrs[2];

      await petMonkey.connect(addrs[1]).doMint(addrs[1].address, tokenId);
      await expect(petMonkey.connect(addrs[0]).transfer(newOwner.address, tokenId)).to.be.revertedWith(
        'RMRKCore: Not approved or owner',
      );
    });

    it('can transfer token from approved address (not owner)', async function () {
      const tokenId = 1;
      const firstOwner = addrs[1];
      const approved = addrs[2];
      const newOwner = addrs[3];

      await petMonkey.connect(firstOwner).doMint(firstOwner.address, tokenId);
      await petMonkey.connect(firstOwner).approve(approved.address, tokenId);

      await petMonkey.connect(firstOwner).transferFrom(firstOwner.address, newOwner.address, tokenId, 0, emptyData);
      expect(await petMonkey.ownerOf(tokenId)).to.eql(newOwner.address);
    });

    it('can transfer parent token to address and owners are ok', async function () {
      const newOwner = addrs[2];
      const {childId, parentId, firstOwner} = await mintTofirstOwner();
      await ownerChunky.connect(firstOwner).transferFrom(firstOwner.address, newOwner.address, parentId, 0, emptyData);

      // New owner of parent
      expect(await ownerChunky.ownerOf(parentId)).to.eql(newOwner.address);
      expect(await ownerChunky.rmrkOwnerOf(parentId)).to.eql(
        [ newOwner.address, ethers.BigNumber.from(0), false]);

      // New owner of child
      expect(await petMonkey.ownerOf(childId)).to.eql(newOwner.address);
      expect(await petMonkey.rmrkOwnerOf(childId)).to.eql(
        [ ownerChunky.address, ethers.BigNumber.from(parentId), true]);

    });

    it('can transfer parent token to address and children are ok', async function () {
      const newOwner = addrs[2];
      const {childId, parentId, firstOwner} = await mintTofirstOwner();
      await ownerChunky.connect(firstOwner).transferFrom(firstOwner.address, newOwner.address, parentId, 0, emptyData);

      // Parent still has its children
      const children = await ownerChunky.pendingChildrenOf(parentId);
      expect(children).to.eql([
        [ethers.BigNumber.from(childId), petMonkey.address, 0, partId],
      ]);
    });

    it('can transfer accepted child to token with same owner, child is in accepted', async function () {
      const newParentId = 12; // owner is firstOwner
      const {childId, parentId, firstOwner} = await mintTofirstOwner(true);

      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_ACCEPTED);
      await petMonkey.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, childId, newParentId, true, CHILD_STATUS_ACCEPTED, 0, emptyData);

      const expected_accepted = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, [], []);
      check_accepted_and_pending_children(ownerChunky, newParentId, expected_accepted, []);
    });

    it('can transfer accepted child to token with different owner, child is in pending', async function () {
      const {childId, parentId, firstOwner} = await mintTofirstOwner(true);
      const newParentId = 5; // owned by addrs[0]

      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_ACCEPTED);
      await petMonkey.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, childId, newParentId, true, CHILD_STATUS_ACCEPTED, 0, emptyData);

      const expected_pending = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, [], []);
      check_accepted_and_pending_children(ownerChunky, newParentId, [], expected_pending);
    });

    it('can transfer pending child to token with same owner, child is in pending', async function () {
      const newParentId = 12; // owner is firstOwner
      const {childId, parentId, firstOwner} = await mintTofirstOwner();

      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_PENDING);
      await petMonkey.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, childId, newParentId, true, CHILD_STATUS_PENDING, 0, emptyData);

      const expected_pending = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, [], []);
      check_accepted_and_pending_children(ownerChunky, newParentId, [], expected_pending);
    });

    it('can transfer pending child to token with different owner, child is pending', async function () {
      const {childId, parentId, firstOwner} = await mintTofirstOwner();
      const newParentId = 5; // owned by addrs[0]

      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_PENDING);
      await petMonkey.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, childId, newParentId, true, CHILD_STATUS_PENDING, 0, emptyData);

      const expected_pending = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, [], []);
      check_accepted_and_pending_children(ownerChunky, newParentId, [], expected_pending);
    });

    it('can transfer parent token to token with same owner, family tree is ok', async function () {
      const newParentId = 12; // owner is firstOwner
      const {childId, parentId, firstOwner} = await mintTofirstOwner(true);

      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_ACCEPTED);
      await ownerChunky.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, parentId, newParentId, true, CHILD_STATUS_ACCEPTED, 0, emptyData);

      let expected_accepted = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, expected_accepted, []);
      expected_accepted = [ethers.BigNumber.from(parentId), ownerChunky.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, newParentId, expected_accepted, []);
    });

    it('can transfer accepted child to token with same owner not setting the status, child is in accepted', async function () {
      const newParentId = 12; // owner is firstOwner
      const {childId, parentId, firstOwner} = await mintTofirstOwner(true);

      // Does not make much sense to know the status on approval but not on transfer. But we test it anyway.
      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_ACCEPTED);
      await petMonkey.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, childId, newParentId, true, CHILD_STATUS_UNKNOWN, 0, emptyData);

      const expected_accepted = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, [], []);
      check_accepted_and_pending_children(ownerChunky, newParentId, expected_accepted, []);
    });

    it('can transfer pending child to token with same owner not setting the status, child is in pending', async function () {
      const newParentId = 12; // owner is firstOwner
      const {childId, parentId, firstOwner} = await mintTofirstOwner();

      // Does not make much sense to know the status on approval but not on transfer. But we test it anyway.
      await ownerChunky.connect(firstOwner).approveTransfer(parentId, 0, CHILD_STATUS_PENDING);
      await petMonkey.connect(firstOwner).transferFromRmrk(
        firstOwner.address, ownerChunky.address, childId, newParentId, true, CHILD_STATUS_UNKNOWN, 0, emptyData);

      const expected_pending = [ethers.BigNumber.from(childId), petMonkey.address, 0, partId];
      check_accepted_and_pending_children(ownerChunky, parentId, [], []);
      check_accepted_and_pending_children(ownerChunky, newParentId, [], expected_pending);
    });

  });

  async function mintTofirstOwner(accept: boolean=false): Promise<{childId: number, parentId: number,  firstOwner: any}> {
    const childId = 1;
    const parentId = 11;
    const firstOwner = addrs[1];

    await petMonkey.connect(firstOwner).doMintNest(ownerChunky.address, childId, parentId, mintNestData);
    if (accept){
      await ownerChunky.connect(firstOwner).acceptChild(parentId, 0);
    }

    return {childId, parentId, firstOwner};
  }

  async function check_accepted_and_pending_children(contract: any, tokenId: number, expected_accepted: any, expected_pending: any) {
    const accepted = await contract.childrenOf(tokenId);
    expect(accepted).to.eql(expected_accepted);

    const pending = await contract.childrenOf(tokenId);
    expect(pending).to.eql(expected_pending);
  }


});
