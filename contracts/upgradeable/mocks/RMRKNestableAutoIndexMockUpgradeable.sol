// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/extension/nestableAutoIndex/RMRKNestableAutoIndexUpgradeable.sol";
import "../RMRK/security/InitializationGuard.sol";

contract RMRKNestableAutoIndexMockUpgradeable is InitializationGuard, RMRKNestableAutoIndexUpgradeable {
    function initialize(
        string memory name_,
        string memory symbol_
    ) public initializable {
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
