// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResourceBase.sol";

interface IRMRKEquippableResource is IRMRKMultiResourceBase {

    //Possibly move this to the constructor of the contract, if only for being able to set arr len on construct
    struct Resource {
        bytes8 id; //8 bytes
        string metadataURI; //32+
        //describes this equippable status
        address baseAddress;
        bytes8 slotId;
        bytes16[] custom;
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
