// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/OwnableLock.sol";

contract OwnableLockMock is OwnableLock {

    function testLock() notLocked external view returns(bool) {
        return true;
    }

}
