// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract ERC20MockUpgradeable is ERC20Upgradeable {
    function initialize() public initializer {
        __ERC20_init("TestToken", "TEST");
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
