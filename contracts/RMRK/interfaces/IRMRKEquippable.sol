// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResource.sol";

interface IRMRKEquippable is IRMRKMultiResource {

    /**
    * @dev emitted when a child's resource is equipped into one of its parent resources.
    */
    event ChildResourceEquipped(
        uint indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed slotPartId,
        uint childTokenId,
        address childAddress,
        uint64 childResourceId
    );

    /**
    * @dev emitted when a child's resource is removed from one of its parent resources.
    */
    event ChildResourceUnequipped(
        uint indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed slotPartId,
        uint childTokenId,
        address childAddress,
        uint64 childResourceId
    );

    /**
    * @dev emitted when it's declared that resources with the referenceId, are equippable into the parent address, on the partId slot
    */
    event ValidParentReferenceIdSet(
        uint64 indexed referenceId,
        uint64 indexed slotPartId,
        address parentAddress
    );

    /**
    * @dev emitted when the nesting address is set
    */
    event NestingAddressSet( address old, address new_);

    /**
    * @dev Returns the Equippable contract's corresponding nesting address.
    */
    function getNestingAddress() external view returns(address);

    /**
    * @dev Returns if the tokenId is considered to be equipped into another resource.
    */
    function isChildEquipped(
        uint tokenId,
        address childAddress,
        uint childTokenId
    ) external view returns(bool);

    /**
    * @dev Returns whether or not tokenId with resourceId can be equipped into parent contract at slot
    *
    */
    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint tokenId,
        uint64 resourceId,
        uint64 slotId
    ) external view returns (bool);
}
