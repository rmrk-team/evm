// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRMRKEquippableAyuilosVer.sol";
import "../library/ValidatorLib.sol";
import "./RMRKNestingInternal.sol";
import "./RMRKMultiResourceInternal.sol";

abstract contract RMRKNestingMultiResourceInternal is
    RMRKNestingInternal,
    RMRKMultiResourceInternal
{
    using RMRKLib for uint64[];

    // ------------------------ Function conflicts resolve ------------------------

    function _exists(uint256 tokenId)
        internal
        view
        virtual
        override(ERC721Internal, RMRKNestingInternal)
        returns (bool)
    {
        return RMRKNestingInternal._exists(tokenId);
    }

    function _ownerOf(uint256 tokenId)
        internal
        view
        virtual
        override(ERC721Internal, RMRKNestingInternal)
        returns (address)
    {
        return RMRKNestingInternal._ownerOf(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(RMRKNestingInternal, RMRKMultiResourceInternal)
    {
        (address rmrkOwner, , ) = _rmrkOwnerOf(tokenId);
        address owner = _ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        ERC721Storage.State storage s = getState();
        NestingStorage.State storage ns = getNestingState();

        _approve(address(0), tokenId);
        _approveForResources(address(0), tokenId);
        _cleanApprovals(address(0), tokenId);

        s._balances[rmrkOwner] -= 1;
        delete ns._RMRKOwners[tokenId];
        delete ns._pendingChildren[tokenId];
        delete ns._children[tokenId];
        delete s._tokenApprovals[tokenId];

        _afterTokenTransfer(owner, address(0), tokenId);
        emit Transfer(owner, address(0), tokenId);
    }

    function _mint(address to, uint256 tokenId)
        internal
        virtual
        override(ERC721Internal, RMRKNestingInternal)
    {
        RMRKNestingInternal._mint(to, tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Internal, RMRKNestingInternal) {
        RMRKNestingInternal._transfer(from, to, tokenId);
    }

    function _tokenURI(uint256 tokenId)
        internal
        view
        virtual
        override(ERC721Internal, RMRKMultiResourceInternal)
        returns (string memory)
    {
        return RMRKMultiResourceInternal._tokenURI(tokenId);
    }
}
