// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "../multiresource/IRMRKMultiResource.sol";

interface IRMRKEquippable is IRMRKMultiResource {
    /**
     * @dev emitted when a child's resource is equipped into one of its parent resources.
     */
    event ChildResourceEquipped(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed slotPartId,
        uint256 childTokenId,
        address childAddress,
        uint64 childResourceId
    );

    /**
     * @dev emitted when a child's resource is removed from one of its parent resources.
     */
    event ChildResourceUnequipped(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed slotPartId,
        uint256 childTokenId,
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
     * @dev Returns if the tokenId is considered to be equipped into another resource.
     */
    function isChildEquipped(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) external view returns (bool);

    struct Equipment {
        uint64 resourceId;
        uint64 childResourceId;
        uint256 childTokenId;
        address childEquippableAddress;
    }

    struct ExtendedResource {
        // Used for input/output only
        uint64 id; // ID of this resource
        uint64 equippableRefId;
        address baseAddress;
        string metadataURI;
    }

    struct FixedPart {
        uint64 partId;
        uint8 z; //1 byte
        string metadataURI; //n bytes 32+
    }

    struct SlotPart {
        uint64 partId;
        uint64 childResourceId;
        uint8 z; //1 byte
        uint256 childTokenId;
        address childAddress;
        string metadataURI; //n bytes 32+
    }

    struct IntakeEquip {
        uint256 tokenId;
        uint256 childIndex;
        uint64 resourceId;
        uint64 slotPartId;
        uint64 childResourceId;
    }

    /**
     * @dev Returns whether or not tokenId with resourceId can be equipped into parent contract at slot
     *
     */
    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotId
    ) external view returns (bool);

    function getSlotPartIds(uint64 resourceId)
        external
        view
        returns (uint64[] memory);

    function getFixedPartIds(uint64 resourceId)
        external
        view
        returns (uint64[] memory);

    function getEquipment(
        uint256 tokenId,
        address targetBaseAddress,
        uint64 slotPartId
    ) external view returns (Equipment memory);

    function getExtendedResource(uint64 resourceId)
        external
        view
        returns (ExtendedResource memory);

    function getBaseAddressOfResource(uint64 resourceId) external view returns(address);
}
