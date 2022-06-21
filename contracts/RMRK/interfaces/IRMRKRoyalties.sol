// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IRMRKRoyalties {

function getRoyaltyData()
    external
    view
    returns (
        address royaltyAddress,
        uint256 numerator,
        uint256 denominator
    );

function setRoyaltyData(
    address _royaltyAddress,
    uint64 _numerator,
    uint64 _denominator
) external;

}
