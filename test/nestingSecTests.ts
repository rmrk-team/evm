import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

async function nestingFixture() {
  const NestingFactory = await ethers.getContractFactory('RMRKNestingMock');
  const parent = await NestingFactory.deploy('Test', 'TST');
  await parent.deployed();

  return parent;
}

describe('Nesting with ChildAdder', function () {
  let parent: Contract;
  let adder: Contract;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
    parent = await loadFixture(nestingFixture);
    const Childadder = await ethers.getContractFactory('ChildAdder');
    adder = await Childadder.deploy();
    await adder.deployed();
  });

  describe('add children', async function () {
    it('cannot add multiple children', async function () {
      await parent.connect(owner).mint(owner.address, 1);
      // Propose 10 children with the same params to the parent token
      await adder.addChild(parent.address, 1, 1, 10);

      await parent.connect(owner).acceptChild(1, 0, adder.address, 1);
      await expect(
        parent.connect(owner).acceptChild(1, 0, adder.address, 1),
      ).to.be.revertedWithCustomError(parent, 'RMRKChildAlreadyExists');
    });
  });
});
