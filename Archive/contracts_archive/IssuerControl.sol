// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)
// Reworked to match RMRK nomenclature of owner-issuer.

pragma solidity ^0.8.0;

import "../utils/Context.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferIssuer}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyIssuer`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract IssuerControl is Context {
    address private _issuer;

    event IssuerTransferred(
        address indexed previousIssuer,
        address indexed newIssuer
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferIssuer(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function issuer() public view virtual returns (address) {
        return _issuer;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyIssuer() {
        require(issuer() == _msgSender(), "Issuer: caller is not the issuer");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyIssuer` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceIssuer() public virtual onlyIssuer {
        _transferIssuer(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newIssuer`).
     * Can only be called by the current owner.
     */
    function transferIssuer(address newIssuer) public virtual onlyIssuer {
        require(
            newIssuer != address(0),
            "Issuer: new issuer is the zero address"
        );
        _transferIssuer(newIssuer);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newIssuer`).
     * Internal function without access restriction.
     */
    function _transferIssuer(address newIssuer) internal virtual {
        address oldIssuer = _issuer;
        _issuer = newIssuer;
        emit IssuerTransferred(oldIssuer, newIssuer);
    }
}
