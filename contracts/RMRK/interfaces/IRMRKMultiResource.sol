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

    event ResourceOverwritten(
        uint256 indexed tokenId,
        uint64 overwritten
    );

    event ApprovalForResources(
        address indexed owner,
        address indexed
        approved,
        uint256 indexed tokenId
    );

    event ApprovalForAllForResources(
        address indexed owner,
        address indexed
        operator,
        bool approved
    );

    struct Resource {
        uint64 id; //8 bytes
        string metadataURI; //32+
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

    // FIXME: This might be unnecesary, it can be done by getting ids and then each of them
    function getFullResources(
        uint256 tokenId
    ) external view returns (Resource[] memory);

    // FIXME: This might be unnecesary, it can be done by getting ids and then each of them
    function getFullPendingResources(
        uint256 tokenId
    ) external view returns (Resource[] memory);

    // Approvals

    function approveForResources(address to, uint256 tokenId) external;

    function getApprovedForResources(uint256 tokenId) external view returns (address);

    function setApprovalForAllForResources(address operator, bool approved) external;

    function isApprovedForAllForResources(address owner, address operator) external view returns (bool);
}
