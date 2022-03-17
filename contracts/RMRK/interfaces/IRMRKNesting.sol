// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

interface IRMRKNesting {
    function ownerOf(uint256 tokenId)
        external view returns (address owner);

    function rmrkOwnerOf(uint256 tokenId)
       external view returns (
           address,
           uint256,
           bool
       );

    function _burnChildren(uint256 tokenId, address oldOwner) external;

    function setChild(
        address childTokenAddress,
        uint256 tokenId,
        uint256 childTokenId
    ) external;
}
