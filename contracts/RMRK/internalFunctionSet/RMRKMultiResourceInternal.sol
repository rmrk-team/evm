// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC721Internal.sol";
import "../interfaces/IRMRKMultiResource.sol";
import "../interfaces/ILightmMultiResource.sol";
import "../library/RMRKLib.sol";
import "../library/RMRKMultiResourceRenderUtils.sol";

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
    IRMRKMultiResourceEventsAndStruct,
    ILightmMultiResourceEventsAndStruct
{
    using Strings for uint256;
    using RMRKLib for uint16[];
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];

    uint16 internal constant LOWEST_PRIORITY = type(uint16).max - 1;

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

    function _tokenURI(uint256 tokenId)
        internal
        view
        virtual
        override
        returns (string memory)
    {
        MultiResourceStorage.State storage mrs = getMRState();

        try
            RMRKMultiResourceRenderUtils.getTopResourceMetaForToken(
                address(this),
                tokenId
            )
        returns (string memory meta) {
            return meta;
        } catch (bytes memory err) {
            if (
                bytes4(err) ==
                RMRKMultiResourceRenderUtils.RMRKTokenHasNoResources.selector
            ) {
                return mrs._fallbackURI;
            }

            revert(string(err));
        }
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

        _beforeAddResource(id, metadataURI);

        state._resources[id] = metadataURI;

        emit ResourceSet(id);
        _afterAddResource(id, metadataURI);
    }

    function _getResourceMetadata(uint64 resourceId)
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
        return _getResourceMetadata(resourceId);
    }

    function _acceptResource(
        MultiResourceStorage.State storage s,
        uint256 tokenId,
        uint64 resourceId,
        uint256 index
    ) private {
        _beforeAcceptResource(tokenId, index, resourceId);

        uint64[] storage pendingResources = s._pendingResources[tokenId];

        delete s._resourcesPosition[tokenId][resourceId];

        pendingResources.removeItemByIndex(index);

        if (pendingResources.length > 0) {
            uint64 prevLastResourceId = pendingResources[index];
            // The implementation of `removeItemByIndex` let we need to update the exchanged resource index
            s._resourcesPosition[tokenId][prevLastResourceId] = index;
        }

        uint64[] storage activeResources = s._activeResources[tokenId];
        uint64 overwrites = s._resourceOverwrites[tokenId][resourceId];
        if (overwrites != uint64(0)) {
            uint256 position = s._resourcesPosition[tokenId][overwrites];
            uint64 overwritesId = activeResources[position];

            if (overwritesId == overwrites) {
                activeResources[position] = resourceId;
                s._resourcesPosition[tokenId][resourceId] = position;
                delete (s._tokenResources[tokenId][overwrites]);
            } else {
                // No `overwrites` exist, set `overwrites` to 0 to run a normal accept process.
                overwrites = uint64(0);
            }
            delete (s._resourceOverwrites[tokenId][resourceId]);
        }

        if (overwrites == uint64(0)) {
            activeResources.push(resourceId);
            s._activeResourcePriorities[tokenId].push(LOWEST_PRIORITY);
            s._resourcesPosition[tokenId][resourceId] =
                s._activeResources[tokenId].length -
                1;
        }

        emit ResourceAccepted(tokenId, resourceId, overwrites);

        _afterAcceptResource(tokenId, index, resourceId);
    }

    function _acceptResource(uint256 tokenId, uint64 resourceId)
        internal
        virtual
    {
        MultiResourceStorage.State storage s = getMRState();

        uint256 index = s._resourcesPosition[tokenId][resourceId];
        uint64[] storage tokenPendingResources = s._pendingResources[tokenId];

        if (index >= tokenPendingResources.length) {
            revert RMRKIndexOutOfRange();
        }

        if (tokenPendingResources[index] != resourceId) {
            revert RMRKNoResourceMatchingId();
        }

        _acceptResource(s, tokenId, resourceId, index);
    }

    function _acceptResourceByIndex(uint256 tokenId, uint256 index)
        internal
        virtual
    {
        MultiResourceStorage.State storage s = getMRState();

        if (index >= s._pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = s._pendingResources[tokenId][index];

        _acceptResource(s, tokenId, resourceId, index);
    }

    function _rejectResource(
        MultiResourceStorage.State storage s,
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) private {
        _beforeRejectResource(tokenId, index, resourceId);

        uint64[] storage pendingResources = s._pendingResources[tokenId];

        delete s._resourcesPosition[tokenId][resourceId];

        delete (s._resourceOverwrites[tokenId][resourceId]);

        pendingResources.removeItemByIndex(index);

        if (pendingResources.length > 0) {
            // Check the implementation of `removeItemByIndex`, the last element will exchange position with element at `index`.
            // So we should update the index of exchanged element.
            uint64 prevLastResourceId = pendingResources[index];
            s._resourcesPosition[tokenId][prevLastResourceId] = index;
        }

        s._tokenResources[tokenId][resourceId] = false;

        emit ResourceRejected(tokenId, resourceId);

        _afterRejectResource(tokenId, index, resourceId);
    }

    function _rejectResource(uint256 tokenId, uint64 resourceId)
        internal
        virtual
    {
        MultiResourceStorage.State storage s = getMRState();

        uint256 index = s._resourcesPosition[tokenId][resourceId];
        uint64[] storage tokenPendingResources = s._pendingResources[tokenId];

        if (index >= tokenPendingResources.length) {
            revert RMRKIndexOutOfRange();
        }

        if (tokenPendingResources[index] != resourceId) {
            revert RMRKNoResourceMatchingId();
        }

        _rejectResource(s, tokenId, index, resourceId);
    }

    function _rejectResourceByIndex(uint256 tokenId, uint256 index)
        internal
        virtual
    {
        MultiResourceStorage.State storage s = getMRState();

        if (index >= s._pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = s._pendingResources[tokenId][index];

        _rejectResource(s, tokenId, index, resourceId);
    }

    function _rejectAllResources(uint256 tokenId) internal virtual {
        _beforeRejectAllResources(tokenId);

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

        _afterRejectAllResources(tokenId);
    }

    function _setPriority(uint256 tokenId, uint16[] memory priorities)
        internal
        virtual
    {
        MultiResourceStorage.State storage s = getMRState();

        uint256 length = priorities.length;
        if (length != s._activeResources[tokenId].length)
            revert RMRKBadPriorityListLength();

        _beforeSetPriority(tokenId, priorities);

        s._activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);

        _afterSetPriority(tokenId, priorities);
    }

    function _setFallbackURI(string memory fallbackURI) internal virtual {
        MultiResourceStorage.State storage s = getMRState();

        s._fallbackURI = fallbackURI;
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

        _beforeAddResourceToToken(tokenId, resourceId, overwrites);

        s._tokenResources[tokenId][resourceId] = true;

        s._resourcesPosition[tokenId][resourceId] = s
            ._pendingResources[tokenId]
            .length;

        s._pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            s._resourceOverwrites[tokenId][resourceId] = overwrites;
        }

        emit ResourceAddedToToken(tokenId, resourceId, overwrites);

        _afterAddResourceToToken(tokenId, resourceId, overwrites);
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
                metadataURI: _getResourceMetadata(id)
            });

            unchecked {
                ++i;
            }
        }
        return resources;
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

    function _beforeAcceptResource(
        uint256 tokenId,
        uint256 index,
        uint256 resourceId
    ) internal virtual {}

    function _afterAcceptResource(
        uint256 tokenId,
        uint256 index,
        uint256 resourceId
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
