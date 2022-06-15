// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResourceBase.sol";

interface IRMRKEquippableResource is IRMRKMultiResourceBase {

    //Reorder this during optimization for packing
    struct Resource {
        bytes8 id; // ID of this resource
        bytes8 equippableRefId; // ID of mapping for applicable equippables
        string metadataURI;
        //describes this equippable status
        address baseAddress; // Base contract reference
        bytes8 slotId; // Which slotId this resource is equippable in
        bytes16[] custom; //Custom data
    }

    struct Equipment {
        uint256 tokenId;
        address contractAddress;
        bytes8 childResourceId;
    }

    //Equipping

    //Abstractions

    function getResource(bytes8 resourceId) external view returns (Resource memory);

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
}
