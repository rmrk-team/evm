// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./interfaces/ILightmEquippable.sol";
import "./internalFunctionSet/LightmEquippableInternal.sol";

contract LightmEquippableFacet is ILightmEquippable, LightmEquippableInternal {
    using RMRKLib for uint64[];

    // ------------------------ MultiResource ------------------------

    function getBaseRelatedResource(uint64 baseRelatedResourceId)
        public
        view
        returns (BaseRelatedResource memory baseRelatedResource)
    {
        baseRelatedResource = _getBaseRelatedResource(baseRelatedResourceId);
    }

    function getBaseRelatedResources(uint64[] calldata baseRelatedResourceIds)
        public
        view
        returns (BaseRelatedResource[] memory)
    {
        return _getBaseRelatedResources(baseRelatedResourceIds);
    }

    function getActiveBaseRelatedResources(uint256 tokenId)
        public
        view
        returns (uint64[] memory)
    {
        return _getActiveBaseRelatedResources(tokenId);
    }

    function getAllBaseRelatedResourceIds()
        public
        view
        returns (uint64[] memory allBaseRelatedResourceIds)
    {
        allBaseRelatedResourceIds = _getAllBaseRelatedResourceIds();
    }

    //
    // -------------- Equipment --------------
    //

    /**
     * @dev get slotEquipment by tokenId, baseRelatedResourceId and slotId (from parent's perspective)
     */
    function getSlotEquipment(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64 slotId
    ) public view returns (SlotEquipment memory slotEquipment) {
        slotEquipment = _getSlotEquipment(
            tokenId,
            baseRelatedResourceId,
            slotId
        );
    }

    /**
     * @dev get slotEquipment by childContract, childTokenId and childBaseRelatedResourceId (from child's perspective)
     */
    function getSlotEquipment(
        address childContract,
        uint256 childTokenId,
        uint64 childBaseRelatedResourceId
    ) public view returns (SlotEquipment memory slotEquipment) {
        slotEquipment = _getSlotEquipment(
            childContract,
            childTokenId,
            childBaseRelatedResourceId
        );
    }

    /**
     * @dev get all about one base instance equipment status
     */
    function getSlotEquipments(uint256 tokenId, uint64 baseRelatedResourceId)
        public
        view
        returns (SlotEquipment[] memory)
    {
        return _getSlotEquipments(tokenId, baseRelatedResourceId);
    }

    /**
     * @dev get one token's all baseRelatedResources equipment status
     */
    function getSlotEquipments(address childContract, uint256 childTokenId)
        public
        view
        returns (SlotEquipment[] memory)
    {
        return _getSlotEquipments(childContract, childTokenId);
    }

    function getAllSlotEquipments()
        public
        view
        returns (SlotEquipment[] memory slotEquipments)
    {
        slotEquipments = _getAllSlotEquipments();
    }

    function getSlotEquipmentByIndex(uint256 index)
        public
        view
        returns (SlotEquipment memory slotEquipment)
    {
        slotEquipment = _getSlotEquipmentByIndex(index);
    }

    function addSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        SlotEquipment[] memory slotEquipments,
        bool doMoreCheck
    ) public virtual {
        _addSlotEquipments(
            tokenId,
            baseRelatedResourceId,
            slotEquipments,
            doMoreCheck
        );
    }

    function removeSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] memory slotIds
    ) public virtual {
        _removeSlotEquipments(tokenId, baseRelatedResourceId, slotIds);
    }

    function removeSlotEquipments(
        address childContract,
        uint256 childTokenId,
        uint64[] memory childBaseRelatedResourceIds
    ) public virtual {
        _removeSlotEquipments(
            childContract,
            childTokenId,
            childBaseRelatedResourceIds
        );
    }
}
