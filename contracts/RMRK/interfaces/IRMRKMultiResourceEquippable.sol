// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResourceBase.sol";

interface IRMRKMultiResourceEquippable is IRMRKMultiResourceBase {

    //Reorder this during optimization for packing
    struct Resource {
        uint64 id; // ID of this resource
        uint64 equippableRefId; // ID of mapping for applicable equippables
        string metadataURI;
        //describes this equippable status
        address baseAddress; // Base contract reference
        uint64 slotId; // Which slotId this resource is equippable in
        uint128[] custom; //Custom data
    }

    struct Equipment {
        uint64 resourceId;
        uint64 childResourceId;
        uint childTokenId;
        address childAddress;
    }

    //Equipping

    function markEquipped(uint tokenId, uint64 resourceId, bool equipped) external;

    function isEquipped(uint tokenId) external view returns(bool);

    //Abstractions

    function getResource(uint64 resourceId) external view returns (Resource memory);

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view returns(Resource memory);

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view returns(Resource memory);

    function getFullResources(
        uint256 tokenId
    ) external view returns (Resource[] memory);

    function getFullPendingResources(
        uint256 tokenId
    ) external view returns (Resource[] memory);

    function getCallerEquippableSlot(
        uint64 resourceRefId
    ) external view returns (uint64);
}
