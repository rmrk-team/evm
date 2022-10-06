import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, constants, Contract } from 'ethers';
import { ethers } from 'hardhat';

const bn = BigNumber.from;

enum ItemType {
  None,
  Slot,
  Fixed,
}

interface Part {
  itemType: ItemType;
  z: number;
  equippable: string[];
  metadataURI: string;
}

interface IntakeStruct {
  part: Part;
  partId: BigNumber;
}

interface BaseRelatedResource {
  id: BigNumber;
  targetSlotId?: BigNumber;
  targetBaseAddress?: string;
  baseAddress?: string;
  partIds?: BigNumber[];
}

interface SlotEquipment {
  child: {
    contractAddress: string;
    tokenId: BigNumber;
  };
  partId: BigNumber;
  childBaseRelatedResourceId: BigNumber;
}

const defaultMetaDataURI = 'ipfs://test';

const eAParams = ['EquippableA', 'EA'];
const eBParams = ['EquippableB', 'EB'];
const eCParams = ['EquippableC', 'EC'];
const baseParams = ['BaseI', 'I'];
const validatorParams = ['0.1.0'];

const unExistId = 2569;

describe('Test Equippable Ayuilos Version', async function () {
  let user1: SignerWithAddress, user2: SignerWithAddress;
  let equippableA: Contract;
  let equippableB: Contract;
  let equippableC: Contract;
  let base: Contract;
  let validator: Contract;
  let baseAddr: string;
  let BRR1: BaseRelatedResource;
  let BRR11: BaseRelatedResource;
  let BRR2: BaseRelatedResource;
  let BRR3: BaseRelatedResource;
  let slotEquipment1: SlotEquipment;
  let slotEquipment2: SlotEquipment;
  let slotEquipment3: SlotEquipment;

  before(async function () {
    [user1, user2] = await ethers.getSigners();
    const equippableContract = await ethers.getContractFactory('RMRKEquippableAVerMock');
    const baseStorageContract = await ethers.getContractFactory('RMRKBaseStorageMock');
    const validatorContract = await ethers.getContractFactory('RMRKValidator');

    equippableA = await equippableContract.deploy(...eAParams);
    equippableB = await equippableContract.deploy(...eBParams);
    equippableC = await equippableContract.deploy(...eCParams);
    base = await baseStorageContract.deploy(...baseParams);
    validator = await validatorContract.deploy(...validatorParams);

    await Promise.all([
      equippableA.deployed(),
      equippableB.deployed(),
      equippableC.deployed(),
      base.deployed(),
      validator.deployed(),
    ]);

    baseAddr = base.address;

    await base.addPartList([
      {
        partId: bn(1),
        part: { itemType: ItemType.Fixed, z: 1, equippable: [], metadataURI: defaultMetaDataURI },
      },
      {
        partId: bn(2),
        part: { itemType: ItemType.Slot, z: 1, equippable: [], metadataURI: '' },
      },
      {
        partId: bn(3),
        part: { itemType: ItemType.Slot, z: 1, equippable: [], metadataURI: '' },
      },
    ] as IntakeStruct[]);

    slotEquipment1 = {
      partId: bn(2),
      childBaseRelatedResourceId: bn(1),
      child: { contractAddress: equippableB.address, tokenId: bn(1) },
    };

    slotEquipment2 = {
      partId: bn(2),
      childBaseRelatedResourceId: bn(1),
      child: { contractAddress: equippableC.address, tokenId: bn(1) },
    };

    slotEquipment3 = {
      partId: bn(3),
      childBaseRelatedResourceId: bn(1),
      child: { contractAddress: equippableC.address, tokenId: bn(1) },
    };

    // will be eA's resource
    BRR1 = {
      id: bn(1),
      baseAddress: baseAddr,
      partIds: [bn(1), bn(2)],
      targetBaseAddress: constants.AddressZero,
      targetSlotId: bn(0),
    };

    // will be eA's resource
    BRR11 = {
      id: bn(2),
      baseAddress: baseAddr,
      partIds: [bn(2), bn(3)],
      targetBaseAddress: constants.AddressZero,
      targetSlotId: bn(0),
    };

    // will be eB's resource
    BRR2 = {
      id: bn(1),
      baseAddress: constants.AddressZero,
      partIds: [],
      targetBaseAddress: baseAddr,
      targetSlotId: bn(2),
    };

    // will be eC's resource
    BRR3 = {
      id: bn(1),
      baseAddress: constants.AddressZero,
      partIds: [],
      targetBaseAddress: baseAddr,
      targetSlotId: bn(3),
    };

    // add BRR1 to eA, add BRR2 to eB, add BRR3 to eC
    await equippableA.addBaseRelatedResourceEntry(BRR1, '');
    await equippableB.addBaseRelatedResourceEntry(BRR2, defaultMetaDataURI);
    await equippableC.addBaseRelatedResourceEntry(BRR3, defaultMetaDataURI);

    // Mint an eA NFT tokenId = 1, an eB NFT tokenId = 1, an eC NFT tokenId = 1
    // add resource1 of eA to token1 of eA and accept it
    // add resource1 of eB to token1 of eB and accept it by user2
    // add resource1 of eC to token1 of eC and accept it by user2

    await equippableA['safeMint(address,uint256)'](user1.address, 1);
    await equippableA.addResourceToToken(1, 1, 0);
    await equippableA.acceptResource(1, 0);

    await equippableB['safeMint(address,uint256)'](user2.address, 1);
    await equippableB.addResourceToToken(1, 1, 0);
    await equippableB.connect(user2).acceptResource(1, 0);

    await equippableC['safeMint(address,uint256)'](user2.address, 1);
    await equippableC.addResourceToToken(1, 1, 0);
    await equippableC.connect(user2).acceptResource(1, 0);

    // transfer eB1 to eA1
    await equippableB
      .connect(user2)
      ['transferFrom(address,address,uint256,uint256)'](user2.address, equippableA.address, 1, 1);
  });

  describe('metadata', function () {
    it('Equippable has a name', async function () {
      expect(await equippableA.name()).to.be.equal(eAParams[0]);
    });

    it('Equippable has a symbol', async function () {
      expect(await equippableA.symbol()).to.be.equal(eAParams[1]);
    });

    it('Validator has a version', async function () {
      expect(await validator.version()).to.be.equal(validatorParams[0]);
    });
  });

  describe('BRR functions', function () {
    it('revert when bRRId not exist', async function () {
      await expect(equippableA.getBaseRelatedResource(unExistId)).to.be.revertedWithCustomError(
        equippableA,
        'RMRKBaseRelatedResourceDidNotExist',
      );
    });
  });

  describe('slotEquipment functions', function () {
    describe('setSlotEquipments', function () {
      it('revert when token not exist', async function () {
        await expect(
          equippableA.setSlotEquipments(unExistId, 1, [slotEquipment1]),
        ).to.be.revertedWithCustomError(equippableA, 'ERC721InvalidTokenId');
      });

      it('revert when bRRId not in activeResourceIds', async function () {
        await expect(
          equippableA.setSlotEquipments(1, unExistId, [slotEquipment1]),
        ).to.be.revertedWithCustomError(equippableA, 'RMRKNotInActiveResources');
      });

      it('emit SlotEquipmentsSet event', async function () {
        await expect(equippableA.setSlotEquipments(1, 1, [slotEquipment1])).to.emit(
          equippableA,
          'SlotEquipmentsSet',
        );
      });
    });

    describe('getSlotEquipments', function () {
      it('revert when token not exist', async function () {
        await expect(equippableA.getSlotEquipments(unExistId, 1)).to.be.revertedWithCustomError(
          equippableA,
          'ERC721InvalidTokenId',
        );
      });

      it('can get right data', async function () {
        const data = (await equippableA.getSlotEquipments(1, 1))[0];

        expect(_slotEquipmentIsEqual(data, slotEquipment1)).to.equal(true);
      });
    });

    describe('addSlotEquipments', function () {
      it('revert when token not exist', async function () {
        await expect(
          equippableA.addSlotEquipments(unExistId, 1, [slotEquipment1]),
        ).to.be.revertedWithCustomError(equippableA, 'ERC721InvalidTokenId');
      });

      it('revert when bRRId not in activeResourceIds', async function () {
        await expect(
          equippableA.addSlotEquipments(1, unExistId, [slotEquipment1]),
        ).to.be.revertedWithCustomError(equippableA, 'RMRKNotInActiveResources');
      });

      it('revert when slot is occupied', async function () {
        await expect(
          equippableA.addSlotEquipments(1, 1, [slotEquipment2]),
        ).to.be.revertedWithCustomError(equippableA, 'RMRKSlotIsOccupied');
      });

      // It's ok when child in slotEquipment3 is not child of equippableA.
      // Because it's not guaranteed "true" when a contract told you it's
      // the owner of another contract token.
      // Always using a validator that contains reasonable validating logic.
      it('emit SlotEquipmentsAdd event', async function () {
        expect(await equippableA.addSlotEquipments(1, 1, [slotEquipment3])).to.emit(
          equippableA,
          'SlotEquipmentsAdd',
        );
      });
    });

    describe('removeSlotEquipments', function () {
      it('revert when token not exist', async function () {
        await expect(
          equippableA.removeSlotEquipments(unExistId, 1, [0]),
        ).to.be.revertedWithCustomError(equippableA, 'ERC721InvalidTokenId');
      });

      it('revert when bRRId not in activeResourceIds', async function () {
        await expect(
          equippableA.removeSlotEquipments(1, unExistId, [0]),
        ).to.be.revertedWithCustomError(equippableA, 'RMRKNotInActiveResources');
      });

      it('revert when index over length', async function () {
        await expect(
          equippableA.removeSlotEquipments(1, 1, [unExistId]),
        ).to.be.revertedWithCustomError(equippableA, 'RMRKIndexOverLength');
      });

      // Here will remove the 2nd sE which be added by `addSlotEquipments`
      it('emit SlotEquipmentsRemove event', async function () {
        expect(equippableA.removeSlotEquipments(1, 1, [1])).to.emit(
          equippableA,
          'SlotEquipmentsRemove',
        );
      });
    });
  });

  describe('validator', function () {});
});

function _slotEquipmentIsEqual(source: SlotEquipment, target: SlotEquipment) {
  if (!source.partId.eq(target.partId)) {
    return false;
  }
  if (!source.childBaseRelatedResourceId.eq(target.childBaseRelatedResourceId)) {
    return false;
  }
  if (source.child.contractAddress !== target.child.contractAddress) {
    return false;
  }
  if (!source.child.tokenId.eq(target.child.tokenId)) {
    return false;
  }

  return true;
}
