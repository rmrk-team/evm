// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./abstracts/MultiResourceAbstractBase.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippableResource.sol";
import "./interfaces/IRMRKNesting.sol";
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

    //TODO: private setter/getters
    //TODO: Check to see is moving the array into Resource struct is cheaper

    //mapping of uint64 Ids to resource object
    mapping(uint64 => Resource) private _resources;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    // FIXME: This should include token
    //mapping of resourceId to slotId to equipped children
    mapping(uint64 => mapping(uint64 => Equipment)) private _equipped;

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

    function supportsInterface(bytes4 interfaceId) public virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKEquippableResource).interfaceId ||
            interfaceId == type(IERC165).interfaceId
        );
    }

    //TODO: Gate to owner of tokenId
    function equip(
        uint256 tokenId,
        uint64 targetResourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint256 childResourceIndex
    ) external onlyOwner(tokenId) {
        Resource storage targetResource = _resources[targetResourceId];
        IRMRKNesting.Child memory child = IRMRKNesting(_nestingAddress).childOf(tokenId, childIndex);

        // FIXME: probably need to ask for the child equip contract instead
        address childEquipable  = child.contractAddress;
        // Idea:
        // address childEquipable = IRMRKNesting(child.contractAddress).getEquippablesAddress();

        Resource memory childResource = IRMRKEquippableResource(childEquipable).getResObjectByIndex(child.tokenId, childResourceIndex);
        // FIXME: should we make sure childResource.baseAddress == targetResource.baseAddress

        // Check from child persective
        if(!validateChildEquip(childEquipable, targetResourceId, slotPartId))
            revert RMRKEquippableBasePartNotEquippable();

        if(!_validateBaseEquip(targetResource.baseAddress, childEquipable, slotPartId))
            revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            tokenId: child.tokenId,
            contractAddress: childEquipable,
            childResourceId: childResource.id
        });

        // FIXME this is missing token id
        _equipped[targetResourceId][slotPartId] = newEquip;
    }

    function unequip(
        uint256 tokenId,
        uint64 targetResourceId,
        uint64 slotPartId
    ) external onlyOwner(tokenId) {
        // FIXME this is missing token id
        delete _equipped[targetResourceId][slotPartId];
    }

    function replaceEquipment(
        uint256 tokenId,
        uint64 targetResourceId,
        uint256 slotPartIndex,
        uint256 childIndex,
        uint256 childResourceIndex
    ) external onlyOwner(tokenId) {
        // TODO: Implement
    }

    function getEquipped(uint64 targetResourceId) public view returns (uint64[] memory slotsEquipped, Equipment[] memory childrenEquipped) {
        uint64[] memory slotPartIds = _slotPartIds[targetResourceId];
        uint256 len = slotPartIds.length;
        for (uint i; i<len;) {
            Equipment memory childEquipped = _equipped[targetResourceId][slotPartIds[i]];
            if (childEquipped.tokenId != uint256(0)) {
                uint256 childrenEquippedLen = childrenEquipped.length;
                childrenEquipped[childrenEquippedLen] = childEquipped;
                slotsEquipped[childrenEquippedLen] = slotPartIds[i];
            }
            unchecked {++i;}
        }
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    function composeEquippables(
        uint64 targetResourceId
    ) public view returns (uint64[] memory basePartIds, address[] memory baseAddresses) {
        //get Resource of target token
        Resource storage targetResource = _resources[targetResourceId];
        //Check gas efficiency of scoping like this
        address baseAddress = targetResource.baseAddress;
        //fixed IDs
        {
            uint64[] memory fixedPartIds = _fixedPartIds[targetResourceId];
            uint256 len = fixedPartIds.length;
            uint256 basePartIdsLen = basePartIds.length;
            unchecked {
                for (uint i; i<len;) {
                    uint64 partId = fixedPartIds[i];
                    basePartIds[basePartIdsLen] = partId;
                    baseAddresses[basePartIdsLen] = baseAddress;
                    ++basePartIdsLen;
                    ++i;
                }
            }
        }
        //Slot IDs + recurse
        {
            uint64[] memory slotPartIds = _slotPartIds[targetResourceId];
            uint256 len = slotPartIds.length;
            uint256 basePartIdsLen = basePartIds.length;
            unchecked {
                for (uint i; i<len;) {
                    uint64 partId = slotPartIds[i];
                    basePartIds[basePartIdsLen] = partId;
                    baseAddresses[basePartIdsLen] = baseAddress;
                    ++basePartIdsLen;
                    ++i;

                    uint64 equippedResourceId = _equipped[targetResourceId][partId].childResourceId;
                    //Recuse while we're in this block, slotpartIds are initialized
                    (uint64[] memory equippedBasePartIds, address[] memory equippedBaseAddresses) = composeEquippables(
                        equippedResourceId
                    );
                    uint256 recLen = equippedBasePartIds.length;
                    for (uint j; j<recLen;) {
                        basePartIds[basePartIdsLen] = equippedBasePartIds[j];
                        baseAddresses[basePartIdsLen] = equippedBaseAddresses[j];
                        ++basePartIdsLen;
                        ++j;
                    }
                }
            }
        }
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
