// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.9;

import "./RMRKNesting.sol";
import "./interfaces/IRMRKEquippableResource.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./library/RMRKLib.sol";
import "./library/MultiResourceLib.sol";
import "./utils/Address.sol";
import "./utils/Strings.sol";
import "./utils/Context.sol";
import "hardhat/console.sol";

error RMRKResourceAlreadyExists();
error RMRKNoResourceMatchingId();
error RMRKWriteToZero();

error RMRKEquippableSlotIDMismatch();
error RMRKEquippableEquipNotAllowedByBase();

error MultiResourceAlreadyExists();
error MultiResourceNotOwner();
error MultiResourceIndexOutOfBounds();
error MultiResourceResourceNotFoundInStorage();
error MultiResourceMaxPendingResourcesReached();
error MultiResourceBadPriorityListLength();

contract RMRKEquippable is Context, RMRKNesting, IRMRKEquippableResource {

    constructor(string memory _name, string memory _symbol)
    RMRKNesting(_name, _symbol)
    {

    }

    using MultiResourceLib for bytes8[];
    using MultiResourceLib for bytes16[];
    using Strings for uint256;

    //TODO: private setter/getters
    //TODO: Check to see is moving the array into Resource struct is cheaper
    mapping(bytes8 => bytes8[16]) public fixedPartIds;
    mapping(bytes8 => bytes8[16]) public slotPartIds;
    mapping(bytes8 => Equipment[16]) public equipped;

    //Gate to owner of tokenId
    function equip(
        uint256 tokenId,
        bytes8 targetResourceId,
        uint256 slotPartIndex,
        uint256 childIndex,
        uint256 childResourceIndex
    ) public {
        Resource storage targetResource = _resources[targetResourceId];
        Child memory child = childrenOf(tokenId)[childIndex];
        //TODO check to see if scoping like so costs or saves gas. Probably saves if pointer is re-used after de-scope like assembly?
        Resource memory childResource = IRMRKEquippableResource(child.contractAddress).getResObjectByIndex(childIndex, childResourceIndex);

        if(validateEquip(childResource.baseAddress, childResource.slotId) == false) revert RMRKEquippableEquipNotAllowedByBase();
        if(slotPartIds[targetResourceId][slotPartIndex] != childResource.slotId) revert RMRKEquippableSlotIDMismatch();

        equipped[targetResourceId][slotPartIndex] = Equipment({
          tokenId: child.tokenId,
          contractAddress: child.contractAddress,
          childResourceId: childResource.id
          });

    }

    //Gate to owner of tokenId
    function unequip(
        uint256 tokenId,
        bytes8 targetResourceId,
        uint256 slotPartIndex
    ) public {
        Resource storage targetResource = _resources[targetResourceId];
        delete equipped[targetResourceId][slotPartIndex];
    }

    // THIS CALL IS EASILY BYPASSED BY ANY GIVEN IMPLEMENTER. For obvious reasons, this function is
    // included to encourage good-faith adherence to a standard, but in no way should be considered
    // a secure feature from the perspective of a Base deployer.
    function validateEquip(address baseContract, bytes8 baseId) private view returns (bool isEquippable) {
        isEquippable = IRMRKBaseStorage(baseContract).checkIsEquippable(baseId, address(this));
    }

    function getEquipped(bytes8 targetResourceId) public view returns (Equipment[16] memory childrenEquipped) {
        childrenEquipped = equipped[targetResourceId];
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    /* function composeEquippables(uint256 tokenId, bytes8 targetResourceId) public view returns (bytes8[] memory basePartIds) {
        Resource storage targetResource = _resources[targetResourceId];

        //get fixed
        uint256 fixedLen = targetResource.fixedParts.length;
        uint256 basePartIdsLen = 0;
        for (uint i; i<fixedLen;) {
            basePartIds.push(targetResource.fixedParts[i]);
            unchecked {++basePartIdsLen;}
            unchecked {++i;}
        }

        Equipped[10] memory equippedChildren = getEquippedChildren(targetResourceId);
        uint256 equippedLen = equippedChildren.length;

        for (uint i; i<equippedLen;) {
             Resource memory childRes = IRMRKEquippableResource(
                targetResource.equippedChildren[i].contractAddress
                ).getResource(
                    targetResource.slotPartDefinitions[i]
                    );
            unchecked {++i;}
        }

    }

    function _returnTreeFixedSlots(uint256 equippedLen) internal view returns(bytes8[] memory basePartIds) {
        bytes8[] memory internalBaseParts = _returnTreeFixedSlots();
        uint256 len = internalBaseParts.length;
        for(uint i; i<len;) {
            basePartIds
            unchecked{++i;}
        }

    } */

    //Rewrite in assembly if time
    /* function returnMinPos(uint256[] memory array) public view returns(uint256 pos) {

      assembly {

      }

    } */

    function returnMinPos(uint256[] memory array) public pure returns(uint256 pos) {
      uint256 min = array[0];
      uint256 len = array.length;
      for(uint256 i=1; i<len;) {
        if(min > array[i]) {
          min = array[i];
          pos = i;
        }
        unchecked {++i;}
      }
    }

    //mapping of bytes8 Ids to resource object
    mapping(bytes8 => Resource) private _resources;

    //mapping tokenId to current resource to replacing resource
    mapping(uint256 => mapping(bytes8 => bytes8)) private _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => bytes8[]) private _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) private _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(bytes8 => bool)) private _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => bytes8[]) private _pendingResources;

    //Mapping of bytes8 resource ID to tokenEnumeratedResource for tokenURI
    mapping(bytes8 => bool) private _tokenEnumeratedResource;

    //Mapping of bytes16 custom field to bytes data
    mapping(bytes8 => mapping (bytes16 => bytes)) private _customResourceData;

    //List of all resources
    bytes8[] private _allResources;

    //fallback URI
    string private _fallbackURI;

    function getFallbackURI() external view virtual returns (string memory) {
        return _fallbackURI;
    }

    function _acceptResource(uint256 tokenId, uint256 index) internal {
        if(index >= _pendingResources[tokenId].length) revert MultiResourceNotOwner();
        bytes8 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(0);

        bytes8 overwrite = _resourceOverwrites[tokenId][resourceId];
        if (overwrite != bytes8(0)) {
            // We could check here that the resource to overwrite actually exists but it is probably harmless.
            _activeResources[tokenId].removeItemByValue(overwrite);
            emit ResourceOverwritten(tokenId, overwrite);
            delete(_resourceOverwrites[tokenId][resourceId]);
        }
        _activeResources[tokenId].push(resourceId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        _activeResourcePriorities[tokenId].push(uint16(0));
        emit ResourceAccepted(tokenId, resourceId);
    }

    function _rejectResource(uint256 tokenId, uint256 index) internal {
        if(index >= _pendingResources[tokenId].length) revert MultiResourceIndexOutOfBounds();
        if(_pendingResources[tokenId].length <= index) revert MultiResourceNotOwner();
        bytes8 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByValue(resourceId);
        _tokenResources[tokenId][resourceId] = false;

        emit ResourceRejected(tokenId, resourceId);
    }

    function _rejectAllResources(uint256 tokenId) internal {
        delete(_pendingResources[tokenId]);
        emit ResourceRejected(tokenId, bytes8(0));
    }

    function _setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) internal {
        uint256 length = priorities.length;
        if(length != _activeResources[tokenId].length) revert MultiResourceBadPriorityListLength();
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    function getActiveResources(
        uint256 tokenId
    ) public view virtual returns(bytes8[] memory) {
        return _activeResources[tokenId];
    }

    function getPendingResources(
        uint256 tokenId
    ) public view virtual returns(bytes8[] memory) {
        return _pendingResources[tokenId];
    }

    function getActiveResourcePriorities(
        uint256 tokenId
    ) public view virtual returns(uint16[] memory) {
        return _activeResourcePriorities[tokenId];
    }

    function getResourceOverwrites(
        uint256 tokenId,
        bytes8 resourceId
    ) public view virtual returns(bytes8) {
        return _resourceOverwrites[tokenId][resourceId];
    }

    function getResource(
        bytes8 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == bytes8(0)) revert RMRKNoResourceMatchingId();
        return resource;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(NestingAbstract, IRMRKEquippableResource) returns (string memory) {
        return _tokenURIAtIndex(tokenId, 0);
    }

    function tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns (string memory) {
        return _tokenURIAtIndex(tokenId, index);
    }

    function tokenURIForCustomValue(
        uint256 tokenId,
        bytes16 customResourceId,
        bytes memory customResourceValue
    ) public view virtual returns (string memory) {
        bytes8[] memory activeResources = _activeResources[tokenId];
        uint256 len = _activeResources[tokenId].length;
        for (uint index; index<len;) {
            bytes memory actualCustomResourceValue = getCustomResourceData(
                activeResources[index],
                customResourceId
            );
            if (
                keccak256(actualCustomResourceValue) ==
                keccak256(customResourceValue)
            ) {
                return _tokenURIAtIndex(tokenId, index);
            }
            unchecked {++index;}
        }
        return _fallbackURI;
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal view returns (string memory) {
        if (_activeResources[tokenId].length > index)  {
            bytes8 activeResId = _activeResources[tokenId][index];
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

    function _addResourceEntry(
        bytes8 id,
        string memory metadataURI,
        bytes8[16] memory fixedParts,
        bytes8[16] memory slotParts,
        address baseAddress,
        bytes8 slotId,
        bytes16[] memory custom
    ) internal {
        if(id == bytes8(0)) revert RMRKWriteToZero();
        if(_resources[id].id != bytes8(0)) revert RMRKResourceAlreadyExists();

        Resource memory resource = Resource({
            id: id,
            metadataURI: metadataURI,
            baseAddress: baseAddress,
            slotId: slotId,
            custom: custom
        });
        _resources[id] = resource;
        fixedPartIds[id] = fixedParts;
        slotPartIds[id] = slotParts;

        _allResources.push(id);

        emit ResourceSet(id);
    }

    function _setCustomResourceData(
        bytes8 resourceId,
        bytes16 customResourceId,
        bytes memory data
    ) internal {
        _customResourceData[resourceId][customResourceId] = data;
        emit ResourceCustomDataSet(resourceId, customResourceId);
    }

    function _addCustomDataToResource(
        bytes8 resourceId,
        bytes16 customResourceId
    ) internal {
        _resources[resourceId].custom.push(customResourceId);
        emit ResourceCustomDataAdded(resourceId, customResourceId);
    }

    function _removeCustomDataFromResource(
        bytes8 resourceId,
        uint256 index
    ) internal {
        bytes16 customResourceId = _resources[resourceId].custom[index];
        _resources[resourceId].custom.removeItemByIndex(index);
        emit ResourceCustomDataRemoved(resourceId, customResourceId);
    }

    function _addResourceToToken(
        uint256 tokenId,
        bytes8 resourceId,
        bytes8 overwrites
    ) internal {
        if(_tokenResources[tokenId][resourceId] != false) revert MultiResourceAlreadyExists();

        if( getResource(resourceId).id == bytes8(0)) revert MultiResourceResourceNotFoundInStorage();

        if(_pendingResources[tokenId].length >= 128) revert MultiResourceMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != bytes8(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    function _setFallbackURI(string memory fallbackURI) internal {
        _fallbackURI = fallbackURI;
    }

    function _setTokenEnumeratedResource(
        bytes8 resourceId,
        bool state
    ) internal {
        _tokenEnumeratedResource[resourceId] = state;
    }

    // Utilities

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        bytes8 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        bytes8 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getFullResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        bytes8[] memory activeResources = _activeResources[tokenId];
        uint256 len = activeResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(activeResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function getFullPendingResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        bytes8[] memory pendingResources = _pendingResources[tokenId];
        uint256 len = pendingResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(pendingResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function getAllResources() public view virtual returns (bytes8[] memory) {
        return _allResources;
    }

    function getCustomResourceData(
        bytes8 resourceId,
        bytes16 customResourceId
    ) public view virtual returns (bytes memory) {
        return _customResourceData[resourceId][customResourceId];
    }

    function isTokenEnumeratedResource(
        bytes8 resourceId
    ) public view virtual returns(bool) {
        return _tokenEnumeratedResource[resourceId];
    }

    function acceptResource(uint256 tokenId, uint256 index) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _setPriority(tokenId, priorities);
    }

}
