// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/utils/RMRKMintingUtilsUpgradeable.sol";

contract MintingUtilsMockUpgradeable is RMRKMintingUtilsUpgradeable {
    function initialize(
        uint256 maxSupply_,
        uint256 pricePerMint_
    ) public initializer {
        __RMRKMintingUtilsUpgradeable_init(maxSupply_, pricePerMint_);
    }

    function setupTestSaleIsOpen() external {
        _nextId = _maxSupply;
    }

    function testSaleIsOpen() external view saleIsOpen returns (bool) {
        return true;
    }

    function mockMint(uint256 total) external payable {
        _totalSupply += total;
        _nextId += total;
    }
}
