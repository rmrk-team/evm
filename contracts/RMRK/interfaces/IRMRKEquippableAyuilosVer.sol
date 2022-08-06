// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKNesting.sol";

interface IRMRKEquippableAyuilosVer {
    /**
        @dev `baseAddress` and `partIds` be used to construct a BaseStorage instance
        and `targetBaseAddress` and `targetSlotId` be used to point at a Base slot
        the rest attributes are the same with `Resource`
     */
    struct BaseRelatedResource {
        uint64 id;
        uint64 targetSlotId;
        address targetBaseAddress;
        address baseAddress;
        uint64[] partIds;
    }

    struct SlotEquipment {
        IRMRKNesting.Child child;
        uint64 childBaseRelatedResourceId;
    }

    event BaseRelatedResourceAdd(uint64 id);
    event SlotEquipmentsSet(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] slotPartIds,
        SlotEquipment[] slotEquipments
    );

    function getBaseRelatedResource(uint64 baseRelatedResourceId)
        external
        view
        returns (BaseRelatedResource memory baseRelatedResource);

    function getAllBaseRelatedResourceIds()
        external
        view
        returns (uint64[] memory allBaseRelatedResourceIds);

    function getSlotEquipments(uint256 tokenId, uint64 baseRelatedResource)
        external
        view
        returns (SlotEquipment[] memory slotEquipments);

    function setSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] calldata slotPartIds,
        SlotEquipment[] calldata slotEquipments
    ) external;
}
