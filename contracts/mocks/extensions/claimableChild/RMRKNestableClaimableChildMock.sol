// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/reclaimableChild/RMRKReclaimableChild.sol";
import "../../RMRKNestableMock.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKNestableClaimableChildMock is
    RMRKNestableMock,
    RMRKReclaimableChild
{
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKNestable, RMRKReclaimableChild)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId,
        bytes memory data
    ) internal virtual override(RMRKNestable, RMRKReclaimableChild) {
        super._beforeAddChild(tokenId, childAddress, childId, data);
    }

    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual override(RMRKNestable, RMRKReclaimableChild) {
        super._beforeAcceptChild(parentId, childIndex, childAddress, childId);
    }

    function _beforeTransferChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
    ) internal virtual override(RMRKNestable, RMRKReclaimableChild) {
        super._beforeTransferChild(
            tokenId,
            childIndex,
            childAddress,
            childId,
            isPending,
            data
        );
    }

    function _beforeNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId,
        bytes memory data
    ) internal override(RMRKNestableMock, RMRKNestable) {
        super._beforeNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId,
            data
        );
    }

    function _afterNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId,
        bytes memory data
    ) internal override(RMRKNestableMock, RMRKNestable) {
        super._afterNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId,
            data
        );
    }
}
