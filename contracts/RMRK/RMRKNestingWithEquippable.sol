// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../RMRK/interfaces/IRMRKEquippable.sol";
import "../RMRK/interfaces/IRMRKNestingWithEquippable.sol";
import "../RMRK/RMRKNesting.sol";
// import "hardhat/console.sol";

error RMRKNotParent();
error RMRKNotEquippable();
error RMRKMustUnequipFirst();

contract RMRKNestingWithEquippable is IRMRKNestingWithEquippable, RMRKNesting {

    address private _equippableAddress;

    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

    //FIXME: Check to make sure this cannot be called from non_RMRK owner
    function _onlyParent(uint256 tokenId) private view {
        (address owner,,bool isNFT) = rmrkOwnerOf(tokenId);
        if(_msgSender() != owner || !isNFT)
            revert RMRKNotParent();
    }

    modifier onlyParent(uint256 tokenId) {
        _onlyParent(tokenId);
        _;
    }

    function _onlyEquippable() private view {
        if(_msgSender() != _equippableAddress)
            revert RMRKNotParent();
    }

    modifier onlyEquippable() {
        _onlyEquippable();
        _;
    }

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
