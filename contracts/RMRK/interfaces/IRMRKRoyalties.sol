// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IRMRKRoyalties {
    /**
     * @notice Returns the data for royalty distributions.
     *
     * Returns address for royalty capture, numerator, and denominator for percentage calculation with arbitrary precision.
     *
     */
    function getRoyaltyData()
        external
        view
        returns (
            address royaltyAddress,
            uint256 numerator,
            uint256 denominator
        );

    /**
     * @notice Setter for royalty distribution data.
     *
     */
    function setRoyaltyData(
        address _royaltyAddress,
        uint64 _numerator,
        uint64 _denominator
    ) external;
}
