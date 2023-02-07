// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/extension/nestableAutoIndex/RMRKNestableAutoIndex.sol";

contract RMRKNestableAutoIndexMock is RMRKNestableAutoIndex {
    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNestableAutoIndex(name_, symbol_) {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId, "");
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external {
        _nestMint(to, tokenId, destinationId, "");
    }
}
