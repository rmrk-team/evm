// AccessControl// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract RMRKIssuable is AccessControl {

    bytes32 private constant ISSUER_ROLE = keccak256("ISSUER");
    
    constructor() {
        _grantRole(ISSUER_ROLE, msg.sender);
        _setRoleAdmin(ISSUER_ROLE, ISSUER_ROLE);
    }

    modifier onlyIssuer() {
        _checkRole(ISSUER_ROLE, _msgSender());
        _;
    }
}