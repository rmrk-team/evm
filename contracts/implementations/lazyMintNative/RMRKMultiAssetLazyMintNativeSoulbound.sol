// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./RMRKMultiAssetLazyMintNative.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

contract RMRKMultiAssetLazyMintNativeSoulbound is
    RMRKSoulbound,
    RMRKMultiAssetLazyMintNative
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKMultiAssetLazyMintNative(
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
        override(RMRKSoulbound, RMRKAbstractMultiAsset)
        returns (bool)
    {
        return
            RMRKAbstractMultiAsset.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractMultiAsset) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractMultiAsset._beforeTokenTransfer(from, to, tokenId);
    }
}
