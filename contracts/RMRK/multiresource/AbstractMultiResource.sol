// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKMultiResource.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Context.sol";

error RMRKApproveForResourcesToCaller();
error RMRKBadPriorityListLength();
error RMRKIndexOutOfRange();
error RMRKMaxPendingResourcesReached();
error RMRKNoResourceMatchingId();
error RMRKResourceAlreadyExists();
error RMRKWriteToZero();

abstract contract AbstractMultiResource is Context, IRMRKMultiResource {
    using RMRKLib for uint64[];

    //mapping of uint64 Ids to resource object
    mapping(uint64 => string) private _resources;

    //mapping of tokenId to new resource, to resource to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) private _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => uint64[]) private _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) private _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(uint64 => bool)) private _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => uint64[]) private _pendingResources;

    //List of all resources
    uint64[] private _allResources;

    // Mapping from owner to operator approvals for resources
    mapping(address => mapping(address => bool))
        private _operatorApprovalsForResources;

    /**
     * @notice Fetches resource data by resourceID
     * @dev Resources are stored by reference mapping _resources[resourceId]
     * @param resourceId The resourceID to query
     * @return string with the meta
     */
    function getResourceMeta(uint64 resourceId)
        public
        view
        virtual
        returns (string memory)
    {
        string memory meta = _resources[resourceId];
        if (bytes(meta).length == 0) revert RMRKNoResourceMatchingId();
        return meta;
    }

    /**
     * @notice Fetches resource data for the token's active resource with the given index.
     * @dev Resources are stored by reference mapping _resources[resourceId]
     * @dev Can be overriden to implement enumerate, fallback or other custom logic
     * @param tokenId the token ID to query
     * @param resourceIndex from the token's active resources
     * @return string with the meta
     */
    function getResourceMetaForToken(uint256 tokenId, uint64 resourceIndex)
        public
        view
        virtual
        returns (string memory)
    {
        if (resourceIndex >= getActiveResources(tokenId).length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = getActiveResources(tokenId)[resourceIndex];
        return getResourceMeta(resourceId);
    }

    /**
     * @notice Returns array of all resource IDs.
     * @return uint64 array of all resource IDs.
     */
    function getAllResources() public view virtual returns (uint64[] memory) {
        return _allResources;
    }

    /**
     * @notice Returns active resource IDs for a given token
     * @dev  Resources data is stored by reference mapping _resource[resourceId]
     * @param tokenId the token ID to query
     * @return uint64[] active resource IDs
     */
    function getActiveResources(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _activeResources[tokenId];
    }

    /**
     * @notice Returns pending resource IDs for a given token
     * @dev Pending resources data is stored by reference mapping _pendingResource[resourceId]
     * @param tokenId the token ID to query
     * @return uint64[] pending resource IDs
     */
    function getPendingResources(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _pendingResources[tokenId];
    }

    /**
     * @notice Returns active resource priorities
     * @dev Resource priorities are a non-sequential array of uint16 values with an array size equal to active resource priorites.
     * @param tokenId the token ID to query
     * @return uint16[] active resource priorities
     */
    function getActiveResourcePriorities(uint256 tokenId)
        public
        view
        virtual
        returns (uint16[] memory)
    {
        return _activeResourcePriorities[tokenId];
    }

    /**
     *  @notice Returns the resource ID that will be replaced (if any) if a given resourceID is accepted from the pending resources array.
     *  @param tokenId the tokenId with the resource to query
     *  @param resourceId the pending resourceID which will be accepted
     *  @return uint64 the resourceId which will be replacted
     */
    function getResourceOverwrites(uint256 tokenId, uint64 resourceId)
        public
        view
        virtual
        returns (uint64)
    {
        return _resourceOverwrites[tokenId][resourceId];
    }

    /**
     * @notice Returns the bool status `operator`'s status for managing resources on `owner`'s tokens.
     * @param owner the tokenId to query
     * @param operator the tokenId to query
     * @return address the address of the approved account.
     */
    function isApprovedForAllForResources(address owner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _operatorApprovalsForResources[owner][operator];
    }

    function setApprovalForAllForResources(address operator, bool approved)
        public
        virtual
    {
        address owner = _msgSender();
        if (owner == operator) revert RMRKApproveForResourcesToCaller();

        _operatorApprovalsForResources[owner][operator] = approved;
        emit ApprovalForAllForResources(owner, operator, approved);
    }

    function _acceptResource(uint256 tokenId, uint256 index) internal {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = _resourceOverwrites[tokenId][resourceId];
        if (overwrite != uint64(0)) {
            // We could check here that the resource to overwrite actually exists but it is probably harmless.
            _activeResources[tokenId].removeItemByValue(overwrite);
            emit ResourceOverwritten(tokenId, overwrite, resourceId);
            delete (_resourceOverwrites[tokenId][resourceId]);
        }
        _activeResources[tokenId].push(resourceId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        _activeResourcePriorities[tokenId].push(uint16(0));
        emit ResourceAccepted(tokenId, resourceId);
    }

    function _rejectResource(uint256 tokenId, uint256 index) internal {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);
        _tokenResources[tokenId][resourceId] = false;
        delete (_resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
    }

    function _rejectAllResources(uint256 tokenId) internal {
        uint256 len = _pendingResources[tokenId].length;
        for (uint256 i; i < len; ) {
            uint64 resourceId = _pendingResources[tokenId][i];
            delete _resourceOverwrites[tokenId][resourceId];
            unchecked {
                ++i;
            }
        }

        delete (_pendingResources[tokenId]);
        emit ResourceRejected(tokenId, uint64(0));
    }

    function _setPriority(uint256 tokenId, uint16[] memory priorities)
        internal
    {
        uint256 length = priorities.length;
        if (length != _activeResources[tokenId].length)
            revert RMRKBadPriorityListLength();
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    function _addResourceEntry(uint64 id, string memory metadataURI) internal {
        if (id == uint64(0)) revert RMRKWriteToZero();
        if (bytes(_resources[id]).length > 0)
            revert RMRKResourceAlreadyExists();
        _resources[id] = metadataURI;
        _allResources.push(id);

        emit ResourceSet(id);
    }

    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal {
        if (_tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if (bytes(_resources[resourceId]).length == 0)
            revert RMRKNoResourceMatchingId();

        if (_pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }
}
