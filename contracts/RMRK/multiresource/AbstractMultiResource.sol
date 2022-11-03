// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKMultiResource.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../library/RMRKErrors.sol";

/**
 * @title AbstractMultiResource
 * @author RMRK team
 * @notice Smart contract of the RMRK Abstract multi resource module.
 */
abstract contract AbstractMultiResource is Context, IRMRKMultiResource {
    using RMRKLib for uint64[];

    /// Mapping of uint64 Ids to resource object
    mapping(uint64 => string) private _resources;

    /// Mapping of tokenId to new resource, to resource to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) private _resourceOverwrites;

    /// Mapping of tokenId to all resources
    mapping(uint256 => uint64[]) private _activeResources;

    /// Mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) private _activeResourcePriorities;

    /// Double mapping of tokenId to active resources
    mapping(uint256 => mapping(uint64 => bool)) private _tokenResources;

    /// Mapping of tokenId to all resources by priority
    mapping(uint256 => uint64[]) private _pendingResources;

    /// List of all resources
    uint64[] private _allResources;

    /// Mapping from owner to operator approvals for resources
    mapping(address => mapping(address => bool))
        private _operatorApprovalsForResources;

    /**
     * @notice Used to fetch the resource data of the specified resource.
     * @dev Resources are stored by reference mapping `_resources[resourceId]`.
     * @param resourceId ID of the resource to query
     * @return string Metadata of the resource
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
     * @notice Used to fetch the resource data of the specified token's active resource with the given index.
     * @dev Resources are stored by reference mapping `_resources[resourceId]`.
     * @dev Can be overriden to implement enumerate, fallback or other custom logic.
     * @param tokenId ID of the token to query
     * @param resourceIndex Index of the resource to query in the token's active resources
     * @return string Metadata of the resource
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
     * @notice Used to retrieve an array containing all of the resource IDs.
     * @return uint64[] Array of all resource IDs.
     */
    function getAllResources() public view virtual returns (uint64[] memory) {
        return _allResources;
    }

    /**
     * @notice Used to retrieve the active resource IDs of a given token.
     * @dev Resources data is stored by reference mapping `_resource[resourceId]`.
     * @param tokenId ID of the token to query
     * @return uint64[] Array of active resource IDs
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
     * @notice Used to retrieve active resource priorities of a given token.
     * @dev Resource priorities are a non-sequential array of uint16 values with an array size equal to active resource
     *  priorites.
     * @param tokenId ID of the token to query
     * @return uint16[] Array of active resource priorities
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
     * @notice Used to retrieve the resource ID that will be replaced (if any) if a given resourceID is accepted from
     *  the pending resources array.
     * @param tokenId ID of the token to query
     * @param resourceId ID of the pending resource which will be accepted
     * @return uint64 ID of the resource which will be replacted
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
     * @notice Used to retrieve the permission of the `operator` to manage the resources on `owner`'s tokens.
     * @param owner Address of the owner of the tokens
     * @param operator Address of the user being checked for permission to manage `owner`'s tokens' resources
     * @return bool Boolean value indicating whether the `operator` is authorised to manage `owner`'s tokens' resources
     *  (`true`) or not (`false`)
     */
    function isApprovedForAllForResources(address owner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _operatorApprovalsForResources[owner][operator];
    }

    /**
     * @notice Used to manage approval to manage own tokens' resources.
     * @dev Passing the value of `true` for the `approved` argument grants the approval and `false` revokes it.
     * @param operator Address of the user of which we are managing the approval
     * @param approved Boolean value indicating whether the approval is being granted (`true`) or revoked (`false`)
     */
    function setApprovalForAllForResources(address operator, bool approved)
        public
        virtual
    {
        address owner = _msgSender();
        if (owner == operator) revert RMRKApprovalForResourcesToCurrentOwner();

        _operatorApprovalsForResources[owner][operator] = approved;
        emit ApprovalForAllForResources(owner, operator, approved);
    }

    /**
     * @notice Used to accept a pending resource.
     * @dev The call is reverted if there is no pending resource at a given index.
     * @param tokenId ID of the token to accept the resource for
     * @param index Index of the pending resource to accept in the given token's pending resources array
     */
    function _acceptResource(uint256 tokenId, uint256 index) internal virtual {
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

    /**
     * @notice Used to reject the specified resource from the pending array.
     * @dev The call is reverted if there is no pending resource at a given index.
     * @param tokenId ID of the token from which to reject the specified pending resource
     * @param index Index of the resource to reject in the pending array of the given token
     */
    function _rejectResource(uint256 tokenId, uint256 index) internal virtual {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];

        _beforeRejectResource(tokenId, index, resourceId);
        _pendingResources[tokenId].removeItemByIndex(index);
        _tokenResources[tokenId][resourceId] = false;
        delete (_resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
        _afterRejectResource(tokenId, index, resourceId);
    }

    /**
     * @notice Used to reject all of the pending resources for the given token.
     * @param tokenId ID of the token to reject all of the pending resources
     */
    function _rejectAllResources(uint256 tokenId) internal virtual {
        _beforeRejectAllResources(tokenId);

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
        _afterRejectAllResources(tokenId);
    }

    /**
     * @notice Used to specify the priorities for a given token's active resources.
     * @dev If the length of the priorities array doesn't match the length of the active resources array, the executin
     *  will be reverted.
     * @dev The position of the priority value in the array corresponds the position of the resource in the active
     *  resources array it will be applied to.
     * @param tokenId ID of the token for which the priorities are being set
     * @param priorities Array of priorities for the resources
     */
    function _setPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {
        uint256 length = priorities.length;
        if (length != _activeResources[tokenId].length)
            revert RMRKBadPriorityListLength();

        _beforeSetPriority(tokenId, priorities);
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
        _afterSetPriority(tokenId, priorities);
    }

    /**
     * @notice Used to add a resource entry.
     * @dev If the specified ID is already used by another resource, the execution will be reverted.
     * @param id ID of the resource to assign to the new resource
     * @param metadataURI Metadata URI of the resource
     */
    function _addResourceEntry(uint64 id, string memory metadataURI)
        internal
        virtual
    {
        if (id == uint64(0)) revert RMRKIdZeroForbidden();
        if (bytes(_resources[id]).length > 0)
            revert RMRKResourceAlreadyExists();

        _beforeAddResource(id, metadataURI);
        _resources[id] = metadataURI;
        _allResources.push(id);

        emit ResourceSet(id);
        _afterAddResource(id, metadataURI);
    }

    /**
     * @notice Used to add a resource to a token.
     * @dev If the given resource is already added to the token, the execution will be reverted.
     * @dev If the resource ID is invalid, the execution will be reverted.
     * @dev If the token already has more than the maximum amount of pending resources (128), the execution will be
     *  reverted.
     * @param tokenId ID of the token to add the resource to
     * @param resourceId ID of the resource to add to the token
     * @param overwrites ID of the resource to overwrite with the resource associated with the `resourceId`
     */
    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal virtual {
        if (_tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if (bytes(_resources[resourceId]).length == 0)
            revert RMRKNoResourceMatchingId();

        if (_pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        _beforeAddResourceToToken(tokenId, resourceId, overwrites);
        _tokenResources[tokenId][resourceId] = true;
        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
        _afterAddResourceToToken(tokenId, resourceId, overwrites);
    }

    function _beforeAddResource(uint64 id, string memory metadataURI)
        internal
        virtual
    {}

    function _afterAddResource(uint64 id, string memory metadataURI)
        internal
        virtual
    {}

    function _beforeAddResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal virtual {}

    function _afterAddResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal virtual {}

    function _beforeRejectResource(
        uint256 tokenId,
        uint256 index,
        uint256 resourceId
    ) internal virtual {}

    function _afterRejectResource(
        uint256 tokenId,
        uint256 index,
        uint256 resourceId
    ) internal virtual {}

    function _beforeRejectAllResources(uint256 tokenId) internal virtual {}

    function _afterRejectAllResources(uint256 tokenId) internal virtual {}

    function _beforeSetPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {}

    function _afterSetPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {}
}
