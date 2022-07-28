// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../interfaces/IRMRKMultiResource.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error RMRKBadPriorityListLength();
error RMRKIndexOutOfRange();
error RMRKInvalidTokenId();
error RMRKMaxPendingResourcesReached();
error RMRKNoResourceMatchingId();
error RMRKResourceAlreadyExists();
error RMRKResourceNotFoundInStorage();
error RMRKWriteToZero();
error RMRKNotApprovedForResourcesOrOwner();
error RMRKApprovalForResourcesToCurrentOwner();
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
error RMRKApproveForResourcesToCaller();


abstract contract MultiResourceAbstract is Context, IRMRKMultiResource {

    using Strings for uint256;
    using RMRKLib for uint64[];

    //mapping of uint64 Ids to resource object
    mapping(uint64 => Resource) internal _resources;
    using RMRKLib for uint128[];
    
    //mapping of tokenId to new resource, to resource to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) internal _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => uint64[]) internal _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) internal _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(uint64 => bool)) internal _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => uint64[]) internal _pendingResources;

    //Mapping of uint64 resource ID to tokenEnumeratedResource for tokenURI
    mapping(uint64 => bool) internal _tokenEnumeratedResource;

    //Mapping of uint128 custom field to bytes data
    mapping(uint64 => mapping (uint128 => bytes)) internal _customResourceData;

    //List of all resources
    uint64[] internal _allResources;

    //fallback URI
    string internal _fallbackURI;

    // Mapping from token ID to approved address for resources
    mapping(uint256 => address) internal _tokenApprovalsForResources;

    // Mapping from owner to operator approvals for resources
    mapping(address => mapping(address => bool)) internal _operatorApprovalsForResources;

    function getResource(
        uint64 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == uint64(0))
            revert RMRKNoResourceMatchingId();
        return resource;
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal view returns (string memory) {
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

    function getFallbackURI() external view virtual returns (string memory) {
        return _fallbackURI;
    }

    function _acceptResource(uint256 tokenId, uint256 index) internal {
        if(index >= _pendingResources[tokenId].length) revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = _resourceOverwrites[tokenId][resourceId];
        if (overwrite != uint64(0)) {
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
        if(index >= _pendingResources[tokenId].length) revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);
        _tokenResources[tokenId][resourceId] = false;
        delete(_resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
    }

    function _rejectAllResources(uint256 tokenId) internal {
        uint256 len = _pendingResources[tokenId].length;
        for (uint i; i<len;) {
            uint64 resourceId = _pendingResources[tokenId][i];
            delete _resourceOverwrites[tokenId][resourceId];
            unchecked {++i;}
        }

        delete(_pendingResources[tokenId]);
        emit ResourceRejected(tokenId, uint64(0));
    }

    function _setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) internal {
        uint256 length = priorities.length;
        if(length != _activeResources[tokenId].length) revert RMRKBadPriorityListLength();
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    // To be implemented with custom guards

    function _addResourceEntry(
        uint64 id,
        string memory metadataURI,
        uint128[] memory custom
    ) internal {
        if(id == uint64(0))
            revert RMRKWriteToZero();
        if(_resources[id].id != uint64(0))
            revert RMRKResourceAlreadyExists();

        Resource memory resource = Resource({
            id: id,
            metadataURI: metadataURI,
            custom: custom
        });
        _resources[id] = resource;
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
        if(_tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if(getResource(resourceId).id == uint64(0))
            revert RMRKResourceNotFoundInStorage();

        if(_pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    
    function getActiveResources(
        uint256 tokenId
    ) public view virtual returns(uint64[] memory) {
        return _activeResources[tokenId];
    }

    function getPendingResources(
        uint256 tokenId
    ) public view virtual returns(uint64[] memory) {
        return _pendingResources[tokenId];
    }

    function getActiveResourcePriorities(
        uint256 tokenId
    ) public view virtual returns(uint16[] memory) {
        return _activeResourcePriorities[tokenId];
    }

    function getResourceOverwrites(
        uint256 tokenId,
        uint64 resourceId
    ) public view virtual returns(uint64) {
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
        uint128 customResourceId,
        bytes memory customResourceValue
    ) public view virtual returns (string memory) {
        uint64[] memory activeResources = _activeResources[tokenId];
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

    function _setCustomResourceData(
        uint64 resourceId,
        uint128 customResourceId,
        bytes memory data
    ) internal {
        _customResourceData[resourceId][customResourceId] = data;
        emit ResourceCustomDataSet(resourceId, customResourceId);
    }

    function _setFallbackURI(string memory fallbackURI) internal {
        _fallbackURI = fallbackURI;
    }

    function _setTokenEnumeratedResource(
        uint64 resourceId,
        bool state
    ) internal {
        _tokenEnumeratedResource[resourceId] = state;
    }

    // Approvals

    function getApprovedForResources(uint256 tokenId) public virtual view returns (address) {
        _requireMinted(tokenId);
        return _tokenApprovalsForResources[tokenId];
    }

    function isApprovedForAllForResources(address owner, address operator) public virtual view returns (bool) {
        return _operatorApprovalsForResources[owner][operator];
    }

    // Cannot be fully implemented since ownership is not defined at this level
    function _approveForResources(address owner, address to, uint256 tokenId) internal virtual {
        _tokenApprovalsForResources[tokenId] = to;
        emit ApprovalForResources(owner, to, tokenId);
    }

    // Cannot be fully implemented since ownership is not defined at this level
    function _setApprovalForAllForResources(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        _operatorApprovalsForResources[owner][operator] = approved;
        emit ApprovalForAllForResources(owner, operator, approved);
    }

    // Utilities

    function getAllResources() public view virtual returns (uint64[] memory) {
        return _allResources;
    }

    function getCustomResourceData(
        uint64 resourceId,
        uint128 customResourceId
    ) public view virtual returns (bytes memory) {
        return _customResourceData[resourceId][customResourceId];
    }

    function isTokenEnumeratedResource(
        uint64 resourceId
    ) public view virtual returns(bool) {
        return _tokenEnumeratedResource[resourceId];
    }

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

        /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */
    function _requireMinted(uint256 tokenId) internal view virtual {
        if(!_exists(tokenId))
            revert RMRKInvalidTokenId();
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool);

}
