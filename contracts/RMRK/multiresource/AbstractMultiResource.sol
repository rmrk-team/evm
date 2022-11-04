// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./IRMRKMultiResource.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../library/RMRKErrors.sol";

/**
 * @title AbstractMultiResource
 * @author RMRK team
 * @notice Abstract Smart contract implementing most of the common logic for contracts implementing IRMRKMultiResource
 */
abstract contract AbstractMultiResource is Context, IRMRKMultiResource {
    using RMRKLib for uint64[];

    /// Mapping of uint64 Ids to resource metadata
    mapping(uint64 => string) private _resources;

    /// Mapping of tokenId to new resource, to resource to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) private _resourceOverwrites;

    /// Mapping of tokenId to an array of active resources
    mapping(uint256 => uint64[]) private _activeResources;

    /// Mapping of tokenId to an array of pending resources
    mapping(uint256 => uint64[]) private _pendingResources;

    /// Mapping of tokenId to an array of priorities for active resources
    mapping(uint256 => uint16[]) private _activeResourcePriorities;

    /// Mapping of tokenId to resourceId to whether the token has this resource assigned
    mapping(uint256 => mapping(uint64 => bool)) private _tokenResources;

    /// Mapping from owner to operator approvals for resources
    mapping(address => mapping(address => bool))
        private _operatorApprovalsForResources;

    /**
     * @notice Used to fetch the resource metadata of the specified resource.
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
     * @notice Used to fetch the resource metadata of the specified token's active resource with the given index.
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
     * @notice Used to retrieve the active resource IDs of a given token.
     * @dev Resources metadata is stored by reference mapping `_resource[resourceId]`.
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
     * @dev Pending resources metadata is stored by reference mapping _pendingResource[resourceId]
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
     * @param newResourceId ID of the pending resource which will be accepted
     * @return uint64 ID of the resource which will be replaced
     */
    function getResourceOverwrites(uint256 tokenId, uint64 newResourceId)
        public
        view
        virtual
        returns (uint64)
    {
        return _resourceOverwrites[tokenId][newResourceId];
    }

    /**
     * @notice Used to check whether the address has been granted the operator role by a given address or not.
     * @dev See {setApprovalForAllForResources}.
     * @param owner Address of the account that we are checking for whether it has granted the operator role
     * @param operator Address of the account that we are checking whether it has the operator role or not
     * @return bool The boolean value indicating wehter the account we are checking has been granted the operator role
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
     * @notice Used to add or remove an operator of resources for the caller.
     * @dev Operators can call {acceptResource}, {rejectResource}, {rejectAllResources} or {setPriority} for any token
     *  owned by the caller.
     * @dev Requirements:
     *
     *  - The `operator` cannot be the caller.
     * @dev Emits an {ApprovalForAllForResources} event.
     * @param operator Address of the account to which the operator role is granted or revoked from
     * @param approved The boolean value indicating whether the operator role is being granted (`true`) or revoked
     *  (`false`)
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
    function _acceptResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) internal virtual {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        if (resourceId != _pendingResources[tokenId][index])
            revert RMRKUnexpectedResourceId();

        _pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = _resourceOverwrites[tokenId][resourceId];
        if (overwrite != uint64(0)) {
            // It could have been overwritten previously so it's fine if it's not found.
            // If it's not deleted (not found), we don't want to send it on the event
            if (!_activeResources[tokenId].removeItemByValue(overwrite))
                overwrite = uint64(0);
            delete (_resourceOverwrites[tokenId][resourceId]);
        }
        _activeResources[tokenId].push(resourceId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        _activeResourcePriorities[tokenId].push(uint16(0));
        emit ResourceAccepted(tokenId, resourceId, overwrite);
    }

    /**
     * @notice Used to reject the specified resource from the pending array.
     * @dev The call is reverted if there is no pending resource at a given index.
     * @param tokenId ID of the token from which to reject the specified pending resource
     * @param index Index of the resource to reject in the pending array of the given token
     */
    function _rejectResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) internal virtual {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        if (resourceId != _pendingResources[tokenId][index])
            revert RMRKUnexpectedResourceId();

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
    function _rejectAllResources(uint256 tokenId, uint256 maxRejections)
        internal
        virtual
    {
        uint256 len = _pendingResources[tokenId].length;
        if (len > maxRejections) revert RMRKUnexpectedNumberOfResources();

        _beforeRejectAllResources(tokenId);

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
     * @dev If the length of the priorities array doesn't match the length of the active resources array, the execution
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

        emit ResourceSet(id);
        _afterAddResource(id, metadataURI);
    }

    /**
     * @notice Used to add a resource to a token.
     * @dev If the given resource is already added to the token, the execution will be reverted.
     * @dev If the resource ID is invalid, the execution will be reverted.
     * @dev If the token already has the maximum amount of pending resources (128), the execution will be
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
        }

        emit ResourceAddedToToken(tokenId, resourceId, overwrites);
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
