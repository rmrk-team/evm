// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC6220} from "../equippable/IERC6220.sol";
import {IERC5773} from "../multiasset/IERC5773.sol";
import {IERC7401} from "../nestable/IERC7401.sol";
import {IERC6454} from "../extension/soulbound/IERC6454.sol";
import {IRMRKCollectionData} from "./IRMRKCollectionData.sol";

/**
 * @title RMRKCollectionUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK Collection utils module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKCollectionUtils {
    /**
     * @notice This event emits when the metadata of a token is changed.
     * So that the third-party platforms such as NFT market could
     * timely update the images and related attributes of the NFT.
     * Inspired on ERC4906, but adding collection.
     * @param collection Address of the collection to emit the event from
     * @param tokenId ID of the token to emit the event from
     */
    event MetadataUpdate(address collection, uint256 tokenId);

    /**
     * @notice This event emits when the metadata of a range of tokens is changed.
     * So that the third-party platforms such as NFT market could
     * timely update the images and related attributes of the NFTs.
     * Inspired on ERC4906, but adding collection.
     * @param collection Address of the collection to emit the event from
     * @param fromTokenId ID of the first token to emit the event from
     * @param toTokenId ID of the last token to emit the event from
     */
    event BatchMetadataUpdate(
        address collection,
        uint256 fromTokenId,
        uint256 toTokenId
    );

    /**
     * notice Structure used to represent the collection data.
     * @return totalSupply The total supply of the collection
     * @return maxSupply The maximum supply of the collection
     * @return royaltyPercentage The royalty percentage of the collection
     * @return royaltyRecipient The address of the royalty recipient
     * @return owner The address of the owner of the collection
     * @return name The name of the collection
     * @return symbol The symbol of the collection
     * @return collectionMetadata The metadata of the collection
     */
    struct CollectionData {
        uint256 totalSupply;
        uint256 maxSupply;
        uint256 royaltyPercentage;
        address royaltyRecipient;
        address owner;
        string name;
        string symbol;
        string collectionMetadata;
    }

    /**
     * @notice Used to get the collection data of a specified collection.
     * @dev The full `CollectionData` struct looks like this:
     *  [
     *      totalSupply,
     *      maxSupply,
     *      royaltyPercentage,
     *      royaltyRecipient,
     *      owner,
     *      symbol,
     *      name,
     *      collectionMetadata
     *  ]
     * @param collection Address of the collection to get the data from
     * @return data Collection data struct containing the collection data
     */
    function getCollectionData(
        address collection
    ) public view returns (CollectionData memory data) {
        IRMRKCollectionData target = IRMRKCollectionData(collection);

        try target.totalSupply() returns (uint256 totalSupply) {
            data.totalSupply = totalSupply;
        } catch {}
        try target.maxSupply() returns (uint256 maxSupply) {
            data.maxSupply = maxSupply;
        } catch {}
        try target.getRoyaltyPercentage() returns (uint256 royaltyPercentage) {
            data.royaltyPercentage = royaltyPercentage;
        } catch {}
        try target.getRoyaltyRecipient() returns (address royaltyRecipient) {
            data.royaltyRecipient = royaltyRecipient;
        } catch {}
        try target.owner() returns (address owner) {
            data.owner = owner;
        } catch {}
        try target.name() returns (string memory name) {
            data.name = name;
        } catch {}
        try target.symbol() returns (string memory symbol) {
            data.symbol = symbol;
        } catch {}
        try target.collectionMetadata() returns (
            string memory collectionMetadata
        ) {
            data.collectionMetadata = collectionMetadata;
        } catch {
            try target.contractURI() returns (
                string memory collectionMetadata
            ) {
                data.collectionMetadata = collectionMetadata;
            } catch {}
        }
    }

    /**
     * @notice Used to get the interface support of a specified collection.
     * @param collection Address of the collection to get the interface support from
     * @return supports721 Boolean value signifying whether the collection supports ERC721 interface
     * @return supportsMultiAsset Boolean value signifying whether the collection supports MultiAsset interface (ERC5773)
     * @return supportsNesting Boolean value signifying whether the collection supports Nestable interface (ERC7401)
     * @return supportsEquippable Boolean value signifying whether the collection supports Equippable interface (ERC6220)
     * @return supportsSoulbound Boolean value signifying whether the collection supports Soulbound interface (ERC6454)
     * @return supportsRoyalties Boolean value signifying whether the collection supports Royaltiesy interface (ERC2981)
     */
    function getInterfaceSupport(
        address collection
    )
        public
        view
        returns (
            bool supports721,
            bool supportsMultiAsset,
            bool supportsNesting,
            bool supportsEquippable,
            bool supportsSoulbound,
            bool supportsRoyalties
        )
    {
        IERC165 target = IERC165(collection);
        supports721 = target.supportsInterface(type(IERC721).interfaceId);
        supportsMultiAsset = target.supportsInterface(
            type(IERC5773).interfaceId
        );
        supportsNesting = target.supportsInterface(type(IERC7401).interfaceId);
        supportsEquippable = target.supportsInterface(
            type(IERC6220).interfaceId
        );
        supportsSoulbound = target.supportsInterface(
            type(IERC6454).interfaceId
        );
        supportsRoyalties = target.supportsInterface(
            type(IERC2981).interfaceId
        );
    }

    /**
     * @notice Used to get a list of existing token IDs in the range between `pageStart` and `pageSize`.
     * @dev It is not optimized to avoid checking IDs out of max supply nor total supply, since this is not meant to be
     *  used during transaction execution; it is only meant to be used as a getter.
     * @dev The resulting array might be smaller than the given `pageSize` since no-existent IDs are not included.
     * @param targetEquippable Address of the collection smart contract of the given token
     * @param pageStart The first ID to check
     * @param pageSize The number of IDs to check
     * @return page An array of IDs of the existing tokens
     */
    function getPaginatedMintedIds(
        address targetEquippable,
        uint256 pageStart,
        uint256 pageSize
    ) public view returns (uint256[] memory page) {
        uint256[] memory tmpIds = new uint[](pageSize);
        uint256 found;
        for (uint256 i = 0; i < pageSize; ) {
            try IERC721(targetEquippable).ownerOf(pageStart + i) returns (
                address
            ) {
                tmpIds[i] = pageStart + i;
                unchecked {
                    found += 1;
                }
            } catch {
                // do nothing
            }
            unchecked {
                ++i;
            }
        }
        page = new uint256[](found);
        uint256 actualIndex;
        for (uint256 i = 0; i < pageSize; ) {
            if (tmpIds[i] != 0) {
                page[actualIndex] = tmpIds[i];
                unchecked {
                    ++actualIndex;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Triggers an event to refresh the collection metadata.
     * @dev It will do nothing if the given collection address is not a contract.
     * @param collectionAddress Address of the collection to refresh the metadata from
     * @param fromTokenId ID of the first token to refresh the metadata from
     * @param toTokenId ID of the last token to refresh the metadata from
     */
    function refreshCollectionTokensMetadata(
        address collectionAddress,
        uint256 fromTokenId,
        uint256 toTokenId
    ) public {
        // To avoid some spam
        if (collectionAddress.code.length == 0) {
            return;
        }
        emit BatchMetadataUpdate(collectionAddress, fromTokenId, toTokenId);
    }

    /**
     * @notice Triggers an event to refresh the token metadata.
     * @dev It will do nothing if the given collection address is not a contract.
     * @param collectionAddress Address of the collection to refresh the metadata from
     * @param tokenId ID of the token to refresh the metadata from
     */
    function refreshTokenMetadata(
        address collectionAddress,
        uint256 tokenId
    ) public {
        // To avoid some spam
        if (collectionAddress.code.length == 0) {
            return;
        }
        emit MetadataUpdate(collectionAddress, tokenId);
    }
}
