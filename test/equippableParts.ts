import { ethers } from 'hardhat';
import { expect } from 'chai';
import { RMRKBaseStorageMock, RMRKEquippableMock, RMRKNestingMock } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

// The general idea is having these tokens: Neon and Mask
// Masks can be equipped into Neons.
// All use a single base.
// Neon will use a resource per token, which uses fixed parts to compose the body
// Mask will have 2 resources per weapon, one for full view, one for equipping. Both are composed using fixed parts
describe('Equipping', async () => {
  let base: RMRKBaseStorageMock;
  let neon: RMRKNestingMock;
  let neonEquip: RMRKEquippableMock;
  let mask: RMRKNestingMock;
  let maskEquip: RMRKEquippableMock;

  let owner: SignerWithAddress;
  let addrs: any[];

  const baseSymbol = 'NCB';
  const baseType = 'mixed';

  const neonName = 'NeonCrisis';
  const neonSymbol = 'NC';

  const maskName = 'NeonMask';
  const maskSymbol = 'NM';

  const partIdForHead1 = 1;
  const partIdForHead2 = 2;
  const partIdForHead3 = 3;
  const partIdForBody1 = 4;
  const partIdForBody2 = 5;
  const partIdForHair1 = 6;
  const partIdForHair2 = 7;
  const partIdForHair3 = 8;
  const partIdForMaskBase1 = 9;
  const partIdForMaskBase2 = 10;
  const partIdForMaskBase3 = 11;
  const partIdForEars1 = 12;
  const partIdForEars2 = 13;
  const partIdForHorns1 = 14;
  const partIdForHorns2 = 15;
  const partIdForHorns3 = 16;
  const partIdForMaskBaseEquipped1 = 17;
  const partIdForMaskBaseEquipped2 = 18;
  const partIdForMaskBaseEquipped3 = 19;
  const partIdForEarsEquipped1 = 20;
  const partIdForEarsEquipped2 = 21;
  const partIdForHornsEquipped1 = 22;
  const partIdForHornsEquipped2 = 23;
  const partIdForHornsEquipped3 = 24;
  const partIdForMask = 25;

  // const uniqueNeons = 10;
  const uniqueMasks = 4;
  // Ids could be the same since they are different collections, but to avoid log problems we have them unique
  const neons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const masks = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const neonResIds = [100, 101, 102, 103, 104];
  const maskResourcesFull = [1, 2, 3, 4]; // Must match the total of uniqueResources
  const maskResourcesEquip = [5, 6, 7, 8]; // Must match the total of uniqueResources
  const maskEquippableRefId = 1; // Resources to equip will all use this

  enum ItemType {
    None,
    Slot,
    Fixed,
  }

  beforeEach(async () => {
    const [signersOwner, ...signersAddr] = await ethers.getSigners();
    owner = signersOwner;
    addrs = signersAddr;

    await deployContracts();
    await setupBase();

    await mintNeons();
    await mintMasks();

    await addResourcesToNeon();
    await addResourcesToMask();
  });

  describe('Equip', async function () {
    it('can equip weapon', async function () {
      // Weapon is child on index 0, background on index 1
      const childIndex = 0;
      const weaponResId = maskResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await neonEquip
        .connect(addrs[0])
        .equip(neons[0], neonResIds[0], partIdForMask, childIndex, weaponResId);
      // All part slots are included on the response:
      const expectedSlots = [bn(partIdForMask)];
      const expectedEquips = [
        [bn(neonResIds[0]), bn(weaponResId), bn(masks[0]), maskEquip.address],
      ];
      expect(await neonEquip.getEquipped(neons[0], neonResIds[0])).to.eql([
        expectedSlots,
        expectedEquips,
      ]);

      // Child is marked as equipped:
      expect(await maskEquip.isEquipped(masks[0])).to.eql(true);
    });

    it('cannot equip non existing child in slot', async function () {
      // Weapon is child on index 0
      const badChildIndex = 3;
      const weaponResId = maskResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await expect(
        neonEquip
          .connect(addrs[0])
          .equip(neons[0], neonResIds[0], partIdForMask, badChildIndex, weaponResId),
      ).to.be.reverted; // Bad index
    });
  });

  describe('Compose', async function () {
    it('can compose all parts for neon', async function () {
      const childIndex = 0;
      const weaponResId = maskResourcesEquip[0]; // This resource is assigned to weapon first weapon
      await neonEquip
        .connect(addrs[0])
        .equip(neons[0], neonResIds[0], partIdForMask, childIndex, weaponResId);

      const expectedResource = [
        bn(neonResIds[0]), // id
        bn(0), // equippableRefId
        base.address, // baseAddress
        'ipfs:neonRes/1', // metadataURI
        [],
      ];
      const expectedFixedParts = [
        [
          bn(partIdForHead1), // partId
          1, // z
          'ipfs://head1.png', // metadataURI
        ],
        [
          bn(partIdForBody1), // partId
          1, // z
          'ipfs://body1.png', // metadataURI
        ],
        [
          bn(partIdForHair1), // partId
          2, // z
          'ipfs://hair1.png', // metadataURI
        ],
      ];
      const expectedSlotParts = [
        [
          bn(partIdForMask), // partId
          bn(maskResourcesEquip[0]), // childResourceId
          2, // z
          bn(masks[0]), // childTokenId
          maskEquip.address, // childAddress
          '', // metadataURI
        ],
      ];
      const allResources = await neonEquip.composeEquippables(neons[0], neonResIds[0]);
      expect(allResources).to.eql([expectedResource, expectedFixedParts, expectedSlotParts]);
    });

    it('can compose all parts for mask', async function () {
      const expectedResource = [
        bn(maskResourcesEquip[0]), // id
        bn(maskEquippableRefId), // equippableRefId
        base.address, // baseAddress
        `ipfs:weapon/equip/${maskResourcesEquip[0]}`, // metadataURI
        [],
      ];
      const expectedFixedParts = [
        [
          bn(partIdForMaskBase1), // partId
          3, // z
          'ipfs://maskBase1.png', // metadataURI
        ],
        [
          bn(partIdForHorns1), // partId
          5, // z
          'ipfs://horn1.png', // metadataURI
        ],
        [
          bn(partIdForEars1), // partId
          4, // z
          'ipfs://ears1.png', // metadataURI
        ],
      ];
      const allResources = await maskEquip.composeEquippables(masks[0], maskResourcesEquip[0]);
      expect(allResources).to.eql([expectedResource, expectedFixedParts, []]);
    });

    it('cannot get composables for neon with not associated resource', async function () {
      const wrongResId = maskResourcesEquip[1];
      await expect(maskEquip.composeEquippables(masks[0], wrongResId)).to.be.revertedWith(
        'RMRKTokenDoesNotHaveActiveResource()',
      );
    });

    it('cannot get composables for mask for resource with no base', async function () {
      const noBaseResourceId = 99;
      await maskEquip.addResourceEntry(
        {
          id: noBaseResourceId,
          equippableRefId: 0, // Not meant to equip
          metadataURI: `ipfs:weapon/full/customResource.png`,
          baseAddress: ethers.constants.AddressZero, // Not meant to equip
          custom: [],
        },
        [],
        [],
      );
      await maskEquip.addResourceToToken(masks[0], noBaseResourceId, 0);
      await maskEquip.connect(addrs[0]).acceptResource(masks[0], 0);
      await expect(maskEquip.composeEquippables(masks[0], noBaseResourceId)).to.be.revertedWith(
        'RMRKNotComposableResource()',
      );
    });
  });

  async function deployContracts(): Promise<void> {
    const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
    const Nesting = await ethers.getContractFactory('RMRKNestingMock');
    const Equip = await ethers.getContractFactory('RMRKEquippableMock');

    // Base
    base = await Base.deploy(baseSymbol, baseType);
    await base.deployed();

    // Neon token
    neon = await Nesting.deploy(neonName, neonSymbol);
    await neon.deployed();
    neonEquip = await Equip.deploy();
    await neonEquip.deployed();

    // Link nesting and equippable:
    neonEquip.setNestingAddress(neon.address);
    neon.setEquippableAddress(neonEquip.address);
    // Weapon
    mask = await Nesting.deploy(maskName, maskSymbol);
    await mask.deployed();
    maskEquip = await Equip.deploy();
    await maskEquip.deployed();
    // Link nesting and equippable:
    maskEquip.setNestingAddress(mask.address);
    mask.setEquippableAddress(maskEquip.address);
  }

  async function setupBase(): Promise<void> {
    const partForHead1 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://head1.png',
    };
    const partForHead2 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://head2.png',
    };
    const partForHead3 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://head3.png',
    };
    const partForBody1 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://body1.png',
    };
    const partForBody2 = {
      itemType: ItemType.Fixed,
      z: 1,
      equippable: [],
      metadataURI: 'ipfs://body2.png',
    };
    const partForHair1 = {
      itemType: ItemType.Fixed,
      z: 2,
      equippable: [],
      metadataURI: 'ipfs://hair1.png',
    };
    const partForHair2 = {
      itemType: ItemType.Fixed,
      z: 2,
      equippable: [],
      metadataURI: 'ipfs://hair2.png',
    };
    const partForHair3 = {
      itemType: ItemType.Fixed,
      z: 2,
      equippable: [],
      metadataURI: 'ipfs://hair3.png',
    };
    const partForMaskBase1 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskBase1.png',
    };
    const partForMaskBase2 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskBase2.png',
    };
    const partForMaskBase3 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskBase3.png',
    };
    const partForEars1 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://ears1.png',
    };
    const partForEars2 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://ears2.png',
    };
    const partForHorns1 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://horn1.png',
    };
    const partForHorns2 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://horn2.png',
    };
    const partForHorns3 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://horn3.png',
    };
    const partForMaskBaseEquipped1 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskBaseEquipped1.png',
    };
    const partForMaskBaseEquipped2 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskBaseEquipped2.png',
    };
    const partForMaskBaseEquipped3 = {
      itemType: ItemType.Fixed,
      z: 3,
      equippable: [],
      metadataURI: 'ipfs://maskBaseEquipped3.png',
    };
    const partForEarsEquipped1 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://earsEquipped1.png',
    };
    const partForEarsEquipped2 = {
      itemType: ItemType.Fixed,
      z: 4,
      equippable: [],
      metadataURI: 'ipfs://earsEquipped2.png',
    };
    const partForHornsEquipped1 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://hornEquipped1.png',
    };
    const partForHornsEquipped2 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://hornEquipped2.png',
    };
    const partForHornsEquipped3 = {
      itemType: ItemType.Fixed,
      z: 5,
      equippable: [],
      metadataURI: 'ipfs://hornEquipped3.png',
    };
    const partForMask = {
      itemType: ItemType.Slot,
      z: 2,
      equippable: [maskEquip.address],
      metadataURI: '',
    };

    await base.addPartList([
      { partId: partIdForHead1, part: partForHead1 },
      { partId: partIdForHead2, part: partForHead2 },
      { partId: partIdForHead3, part: partForHead3 },
      { partId: partIdForBody1, part: partForBody1 },
      { partId: partIdForBody2, part: partForBody2 },
      { partId: partIdForHair1, part: partForHair1 },
      { partId: partIdForHair2, part: partForHair2 },
      { partId: partIdForHair3, part: partForHair3 },
      { partId: partIdForMaskBase1, part: partForMaskBase1 },
      { partId: partIdForMaskBase2, part: partForMaskBase2 },
      { partId: partIdForMaskBase3, part: partForMaskBase3 },
      { partId: partIdForEars1, part: partForEars1 },
      { partId: partIdForEars2, part: partForEars2 },
      { partId: partIdForHorns1, part: partForHorns1 },
      { partId: partIdForHorns2, part: partForHorns2 },
      { partId: partIdForHorns3, part: partForHorns3 },
      { partId: partIdForMaskBaseEquipped1, part: partForMaskBaseEquipped1 },
      { partId: partIdForMaskBaseEquipped2, part: partForMaskBaseEquipped2 },
      { partId: partIdForMaskBaseEquipped3, part: partForMaskBaseEquipped3 },
      { partId: partIdForEarsEquipped1, part: partForEarsEquipped1 },
      { partId: partIdForEarsEquipped2, part: partForEarsEquipped2 },
      { partId: partIdForHornsEquipped1, part: partForHornsEquipped1 },
      { partId: partIdForHornsEquipped2, part: partForHornsEquipped2 },
      { partId: partIdForHornsEquipped3, part: partForHornsEquipped3 },
      { partId: partIdForMask, part: partForMask },
    ]);
  }

  async function mintNeons(): Promise<void> {
    // Using only first 3 addresses to mint
    for (let i = 0; i < neons.length; i++) {
      await neon['mint(address,uint256)'](addrs[i % 3].address, neons[i]);
    }
  }

  async function mintMasks(): Promise<void> {
    // Mint one weapon to neon
    for (let i = 0; i < neons.length; i++) {
      await mask['mint(address,uint256,uint256,bytes)'](
        neon.address,
        masks[i],
        neons[i],
        ethers.utils.hexZeroPad('0x1', 1),
      );
      await neon.connect(addrs[i % 3]).acceptChild(neons[i], 0);
    }
  }

  async function addResourcesToNeon(): Promise<void> {
    await neonEquip.addResourceEntry(
      {
        id: neonResIds[0],
        equippableRefId: 0,
        metadataURI: 'ipfs:neonRes/1',
        baseAddress: base.address,
        custom: [],
      },
      [partIdForHead1, partIdForBody1, partIdForHair1], // Fixed parts
      [partIdForMask], // Can receive these
    );
    await neonEquip.addResourceEntry(
      {
        id: neonResIds[1],
        equippableRefId: 0,
        metadataURI: 'ipfs:neonRes/2',
        baseAddress: base.address,
        custom: [],
      },
      [partIdForHead2, partIdForBody2, partIdForHair2], // Fixed parts
      [partIdForMask], // Can receive these
    );
    await neonEquip.addResourceEntry(
      {
        id: neonResIds[2],
        equippableRefId: 0,
        metadataURI: 'ipfs:neonRes/3',
        baseAddress: base.address,
        custom: [],
      },
      [partIdForHead3, partIdForBody1, partIdForHair3], // Fixed parts
      [partIdForMask], // Can receive these
    );
    await neonEquip.addResourceEntry(
      {
        id: neonResIds[3],
        equippableRefId: 0,
        metadataURI: 'ipfs:neonRes/4',
        baseAddress: base.address,
        custom: [],
      },
      [partIdForHead1, partIdForBody2, partIdForHair2], // Fixed parts
      [partIdForMask], // Can receive these
    );
    await neonEquip.addResourceEntry(
      {
        id: neonResIds[4],
        equippableRefId: 0,
        metadataURI: 'ipfs:neonRes/1',
        baseAddress: base.address,
        custom: [],
      },
      [partIdForHead2, partIdForBody1, partIdForHair1], // Fixed parts
      [partIdForMask], // Can receive these
    );

    for (let i = 0; i < neons.length; i++) {
      await neonEquip.addResourceToToken(neons[i], neonResIds[i % neonResIds.length], 0);
      await neonEquip.connect(addrs[i % 3]).acceptResource(neons[i], 0);
    }
  }

  async function addResourcesToMask(): Promise<void> {
    // Resources for full view, composed with fixed parts
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesFull[0],
        equippableRefId: 0, // Not meant to equip
        metadataURI: `ipfs:weapon/full/${maskResourcesFull[0]}`,
        baseAddress: base.address, // Not meant to equip, but base needed for parts
        custom: [],
      },
      [partIdForMaskBase1, partIdForHorns1, partIdForEars1],
      [],
    );
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesFull[1],
        equippableRefId: 0, // Not meant to equip
        metadataURI: `ipfs:weapon/full/${maskResourcesFull[1]}`,
        baseAddress: base.address, // Not meant to equip, but base needed for parts
        custom: [],
      },
      [partIdForMaskBase2, partIdForHorns2, partIdForEars2],
      [],
    );
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesFull[2],
        equippableRefId: 0, // Not meant to equip
        metadataURI: `ipfs:weapon/full/${maskResourcesFull[2]}`,
        baseAddress: base.address, // Not meant to equip, but base needed for parts
        custom: [],
      },
      [partIdForMaskBase3, partIdForHorns1, partIdForEars2],
      [],
    );
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesFull[3],
        equippableRefId: 0, // Not meant to equip
        metadataURI: `ipfs:weapon/full/${maskResourcesFull[3]}`,
        baseAddress: base.address, // Not meant to equip, but base needed for parts
        custom: [],
      },
      [partIdForMaskBase2, partIdForHorns2, partIdForEars1],
      [],
    );

    // Resources for equipping view, also composed with fixed parts
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesEquip[0],
        equippableRefId: maskEquippableRefId,
        metadataURI: `ipfs:weapon/equip/${maskResourcesEquip[0]}`,
        baseAddress: base.address,
        custom: [],
      },
      [partIdForMaskBase1, partIdForHorns1, partIdForEars1],
      [],
    );

    // Resources for equipping view, also composed with fixed parts
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesEquip[1],
        equippableRefId: maskEquippableRefId,
        metadataURI: `ipfs:weapon/equip/${maskResourcesEquip[1]}`,
        baseAddress: base.address,
        custom: [],
      },
      [partIdForMaskBase2, partIdForHorns2, partIdForEars2],
      [],
    );

    // Resources for equipping view, also composed with fixed parts
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesEquip[2],
        equippableRefId: maskEquippableRefId,
        metadataURI: `ipfs:weapon/equip/${maskResourcesEquip[2]}`,
        baseAddress: base.address,
        custom: [],
      },
      [partIdForMaskBase3, partIdForHorns1, partIdForEars2],
      [],
    );

    // Resources for equipping view, also composed with fixed parts
    await maskEquip.addResourceEntry(
      {
        id: maskResourcesEquip[3],
        equippableRefId: maskEquippableRefId,
        metadataURI: `ipfs:weapon/equip/${maskResourcesEquip[3]}`,
        baseAddress: base.address,
        custom: [],
      },
      [partIdForMaskBase2, partIdForHorns2, partIdForEars1],
      [],
    );

    // Can be equipped into neons
    await maskEquip.setValidParentRefId(maskEquippableRefId, neonEquip.address, partIdForMask);

    // Add 2 resources to each weapon, one full, one for equip
    // There are 10 weapon tokens for 4 unique resources so we use %
    for (let i = 0; i < masks.length; i++) {
      await maskEquip.addResourceToToken(masks[i], maskResourcesFull[i % uniqueMasks], 0);
      await maskEquip.addResourceToToken(masks[i], maskResourcesEquip[i % uniqueMasks], 0);
      await maskEquip.connect(addrs[i % 3]).acceptResource(masks[i], 0);
      await maskEquip.connect(addrs[i % 3]).acceptResource(masks[i], 0);
    }
  }

  function bn(x: number): BigNumber {
    return BigNumber.from(x);
  }
});
