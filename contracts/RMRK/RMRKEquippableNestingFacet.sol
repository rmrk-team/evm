// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.15;

import "./RMRKNestingFacet.sol";
import "./internalFunctionSet/RMRKEquippableInternal.sol";

contract RMRKEquippableNestingFacet is
    RMRKNestingFacet,
    RMRKEquippableInternal
{
    constructor(string memory name_, string memory symbol_)
        RMRKNestingFacet(name_, symbol_)
    {}

    function _burn(uint256 tokenId)
        internal
        override(RMRKNestingInternal, RMRKEquippableInternal)
    {
        RMRKEquippableInternal._burn(tokenId);
    }

    function _burnChild(uint256 tokenId, uint256 index)
        internal
        override(RMRKNestingInternal, RMRKEquippableInternal)
    {
        RMRKEquippableInternal._burnChild(tokenId, index);
    }

    function _exists(uint256 tokenId)
        internal
        view
        override(RMRKNestingInternal, RMRKNestingMultiResourceInternal)
        returns (bool)
    {
        return RMRKNestingMultiResourceInternal._exists(tokenId);
    }

    function _mint(address to, uint256 tokenId)
        internal
        override(RMRKNestingInternal, RMRKNestingMultiResourceInternal)
    {
        RMRKNestingMultiResourceInternal._mint(to, tokenId);
    }

    function _ownerOf(uint256 tokenId)
        internal
        view
        override(RMRKNestingInternal, RMRKNestingMultiResourceInternal)
        returns (address)
    {
        return RMRKNestingMultiResourceInternal._ownerOf(tokenId);
    }

    function _tokenURI(uint256 tokenId)
        internal
        view
        override(ERC721Internal, RMRKNestingMultiResourceInternal)
        returns (string memory)
    {
        return RMRKNestingMultiResourceInternal._tokenURI(tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(RMRKNestingInternal, RMRKNestingMultiResourceInternal) {
        RMRKNestingMultiResourceInternal._transfer(from, to, tokenId);
    }

    function _unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) internal override(RMRKNestingInternal, RMRKEquippableInternal) {
        RMRKEquippableInternal._unnestChild(tokenId, index, to);
    }
}
