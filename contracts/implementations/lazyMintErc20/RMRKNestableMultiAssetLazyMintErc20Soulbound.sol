// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./RMRKNestableMultiAssetLazyMintErc20.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

contract RMRKNestableMultiAssetLazyMintErc20Soulbound is
    RMRKSoulbound,
    RMRKNestableMultiAssetLazyMintErc20
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKNestableMultiAssetLazyMintErc20(
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
        override(RMRKSoulbound, RMRKAbstractNestableMultiAsset)
        returns (bool)
    {
        return
            RMRKAbstractNestableMultiAsset.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractNestableMultiAsset) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractNestableMultiAsset._beforeTokenTransfer(from, to, tokenId);
    }
}
