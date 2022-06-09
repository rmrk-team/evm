// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./IERC721.sol";
import "./IRMRKNestingReceiver.sol";

interface IRMRKNesting is IERC721 {

    struct RMRKOwner {
      uint256 tokenId;
      address ownerAddress;
      bool isNft;
    }

    struct Child {
      uint256 tokenId;
      address contractAddress;
    }

    //Nesting events
    event ChildProposed(uint parentTokenId);
    event ChildAccepted(uint tokenId);
    event ChildRemoved(uint tokenId, uint index);
    event PendingChildRemoved(uint tokenId, uint index);
    event AllPendingChildrenRemoved(uint tokenId);
    event ChildUnnested(uint parentTokenId, uint childTokenId);
    //Gas check this, can emit lots of events. Possibly offset by gas savings from deleted arrays.
    event ChildBurned(uint tokenId);

    function ownerOf(uint256 tokenId)
    external view returns (address owner);

    function rmrkOwnerOf(uint256 tokenId)
    external view returns (
        address,
        uint256,
        bool
    );

    function _burnChildren(uint256 tokenId, address oldOwner) external;

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
        uint256 parentId,
        address parentAddress
    ) external;
}
