// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IRMRKMultiResourceBase.sol";

interface IRMRKMultiResource is IRMRKMultiResourceBase {

    struct Resource {
        uint64 id; //8 bytes
        string metadataURI; //32+
        uint128[] custom;
    }

    //Abstractions

    function getResource(uint64 resourceId) external view returns (Resource memory);

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view returns(Resource memory);

    // FIXME: Re enable functionality when enough space
    // function getPendingResObjectByIndex(
    //     uint256 tokenId,
    //     uint256 index
    // ) external view returns(Resource memory);

    function getFullResources(
        uint256 tokenId
    ) external view returns (Resource[] memory);

    function getFullPendingResources(
        uint256 tokenId
    ) external view returns (Resource[] memory);
}
