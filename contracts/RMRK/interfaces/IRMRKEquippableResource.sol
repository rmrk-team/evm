// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IRMRKEquippableResource {
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

    event ResourceSet(bytes8 resourceId);

    event ResourceAddedToToken(uint256 indexed tokenId, bytes8 resourceId);

    event ResourceAccepted(uint256 indexed tokenId, bytes8 resourceId);

    event ResourceRejected(uint256 indexed tokenId, bytes8 resourceId);

    event ResourcePrioritySet(uint256 indexed tokenId);

    event ResourceOverwriteProposed(
        uint256 indexed tokenId,
        bytes8 resourceId,
        bytes8 overwrites
    );

    event ResourceOverwritten(uint256 indexed tokenId, bytes8 overwritten);

    event ResourceCustomDataSet(bytes8 resourceId, bytes16 customResourceId);

    event ResourceCustomDataAdded(
        bytes8 resourceId,
        bytes16 customResourceId
    );

    event ResourceCustomDataRemoved(
        bytes8 resourceId,
        bytes16 customResourceId
    );

    function acceptResource(uint256 tokenId, uint256 index) external;

    function rejectResource(uint256 tokenId, uint256 index) external;

    function rejectAllResources(uint256 tokenId) external;

    function setPriority(uint256 tokenId, uint16[] memory priorities) external;

    function getActiveResources(
        uint256 tokenId
    ) external view returns(bytes8[] memory);

    function getPendingResources(
        uint256 tokenId
    ) external view returns(bytes8[] memory);

    function getActiveResourcePriorities(
        uint256 tokenId
    ) external view returns(uint16[] memory);

    function getResourceOverwrites(
        uint256 tokenId,
        bytes8 resourceId
    ) external view returns(bytes8);

    function getResource(bytes8 resourceId) external view returns (Resource memory);

    function getCustomResourceData(
        bytes8 resourceId,
        bytes16 customResourceId
    ) external view returns (bytes memory);

    function tokenURI(
        uint256 tokenId
    ) external view returns (string memory);

    //Equipping

    //Abstractions

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
