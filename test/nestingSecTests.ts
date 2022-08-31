import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('NestingMock', function () {
  let parent: Contract;
  let adder: Contract;
  let owner: SignerWithAddress;

  async function nestingFixture() {
    const NestingFactory = await ethers.getContractFactory('RMRKNestingMock');
    parent = await NestingFactory.deploy('Test', 'TST');
    await parent.deployed();

    const Childadder = await ethers.getContractFactory('ChildAdder');
    adder = await Childadder.deploy();
    await adder.deployed();

    return { parent, adder };
  }

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
    ({ parent, adder } = await loadFixture(nestingFixture));
  });

  describe('add children', async function () {
    it('Cannot add multiple chilren', async function () {
      await parent.connect(owner).mint(owner.address, 1);
      // Propose 10 children with the same params to the parent token
      await adder.addChild(parent.address, 1, 1, 10);

      await parent.connect(owner).acceptChild(1, 0);
      await expect(parent.connect(owner).acceptChild(1, 0)).to.be.revertedWithCustomError(
        parent,
        'RMRKChildAlreadyExists',
      );
    });
  });
});
