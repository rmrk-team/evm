// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKNesting.sol";
import "./IRMRKMultiResource.sol";

interface IRMRKEquippableEventsAndStruct {
    event BaseRelatedResourceAdd(uint64 indexed id);

    event SlotEquipmentsAdd(
        uint256 indexed tokenId,
        uint64 indexed baseRelatedResourceId,
        SlotEquipment[] slotEquipments
    );

    event SlotEquipmentsRemove(
        uint256 indexed tokenId,
        uint64 indexed baseRelatedResourceId,
        uint64[] indexes
    );

    /**
        @dev `baseAddress` and `partIds` be used to construct a BaseStorage instance,
        `targetBaseAddress` and `targetSlotId` be used to point at a Base slot,
        the rest attributes are the same with `Resource`
     */
    struct BaseRelatedResource {
        uint64 id;
        address baseAddress;
        uint64 targetSlotId;
        address targetBaseAddress;
        uint64[] partIds;
        string metadataURI;
    }

    struct BaseRelatedData {
        address baseAddress;
        uint64 targetSlotId;
        address targetBaseAddress;
        uint64[] partIds;
    }

    struct SlotEquipment {
        uint256 tokenId;
        uint64 baseRelatedResourceId;
        uint64 slotId;
        uint64 childBaseRelatedResourceId;
        IRMRKNesting.Child child;
    }

    struct EquipmentPointer {
        uint256 equipmentIndex;
        uint256 recordIndex;
    }
}

interface IRMRKEquippable is IRMRKEquippableEventsAndStruct {
    function getBaseRelatedResource(uint64 baseRelatedResourceId)
        external
        view
        returns (BaseRelatedResource memory baseRelatedResource);

    function getBaseRelatedResources(uint64[] memory)
        external
        view
        returns (BaseRelatedResource[] memory);

    function getActiveBaseRelatedResources(uint256 tokenId)
        external
        view
        returns (uint64[] memory);

    function getAllBaseRelatedResourceIds()
        external
        view
        returns (uint64[] memory allBaseRelatedResourceIds);

    function getSlotEquipment(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64 slotId
    ) external view returns (SlotEquipment memory slotEquipment);

    function getSlotEquipment(
        address childContract,
        uint256 childTokenId,
        uint64 childBaseRelatedResourceId
    ) external view returns (SlotEquipment memory slotEquipment);

    function getSlotEquipments(uint256 tokenId, uint64 baseRelatedResource)
        external
        view
        returns (SlotEquipment[] memory slotEquipments);

    function getSlotEquipments(address childContract, uint256 tokenId)
        external
        view
        returns (SlotEquipment[] memory slotEquipments);

    function getAllSlotEquipments()
        external
        view
        returns (SlotEquipment[] memory slotEquipments);

    function addSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        SlotEquipment[] memory slotEquipments,
        bool doMoreCheck
    ) external;

    function removeSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] memory slotIds
    ) external;

    function removeSlotEquipments(
        address childContract,
        uint256 childTokenId,
        uint64[] calldata childBaseRelatedResourceIds
    ) external;
}
