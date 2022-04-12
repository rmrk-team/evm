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
}
