// SPDX-License-Identifier: Apache-2.0
import "../access/OwnableLock.sol";

pragma solidity ^0.8.15;

error RMRKMintOverMax();

/**
 * @dev Top-level utilities for managing minting. Implements OwnableLock by default.
 * Max supply-related and pricing variables are immutable after deployment.
 */

contract RMRKMintingUtils is OwnableLock {
    uint256 internal _totalSupply;
    uint256 internal immutable _maxSupply;
    uint256 internal immutable _pricePerMint;

    constructor(uint256 maxSupply_, uint256 pricePerMint_) {
        _maxSupply = maxSupply_;
        _pricePerMint = pricePerMint_;
    }

    modifier saleIsOpen() {
        if (_totalSupply >= _maxSupply) revert RMRKMintOverMax();
        _;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function pricePerMint() public view returns (uint256) {
        return _pricePerMint;
    }

    function withdrawRaised(address to, uint256 amount) external onlyOwner {
        _withdraw(to, amount);
    }

    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Transfer failed.");
    }
}
