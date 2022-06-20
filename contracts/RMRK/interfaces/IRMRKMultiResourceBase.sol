// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IRMRKMultiResourceBase {
    event ResourceSet(uint32 resourceId);

    event ResourceAddedToToken(uint256 indexed tokenId, uint32 resourceId);

    event ResourceAccepted(uint256 indexed tokenId, uint32 resourceId);

    event ResourceRejected(uint256 indexed tokenId, uint32 resourceId);

    event ResourcePrioritySet(uint256 indexed tokenId);

    event ResourceOverwriteProposed(
        uint256 indexed tokenId,
        uint32 resourceId,
        uint32 overwrites
    );

    event ResourceOverwritten(uint256 indexed tokenId, uint32 overwritten);

    event ResourceCustomDataSet(uint32 resourceId, uint64 customResourceId);

    event ResourceCustomDataAdded(
        uint32 resourceId,
        uint64 customResourceId
    );

    event ResourceCustomDataRemoved(
        uint32 resourceId,
        uint64 customResourceId
    );

    function acceptResource(uint256 tokenId, uint256 index) external;

    function rejectResource(uint256 tokenId, uint256 index) external;

    function rejectAllResources(uint256 tokenId) external;

    function setPriority(uint256 tokenId, uint16[] memory priorities) external;

    function getActiveResources(
        uint256 tokenId
    ) external view returns(uint32[] memory);

    function getPendingResources(
        uint256 tokenId
    ) external view returns(uint32[] memory);

    function getActiveResourcePriorities(
        uint256 tokenId
    ) external view returns(uint16[] memory);

    function getResourceOverwrites(
        uint256 tokenId,
        uint32 resourceId
    ) external view returns(uint32);

    function getCustomResourceData(
        uint32 resourceId,
        uint64 customResourceId
    ) external view returns (bytes memory);

    function tokenURI(
        uint256 tokenId
    ) external view returns (string memory);
}
