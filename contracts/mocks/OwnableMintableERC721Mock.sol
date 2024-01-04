// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

/// @dev This mock smart contract is intended to be used with `@defi-wonderland/smock` and doesn't need any business
///  logic.
contract OwnableMintableERC721Mock {
    function owner() public pure returns (address) {
        return address(0);
    }

    function ownerOf(uint256) public pure returns (address) {
        return address(0);
    }
}
