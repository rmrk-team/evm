// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC721Internal.sol";
import "../interfaces/IRMRKMultiResource.sol";
import "../library/RMRKLib.sol";
import {MultiResourceStorage} from "./Storage.sol";

error RMRKBadPriorityListLength();
error RMRKIndexOutOfRange();
error RMRKInvalidTokenId();
error RMRKMaxPendingResourcesReached();
error RMRKNoResourceMatchingId();
error RMRKResourceAlreadyExists();
error RMRKResourceNotFoundInStorage();
error RMRKNotApprovedForResourcesOrOwner();
error RMRKApprovalForResourcesToCurrentOwner();
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
error RMRKApproveForResourcesToCaller();
error RMRKWriteToZero();

abstract contract RMRKMultiResourceInternal is
    ERC721Internal,
    IRMRKMultiResourceEventsAndStruct
{
    using Strings for uint256;
    using RMRKLib for uint16[];
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];

    function getMRState()
        internal
        pure
        returns (MultiResourceStorage.State storage)
    {
        return MultiResourceStorage.getState();
    }

    function _burn(uint256 tokenId) internal virtual override {
        address owner = _ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);
        _approveForResources(address(0), tokenId);

        ERC721Storage.State storage s = getState();
        s._balances[owner] -= 1;
        delete s._owners[tokenId];

        emit Transfer(owner, address(0), tokenId);

        _afterTokenTransfer(owner, address(0), tokenId);
    }

    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = _ownerOf(tokenId);
        return (user == owner ||
            _isApprovedForAllForResources(owner, user) ||
            _getApprovedForResources(tokenId) == user);
    }

    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    function _addResourceEntry(uint64 id, string memory metadataURI) internal {
        if (id == uint64(0)) revert RMRKWriteToZero();

        MultiResourceStorage.State storage state = MultiResourceStorage
            .getState();

        if (bytes(state._resources[id]).length > 0)
            revert RMRKResourceAlreadyExists();

        state._resources[id] = metadataURI;
        state._allResources.push(id);

        emit ResourceSet(id);
    }

    function _getResourceMeta(uint64 resourceId)
        internal
        view
        virtual
        returns (string memory)
    {
        string memory metadata = getMRState()._resources[resourceId];
        if (bytes(metadata).length == 0) revert RMRKNoResourceMatchingId();

        return metadata;
    }

    function _getResourceMetaForToken(uint256 tokenId, uint256 resourceIndex)
        internal
        view
        virtual
        returns (string memory)
    {
        uint64 resourceId = _getActiveResources(tokenId)[resourceIndex];
        return _getResourceMeta(resourceId);
    }

    function _acceptResource(uint256 tokenId, uint256 index) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        if (index >= s._pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = s._pendingResources[tokenId][index];
        s._pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = s._resourceOverwrites[tokenId][resourceId];
        if (overwrite != uint64(0)) {
            // We could check here that the resource to overwrite actually exists but it is probably harmless.
            s._activeResources[tokenId].removeItemByValue(overwrite);
            emit ResourceOverwritten(tokenId, overwrite, resourceId);
            delete (s._resourceOverwrites[tokenId][resourceId]);
        }
        s._activeResources[tokenId].push(resourceId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        s._activeResourcePriorities[tokenId].push(uint16(0));
        emit ResourceAccepted(tokenId, resourceId);
    }

    function _rejectResource(uint256 tokenId, uint256 index) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        if (index >= s._pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = s._pendingResources[tokenId][index];
        s._pendingResources[tokenId].removeItemByIndex(index);
        s._tokenResources[tokenId][resourceId] = false;
        delete (s._resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
    }

    function _rejectAllResources(uint256 tokenId) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        uint256 len = s._pendingResources[tokenId].length;
        for (uint256 i; i < len; ) {
            uint64 resourceId = s._pendingResources[tokenId][i];
            delete s._resourceOverwrites[tokenId][resourceId];
            unchecked {
                ++i;
            }
        }

        delete (s._pendingResources[tokenId]);
        emit ResourceRejected(tokenId, uint64(0));
    }

    function _removeResource(uint256 tokenId, uint256 index) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        if (index >= s._activeResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = s._activeResources[tokenId][index];

        s._activeResources[tokenId].removeItemByIndex(index);
        s._activeResourcePriorities[tokenId].removeItemByIndex(index);
        delete s._tokenResources[tokenId][resourceId];

        emit ResourceRemoved(tokenId, resourceId);
    }

    function _removeAllResources(uint256 tokenId) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        uint256 len = s._activeResources[tokenId].length;

        for (uint256 i; i < len; i++) {
            uint64 resourceId = s._activeResources[tokenId][i];
            delete s._tokenResources[tokenId][resourceId];
        }

        delete s._activeResources[tokenId];
        delete s._activeResourcePriorities[tokenId];

        emit ResourceRemoved(tokenId, uint64(0));
    }

    function _setPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {
        MultiResourceStorage.State storage s = getMRState();

        uint256 length = priorities.length;
        if (length != s._activeResources[tokenId].length)
            revert RMRKBadPriorityListLength();
        s._activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        if (s._tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if (resourceId == uint64(0)) revert RMRKResourceNotFoundInStorage();

        if (s._pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        s._tokenResources[tokenId][resourceId] = true;

        s._pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            s._resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    function _getActiveResources(uint256 tokenId)
        internal
        view
        virtual
        returns (uint64[] memory)
    {
        return getMRState()._activeResources[tokenId];
    }

    function _getPendingResources(uint256 tokenId)
        internal
        view
        virtual
        returns (uint64[] memory)
    {
        return getMRState()._pendingResources[tokenId];
    }

    function _getActiveResourcePriorities(uint256 tokenId)
        internal
        view
        virtual
        returns (uint16[] memory)
    {
        return getMRState()._activeResourcePriorities[tokenId];
    }

    function _getResourceOverwrites(uint256 tokenId, uint64 resourceId)
        internal
        view
        virtual
        returns (uint64)
    {
        return getMRState()._resourceOverwrites[tokenId][resourceId];
    }

    function _getApprovedForResources(uint256 tokenId)
        internal
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);

        return getMRState()._tokenApprovalsForResources[tokenId];
    }

    function _isApprovedForAllForResources(address owner, address operator)
        internal
        view
        virtual
        returns (bool)
    {
        return getMRState()._operatorApprovalsForResources[owner][operator];
    }

    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        getMRState()._tokenApprovalsForResources[tokenId] = to;
        emit ApprovalForResources(_ownerOf(tokenId), to, tokenId);
    }

    function _setApprovalForAllForResources(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        getMRState()._operatorApprovalsForResources[owner][operator] = approved;
        emit ApprovalForAllForResources(owner, operator, approved);
    }

    function _getAllResources()
        internal
        view
        virtual
        returns (uint64[] memory)
    {
        return getMRState()._allResources;
    }

    function _getFullResources(uint256 tokenId)
        internal
        view
        virtual
        returns (Resource[] memory)
    {
        uint64[] memory resourceIds = getMRState()._activeResources[tokenId];
        return _getResourcesById(resourceIds);
    }

    function _getFullPendingResources(uint256 tokenId)
        internal
        view
        virtual
        returns (Resource[] memory)
    {
        uint64[] memory resourceIds = getMRState()._pendingResources[tokenId];
        return _getResourcesById(resourceIds);
    }

    function _getResourcesById(uint64[] memory resourceIds)
        internal
        view
        virtual
        returns (Resource[] memory)
    {
        uint256 len = resourceIds.length;
        Resource[] memory resources = new Resource[](len);
        for (uint256 i; i < len; ) {
            uint64 id = resourceIds[i];
            resources[i] = Resource({
                id: id,
                metadataURI: _getResourceMeta(id)
            });
            unchecked {
                ++i;
            }
        }
        return resources;
    }
}
