// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {RMRKEquippableLazyMintErc20} from "./RMRKEquippableLazyMintErc20.sol";
import {RMRKAbstractEquippable} from "../abstract/RMRKAbstractEquippable.sol";
import {RMRKSoulbound} from "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKEquippableLazyMintErc20Soulbound
 * @author RMRK team
 * @notice Implementation of non-transferable RMRK equippable module with ERC20-powered lazy minting.
 */
contract RMRKEquippableLazyMintErc20Soulbound is
    RMRKSoulbound,
    RMRKEquippableLazyMintErc20
{
    /**
     * @notice Used to initialize the smart contract.
     * @param name Name of the token collection
     * @param symbol Symbol of the token collection
     * @param collectionMetadata URI to the collection's metadata
     * @param baseTokenURI The base URI of the token metadata
     * @param data The `InitData` struct used to pass the initialization parameters.
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKEquippableLazyMintErc20(
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
