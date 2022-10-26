// SPDX-License-Identifier: Apache-2.0
import "../access/OwnableLock.sol";
import "../utils/IERC20.sol";

pragma solidity ^0.8.15;

/**
 * @dev Top-level utilities for managing minting. Implements OwnableLock by default.
 * Max supply-related and pricing variables are immutable after deployment.
 * Payments are done through an ERC20 supplied on constructor's `tokenAddress_`
 */

contract RMRKMintingUtilsErc20Pay is OwnableLock {
    uint256 internal _totalSupply;
    uint256 internal immutable _maxSupply;
    uint256 internal immutable _pricePerMint;
    address internal immutable _tokenAddress;

    constructor(
        address tokenAddress_,
        uint256 maxSupply_,
        uint256 pricePerMint_
    ) {
        _tokenAddress = tokenAddress_;
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

    function tokenAddress() public view returns (address) {
        return _tokenAddress;
    }

    function withdrawRaised(address to, uint256 amount) external onlyOwner {
        _withdraw(to, amount);
    }

    function _withdraw(address to, uint256 amount) private {
        IERC20(_tokenAddress).transferFrom(address(this), to, amount);
    }
}
