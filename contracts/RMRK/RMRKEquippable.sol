// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./abstracts/MultiResourceAbstractBase.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippableResource.sol";
import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingWithEquippable.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// import "hardhat/console.sol";

error ERC721NotApprovedOrOwner();
error RMRKBadLength();
error RMRKEquippableBasePartNotEquippable();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKOwnerQueryForNonexistentToken();

contract RMRKEquippable is IRMRKEquippableResource, MultiResourceAbstractBase {

    address private _nestingAddress;

    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
    using Strings for uint256;

    //mapping of uint64 Ids to resource object
    mapping(uint64 => Resource) private _resources;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    //mapping of token to base address to slot part Id to equipped information.
    mapping(uint => mapping(address => mapping(uint64 => Equipment))) private _equipped;

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
            interfaceId == type(IRMRKEquippableResource).interfaceId ||
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
        IRMRKNesting.Child memory child = IRMRKNesting(_nestingAddress).childOf(tokenId, childIndex);

        address childEquipable = IRMRKNestingWithEquippable(child.contractAddress).getEquippablesAddress();

        // Check from child persective
        if(!validateChildEquip(childEquipable, childResourceId, slotPartId))
            revert RMRKEquippableBasePartNotEquippable();

        // Check from base perspective
        if(!_validateBaseEquip(resource.baseAddress, childEquipable, slotPartId))
            revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: resourceId,
            childResourceId: childResourceId,
            childTokenId: child.tokenId,
            childAddress: childEquipable
        });

        _equipped[tokenId][resource.baseAddress][slotPartId] = newEquip;
        // FIXME: child must now be marked as equipped
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
        address targetBaseAddress = _resources[resourceId].baseAddress;
        delete _equipped[tokenId][targetBaseAddress][slotPartId];
    }

    function replaceEquipment(
        uint256 tokenId,
        uint64 oldResourceId,
        uint64 newResourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyOwner(tokenId) {
        _unequip(tokenId, oldResourceId, slotPartId);
        _equip(tokenId, newResourceId, slotPartId, childIndex, childResourceId);
    }

    function getEquipped(
        uint64 tokenId,
        uint64 resourceId
    ) public view returns (
        uint64[] memory slotsEquipped,
        Equipment[] memory childrenEquipped
    ) {
        address targetBaseAddress = _resources[resourceId].baseAddress;
        uint64[] memory slotPartIds = _slotPartIds[resourceId];

        // FIXME: There could be empty slots and children at the end, since a part might be equipped to another resource or simply not equipped
        slotsEquipped = new uint64[](slotPartIds.length);
        childrenEquipped = new Equipment[](slotPartIds.length);

        uint256 len = slotPartIds.length;
        for (uint i; i<len;) {
            slotsEquipped[i] = slotPartIds[i];
            Equipment memory equipment = _equipped[tokenId][targetBaseAddress][slotPartIds[i]];
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

        //             uint64 equippedResourceId = _equipped[resourceId][partId].childResourceId;
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
        isEquippable = IRMRKEquippableResource(childContract).getCallerEquippableSlot(childResourceId) == slotPartId;
    }

    //Return 0 means not equippable
    function getCallerEquippableSlot(uint64 resourceId) public view returns (uint64 equippableSlot) {
        uint64 refId = _resources[resourceId].equippableRefId;
        equippableSlot = _validParentSlots[refId][_msgSender()];
    }

    // --------------------- RESOURCES ---------------------

    function getResource(
        uint64 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == uint64(0))
            revert RMRKNoResourceMatchingId();
        return resource;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(
        IRMRKMultiResourceBase,
        MultiResourceAbstractBase
    ) virtual returns (string memory) {
        return _tokenURIAtIndex(tokenId, 0);
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal override view returns (string memory) {
        if (_activeResources[tokenId].length > index)  {
            uint64 activeResId = _activeResources[tokenId][index];
            string memory URI;
            Resource memory _activeRes = getResource(activeResId);
            if (!_tokenEnumeratedResource[activeResId]) {
                URI = _activeRes.metadataURI;
            }
            else {
                string memory baseURI = _activeRes.metadataURI;
                URI = bytes(baseURI).length > 0 ?
                    string(abi.encodePacked(baseURI, tokenId.toString())) : "";
            }
            return URI;
        }
        else {
            return _fallbackURI;
        }
    }

    // To be implemented with custom guards
    // TODO make take a resource struct and additional params for mappings
    function _addResourceEntry(
        Resource memory resource,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) internal {
        uint64 id = resource.id;
        if(id == uint64(0))
            revert RMRKWriteToZero();
        if(_resources[id].id != uint64(0))
            revert RMRKResourceAlreadyExists();

        _resources[id] = resource;

        _fixedPartIds[id] = fixedPartIds;
        _slotPartIds[id] = slotPartIds;

        _allResources.push(id);

        emit ResourceSet(id);
    }

    function _addCustomDataToResource(
        uint64 resourceId,
        uint128 customResourceId
    ) internal {
        _resources[resourceId].custom.push(customResourceId);
        emit ResourceCustomDataAdded(resourceId, customResourceId);
    }

    function _removeCustomDataFromResource(
        uint64 resourceId,
        uint256 index
    ) internal {
        uint128 customResourceId = _resources[resourceId].custom[index];
        _resources[resourceId].custom.removeItemByIndex(index);
        emit ResourceCustomDataRemoved(resourceId, customResourceId);
    }

    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal {
        if(_ownerOf(tokenId) == address(0)) revert RMRKOwnerQueryForNonexistentToken();

        if(_tokenResources[tokenId][resourceId]) revert RMRKResourceAlreadyExists();

        if( getResource(resourceId).id == uint64(0)) revert RMRKResourceNotFoundInStorage();

        if(_pendingResources[tokenId].length >= 128) revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    // Utilities

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(Resource memory) {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(Resource memory) {
        uint64 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getFullResources(
        uint256 tokenId
    ) external view virtual returns (Resource[] memory) {
        uint64[] memory resourceIds = _activeResources[tokenId];
        return _getResourcesById(resourceIds);
    }

    function getFullPendingResources(
        uint256 tokenId
    ) external view virtual returns (Resource[] memory) {
        uint64[] memory resourceIds = _pendingResources[tokenId];
        return _getResourcesById(resourceIds);
    }

    function _getResourcesById(
        uint64[] memory resourceIds
    ) internal view virtual returns (Resource[] memory) {
        uint256 len = resourceIds.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(resourceIds[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function acceptResource(uint256 tokenId, uint256 index) external virtual onlyOwner(tokenId) {
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual onlyOwner(tokenId) {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual onlyOwner(tokenId) {
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual onlyOwner(tokenId) {
        _setPriority(tokenId, priorities);
    }

}
