// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/extension/nestableAutoIndex/RMRKNestableAutoIndexUpgradeable.sol";

contract RMRKNestableAutoIndexMockUpgradeable is
    RMRKNestableAutoIndexUpgradeable
{
    function initialize(
        string memory name_,
        string memory symbol_
    ) public initializer {
        __RMRKNestableAutoIndexUpgradeable_init(name_, symbol_);
    }

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
