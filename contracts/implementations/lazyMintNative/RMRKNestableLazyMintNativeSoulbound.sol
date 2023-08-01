// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./RMRKNestableLazyMintNative.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKNestableLazyMintNativeSoulbound
 * @author RMRK team
 * @notice Implementation of non-transferable RMRK nestable module with native token-powered lazy minting.
 */
/**
 * @title RMRKNestableLazyMintNativeSoulbound
 * @author RMRK team
 * @notice Implementation of non-transferable RMRK nestable module with native token-powered lazy minting.
 */
contract RMRKNestableLazyMintNativeSoulbound is
    RMRKSoulbound,
    RMRKNestableLazyMintNative
{
    /**
     * @notice Used to initialize the smart contract.
     * @param name Name of the token collection
     * @param symbol Symbol of the token collection
     * @param collectionMetadata URI to the collection's metadata
     * @param baseTokenURI Each token's base URI
     * @param data The `InitData` struct used to pass initialization parameters
     */
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
        RMRKNestableLazyMintNative(
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
        override(RMRKSoulbound, RMRKAbstractNestable)
        returns (bool)
    {
        return
            RMRKAbstractNestable.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractNestable) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractNestable._beforeTokenTransfer(from, to, tokenId);
    }
}
