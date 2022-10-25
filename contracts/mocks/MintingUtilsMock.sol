// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/utils/RMRKMintingUtils.sol";

contract MintingUtilsMock is RMRKMintingUtils {
    constructor(uint256 maxSupply_, uint256 pricePerMint_)
        RMRKMintingUtils(maxSupply_, pricePerMint_)
    {}

    function setupTestSaleIsOpen() external {
        _totalSupply = _maxSupply;
    }

    function testSaleIsOpen() external view saleIsOpen returns (bool) {
        return true;
    }
}
