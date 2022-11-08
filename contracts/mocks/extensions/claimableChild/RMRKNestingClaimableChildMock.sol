// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/reclaimableChild/RMRKReclaimableChild.sol";
import "../../RMRKNestingMock.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKNestingClaimableChildMock is
    RMRKNestingMock,
    RMRKReclaimableChild
{
    constructor(string memory name, string memory symbol)
        RMRKNestingMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKNesting, RMRKReclaimableChild)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    )
        internal
        virtual
        override(RMRKNesting, RMRKReclaimableChild)
    {
        super._beforeAddChild(tokenId, childAddress, childId);
    }

    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual override(RMRKNesting, RMRKReclaimableChild) {
        super._beforeAcceptChild(
            parentId,
            childIndex,
            childAddress,
            childId
        );
    }

    function _beforeUnnestChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual override(RMRKNesting, RMRKReclaimableChild) {
        super._beforeUnnestChild(
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
    ) internal override(RMRKNestingMock, RMRKNesting) {
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
    ) internal override(RMRKNestingMock, RMRKNesting) {
        super._afterNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId
        );
    }
}
