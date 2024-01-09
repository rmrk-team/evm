import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { RMRKImplementationBaseMock } from '../../typechain-types';

describe('Implementation Base', async () => {
  let implementation_base: RMRKImplementationBaseMock;
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  async function deployMintingUtilsFixture() {
    const [signersOwner, ...signersAddrs] = await ethers.getSigners();
    const MINT = await ethers.getContractFactory('RMRKImplementationBaseMock');
    const mintingUtilsContract = <RMRKImplementationBaseMock>(
      await MINT.deploy('Name', 'SBL', 'ipfs://collection-meta', 10)
    );
    await mintingUtilsContract.waitForDeployment();

    return { mintingUtilsContract, signersOwner, signersAddrs };
  }

  beforeEach(async function () {
    const { mintingUtilsContract, signersOwner, signersAddrs } = await loadFixture(
      deployMintingUtilsFixture,
    );
    implementation_base = mintingUtilsContract;
    owner = signersOwner;
    addrs = signersAddrs;
  });

  it('can get total supply, max supply and price', async function () {
    await implementation_base.connect(owner).mockMint(5);
    expect(await implementation_base.totalSupply()).to.equal(5);
    expect(await implementation_base.maxSupply()).to.equal(10);
  });

  it('can transfer ownership', async function () {
    const newOwner = addrs[1];
    await implementation_base.connect(owner).transferOwnership(await newOwner.getAddress());
    expect(await implementation_base.owner()).to.eql(await newOwner.getAddress());
  });

  it('emits OwnershipTransferred event when transferring ownership', async function () {
    const newOwner = addrs[1];
    await expect(implementation_base.connect(owner).transferOwnership(await newOwner.getAddress()))
      .to.emit(implementation_base, 'OwnershipTransferred')
      .withArgs(await owner.getAddress(), await newOwner.getAddress());
  });

  it('cannot transfer ownership to address 0', async function () {
    await expect(
      implementation_base.connect(owner).transferOwnership(ethers.ZeroAddress),
    ).to.be.revertedWithCustomError(implementation_base, 'RMRKNewOwnerIsZeroAddress');
  });

  it('can renounce ownership', async function () {
    await implementation_base.connect(owner).renounceOwnership();
    expect(await implementation_base.owner()).to.eql(ethers.ZeroAddress);
  });

  it('can add and revoke contributor', async function () {
    const contributor = addrs[1];
    await implementation_base
      .connect(owner)
      .manageContributor(await contributor.getAddress(), true);
    expect(
      await implementation_base.connect(owner).isContributor(await contributor.getAddress()),
    ).to.eql(true);
    await implementation_base
      .connect(owner)
      .manageContributor(await contributor.getAddress(), false);
    expect(
      await implementation_base.connect(owner).isContributor(await contributor.getAddress()),
    ).to.eql(false);
  });

  it('emits ContributorUpdate when adding a contributor', async function () {
    const contributor = addrs[1];
    await expect(
      implementation_base.connect(owner).manageContributor(await contributor.getAddress(), true),
    )
      .to.emit(implementation_base, 'ContributorUpdate')
      .withArgs(await contributor.getAddress(), true);
  });

  it('emits ContributorUpdate when removing a contributor', async function () {
    const contributor = addrs[1];
    await implementation_base
      .connect(owner)
      .manageContributor(await contributor.getAddress(), true);
    await expect(
      implementation_base.connect(owner).manageContributor(await contributor.getAddress(), false),
    )
      .to.emit(implementation_base, 'ContributorUpdate')
      .withArgs(await contributor.getAddress(), false);
  });

  it('cannot add zero address as contributor', async function () {
    await expect(
      implementation_base.connect(owner).manageContributor(ethers.ZeroAddress, true),
    ).to.be.revertedWithCustomError(implementation_base, 'RMRKNewContributorIsZeroAddress');
  });

  it('cannot do owner operations if not owner', async function () {
    const notOwner = addrs[1];
    const otherUser = addrs[2];
    await expect(
      implementation_base.connect(notOwner).transferOwnership(await otherUser.getAddress()),
    ).to.be.revertedWithCustomError(implementation_base, 'RMRKNotOwner');
    await expect(
      implementation_base.connect(notOwner).renounceOwnership(),
    ).to.be.revertedWithCustomError(implementation_base, 'RMRKNotOwner');
    await expect(
      implementation_base.connect(notOwner).manageContributor(await otherUser.getAddress(), true),
    ).to.be.revertedWithCustomError(implementation_base, 'RMRKNotOwner');
    await expect(
      implementation_base.connect(notOwner).manageContributor(await otherUser.getAddress(), false),
    ).to.be.revertedWithCustomError(implementation_base, 'RMRKNotOwner');
  });
});
