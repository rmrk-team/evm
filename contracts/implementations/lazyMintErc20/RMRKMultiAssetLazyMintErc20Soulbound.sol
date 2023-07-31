// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./RMRKMultiAssetLazyMintErc20.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKMultiAssetLazyMintErc20Soulbound
 * @author RMRK team
 * @notice Implementation of non-transferable RMRK multi-asset module with ERC20-powered lazy minting.
 */
contract RMRKMultiAssetLazyMintErc20Soulbound is
    RMRKSoulbound,
    RMRKMultiAssetLazyMintErc20
{
    /**
     * @notice Used to initialize the smart contract.
     * @param name Name of the token collection
     * @param symbol Symbol of the token collection
     * @param collectionMetadata URI to the collection's metadata
     * @param baseTokenURI Each token's base URI
     * @param data The `InitData` struct used to pass initialization parameters
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKMultiAssetLazyMintErc20(
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
