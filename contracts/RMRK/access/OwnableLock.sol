// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/Context.sol";
import "../library/RMRKErrors.sol";

/*
Minimal ownable lock, based on "openzeppelin's access/Ownable.sol";
*/
contract OwnableLock is Context {
    bool private _lock;
    address private _owner;
    mapping(address => uint256) private _contributors;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Throws if called by any account other than the owner or an approved contributer
     */
    modifier onlyOwnerOrContributor() {
        _onlyOwnerOrContributor();
        _;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /**
     * @dev Throws if the lock flag is set to true.
     */
    modifier notLocked() {
        _onlyNotLocked();
        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Sets the lock -- once locked functions marked notLocked cannot be accessed.
     */
    function setLock() external onlyOwner {
        _lock = true;
    }

    /**
     * @dev Returns lock status.
     */
    function getLock() public view returns (bool) {
        return _lock;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (owner() == address(0)) revert RMRKNewOwnerIsZeroAddress();
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function addContributor(address contributor) external onlyOwner {
        if (contributor != address(0)) revert RMRKNewContributorIsZeroAddress();
        _contributors[contributor] = 1;
    }

    function revokeContributor(address contributor) external onlyOwner {
        delete _contributors[contributor];
    }

    function isContributor(address contributor) public view returns (bool) {
        return _contributors[contributor] == 1;
    }

    function _onlyOwnerOrContributor() private view {
        if (owner() != _msgSender() && isContributor(_msgSender()))
            revert RMRKNotOwnerOrContributor();
    }

    function _onlyOwner() private view {
        if (owner() != _msgSender()) revert RMRKNotOwner();
    }

    function _onlyNotLocked() private view {
        if (getLock()) revert RMRKLocked();
    }
}
