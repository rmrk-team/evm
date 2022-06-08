// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./IERC721.sol";
import "./IRMRKNestingReceiver.sol";

interface IRMRKNesting is IERC721 {

    function ownerOf(uint256 tokenId)
    external view returns (address owner);

    function rmrkOwnerOf(uint256 tokenId)
    external view returns (
        address,
        uint256,
        bool
    );

    function burnFromParent(uint256 tokenId) external;

    function addChild(
        uint256 parentTokenId,
        uint256 childTokenId,
        address childTokenAddress
    ) external;

    function acceptChild(
        uint256 parentTokenId,
        uint256 childTokenId
    ) external;

    function rejectChild(
        uint256 parentTokenId,
        uint256 index
    ) external;

    function removeChild(
        uint256 parentTokenId,
        uint256 index
    ) external;

    function unnestChild(
        uint256 tokenId,
        uint256 index
    ) external;

    function unnestToken(
        uint256 tokenId,
        uint256 parentId
    ) external;
}
