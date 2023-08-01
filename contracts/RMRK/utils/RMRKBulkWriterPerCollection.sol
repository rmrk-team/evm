// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../equippable/IERC6220.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error RMRKCanOnlyDoBulkOperationsOnOwnedTokens();
error RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime();

/**
 * @title RMRKBulkWriterPerCollection
 * @author RMRK team
 * @notice Smart contract of the RMRK Bulk Writer per collection module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKBulkWriterPerCollection {
    /**
     * @notice Used to provide a struct for inputing unequip data.
     * @dev Only used for input and not storage of data
     * @return assetId ID of the asset that we are equipping into
     * @return slotPartId ID of the slot part that we are using to unequip
     */
    struct IntakeUnequip {
        uint64 assetId;
        uint64 slotPartId;
    }

    /// Address of the collection that this contract is managing
    address private _collection;

    /**
     * @notice Reverts if the caller is not the owner of the token
     */
    modifier onlyTokenOwner(uint256 tokenId) {
        _checkTokenOwner(tokenId);
        _;
    }

    /**
     * @notice Initializes the contract by setting the collection
     * @param collection Address of the collection that this contract is managing.
     */
    constructor(address collection) {
        _collection = collection;
    }

    /**
     * @notice Returns the address of the collection that this contract is managing
     * @return Address of the collection that this contract is managing
     */
    function getCollection() public view returns (address) {
        return _collection;
    }

    /**
     * @notice Replaces the current equipped child on the asset and slot combination with the given one
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      assetId,
     *      slotPartId,
     *      childAssetId
     *  ]
     * @param data An `IntakeEquip` struct specifying the equip data.
     */
    function replaceEquip(
        IERC6220.IntakeEquip memory data
    ) public onlyTokenOwner(data.tokenId) {
        IERC6220(_collection).unequip(
            data.tokenId,
            data.assetId,
            data.slotPartId
        );
        IERC6220(_collection).equip(data);
    }

    /**
     * @notice Performs multiple unequip and equip operations
     * @dev Unequip operations must run first
     * @dev tokenId is included as a parameter to be able to do a single check for ownership
     * @dev Every tokenId in the `IntakeEquip` structs must match the tokenId passed in
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
     * @param tokenId ID of the token we are managing.
     * @param unequips[] An array of `IntakeUnequip` structs specifying the slots to unequip.
     * @param equips[] An array of `IntakeEquip` structs specifying the slots to equip.
     */
    function bulkEquip(
        uint256 tokenId,
        IntakeUnequip[] memory unequips,
        IERC6220.IntakeEquip[] memory equips
    ) public onlyTokenOwner(tokenId) {
        uint256 length = unequips.length;
        for (uint256 i = 0; i < length; ) {
            IERC6220(_collection).unequip(
                tokenId,
                unequips[i].assetId,
                unequips[i].slotPartId
            );
            unchecked {
                ++i;
            }
        }
        length = equips.length;
        for (uint256 i = 0; i < length; ) {
            if (equips[i].tokenId != tokenId) {
                revert RMRKCanOnlyDoBulkOperationsWithOneTokenAtATime();
            }
            IERC6220(_collection).equip(equips[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Checks if the caller is the owner of the token
     * @dev Reverts if the caller is not the owner of the token
     * @param tokenId ID of the token we are managing.
     */
    function _checkTokenOwner(uint256 tokenId) internal view {
        address tokenOwner = IERC721(_collection).ownerOf(tokenId);
        if (tokenOwner != msg.sender) {
            revert RMRKCanOnlyDoBulkOperationsOnOwnedTokens();
        }
    }
}
