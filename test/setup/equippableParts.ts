import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

let addrs: SignerWithAddress[];

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

const uniqueNeons = 10;
const uniqueMasks = 4;
// Ids could be the same since they are different collections, but to avoid log problems we have them unique
const neons: number[] = [];
const masks: number[] = [];

const neonResIds = [100, 101, 102, 103, 104];
const maskResourcesFull = [1, 2, 3, 4]; // Must match the total of uniqueResources
const maskResourcesEquip = [5, 6, 7, 8]; // Must match the total of uniqueResources
const maskEquippableRefId = 1; // Resources to equip will all use this

enum ItemType {
  None,
  Slot,
  Fixed,
}

async function setupContextForParts(
  base: Contract,
  neon: Contract,
  neonEquip: Contract,
  mask: Contract,
  maskEquip: Contract,
  mint: (token: Contract, to: string) => Promise<number>,
  nestMint: (token: Contract, to: string, parentId: number) => Promise<number>,
) {
  const [, ...signersAddr] = await ethers.getSigners();
  addrs = signersAddr;

  await setupBase();

  await mintNeons();
  await mintMasks();

  await addResourcesToNeon();
  await addResourcesToMask();

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
    for (let i = 0; i < uniqueNeons; i++) {
      const newId = await mint(neon, addrs[i % 3].address);
      neons.push(newId);
    }
  }

  async function mintMasks(): Promise<void> {
    // Mint one weapon to neon
    for (let i = 0; i < uniqueNeons; i++) {
      const newId = await nestMint(mask, neon.address, neons[i]);
      masks.push(newId);
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
      },
      [partIdForHead2, partIdForBody1, partIdForHair1], // Fixed parts
      [partIdForMask], // Can receive these
    );

    for (let i = 0; i < uniqueNeons; i++) {
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
}

export {
  partIdForHead1,
  partIdForHead2,
  partIdForHead3,
  partIdForBody1,
  partIdForBody2,
  partIdForHair1,
  partIdForHair2,
  partIdForHair3,
  partIdForMaskBase1,
  partIdForMaskBase2,
  partIdForMaskBase3,
  partIdForEars1,
  partIdForEars2,
  partIdForHorns1,
  partIdForHorns2,
  partIdForHorns3,
  partIdForMaskBaseEquipped1,
  partIdForMaskBaseEquipped2,
  partIdForMaskBaseEquipped3,
  partIdForEarsEquipped1,
  partIdForEarsEquipped2,
  partIdForHornsEquipped1,
  partIdForHornsEquipped2,
  partIdForHornsEquipped3,
  partIdForMask,
  uniqueNeons,
  uniqueMasks,
  neons,
  masks,
  neonResIds,
  maskResourcesFull,
  maskResourcesEquip,
  maskEquippableRefId,
  setupContextForParts,
};
