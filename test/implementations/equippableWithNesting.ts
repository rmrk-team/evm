import { Contract } from 'ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { addResourceToToken, addResourceEntryEquippables } from '../utils';
import { setupContextForParts } from '../setup/equippableParts';
import { setupContextForSlots } from '../setup/equippableSlots';
import shouldBehaveLikeEquippableResources from '../behavior/equippableResources';
import shouldBehaveLikeEquippableWithParts from '../behavior/equippableParts';
import shouldBehaveLikeEquippableWithSlots from '../behavior/equippableSlots';
import shouldBehaveLikeMultiResource from '../behavior/multiresource';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { bn, mintFromImpl, nestMintFromImpl, ONE_ETH } from '../utils';

// --------------- FIXTURES -----------------------

async function partsFixture() {
  const baseSymbol = 'NCB';
  const baseType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const nestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableWithNestingImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquippableViews');


  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Neon token
  const neon = await nestingFactory.deploy(
    neonName,
    neonSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  const neonEquip = await equipFactory.deploy(neon.address);
  await neon.deployed();
  await neonEquip.deployed();
  // Link nesting and equippable:
  neon.setEquippableAddress(neonEquip.address);

  // Weapon
  const mask = await nestingFactory.deploy(
    maskName,
    maskSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await mask.deployed();
  const maskEquip = await equipFactory.deploy(mask.address);
  await maskEquip.deployed();
  // Link nesting and equippable:
  mask.setEquippableAddress(maskEquip.address);

  await setupContextForParts(
    base,
    neon,
    neonEquip,
    mask,
    maskEquip,
    mintFromImpl,
    nestMintFromImpl,
  );
  return { base, neon, neonEquip, mask, maskEquip, view };
}

async function slotsFixture() {
  const baseSymbol = 'SSB';
  const baseType = 'mixed';

  const soldierName = 'SnakeSoldier';
  const soldierSymbol = 'SS';

  const weaponName = 'SnakeWeapon';
  const weaponSymbol = 'SW';

  const weaponGemName = 'SnakeWeaponGem';
  const weaponGemSymbol = 'SWG';

  const backgroundName = 'SnakeBackground';
  const backgroundSymbol = 'SB';

  const baseFactory = await ethers.getContractFactory('RMRKBaseStorageImpl');
  const nestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const equipFactory = await ethers.getContractFactory('RMRKEquippableWithNestingImpl');
  const viewFactory = await ethers.getContractFactory('RMRKEquippableViews');


  // View
  const view = await viewFactory.deploy();
  await view.deployed();

  // Base
  const base = await baseFactory.deploy(baseSymbol, baseType);
  await base.deployed();

  // Soldier token
  const soldier = await nestingFactory.deploy(
    soldierName,
    soldierSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await soldier.deployed();
  const soldierEquip = await equipFactory.deploy(soldier.address);
  await soldierEquip.deployed();
  // Link nesting and equippable:
  soldier.setEquippableAddress(soldierEquip.address);

  // Weapon
  const weapon = await nestingFactory.deploy(
    weaponName,
    weaponSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await weapon.deployed();
  const weaponEquip = await equipFactory.deploy(weapon.address);
  await weaponEquip.deployed();
  // Link nesting and equippable:
  weapon.setEquippableAddress(weaponEquip.address);

  // Weapon Gem
  const weaponGem = await nestingFactory.deploy(
    weaponGemName,
    weaponGemSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await weaponGem.deployed();
  const weaponGemEquip = await equipFactory.deploy(weaponGem.address);
  await weaponGemEquip.deployed();
  // Link nesting and equippable:
  weaponGem.setEquippableAddress(weaponGemEquip.address);

  // Background
  const background = await nestingFactory.deploy(
    backgroundName,
    backgroundSymbol,
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await background.deployed();
  const backgroundEquip = await equipFactory.deploy(background.address);
  await backgroundEquip.deployed();
  // Link nesting and equippable:
  background.setEquippableAddress(backgroundEquip.address);

  await setupContextForSlots(
    base,
    soldier,
    soldierEquip,
    weapon,
    weaponEquip,
    weaponGem,
    weaponGemEquip,
    background,
    backgroundEquip,
    mintFromImpl,
    nestMintFromImpl,
  );

  return {
    base,
    soldier,
    soldierEquip,
    weapon,
    weaponEquip,
    weaponGem,
    weaponGemEquip,
    background,
    backgroundEquip,
    view
  };
}

async function resourcesFixture() {
  const Nesting = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const Equip = await ethers.getContractFactory('RMRKEquippableWithNestingImpl');

  const nesting = await Nesting.deploy(
    'Chunky',
    'CHNK',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await nesting.deployed();

  const equip = await Equip.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip };
}

async function multiResourceFixture() {
  const NestingFactory = await ethers.getContractFactory('RMRKNestingWithEquippableImpl');
  const EquipFactory = await ethers.getContractFactory('RMRKEquippableWithNestingImpl');

  const nesting = await NestingFactory.deploy(
    'NestingWithEquippable',
    'NWE',
    10000,
    ONE_ETH,
    ethers.constants.AddressZero,
  );
  await nesting.deployed();

  const equip = await EquipFactory.deploy(nesting.address);
  await equip.deployed();

  await nesting.setEquippableAddress(equip.address);

  return { nesting, equip };
}

// --------------- END FIXTURES -----------------------

// --------------- EQUIPPABLE BEHAVIOR -----------------------

describe.skip('EquippableImpl with Parts', async () => {
  beforeEach(async function () {
    const { base, neon, neonEquip, mask, maskEquip, view } = await loadFixture(partsFixture);

    this.base = base;
    this.neon = neon;
    this.neonEquip = neonEquip;
    this.mask = mask;
    this.maskEquip = maskEquip;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithParts();
});

describe.skip('EquippableImpl with Slots', async () => {
  beforeEach(async function () {
    const {
      base,
      soldier,
      soldierEquip,
      weapon,
      weaponEquip,
      weaponGem,
      weaponGemEquip,
      background,
      backgroundEquip,
      view
    } = await loadFixture(slotsFixture);

    this.base = base;
    this.soldier = soldier;
    this.soldierEquip = soldierEquip;
    this.weapon = weapon;
    this.weaponEquip = weaponEquip;
    this.weaponGem = weaponGem;
    this.weaponGemEquip = weaponGemEquip;
    this.background = background;
    this.backgroundEquip = backgroundEquip;
    this.view = view;
  });

  shouldBehaveLikeEquippableWithSlots(nestMintFromImpl);
});

describe.skip('EquippableImpl Resources', async () => {
  const equippableRefIdDefault = bn(1);
  const metaURIDefault = 'metaURI';
  const baseAddressDefault = ethers.constants.AddressZero;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    const { nesting, equip } = await loadFixture(resourcesFixture);
    this.nesting = nesting;
    this.equip = equip;

    owner = (await ethers.getSigners())[0];
  });

  shouldBehaveLikeEquippableResources(mintFromImpl);

  describe.skip('Token URI', async function () {
    it('can set fallback URI', async function () {
      await this.equip.setFallbackURI('TestURI');
      expect(await this.equip.getFallbackURI()).to.be.eql('TestURI');
    });

    it('gets fallback URI if no active resources on token', async function () {
      const tokenId = await mintFromImpl(this.nesting, owner.address);
      const fallBackUri = 'fallback404';
      await this.equip.setFallbackURI(fallBackUri);
      expect(await this.equip.tokenURI(tokenId)).to.eql(fallBackUri);
    });

    it('can get token URI when resource is not enumerated', async function () {
      const tokenId = await mintFromImpl(this.nesting, owner.address);
      const resId = bn(1);
      await this.equip.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: metaURIDefault,
          baseAddress: baseAddressDefault,
        },
        [],
        [],
      );
      await this.equip.addResourceToToken(tokenId, resId, 0);
      await this.equip.acceptResource(tokenId, 0);
      expect(await this.equip.tokenURI(tokenId)).to.eql(metaURIDefault);
    });

    it('can get token URI at specific index', async function () {
      const tokenId = await mintFromImpl(this.nesting, owner.address);
      const resId = bn(1);
      const resId2 = bn(2);

      await this.equip.addResourceEntry(
        {
          id: resId,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriA',
          baseAddress: baseAddressDefault,
        },
        [],
        [],
      );
      await this.equip.addResourceEntry(
        {
          id: resId2,
          equippableRefId: equippableRefIdDefault,
          metadataURI: 'UriB',
          baseAddress: baseAddressDefault,
        },
        [],
        [],
      );
      await this.equip.addResourceToToken(tokenId, resId, 0);
      await this.equip.addResourceToToken(tokenId, resId2, 0);
      await this.equip.acceptResource(tokenId, 0);
      await this.equip.acceptResource(tokenId, 0);

      expect(await this.equip.tokenURIAtIndex(tokenId, 1)).to.eql('UriB');
    });
  });
});

// --------------- END EQUIPPABLE BEHAVIOR -----------------------

// --------------- MULTI RESOURCE BEHAVIOR -----------------------

describe.skip('EquippableImpl MR behavior with minted token', async () => {
  let nesting: Contract;
  let equip: Contract;

  beforeEach(async function () {
    ({ nesting, equip } = await loadFixture(multiResourceFixture));
    this.token = equip;
  });

  // Mint needs to happen on the nesting contract, but the MR behavior happens on the equip one.
  async function mintToNesting(token: Contract, to: string): Promise<number> {
    await nesting.mint(to, 1, { value: ONE_ETH });
    return await nesting.totalSupply();
  }

  shouldBehaveLikeMultiResource(mintToNesting, addResourceEntryEquippables, addResourceToToken);
});

// --------------- MULTI RESOURCE BEHAVIOR END ------------------------
