// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./OwnableUpgradeable.sol";
import "../../../RMRK/library/RMRKErrors.sol";

/**
 * @title OwnableLockUpgradeable
 * @author RMRK team
 * @notice A minimal upgradeable ownable lock smart contract.
 */
contract OwnableLockUpgradeable is OwnableUpgradeable {
    uint256 private _lock;

    /**
     * @notice Emitted when the smart contract is locked.
     */
    event LockSet();

    /**
     * @notice Reverts if the lock flag is set to true.
     */
    modifier notLocked() {
        _onlyNotLocked();
        _;
    }

    function __OwnableLockUpgradeable_init() internal initializer {
        __OwnableLockUpgradeable_init_unchained();
        __OwnableUpgradeable_init();
    }

    function __OwnableLockUpgradeable_init_unchained() internal initializer {}

    /**
     * @notice Locks the operation.
     * @dev Once locked, functions using `notLocked` modifier cannot be executed.
     * @dev Emits ***LockSet*** event.
     */
    function setLock() public virtual onlyOwner {
        _lock = 1;
        emit LockSet();
    }

    /**
     * @notice Used to retrieve the status of a lockable smart contract.
     * @return A boolean value signifying whether the smart contract has been locked
     */
    function getLock() public view returns (bool) {
        return _lock == 1;
    }

    /**
     * @notice Used to verify that the operation of the smart contract is not locked.
     * @dev If the operation of the smart contract is locked, the execution will be reverted.
     */
    function _onlyNotLocked() private view {
        if (_lock == 1) revert RMRKLocked();
    }
}
