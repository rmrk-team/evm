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

}
