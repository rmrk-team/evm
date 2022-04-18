// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKNestingInternal {
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

    function addChildAccepted(
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

    function removeOrRejectChild(
        uint256 parentTokenId,
        uint256 childTokenId
    ) external;
}
