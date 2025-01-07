// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IERC6220} from "../equippable/IERC6220.sol";
import {IERC7401} from "../nestable/IERC7401.sol";
import {IERC6454} from "../extension/soulbound/IERC6454.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKBulkWriter
 * @author RMRK team
 * @notice Smart contract of the RMRK Bulk Writer module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKBulkWriter is Context {
    /**
     * @notice Used to provide a struct for inputing unequip data.
     * @dev Only used for input and not storage of data.
     * @return assetId ID of the asset that we are equipping into
     * @return slotPartId ID of the slot part that we are using to unequip
     */
    struct IntakeUnequip {
        uint64 assetId;
        uint64 slotPartId;
    }

    struct ParentData {
        address parentCollection;
        uint256 parentTokenId;
        uint256 childIndexInParent;
        uint64 parentEquippedAssetId;
        uint64 parentEquippedSlotPartId;
    }

    /**
     * @notice Reverts if the caller is not the owner of the token.
     * @param collection Address of the collection that this contract is managing
     * @param tokenId ID of the token we are managing
     */
    modifier onlyTokenOwner(address collection, uint256 tokenId) {
        _checkTokenOwner(collection, tokenId);
        _;
    }

    /**
     * @notice Initializes the contract.
     */
    constructor() {}

    /**
     * @notice Replaces the current equipped child in the asset and slot combination with the given one.
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      assetId,
     *      slotPartId,
     *      childAssetId
     *  ]
     * @dev This contract must have approval to manage the NFT assets, only the current owner can call this method (not an approved operator).
     * @param collection Address of the collection that this contract is managing
     * @param data An `IntakeEquip` struct specifying the equip data
     */
    function replaceEquip(
        address collection,
        IERC6220.IntakeEquip memory data
    ) public onlyTokenOwner(collection, data.tokenId) {
        IERC6220(collection).unequip(
            data.tokenId,
            data.assetId,
            data.slotPartId
        );
        IERC6220(collection).equip(data);
    }

    /**
     * @notice Performs multiple unequip and/or equip operations.
     * @dev Unequip operations must run first.
     * @dev Unequip operations do not need to be related to the equip operations; this method does not force you to only equip the assets into the slots that were unequipped.
     * @dev `tokenId` is included as a parameter to be able to do a single check for ownership.
     * @dev Every `tokenId` in the `IntakeEquip` structs must match the `tokenId` passed as the argument.
     * @dev The `IntakeUnequip` stuct contains the following data:
     *  [
     *      assetId,
     *      slotPartId,
     *  ]
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      assetId,
     *      slotPartId,
     *      childAssetId
     *  ]
     * @dev This contract must have approval to manage the NFT assets, only the current owner can call this method (not an approved operator).
     * @param collection Address of the collection that this contract is managing
     * @param tokenId ID of the token we are managing
     * @param unequips[] An array of `IntakeUnequip` structs specifying the slots to unequip
     * @param equips[] An array of `IntakeEquip` structs specifying the slots to equip
     */
    function bulkEquip(
        address collection,
        uint256 tokenId,
        IntakeUnequip[] memory unequips,
        IERC6220.IntakeEquip[] memory equips
    ) public onlyTokenOwner(collection, tokenId) {
        uint256 length = unequips.length;
        for (uint256 i; i < length; ) {
            IERC6220(collection).unequip(
                tokenId,
                unequips[i].assetId,
                unequips[i].slotPartId
            );
            unchecked {
                ++i;
            }
        }
        length = equips.length;
        for (uint256 i; i < length; ) {
            if (equips[i].tokenId != tokenId) {
                revert RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime();
            }
            IERC6220(collection).equip(equips[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Transfers multiple children from one token.
     * @dev If `destinationId` is 0, the destination can be an EoA or a contract implementing the IERC721Receiver interface.
     * @dev If `destinationId` is not 0, the destination must be a contract implementing the IERC7401 interface.
     * @dev `childrenIndexes` MUST be in ascending order, this method will transfer the children in reverse order to avoid index changes on children.
     * @dev This methods works with active children only.
     * @dev This contract must have approval to manage the NFT, only the current owner can call this method (not an approved operator).
     * @param collection Address of the collection that this contract is managing
     * @param tokenId ID of the token we are managing
     * @param childrenIndexes An array of indexes of the children to transfer
     * @param to Address of the destination token or contract
     * @param destinationId ID of the destination token
     */
    function bulkTransferChildren(
        address collection,
        uint256 tokenId,
        uint256[] memory childrenIndexes,
        address to,
        uint256 destinationId
    ) public onlyTokenOwner(collection, tokenId) {
        IERC7401 targetCollection = IERC7401(collection);
        IERC7401.Child[] memory children = targetCollection.childrenOf(tokenId);
        uint256 length = childrenIndexes.length;
        for (uint256 i; i < length; ) {
            uint256 lastIndex = length - 1 - i;
            uint256 childIndex = childrenIndexes[lastIndex];
            IERC7401.Child memory child = children[childIndex];
            targetCollection.transferChild(
                tokenId,
                to,
                destinationId,
                childIndex,
                child.contractAddress,
                child.tokenId,
                false,
                ""
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Transfers all children from one token.
     * @dev If `destinationId` is 0, the destination can be an EoA or a contract implementing the IERC721Receiver interface.
     * @dev If `destinationId` is not 0, the destination must be a contract implementing the IERC7401 interface.
     * @dev This methods works with active children only.
     * @dev This contract must have approval to manage the NFT, only the current owner can call this method (not an approved operator).
     * @param collection Address of the collection that this contract is managing
     * @param tokenId ID of the token we are managing
     * @param to Address of the destination token or contract
     * @param destinationId ID of the destination token
     */
    function bulkTransferAllChildren(
        address collection,
        uint256 tokenId,
        address to,
        uint256 destinationId
    ) public onlyTokenOwner(collection, tokenId) {
        IERC7401 targetCollection = IERC7401(collection);
        IERC7401.Child[] memory children = targetCollection.childrenOf(tokenId);

        uint256 length = children.length;
        for (uint256 i; i < length; ) {
            uint256 lastIndex = length - 1 - i;
            IERC7401.Child memory child = children[lastIndex];
            bool transferable = true;
            IERC6454 targetChild = IERC6454(child.contractAddress);
            if (targetChild.supportsInterface(type(IERC6454).interfaceId)) {
                transferable = targetChild.isTransferable(
                    tokenId,
                    address(this),
                    to
                );
            }
            if (transferable) {
                targetCollection.transferChild(
                    tokenId,
                    to,
                    destinationId,
                    lastIndex,
                    child.contractAddress,
                    child.tokenId,
                    false,
                    ""
                );
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Transfers an NFT to and NFT and optionally equips it.
     * @dev If the NFT is currently equipped, you MUST set full `parentData` and it will be unequipped before transfer.
     * @dev If the NFT is currently nested, you MUST set `parentData` with `parentCollection`, `parentTokenId` and `childIndexInParent`. The child will be transferred directly to the destination NFT via `transferChild`.
     * @dev If the NFT is not currently nested you MUST send empty `parentData` and the transfer will be done via `nestTransferFrom`.
     * @dev If the destination contract does not have an auto accept mechanism for children, the child will be auto accepted.
     * @dev If the `equipData` is set, the NFT will be equipped after the transfer. Mind that the child index equip data is the index after the transfer, so it MUST be set to the number of children the destination NFT has.
     * @dev If equipping into destination, the `equipData.tokenId` will match the `destinationTokenId`.
     * @dev This contract MUST have approval on the parent collection, if any, to transfer the NFT.
     * @dev This contract MUST have approval for assets on the parent collection, if any, to unequip the NFT.
     * @dev This contract MUST have approval on the NFT collection, if not nested, to transfer the NFT.
     * @dev This contract MUST have approval on the destination collection to accept the NFT.
     * @dev This contract MUST have approval for assets on the destination collection to equip the NFT.
     * @param collection Address of the collection that this contract is managing
     * @param tokenId ID of the token we are managing
     * @param destinationCollection Address of the destination collection
     * @param destinationTokenId ID of the destination token
     * @param parentData A `ParentData` struct specifying the parent data
     * @param equipData An `IntakeEquip` struct specifying the equip data
     */
    function transferAndEquip(
        address collection,
        uint256 tokenId,
        address destinationCollection,
        uint256 destinationTokenId,
        ParentData memory parentData,
        IERC6220.IntakeEquip memory equipData
    ) public onlyTokenOwner(collection, tokenId) {
        if (parentData.parentCollection != address(0)) {
            if (
                parentData.parentEquippedAssetId != 0 &&
                parentData.parentEquippedSlotPartId != 0
            ) {
                IERC6220(parentData.parentCollection).unequip(
                    parentData.parentTokenId,
                    parentData.parentEquippedAssetId,
                    parentData.parentEquippedSlotPartId
                );
            }
            IERC7401(parentData.parentCollection).transferChild(
                parentData.parentTokenId,
                destinationCollection,
                destinationTokenId,
                parentData.childIndexInParent,
                collection,
                tokenId,
                false,
                ""
            );
        } else {
            IERC7401(collection).nestTransferFrom(
                _msgSender(),
                destinationCollection,
                tokenId,
                destinationTokenId,
                ""
            );
        }

        _acceptChildIfNecessary(
            destinationCollection,
            destinationTokenId,
            collection,
            tokenId
        );

        if (equipData.assetId == 0) return;

        _unequipSlotIfNecessary(
            destinationCollection,
            destinationTokenId,
            equipData.assetId,
            equipData.slotPartId
        );

        IERC6220(destinationCollection).equip(equipData);
    }

    function _acceptChildIfNecessary(
        address parentCollection,
        uint256 parentId,
        address childCollection,
        uint256 childId
    ) private {
        IERC7401 destination = IERC7401(parentCollection);
        IERC7401.Child[] memory children = destination.pendingChildrenOf(
            parentId
        );
        uint256 length = children.length;
        for (uint256 i; i < length; ) {
            IERC7401.Child memory child = children[i];
            if (
                child.contractAddress == childCollection &&
                child.tokenId == childId
            ) {
                destination.acceptChild(parentId, i, childCollection, childId);
                return;
            }
            unchecked {
                ++i;
            }
        }
    }

    function _unequipSlotIfNecessary(
        address collection,
        uint256 tokenId,
        uint64 assetId,
        uint64 slotPartId
    ) private {
        IERC6220 targetCollection = IERC6220(collection);
        (, , address catalogAddress, ) = targetCollection
            .getAssetAndEquippableData(tokenId, assetId);
        if (
            targetCollection
                .getEquipment(tokenId, catalogAddress, slotPartId)
                .childId != 0
        ) targetCollection.unequip(tokenId, assetId, slotPartId);
    }

    /**
     * @notice Validates that the caller is the owner of the token.
     * @dev Reverts if the caller is not the owner of the token.
     * @param collection Address of the collection that this contract is managing
     * @param tokenId ID of the token we are managing
     */
    function _checkTokenOwner(
        address collection,
        uint256 tokenId
    ) internal view {
        address tokenOwner = IERC721(collection).ownerOf(tokenId);
        if (tokenOwner != _msgSender()) {
            revert RMRKCanOnlyDoBulkOperationsOnOwnedTokens();
        }
    }
}
