// AccessControl// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Context.sol";

error RMRKOnlyIssuer();

contract RMRKIssuable is Context {

    address private _issuer;
    
    constructor() {
        _setIssuer(_msgSender());
    }

    function _onlyIssuer() private view {
        if(_msgSender() != _issuer) revert RMRKOnlyIssuer();
    }

    modifier onlyIssuer() {
        _onlyIssuer();
        _;
    }

    function setIssuer(address issuer) external onlyIssuer {
        _setIssuer(issuer);
    }

    function getIssuer() external view returns (address) {
        return _issuer;
    }

    function _setIssuer(address issuer) private {
        _issuer = issuer;
    }
}