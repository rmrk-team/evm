pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/*
Minimal ownable lock
*/
error RMRKLocked();

contract OwnableLock is Ownable {

    bool private lock;

    modifier notLocked() {
        if (getLock()) revert RMRKLocked();
        _;
    }

    function setLock() external onlyOwner {
        lock = true;
    }

    function getLock() public view returns(bool) {
        return lock;
    }
}
