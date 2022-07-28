// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../RMRK/interfaces/IRMRKNestingWithEquippable.sol";
import "../RMRK/interfaces/IRMRKMultiResource.sol";
import "../RMRK/RMRKNesting.sol";
/* import "hardhat/console.sol"; */


contract RMRKNestingWithEquippable is IRMRKNestingWithEquippable, RMRKNesting {

    address private _equippableAddress;

    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

    function _setEquippableAddress(address equippable) internal virtual {
        _equippableAddress = equippable;
    }

    function getEquippablesAddress() external virtual view returns (address) {
        return _equippableAddress;
    }

    function isApprovedOrOwner(address spender, uint256 tokenId) external virtual view returns (bool) {
        return _isApprovedOrOwner(spender, tokenId);
    }

    function _cleanApprovals(address, uint256 tokenId) internal override virtual {
        IRMRKMultiResource(_equippableAddress).approveForResources(address(0), tokenId);
    }
}
