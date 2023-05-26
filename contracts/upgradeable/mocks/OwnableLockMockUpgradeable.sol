// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/access/OwnableLockUpgradeable.sol";

contract OwnableLockMockUpgradeable is OwnableLockUpgradeable {
    function initialize() public initializer {
        __OwnableLockUpgradeable_init();
    }

    function testLock() external view notLocked returns (bool) {
        return true;
    }
}
