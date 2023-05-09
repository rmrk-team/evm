import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  bn,
  mintFromMock,
  nestMintFromMock,
  transfer,
  nestTransfer,
  singleFixtureWithArgs,
  parentChildFixtureWithArgs,
} from './utils';
import shouldBehaveLikeNestable from './behavior/nestable';
import shouldBehaveLikeERC721 from './behavior/erc721';
import { RMRKNestableUtils } from '../typechain-types';

const parentName = 'ownerChunky';
const parentSymbol = 'CHNKY';

const childName = 'petMonkey';
const childSymbol = 'MONKE';

async function nestableUtilsFixture() {
  const nestableUtilsFactory = await ethers.getContractFactory('RMRKNestableUtils');
  const nestableUtils = <RMRKNestableUtils>await nestableUtilsFactory.deploy();
  await nestableUtils.deployed();

  return { nestableUtils };
}

async function singleFixture(): Promise<Contract> {
  return singleFixtureWithArgs('RMRKMultiAssetMock', [parentName, parentSymbol]);
}

async function parentChildFixture(): Promise<{ parent: Contract; child: Contract }> {
  return parentChildFixtureWithArgs(
    'RMRKNestableMock',
    [parentName, parentSymbol],
    [childName, childSymbol],
  );
}

describe('NestableUtils', function () {
  let parent: Contract;
  let child: Contract;
  let multiAsset: Contract;
  let owner: SignerWithAddress;
  let nestableUtils: RMRKNestableUtils;
  let parentTokenOne: number;
  let parentTokenTwo: number;
  let childTokenOne: number;
  let childTokenTwo: number;
  let childTokenThree: number;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];

    ({ parent, child } = await loadFixture(parentChildFixture));
    this.parentToken = parent;
    this.childToken = child;

    ({ nestableUtils } = await loadFixture(nestableUtilsFixture));
    this.nestableUtils = nestableUtils;

    multiAsset = await singleFixture();

    parentTokenOne = await mintFromMock(parent, owner.address);
    parentTokenTwo = await mintFromMock(parent, owner.address);
    childTokenOne = await nestMintFromMock(child, parent.address, parentTokenOne);
    childTokenTwo = await nestMintFromMock(child, parent.address, parentTokenTwo);
    childTokenThree = await nestMintFromMock(child, parent.address, parentTokenOne);
  });

  it('returns true if the specified token is nested into the given parent', async function () {
    expect(
      await nestableUtils.validateChildOf(
        parent.address,
        child.address,
        parentTokenOne,
        childTokenOne,
      ),
    ).to.be.true;
  });

  it('returns false if the child does not implement IERC6059', async function () {
    expect(
      await nestableUtils.validateChildOf(
        parent.address,
        multiAsset.address,
        parentTokenOne,
        childTokenOne,
      ),
    ).to.be.false;
  });

  it('returns false if the specified child token is not the child token of the parent token', async function () {
    expect(
      await nestableUtils.validateChildOf(
        parent.address,
        child.address,
        parentTokenOne,
        childTokenTwo,
      ),
    ).to.be.false;
  });

  it('returns true if the specified children are the child tokens of the given parent token', async function () {
    expect(
      await nestableUtils.validateChildrenOf(
        parent.address,
        [child.address, child.address],
        parentTokenOne,
        [childTokenOne, childTokenThree],
      ),
    ).to.eql([true, [true, true]]);
  });

  it('does not allow to pass different length child token address and token ID arrays', async function () {
    await expect(
      nestableUtils.validateChildrenOf(
        parent.address,
        [child.address, child.address],
        parentTokenOne,
        [childTokenOne],
      ),
    ).to.be.revertedWithCustomError(nestableUtils, 'RMRKMismachedArrayLength');
  });

  it('returns false if one of the child tokens does not implement IERC6059', async function () {
    expect(
      await nestableUtils.validateChildrenOf(
        parent.address,
        [child.address, multiAsset.address],
        parentTokenOne,
        [childTokenOne, childTokenTwo],
      ),
    ).to.eql([false, [true, false]]);
  });

  it('returns false if any of the given tokens is not owned by the specified parent token', async function () {
    expect(
      await nestableUtils.validateChildrenOf(
        parent.address,
        [child.address, child.address, child.address],
        parentTokenOne,
        [childTokenOne, childTokenTwo, childTokenThree],
      ),
    ).to.eql([false, [true, false, true]]);
  });
});
