// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {Ownable} from "../access/Ownable.sol";
import {RMRKEquippable} from "../equippable/RMRKEquippable.sol";
import {RMRKSoulbound} from "../extension/soulbound/RMRKSoulbound.sol";
import {IERC6454} from "../extension/soulbound/IERC6454.sol";
import {IERC6220} from "../equippable/IERC6220.sol";
import {IERC5773} from "../multiasset/IERC5773.sol";
import {IERC7401} from "../nestable/IERC7401.sol";

import {RMRKLib} from "../library/RMRKLib.sol";
import "../library/RMRKErrors.sol";
import {IRMRKCollectionData} from "./IRMRKCollectionData.sol";

/**
 * @title RMRKRenderUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK render utils module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKRenderUtils {
    /**
     * @notice Structure used to represent the extended NFT.
     * @return tokenMetadataUri Metadata URI of the specified token
     * @return directOwner Address of the direct owner of the token (smart contract if the token is nested, otherwise
     *  EOA)
     * @return rootOwner Address of the root owner
     * @return activeAssetCount Number of active assets present on the token
     * @return pendingAssetcount Number of pending assets on the token
     * @return priorities The array of priorities of the active asset
     * @return maxSupply The maximum supply of the collection the specified token belongs to
     * @return totalSupply The total supply of the collection the specified token belongs to
     * @return issuer Address of the issuer of the token's collection
     * @return name Name of the collection the token belongs to
     * @return symbol Symbol of the collection the token belongs to
     * @return activeChildrenNumber Number of active child tokens of the given token (only account for direct child
     *  tokens)
     * @return pendingChildrenNumber Number of pending child tokens of the given token (only account for direct child
     *  tokens)
     * @return isSoulbound Boolean value signifying whether the token is soulbound or not
     * @return hasMultiAssetInterface Boolean value signifying whether the toke supports MultiAsset interface
     * @return hasNestingInterface Boolean value signifying whether the toke supports Nestable interface
     * @return hasEquippableInterface Boolean value signifying whether the toke supports Equippable interface
     */
    struct ExtendedNft {
        string tokenMetadataUri;
        address directOwner;
        address rootOwner;
        uint256 activeAssetCount;
        uint256 pendingAssetCount;
        uint64[] priorities;
        uint256 maxSupply;
        uint256 totalSupply;
        address issuer;
        string name;
        string symbol;
        uint256 activeChildrenNumber;
        uint256 pendingChildrenNumber;
        bool isSoulbound;
        bool hasMultiAssetInterface;
        bool hasNestingInterface;
        bool hasEquippableInterface;
    }

    /**
     * @notice Used to get extended information about a specified token.
     * @dev The full `ExtendedNft` struct looks like this:
     *  [
     *      tokenMetadataUri,
     *      directOwner,
     *      rootOwner,
     *      activeAssetCount,
     *      pendingAssetCount
     *      priorities,
     *      maxSupply,
     *      totalSupply,
     *      issuer,
     *      name,
     *      symbol,
     *      activeChildrenNumber,
     *      pendingChildrenNumber,
     *      isSoulbound,
     *      hasMultiAssetInterface,
     *      hasNestingInterface,
     *      hasEquippableInterface
     *  ]
     * @param tokenId ID of the token for which to retireve the `ExtendedNft` struct
     * @param targetCollection Address of the collection to which the specified token belongs to
     * @return data The `ExtendedNft` struct containing the specified token's data
     */
    function getExtendedNft(
        uint256 tokenId,
        address targetCollection
    ) public view returns (ExtendedNft memory data) {
        RMRKEquippable targetEquippable = RMRKEquippable(targetCollection);
        IRMRKCollectionData targetCollectionData = IRMRKCollectionData(
            targetCollection
        );
        data.hasMultiAssetInterface = targetEquippable.supportsInterface(
            type(IERC5773).interfaceId
        );
        data.hasNestingInterface = targetEquippable.supportsInterface(
            type(IERC7401).interfaceId
        );
        data.hasEquippableInterface = targetEquippable.supportsInterface(
            type(IERC6220).interfaceId
        );
        if (data.hasNestingInterface) {
            (data.directOwner, , ) = targetEquippable.directOwnerOf(tokenId);
            data.activeChildrenNumber = targetEquippable
                .childrenOf(tokenId)
                .length;
            data.pendingChildrenNumber = targetEquippable
                .pendingChildrenOf(tokenId)
                .length;
        }
        if (data.hasMultiAssetInterface) {
            data.activeAssetCount = targetEquippable
                .getActiveAssets(tokenId)
                .length;
            data.pendingAssetCount = targetEquippable
                .getPendingAssets(tokenId)
                .length;
            data.priorities = targetEquippable.getActiveAssetPriorities(
                tokenId
            );
        }
        data.rootOwner = targetEquippable.ownerOf(tokenId);
        if (data.directOwner == address(0x0)) {
            data.directOwner = data.rootOwner;
        }
        if (targetEquippable.supportsInterface(type(IERC6454).interfaceId)) {
            data.isSoulbound = !IERC6454(targetCollection).isTransferable(
                tokenId,
                data.rootOwner,
                0x000000000000000000000000000000000000dEaD
            );
        }
        try targetCollectionData.name() returns (string memory name) {
            data.name = name;
        } catch {
            // Retain default value
        }
        try targetCollectionData.symbol() returns (string memory symbol) {
            data.symbol = symbol;
        } catch {
            // Retain default value
        }
        try IERC721Metadata(targetCollection).tokenURI(tokenId) returns (
            string memory metadataUri_
        ) {
            data.tokenMetadataUri = metadataUri_;
        } catch {
            // Retain default value
        }
        try targetCollectionData.totalSupply() returns (uint256 totalSupply_) {
            data.totalSupply = totalSupply_;
        } catch {
            // Retain default value
        }
        try targetCollectionData.maxSupply() returns (uint256 maxSupply_) {
            data.maxSupply = maxSupply_;
        } catch {
            // Retain default value
        }
        try Ownable(targetCollection).owner() returns (address issuer_) {
            data.issuer = issuer_;
        } catch {
            // Retain default value
        }
    }
}
