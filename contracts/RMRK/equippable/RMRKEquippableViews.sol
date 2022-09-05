// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../base/IRMRKBaseStorage.sol";
import "../library/RMRKLib.sol";
import "./IRMRKEquippable.sol";

import "@openzeppelin/contracts/utils/Address.sol";


// import "hardhat/console.sol";

contract RMRKEquippableViews {
    using RMRKLib for uint256;
    using Address for address;
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];

    constructor() {}

    function getEquipped(
        address equippableContract,
        uint64 tokenId,
        uint64 resourceId
    ) public view returns (
        uint64[] memory slotParts,
        IRMRKEquippable.Equipment[] memory childrenEquipped
    )
    {
        IRMRKEquippable _equippableContract = IRMRKEquippable(
            equippableContract
        );

        address targetBaseAddress = _equippableContract.getBaseAddressOfResource(resourceId);
        uint64[] memory slotPartIds = _equippableContract.getSlotPartIds(
            resourceId
        );

        // TODO: Clarify on docs: Some children equipped might be empty.
        slotParts = new uint64[](slotPartIds.length);
        childrenEquipped = new IRMRKEquippable.Equipment[](slotPartIds.length);

        uint256 len = slotPartIds.length;
        for (uint256 i; i < len; ) {
            slotParts[i] = slotPartIds[i];
            IRMRKEquippable.Equipment memory equipment = _equippableContract
                .getEquipment(tokenId, targetBaseAddress, slotPartIds[i]);
            if (equipment.resourceId == resourceId) {
                childrenEquipped[i] = equipment;
            }
            unchecked {
                ++i;
            }
        }
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    function composeEquippables(
        address equippableContract,
        uint256 tokenId,
        uint64 resourceId
    ) public view returns (
        IRMRKEquippable.ExtendedResource memory resource,
        IRMRKEquippable.FixedPart[] memory fixedParts,
        IRMRKEquippable.SlotPart[] memory slotParts
    )
    {
        IRMRKEquippable _equippableContract = IRMRKEquippable(
            equippableContract
        );

        resource = _equippableContract.getExtendedResource(resourceId);
        address targetBaseAddress = _equippableContract.getBaseAddressOfResource(resourceId);

        // Fixed parts:
        uint64[] memory fixedPartIds = _equippableContract.getFixedPartIds(
            resourceId
        );
        fixedParts = new IRMRKEquippable.FixedPart[](fixedPartIds.length);

        uint256 len = fixedPartIds.length;
        if (len > 0) {
            IRMRKBaseStorage.Part[] memory baseFixedParts = IRMRKBaseStorage(
                targetBaseAddress
            ).getParts(fixedPartIds);
            for (uint256 i; i < len; ) {
                fixedParts[i] = IRMRKEquippable.FixedPart({
                    partId: fixedPartIds[i],
                    z: baseFixedParts[i].z,
                    metadataURI: baseFixedParts[i].metadataURI
                });
                unchecked {
                    ++i;
                }
            }
        }

        // Slot parts:
        uint64[] memory slotPartIds = _equippableContract.getSlotPartIds(
            resourceId
        );
        slotParts = new IRMRKEquippable.SlotPart[](slotPartIds.length);
        len = slotPartIds.length;

        if (len > 0) {
            IRMRKBaseStorage.Part[] memory baseSlotParts = IRMRKBaseStorage(
                targetBaseAddress
            ).getParts(slotPartIds);
            for (uint256 i; i < len; ) {
                IRMRKEquippable.Equipment memory equipment = _equippableContract
                    .getEquipment(tokenId, targetBaseAddress, slotPartIds[i]);
                if (equipment.resourceId == resourceId) {
                    slotParts[i] = IRMRKEquippable.SlotPart({
                        partId: slotPartIds[i],
                        childResourceId: equipment.childResourceId,
                        z: baseSlotParts[i].z,
                        childTokenId: equipment.childTokenId,
                        childAddress: equipment.childEquippableAddress,
                        metadataURI: baseSlotParts[i].metadataURI
                    });
                } else {
                    slotParts[i] = IRMRKEquippable.SlotPart({
                        partId: slotPartIds[i],
                        childResourceId: uint64(0),
                        z: baseSlotParts[i].z,
                        childTokenId: uint256(0),
                        childAddress: address(0),
                        metadataURI: baseSlotParts[i].metadataURI
                    });
                }
                unchecked {
                    ++i;
                }
            }
        }
    }
}
