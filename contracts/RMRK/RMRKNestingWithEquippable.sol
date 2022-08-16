// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../RMRK/interfaces/IRMRKEquippable.sol";
import "../RMRK/interfaces/IRMRKNestingWithEquippable.sol";
import "../RMRK/RMRKNesting.sol";
// import "hardhat/console.sol";

error RMRKMustUnequipFirst();

contract RMRKNestingWithEquippable is IRMRKNestingWithEquippable, RMRKNesting {

    address private _equippableAddress;

    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

    // It's overriden to make check the child is not equipped when trying to unnest
    function unnestChild(
        uint256 tokenId,
        uint256 index, 
        address to
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        Child memory child = childOf(tokenId, index);
        if (
            IRMRKEquippable(_equippableAddress).isChildEquipped(
                tokenId, child.contractAddress, child.tokenId
            )
        )
            revert RMRKMustUnequipFirst();
        super.unnestChild(tokenId, index, to);
    }

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
