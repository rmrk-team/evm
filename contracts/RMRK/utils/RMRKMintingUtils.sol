// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

error RMRKMintOverMax();

contract RMRKMintingUtils {

    uint256 internal _totalSupply;
    uint256 internal immutable _maxSupply;
    uint256 internal immutable _pricePerMint;

    constructor(
        uint256 maxSupply_,
        uint256 pricePerMint_
    ) {
        _maxSupply = maxSupply_;
        _pricePerMint = pricePerMint_;
    }

    modifier saleIsOpen {
        if (_totalSupply >= _maxSupply) revert RMRKMintOverMax();
        _;
    }

    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }

    function maxSupply() public view returns(uint) {
        return _maxSupply;
    }

    function pricePerMint() public view returns (uint) {
        return _pricePerMint;
    }

}
