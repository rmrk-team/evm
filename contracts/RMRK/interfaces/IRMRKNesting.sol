// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./IRMRKNestingReceiver.sol";

interface IRMRKNesting {

    // FIXME, should we add more context to these events?
    event ChildProposed(uint parentTokenId);
    event ChildAccepted(uint tokenId);
    // FIXME: ChildRejected seems more consistent
    event PendingChildRemoved(uint tokenId, uint index);
    event AllPendingChildrenRemoved(uint tokenId);
    event ChildRemoved(uint tokenId, uint index);
    event ChildUnnested(uint tokenId, uint index);


    struct Child {
        uint256 tokenId;
        address contractAddress;
    }

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
        uint256 index,
        address to
    ) external;

    function removeChild(
        uint256 parentTokenId,
        uint256 index
    ) external;

    function unnestChild(
        uint256 tokenId,
        uint256 index, 
        address to
    ) external;

    function transferAsChild(
        uint256 tokenId, 
        address to
    ) external;

    function childrenOf(
        uint256 parentTokenId
    ) external view returns (Child[] memory);

    function pendingChildrenOf(
        uint256 parentTokenId
    ) external view returns (Child[] memory);

    function childOf(
        uint256 parentTokenId,
        uint256 index
    ) external view returns (Child memory);

    function pendingChildOf(
        uint256 parentTokenId,
        uint256 index
    ) external view returns (Child memory);

}
