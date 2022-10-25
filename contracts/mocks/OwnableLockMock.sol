// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/access/OwnableLock.sol";

contract OwnableLockMock is OwnableLock {
    function testLock() external view notLocked returns (bool) {
        return true;
    }
}
