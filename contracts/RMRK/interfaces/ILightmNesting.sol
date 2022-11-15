// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import {IRMRKNesting} from "./IRMRKNesting.sol";

interface ILightmNesting is IRMRKNesting {
    function hasChild(
        uint256 tokenId,
        address childContract,
        uint256 childTokenId
    )
        external
        view
        returns (
            bool found,
            bool isPending,
            uint256 index
        );

    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) external;

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external;
}
