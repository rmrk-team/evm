// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "../RMRK/security/InitializationGuard.sol";

/**
 * @title ERC721MockUpgradeable
 * Used for tests with non RMRK implementer
 */
contract ERC721MockUpgradeable is InitializationGuard, ERC721Upgradeable {
    function initialize(
        string memory name,
        string memory symbol
    ) public initializable{
        __ERC721_init(name, symbol);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}
