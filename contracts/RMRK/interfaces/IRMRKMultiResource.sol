// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;


interface IRMRKMultiResource {

    event ResourceSet(uint64 resourceId);

    event ResourceAddedToToken(uint256 indexed tokenId, uint64 resourceId);

    event ResourceAccepted(uint256 indexed tokenId, uint64 resourceId);

    event ResourceRejected(uint256 indexed tokenId, uint64 resourceId);

    event ResourcePrioritySet(uint256 indexed tokenId);

    event ResourceOverwriteProposed(
        uint256 indexed tokenId,
        uint64 resourceId,
        uint64 overwrites
    );

    event ResourceOverwritten(uint256 indexed tokenId, uint64 overwritten);

    event ResourceCustomDataSet(uint64 resourceId, uint128 customResourceId);

    event ResourceCustomDataAdded(
        uint64 resourceId,
        uint128 customResourceId
    );

    event ResourceCustomDataRemoved(
        uint64 resourceId,
        uint128 customResourceId
    );


    struct Resource {
        uint64 id; //8 bytes
        string metadataURI; //32+
        uint128[] custom;
    }
    
    function acceptResource(uint256 tokenId, uint256 index) external;

    function rejectResource(uint256 tokenId, uint256 index) external;

    function rejectAllResources(uint256 tokenId) external;

    function setPriority(uint256 tokenId, uint16[] memory priorities) external;

    function getActiveResources(
        uint256 tokenId
    ) external view returns(uint64[] memory);

    function getPendingResources(
        uint256 tokenId
    ) external view returns(uint64[] memory);

    function getActiveResourcePriorities(
        uint256 tokenId
    ) external view returns(uint16[] memory);

    function getResourceOverwrites(
        uint256 tokenId,
        uint64 resourceId
    ) external view returns(uint64);

    function getCustomResourceData(
        uint64 resourceId,
        uint128 customResourceId
    ) external view returns (bytes memory);

    function tokenURI(
        uint256 tokenId
    ) external view returns (string memory);

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
}
