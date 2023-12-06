// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {RMRKAbstractNestableMultiAsset} from "../abstract/RMRKAbstractNestableMultiAsset.sol";
import {RMRKNestableMultiAssetLazyMintErc20} from "./RMRKNestableMultiAssetLazyMintErc20.sol";
import {RMRKSoulbound} from "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKNestableMultiAssetLazyMintErc20Soulbound
 * @author RMRK team
 * @notice Implementation of joined non-transferable RMRK nestable and multi asset module with ERC20-powered lazy minting.
 */
contract RMRKNestableMultiAssetLazyMintErc20Soulbound is
    RMRKSoulbound,
    RMRKNestableMultiAssetLazyMintErc20
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
