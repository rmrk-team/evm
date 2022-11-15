// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import {IRMRKMultiResource} from "./IRMRKMultiResource.sol";

interface ILightmMultiResourceEventsAndStruct {
    struct Resource {
        uint64 id;
        string metadataURI;
    }
}

interface ILightmMultiResource is
    ILightmMultiResourceEventsAndStruct,
    IRMRKMultiResource
{
    function getFullResources(uint256 tokenId)
        external
        view
        returns (Resource[] memory);

    function getFullPendingResources(uint256 tokenId)
        external
        view
        returns (Resource[] memory);
}
