// SPDX-License-Identifier: Apache-2.0

// RMRKMR facet style which could be used alone

pragma solidity ^0.8.15;

import "./RMRKMultiResourceFacet.sol";
import "./internalFunctionSet/LightmEquippableInternal.sol";

// !!!
// Before use, make sure you know the description below
// !!!
/**
    @dev NOTE that MultiResource take NFT as a real unique item on-chain,
    so if you `burn` a NFT, it means that you NEVER wanna `mint` it again,
    if you do so, you are trying to raising the soul of a dead man
    (the `activeResources` etc. of this burned token will not be removed when `burn`),
    instead of creating a new life by using a empty shell.
    You are responsible for any unknown consequences of this action, so take care of
    `mint` logic in your own implementer.
 */

contract LightmEquippableMultiResourceFacet is
    LightmEquippableInternal,
    RMRKMultiResourceFacet
{
    constructor(string memory name_, string memory symbol_)
        RMRKMultiResourceFacet(name_, symbol_)
    {}

    // No need to override `supportsInterface` here,
    // this contract is only used to be cut by Diamond
    // and Diamond loupe facet is responsible for IERC165

    function getFullResources(uint256 tokenId)
        external
        view
        virtual
        returns (Resource[] memory)
    {
        return _getFullResources(tokenId);
    }

    function getFullPendingResources(uint256 tokenId)
        external
        view
        virtual
        returns (Resource[] memory)
    {
        return _getFullPendingResources(tokenId);
    }

    function _acceptResourceByIndex(uint256 tokenId, uint256 index)
        internal
        override(RMRKMultiResourceInternal, LightmEquippableInternal)
    {
        LightmEquippableInternal._acceptResourceByIndex(tokenId, index);
    }

    function _acceptResource(uint256 tokenId, uint64 resourceId)
        internal
        override(RMRKMultiResourceInternal, LightmEquippableInternal)
    {
        LightmEquippableInternal._acceptResource(tokenId, resourceId);
    }

    function _burn(uint256 tokenId)
        internal
        override(RMRKMultiResourceInternal, RMRKNestingMultiResourceInternal)
    {
        RMRKNestingMultiResourceInternal._burn(tokenId);
    }

    function _exists(uint256 tokenId)
        internal
        view
        override(ERC721Internal, RMRKNestingMultiResourceInternal)
        returns (bool)
    {
        return RMRKNestingMultiResourceInternal._exists(tokenId);
    }

    function _mint(address to, uint256 tokenId)
        internal
        override(ERC721Internal, RMRKNestingMultiResourceInternal)
    {
        RMRKNestingMultiResourceInternal._mint(to, tokenId);
    }

    function _ownerOf(uint256 tokenId)
        internal
        view
        override(ERC721Internal, RMRKNestingMultiResourceInternal)
        returns (address)
    {
        return RMRKNestingMultiResourceInternal._ownerOf(tokenId);
    }

    function _tokenURI(uint256 tokenId)
        internal
        view
        override(RMRKMultiResourceInternal, RMRKNestingMultiResourceInternal)
        returns (string memory)
    {
        return RMRKNestingMultiResourceInternal._tokenURI(tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Internal, RMRKNestingMultiResourceInternal) {
        RMRKNestingMultiResourceInternal._transfer(from, to, tokenId);
    }
}
