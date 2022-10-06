// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Create2.sol";

contract Create2Deployer {
    function deploy(
        uint256 amount,
        bytes32 salt,
        bytes memory bytecode
    ) external returns (address) {
        return Create2.deploy(amount, salt, bytecode);
    }

    function computeAddress(
        bytes32 salt,
        bytes32 bytecodeHash,
        address deployer
    ) public pure returns (address) {
        return Create2.computeAddress(salt, bytecodeHash, deployer);
    }

    function computeAddress(bytes32 salt, bytes32 bytecodeHash)
        external
        view
        returns (address)
    {
        return computeAddress(salt, bytecodeHash, address(this));
    }
}
