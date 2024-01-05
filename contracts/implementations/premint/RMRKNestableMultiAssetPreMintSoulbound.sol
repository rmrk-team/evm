// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {RMRKAbstractNestableMultiAsset} from "../abstract/RMRKAbstractNestableMultiAsset.sol";
import {RMRKNestableMultiAssetPreMint} from "./RMRKNestableMultiAssetPreMint.sol";
import {RMRKSoulbound} from "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKNestableMultiAssetPreMintSoulbound
 * @author RMRK team
 * @notice Implementation of joined non-transferable RMRK nestable and multi asset modules with pre-minting.
 */
contract RMRKNestableMultiAssetPreMintSoulbound is
    RMRKSoulbound,
    RMRKNestableMultiAssetPreMint
{
    /**
     * @notice Used to initialize the smart contract.
     * @param name Name of the token collection
     * @param symbol Symbol of the token collection
     * @param collectionMetadata CID of the collection metadata
     * @param maxSupply The maximum supply of tokens
     * @param royaltyRecipient Recipient of resale royalties
     * @param royaltyPercentageBps The percentage to be paid from the sale of the token expressed in basis points
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKNestableMultiAssetPreMint(
            name,
            symbol,
            collectionMetadata,
            maxSupply,
            royaltyRecipient,
            royaltyPercentageBps
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
