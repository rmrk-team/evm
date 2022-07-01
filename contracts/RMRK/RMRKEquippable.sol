// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./abstracts/MultiResourceAbstract.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippable.sol";
import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingWithEquippable.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// import "hardhat/console.sol";

error ERC721NotApprovedOrOwner();
error RMRKAlreadyEquipped();
error RMRKBadLength();
error RMRKCallerCannotChangeEquipStatus();
error RMRKEquippableBasePartNotEquippable();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKNotEquipped();
error RMRKOwnerQueryForNonexistentToken();
error RMRKSlotAlreadyUsed();

contract RMRKEquippable is IRMRKEquippable, MultiResourceAbstract {

    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
    using Strings for uint256;

    struct ExtendedResource { // Used for input/output only
        uint64 id; // ID of this resource
        uint64 equippableRefId;
        address baseAddress;
        string metadataURI;
        uint128[] custom; //Custom data
    }

    address private _nestingAddress;

    //mapping of uint64 Ids to resource object
    mapping(uint64 => address) private _baseAddresses;
    mapping(uint64 => uint64) private _equippableRefIds;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    //mapping of token id to base address to slot part Id to equipped information.
    mapping(uint => mapping(address => mapping(uint64 => Equipment))) private _equipments;

    //mapping of token id to whether it is equipped into the parent
    mapping(uint => bool) private _isEquipped;


    //Mapping of refId to parent contract address and valid slotId
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    function _ownerOf(uint tokenId) internal view returns(address) {
        return IRMRKNesting(_nestingAddress).ownerOf(tokenId);
    }

    function _onlyOwner(uint tokenId) internal view {
        if(_msgSender() != _ownerOf(tokenId)) revert ERC721NotApprovedOrOwner();
    }

    modifier onlyOwner(uint256 tokenId) {
        _onlyOwner(tokenId);
        _;
    }

    function _setNestingAddress(address nestingAddress) internal {
        _nestingAddress = nestingAddress;
    }

    function getNestingAddress() external view returns(address) {
        return _nestingAddress;
    }

    function supportsInterface(bytes4 interfaceId) public virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKEquippable).interfaceId ||
            interfaceId == type(IERC165).interfaceId
        );
    }

    function equip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyOwner(tokenId) {
        _equip(tokenId, resourceId, slotPartId, childIndex, childResourceId);
    }

    function _equip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) private {
        Resource storage resource = _resources[resourceId];
        if (_equipments[tokenId][_baseAddresses[resourceId]][slotPartId].childAddress != address(0))
            revert RMRKSlotAlreadyUsed();

        IRMRKNesting.Child memory child = IRMRKNesting(_nestingAddress).childOf(tokenId, childIndex);
        address childEquipable = IRMRKNestingWithEquippable(child.contractAddress).getEquippablesAddress();

        // Check from child persective
        if(!validateChildEquip(childEquipable, childResourceId, slotPartId))
            revert RMRKEquippableBasePartNotEquippable();

        // Check from base perspective
        if(!_validateBaseEquip(_baseAddresses[resourceId], childEquipable, slotPartId))
            revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: resourceId,
            childResourceId: childResourceId,
            childTokenId: child.tokenId,
            childAddress: childEquipable
        });

        _equipments[tokenId][_baseAddresses[resourceId]][slotPartId] = newEquip;
        IRMRKEquippable(childEquipable).markEquipped(child.tokenId, childResourceId, true);
    }

    function unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) external onlyOwner(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
    }

    function _unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) private {
        address targetBaseAddress = _baseAddresses[resourceId];
        Equipment memory equipment = _equipments[tokenId][targetBaseAddress][slotPartId];
        if (equipment.childAddress == address(0))
            revert RMRKNotEquipped();
        delete _equipments[tokenId][targetBaseAddress][slotPartId];

        IRMRKEquippable(equipment.childAddress).markEquipped(equipment.childTokenId, equipment.childResourceId, false);
    }

    function replaceEquipment(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyOwner(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
        _equip(tokenId, resourceId, slotPartId, childIndex, childResourceId);
    }

    function markEquipped(uint tokenId, uint64 resourceId, bool equipped) external {
        if (getCallerEquippableSlot(resourceId) == uint64(0))
            revert RMRKCallerCannotChangeEquipStatus();
        if (_isEquipped[tokenId] && equipped)
            revert RMRKAlreadyEquipped();
        if(!_isEquipped[tokenId] && !equipped)
            revert RMRKNotEquipped();
        _isEquipped[tokenId] = equipped;
    }

    function isEquipped(uint tokenId) external view returns(bool) {
        return _isEquipped[tokenId];
    }

    function getEquipped(
        uint64 tokenId,
        uint64 resourceId
    ) public view returns (
        uint64[] memory slotsEquipped,
        Equipment[] memory childrenEquipped
    ) {
        address targetBaseAddress = _baseAddresses[resourceId];
        uint64[] memory slotPartIds = _slotPartIds[resourceId];

        // FIXME: There could be empty slots and children at the end, since a part might be equipped to another resource or simply not equipped
        slotsEquipped = new uint64[](slotPartIds.length);
        childrenEquipped = new Equipment[](slotPartIds.length);

        uint256 len = slotPartIds.length;
        for (uint i; i<len;) {
            slotsEquipped[i] = slotPartIds[i];
            Equipment memory equipment = _equipments[tokenId][targetBaseAddress][slotPartIds[i]];
            if (equipment.resourceId == resourceId) {
                childrenEquipped[i] = equipment;
            }
            unchecked {++i;}
        }
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    function composeEquippables(
        uint tokenId,
        uint64 resourceId
    ) public view returns (uint64[] memory basePartIds, address[] memory baseAddresses) {
        //get Resource of target token
        // Resource storage resource = _resources[resourceId];
        // //Check gas efficiency of scoping like this
        // address baseAddress = resource.baseAddress;
        // //fixed IDs
        // {
        //     uint64[] memory fixedPartIds = _fixedPartIds[resourceId];
        //     uint256 len = fixedPartIds.length;
        //     uint256 basePartIdsLen = basePartIds.length;
        //     unchecked {
        //         for (uint i; i<len;) {
        //             uint64 partId = fixedPartIds[i];
        //             basePartIds[basePartIdsLen] = partId;
        //             baseAddresses[basePartIdsLen] = baseAddress;
        //             ++basePartIdsLen;
        //             ++i;
        //         }
        //     }
        // }
        // //Slot IDs + recurse
        // {
        //     uint64[] memory slotPartIds = _slotPartIds[resourceId];
        //     uint256 len = slotPartIds.length;
        //     uint256 basePartIdsLen = basePartIds.length;
        //     unchecked {
        //         for (uint i; i<len;) {
        //             uint64 partId = slotPartIds[i];
        //             basePartIds[basePartIdsLen] = partId;
        //             baseAddresses[basePartIdsLen] = baseAddress;
        //             ++basePartIdsLen;
        //             ++i;

        //             uint64 equippedResourceId = _equipments[resourceId][partId].childResourceId;
        //             //Recuse while we're in this block, slotpartIds are initialized
        //             (uint64[] memory equippedBasePartIds, address[] memory equippedBaseAddresses) = composeEquippables(
        //                 equippedResourceId
        //             );
        //             uint256 recLen = equippedBasePartIds.length;
        //             for (uint j; j<recLen;) {
        //                 basePartIds[basePartIdsLen] = equippedBasePartIds[j];
        //                 baseAddresses[basePartIdsLen] = equippedBaseAddresses[j];
        //                 ++basePartIdsLen;
        //                 ++j;
        //             }
        //         }
        //     }
        // }
    }

    // --------------------- VALIDATION ---------------------

    // Declares that resources with this refId, are equippable into the parent address, on the partId slot
    function _setValidParentRefId(uint64 refId, address parentAddress, uint64 partId) internal {
        _validParentSlots[refId][parentAddress] = partId;
    }

    // Checks on the base contract that the child can go into the part id
    function _validateBaseEquip(address baseContract, address childContract, uint64 partId) private view returns (bool isEquippable) {
        isEquippable = IRMRKBaseStorage(baseContract).checkIsEquippable(partId, childContract);
    }

    //Checks if the resource for the child is intented to be equipped into the part slot
    function validateChildEquip(address childContract, uint64 childResourceId, uint64 slotPartId) public view returns (bool isEquippable) {
        // FIXME: Must also check the child is not already equipped
        isEquippable = IRMRKEquippable(childContract).getCallerEquippableSlot(childResourceId) == slotPartId;
    }

    //Return 0 means not equippable
    function getCallerEquippableSlot(uint64 resourceId) public view returns (uint64 equippableSlot) {
        uint64 refId = _equippableRefIds[resourceId];
        equippableSlot = _validParentSlots[refId][_msgSender()];
    }

    ////////////////////////////////////////
    //                RESOURCES
    ////////////////////////////////////////

    function acceptResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyOwner(tokenId) {
        // FIXME: clean approvals and test
        _acceptResource(tokenId, index);
    }

    function rejectResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyOwner(tokenId) {
        // FIXME: clean approvals and test
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(
        uint256 tokenId
    ) external virtual onlyOwner(tokenId) {
        // FIXME: clean approvals and test
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual onlyOwner(tokenId) {
        // FIXME: clean approvals and test
        _setPriority(tokenId, priorities);
    }

    ////////////////////////////////////////
    //       MANAGING EXTENDED RESOURCES
    ////////////////////////////////////////

    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) internal {
        _addResourceEntry(resource.id, resource.metadataURI, resource.custom);

        _baseAddresses[resource.id] = resource.baseAddress;
        _equippableRefIds[resource.id] = resource.equippableRefId;
        _fixedPartIds[resource.id] = fixedPartIds;
        _slotPartIds[resource.id] = slotPartIds;
    }

    function getExtendedResource(
        uint64 resourceId
    ) public view virtual returns (ExtendedResource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == uint64(0))
            revert RMRKNoResourceMatchingId();
        
        return ExtendedResource({
            id: resource.id,
            equippableRefId: _equippableRefIds[resource.id],
            baseAddress: _baseAddresses[resource.id],
            metadataURI: resource.metadataURI,
            custom: resource.custom
        });
    }

    function getExtendedResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(ExtendedResource memory) {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getExtendedResource(resourceId);
    }

    function getPendingExtendedResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(ExtendedResource memory) {
        uint64 resourceId = getPendingResources(tokenId)[index];
        return getExtendedResource(resourceId);
    }

    function getFullExtendedResources(
        uint256 tokenId
    ) external view virtual returns (ExtendedResource[] memory) {
        uint64[] memory resourceIds = _activeResources[tokenId];
        return _getExtendedResourcesById(resourceIds);
    }

    function getFullPendingExtendedResources(
        uint256 tokenId
    ) external view virtual returns (ExtendedResource[] memory) {
        uint64[] memory resourceIds = _pendingResources[tokenId];
        return _getExtendedResourcesById(resourceIds);
    }

    function _getExtendedResourcesById(
        uint64[] memory resourceIds
    ) internal view virtual returns (ExtendedResource[] memory) {
        uint256 len = resourceIds.length;
        ExtendedResource[] memory extendedResources = new ExtendedResource[](len);
        for (uint i; i<len;) {
            Resource memory resource = getResource(resourceIds[i]);
            extendedResources[i] = ExtendedResource({
                id: resource.id,
                equippableRefId: _equippableRefIds[resource.id],
                baseAddress: _baseAddresses[resource.id],
                metadataURI: resource.metadataURI,
                custom: resource.custom
            });
            unchecked {++i;}
        }

        return extendedResources;
    }
}
