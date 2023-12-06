// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {RMRKAbstractMultiAsset} from "../abstract/RMRKAbstractMultiAsset.sol";
import {RMRKMultiAssetPreMint} from "./RMRKMultiAssetPreMint.sol";
import {RMRKSoulbound} from "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKMultiAssetPreMintSoulbound
 * @author RMRK team
 * @notice Implementation of non-transferable RMRK multi asset module with pre-minting.
 */
contract RMRKMultiAssetPreMintSoulbound is
    RMRKSoulbound,
    RMRKMultiAssetPreMint
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
        RMRKMultiAssetPreMint(
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
