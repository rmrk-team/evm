// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../multiresource/IRMRKMultiResource.sol";

/**
 * @title IRMRKEquippable
 * @author RMRK team
 * @notice Interface smart contract of the RMRK equippable module.
 */
interface IRMRKEquippable is IRMRKMultiResource {
    /**
     * @notice Used to store the core structure of the `Equippable` RMRK lego.
     * @return resourceId The ID of the resource equipping a child
     * @return childResourceId The ID of the resource used as equipment
     * @return childId The ID of token that is equipped
     * @return childEquippableAddress Address of the collection to which the child resource belongs to
     */
    struct Equipment {
        uint64 resourceId;
        uint64 childResourceId;
        uint256 childId;
        address childEquippableAddress;
    }

    /**
     * @notice Used to provide data about fixed parts.
     * @return partId ID of the part
     * @return z The z value of the resource, specifying how the part should be rendered in a composed NFT
     * @return matadataURI The metadata URI of the fixed part
     */
    struct FixedPart {
        uint64 partId;
        uint8 z; //1 byte
        string metadataURI; //n bytes 32+
    }

    /**
     * @notice Used to provide data about slot parts.
     * @return partId ID of the part
     * @return childResourceId The ID of resource associated with token equipped into this slot
     * @return z The z value of the resource, specifying how the part should be rendered in a composed NFT
     * @return childId The ID of the token equipped into this part
     * @return childAddress The address of the child token's collection
     * @return metadataURI The metadata URI of the slot part
     */
    struct SlotPart {
        uint64 partId;
        uint64 childResourceId;
        uint8 z; //1 byte
        uint256 childId;
        address childAddress;
        string metadataURI; //n bytes 32+
    }

    /**
     * @notice Used to provide a struct for inputing equip data.
     * @dev Only used for input and not storage of data.
     * @return tokenId ID of the token we are managing
     * @return childIndex Index of a child in the list of token's active children
     * @return resourceId ID of the resource that we are equipping into
     * @return slotPartId ID of the slot part that we are using to equip
     * @return childResourceId ID of the resource that we are equipping
     */
    struct IntakeEquip {
        uint256 tokenId;
        uint256 childIndex;
        uint64 resourceId;
        uint64 slotPartId;
        uint64 childResourceId;
    }

    /**
     * @notice Used to notify listeners that a child's resource has been equipped into one of its parent resources.
     * @param tokenId ID of the token that had a resource equipped
     * @param resourceId ID of the resource associated with the token we are equipping into
     * @param slotPartId ID of the slot we are using to equip
     * @param childId ID of the child token we are equipping into the slot
     * @param childAddress Address of the child token's collection
     * @param childResourceId ID of the resource associated with the token we are equipping
     */
    event ChildResourceEquipped(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed slotPartId,
        uint256 childId,
        address childAddress,
        uint64 childResourceId
    );

    /**
     * @notice Used to notify listeners that a child's resource has been unequipped from one of its parent resources.
     * @param tokenId ID of the token that had a resource unequipped
     * @param resourceId ID of the resource associated with the token we are unequipping out of
     * @param slotPartId ID of the slot we are unequipping from
     * @param childId ID of the token being unequipped
     * @param childAddress Address of the collection that a token that is being unequipped belongs to
     * @param childResourceId ID of the resource associated with the token we are unequipping
     */
    event ChildResourceUnequipped(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed slotPartId,
        uint256 childId,
        address childAddress,
        uint64 childResourceId
    );

    /**
     * @notice Used to notify listeners that the resources belonging to a `equippableGroupId` have been marked as
     *  equippable into a given slot and parent
     * @param equippableGroupId ID of the equippable group being marked as equippable into the slot associated with
     *  `slotPartId` of the `parentAddress` collection
     * @param slotPartId ID of the slot part of the base into which the parts belonging to the equippable group
     *  associated with `equippableGroupId` can be equipped
     * @param parentAddress Address of the collection into which the parts belonging to `equippableGroupId` can be
     *  equipped
     */
    event ValidParentEquippableGroupIdSet(
        uint64 indexed equippableGroupId,
        uint64 indexed slotPartId,
        address parentAddress
    );

    /**
     * @notice Used to check whether the token has a given child equipped.
     * @param tokenId ID of the parent token for which we are querying for
     * @param childAddress Address of the child token's smart contract
     * @param childId ID of the child token
     * @return bool The boolean value indicating whether the child token is equipped into the given token or not
     */
    function isChildEquipped(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) external view returns (bool);

    /**
     * @notice Used to verify whether a token can be equipped into a given parent's slot.
     * @param parent Address of the parent token's smart contract
     * @param tokenId ID of the token we want to equip
     * @param resourceId ID of the resource associated with the token we want to equip
     * @param slotId ID of the slot that we want to equip the token into
     * @return bool The boolean indicating whether the token with the given resource can be equipped into the desired
     *  slot
     */
    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotId
    ) external view returns (bool);

    /**
     * @notice Used to get the Equipment object equipped into the specified slot of the desired token.
     * @param tokenId ID of the token for which we are retrieving the equipped object
     * @param targetBaseAddress Address of the `Base` associated with the `Slot` part of the token
     * @param slotPartId ID of the `Slot` part that we are checking for equipped objects
     * @return struct The `Equipment` struct containing data about the equipped object
     */
    function getEquipment(
        uint256 tokenId,
        address targetBaseAddress,
        uint64 slotPartId
    ) external view returns (Equipment memory);

    /**
     * @notice Used to get the extended resource struct of the resource associated with given `resourceId`.
     * @param resourceId ID of the resource of which we are retrieving
     */
    function getExtendedResource(uint256 tokenId, uint64 resourceId)
        external
        view
        returns (
            string memory metadataURI,
            uint64 equippableGroupId,
            address baseAddress,
            uint64[] memory fixedPartIds,
            uint64[] memory slotPartIds
        );
}
