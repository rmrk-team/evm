// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKNestingReceiver.sol";

interface IRMRKNesting {

    event ChildProposed(uint parentTokenId);
    event ChildAccepted(uint tokenId);
    event PendingChildRemoved(uint tokenId, uint index);
    event AllPendingChildrenRemoved(uint tokenId);
    event ChildRemoved(uint tokenId, uint index);
    event ChildUnnested(uint parentTokenId, uint childTokenId);

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
