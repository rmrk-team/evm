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

    function _onlyUnequipped(uint256 tokenId) private view {
        if (IRMRKEquippable(_equippableAddress).isEquipped(tokenId))
            revert RMRKMustUnequipFirst();
    }

    modifier onlyUnequipped(uint256 tokenId) {
        _onlyUnequipped(tokenId);
        _;
    }

    function markSelfEquipped(
        uint tokenId,
        address equippingParent,
        uint64 resourceId,
        uint64 slotId,
        bool equipped
    ) external onlyParent(tokenId) {
        IRMRKEquippable(_equippableAddress).markEquipped(
            tokenId, equippingParent, resourceId, slotId, equipped);
    }

    function markChildEquipped(
        address childAddress, 
        uint tokenId, 
        uint64 resourceId, 
        uint64 slotId,
        bool equipped
    ) external onlyEquippable {
        IRMRKNestingWithEquippable(childAddress).markSelfEquipped(
            tokenId, _equippableAddress, resourceId, slotId, equipped);
    }

    // This is done on the internal level so we don't relly on every implementer rememebering this check
    function _unnestSelf(uint256 tokenId, uint256 index) internal override onlyUnequipped(tokenId) {
        super._unnestSelf(tokenId, index);
    }

    // This is done on the internal level so we don't relly on every implementer rememebering this check
    function _burn(uint256 tokenId) internal override onlyUnequipped(tokenId) {
        super._burn(tokenId);
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
