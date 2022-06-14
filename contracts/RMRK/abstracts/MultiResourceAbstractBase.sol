// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "../interfaces/IRMRKMultiResourceBase.sol";
import "../library/MultiResourceLib.sol";
import "../utils/Address.sol";
import "../utils/Strings.sol";
import "../utils/Context.sol";

error MultiResourceNotOwner();
error MultiResourceIndexOutOfBounds();
error MultiResourceBadPriorityListLength();
error MultiResourceAlreadyExists();
error MultiResourceResourceNotFoundInStorage();
error MultiResourceMaxPendingResourcesReached();
error RMRKResourceAlreadyExists();
error RMRKNoResourceMatchingId();
error RMRKWriteToZero();


abstract contract MultiResourceAbstractBase is Context, IRMRKMultiResourceBase {

    using MultiResourceLib for bytes8[];

    //mapping tokenId to current resource to replacing resource
    mapping(uint256 => mapping(bytes8 => bytes8)) internal _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => bytes8[]) internal _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) internal _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(bytes8 => bool)) internal _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => bytes8[]) internal _pendingResources;

    //Mapping of bytes8 resource ID to tokenEnumeratedResource for tokenURI
    mapping(bytes8 => bool) internal _tokenEnumeratedResource;

    //Mapping of bytes16 custom field to bytes data
    mapping(bytes8 => mapping (bytes16 => bytes)) internal _customResourceData;

    //List of all resources
    bytes8[] internal _allResources;

    //fallback URI
    string internal _fallbackURI;

    function getFallbackURI() external view virtual returns (string memory) {
        return _fallbackURI;
    }

    function _acceptResource(uint256 tokenId, uint256 index) internal {
        if(index >= _pendingResources[tokenId].length) revert MultiResourceIndexOutOfBounds();
        bytes8 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);

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
        if(_pendingResources[tokenId].length <= index) revert MultiResourceIndexOutOfBounds();
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

    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
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
    ) internal virtual view returns (string memory);

    function _setCustomResourceData(
        bytes8 resourceId,
        bytes16 customResourceId,
        bytes memory data
    ) internal {
        _customResourceData[resourceId][customResourceId] = data;
        emit ResourceCustomDataSet(resourceId, customResourceId);
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

}
