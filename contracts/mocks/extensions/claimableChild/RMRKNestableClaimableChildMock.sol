// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/reclaimableChild/RMRKReclaimableChild.sol";
import "../../RMRKNestableMock.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKNestableClaimableChildMock is
    RMRKNestableMock,
    RMRKReclaimableChild
{
    constructor(string memory name, string memory symbol)
        RMRKNestableMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
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
        uint256 childId
    ) internal virtual override(RMRKNestable, RMRKReclaimableChild) {
        super._beforeAddChild(tokenId, childAddress, childId);
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
        bool isPending
    ) internal virtual override(RMRKNestable, RMRKReclaimableChild) {
        super._beforeTransferChild(
            tokenId,
            childIndex,
            childAddress,
            childId,
            isPending
        );
    }

    function _beforeNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId
    ) internal override(RMRKNestableMock, RMRKNestable) {
        super._beforeNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId
        );
    }

    function _afterNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId
    ) internal override(RMRKNestableMock, RMRKNestable) {
        super._afterNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId
        );
    }
}
