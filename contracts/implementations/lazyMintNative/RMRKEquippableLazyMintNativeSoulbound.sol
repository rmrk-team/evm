// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./RMRKEquippableLazyMintNative.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

contract RMRKEquippableLazyMintNativeSoulbound is
    RMRKSoulbound,
    RMRKEquippableLazyMintNative
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKEquippableLazyMintNative(
            name,
            symbol,
            collectionMetadata,
            baseTokenURI,
            data
        )
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKAbstractEquippable)
        returns (bool)
    {
        return
            RMRKAbstractEquippable.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractEquippable) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractEquippable._beforeTokenTransfer(from, to, tokenId);
    }
}
