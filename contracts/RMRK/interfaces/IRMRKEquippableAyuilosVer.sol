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
        uint256 tokenId;
        IRMRKNesting.Child child;
        uint64 baseRelatedResourceId;
        uint64 childBaseRelatedResourceId;
    }

    event Equip(uint256 tokenId);
    event Unequip(uint256 tokenId);

    event BaseRelatedResourceSet(uint64 id);
    event BaseRelatedResourceIdsInvolvedInEquipmentSet(
        uint256 tokenId,
        uint64[] baseRelatedResourceIds
    );
    event SlotEquipmentsAdd(
        uint256 tokenId,
        uint128[] slotEquipmentIds,
        SlotEquipment[] slotEquipments
    );
    event SlotEquipmentsRemove(uint256 tokenId, uint128[] slotEquipmentIds);

    function equip(uint256 tokenId) external;

    function unequip(uint256 tokenId) external;

    function getEquipStatus(uint256 tokenId) external view returns (bool);

    function batchGetEquipStatus(uint256[] calldata tokenIds)
        external
        view
        returns (bool[] memory);

    function getAllBaseRelatedResourceIds()
        external
        view
        returns (uint64[] memory);

    function getBaseRelatedResourceIdsInvolvedInEquipment(uint256 tokenId)
        external
        view
        returns (uint64[] memory);

    function getSlotEquipments(uint256 tokenId)
        external
        view
        returns (SlotEquipment[] memory slotEquipments);

    function setBaseRelatedResourceIdsInvolvedInEquipment(
        uint256 tokenId,
        uint64[] calldata baseRelatedResourceIds
    ) external;

    function addSlotEquipments(
        uint256 tokenId,
        uint128[] calldata slotEquipmentIds,
        SlotEquipment[] calldata slotEquipments
    ) external;
}
