// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResourceBase.sol";

interface IRMRKMultiResource is IRMRKMultiResourceBase {

    struct Resource {
        uint32 id; //8 bytes
        string metadataURI; //32+
        uint64[] custom;
    }

    //Abstractions

    function getResource(uint32 resourceId) external view returns (Resource memory);

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
