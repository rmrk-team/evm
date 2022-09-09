// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../../RMRK/equippable/IRMRKEquippable.sol";
import "../../RMRK/equippable/IRMRKExternalEquip.sol";
import "../../RMRK/equippable/IRMRKNestingExternalEquip.sol";
import "../../RMRK/nesting/RMRKNesting.sol";
// import "hardhat/console.sol";

error RMRKMustUnequipFirst();

/**
 * @dev RMRKNesting contract with external equippable contract for space saving purposes. Expected to be deployed along
 * an instance of RMRKExternalEquip.sol. To make use of the equippable module with this contract, expose the _setEquippableAddress
 * function and set it to the corresponding equipment contraft after deployment. Consider using RMRKOwnableLock to lock the equippable
 * address after deployment.
 */
contract RMRKNestingExternalEquip is IRMRKNestingExternalEquip, RMRKNesting {
    address private _equippableAddress;

    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165, RMRKNesting)
        virtual
        returns (bool)
    {
        return
            interfaceId == type(IRMRKNestingExternalEquip).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // It's overriden to make check the child is not equipped when trying to unnest
    function unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        Child memory child = childOf(tokenId, index);
        if (
            IRMRKEquippable(_equippableAddress).isChildEquipped(
                tokenId,
                child.contractAddress,
                child.tokenId
            )
        ) revert RMRKMustUnequipFirst();
        super.unnestChild(tokenId, index, to);
    }

    function _setEquippableAddress(address equippable) internal virtual {
        address oldAddress = _equippableAddress;
        _equippableAddress = equippable;
        emit EquippableAddressSet(oldAddress, equippable);
    }

    function getEquippableAddress() external view virtual returns (address) {
        return _equippableAddress;
    }

    function isApprovedOrOwner(address spender, uint256 tokenId)
        external
        view
        virtual
        returns (bool)
    {
        return _isApprovedOrOwner(spender, tokenId);
    }

    function _cleanApprovals(address, uint256 tokenId)
        internal
        virtual
        override
    {
        IRMRKMultiResource(_equippableAddress).approveForResources(
            address(0),
            tokenId
        );
    }
}
