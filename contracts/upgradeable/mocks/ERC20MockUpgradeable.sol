// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "../RMRK/security/InitializationGuard.sol";

contract ERC20MockUpgradeable is InitializationGuard, ERC20Upgradeable {
    function initialize() public initializable {
        __ERC20_init("TestToken", "TEST");
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
