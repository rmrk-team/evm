// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../nesting/RMRKNesting.sol";
import "./IRMRKReclaimableChild.sol";

abstract contract RMRKReclaimableChild is IRMRKReclaimableChild, RMRKNesting {
    // WARNING: This mapping is not updated on burn or reject all, to save gas.
    // This is only used to cheaply forbid reclaiming a child which is pending
    mapping(address => mapping(uint256 => uint256)) private _childIsInPending;

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNesting)
        returns (bool)
    {
        return
            RMRKNesting.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKReclaimableChild).interfaceId;
    }

    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        if (childIsInActive(childAddress, childTokenId))
            revert RMRKInvalidChildReclaim();
        if (_childIsInPending[childAddress][childTokenId] != 0)
            revert RMRKInvalidChildReclaim();

        (address owner, uint256 ownerTokenId, bool isNft) = IRMRKNesting(
            childAddress
        ).rmrkOwnerOf(childTokenId);
        if (owner != address(this) || ownerTokenId != tokenId || !isNft)
            revert RMRKInvalidChildReclaim();
        IERC721(childAddress).safeTransferFrom(
            address(this),
            _msgSender(),
            childTokenId
        );
    }

    function _beforeAddChild(uint256 tokenId, Child memory child)
        internal
        virtual
        override
    {
        super._beforeAddChild(tokenId, child);
        _childIsInPending[child.contractAddress][child.tokenId] = 1; // We use 1 as true
    }

    function _beforeAcceptChild(
        uint256 tokenId,
        uint256 index,
        Child memory child
    ) internal virtual override {
        super._beforeAcceptChild(tokenId, index, child);
        delete _childIsInPending[child.contractAddress][child.tokenId];
    }

    function _beforeUnnestChild(
        uint256 tokenId,
        uint256 index,
        Child memory child,
        bool isPending
    ) internal virtual override {
        super._beforeUnnestChild(tokenId, index, child, isPending);
        if (isPending)
            delete _childIsInPending[child.contractAddress][child.tokenId];
    }
}
