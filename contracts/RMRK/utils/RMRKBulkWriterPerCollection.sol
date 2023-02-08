// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../equippable/IRMRKEquippable.sol";

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
     * @return tokenId ID of the token we are managing
     * @return assetId ID of the asset that we are equipping into
     * @return slotPartId ID of the slot part that we are using to unequip
     */
    struct IntakeUnequip {
        uint256 tokenId;
        uint64 assetId;
        uint64 slotPartId;
    }

    /// Address of the collection that this contract is managing
    address private _collection;

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
    function getCollection() external view returns (address) {
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
    function replaceEquip(IRMRKEquippable.IntakeEquip memory data) external {
        IRMRKEquippable(_collection).unequip(
            data.tokenId,
            data.assetId,
            data.slotPartId
        );
        IRMRKEquippable(_collection).equip(data);
    }

    /**
     * @notice Permorms multiple unequip and equip operations
     * @dev Unequip operations must run first
     * @dev The `IntakeUnquip` stuct contains the following data:
     *  [
     *      tokenId,
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
     * @param unequips[] An array of `IntakeUnequip` structs specifying the slots to unequip.
     * @param equips[] An array of `IntakeEquip` structs specifying the slots to equip.
     */
    function bulkEquip(
        IntakeUnequip[] memory unequips,
        IRMRKEquippable.IntakeEquip[] memory equips
    ) external {
        uint256 length = unequips.length;
        for (uint256 i = 0; i < length; i++) {
            IRMRKEquippable(_collection).unequip(
                unequips[i].tokenId,
                unequips[i].assetId,
                unequips[i].slotPartId
            );
        }
        length = equips.length;
        for (uint256 i = 0; i < length; i++) {
            IRMRKEquippable(_collection).equip(equips[i]);
        }
    }
}
