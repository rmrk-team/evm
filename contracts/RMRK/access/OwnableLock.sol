// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./Ownable.sol";
import "../library/RMRKErrors.sol";

/**
 * @title OwnableLock
 * @author RMRK team
 * @notice A minimal ownable lock smart contract.
 */
contract OwnableLock is Ownable {
    uint256 private _lock;

    /**
     * @dev Reverts if the lock flag is set to true.
     */
    modifier notLocked() {
        _onlyNotLocked();
        _;
    }

    /**
     * @notice Locks the operation.
     * @dev Once locked, functions using `notLocked` modifier cannot be executed.
     */
    function setLock() external onlyOwner {
        _lock = 1;
    }

    /**
     * @notice Used to retrieve the status of a lockable smart contract.
     * @return bool A boolean value signifying whether the smart contract has been locked
     */
    function getLock() public view returns (bool) {
        return _lock == 1;
    }

    function _onlyNotLocked() private view {
        if (getLock()) revert RMRKLocked();
    }
}
