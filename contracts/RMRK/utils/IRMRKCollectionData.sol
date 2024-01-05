//SPDX-License-Identifier: Apache 2.0

pragma solidity ^0.8.21;

interface IRMRKCollectionData {
    function totalSupply() external view returns (uint256);

    function maxSupply() external view returns (uint256);

    function getRoyaltyPercentage() external view returns (uint256);

    function getRoyaltyRecipient() external view returns (address);

    function owner() external view returns (address);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function collectionMetadata() external view returns (string memory);

    function contractURI() external view returns (string memory);
}
