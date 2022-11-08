// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.16;

import "../../RMRK/equippable/IRMRKEquippable.sol";
import "../../RMRK/equippable/IRMRKExternalEquip.sol";
import "../../RMRK/equippable/IRMRKNestingExternalEquip.sol";
import "../../RMRK/nesting/RMRKNesting.sol";

// import "hardhat/console.sol";

/**
 * @title RMRKNestingExternalEquip
 * @author RMRK team
 * @notice Smart contract of the RMRK Nesting External Equippable module.
 * @dev This is a RMRKNesting smart contract with external `Equippable` smart contract for space saving purposes. It is
 *  expected to be deployed along an instance of `RMRKExternalEquip`. To make use of the equippable module with this
 *  contract, the `_setEquippableAddress` function has to be exposed and used to set the corresponding equipment
 *  contract after deployment. Consider using `RMRKOwnableLock` to lock the equippable address after deployment.
 */
contract RMRKNestingExternalEquip is IRMRKNestingExternalEquip, RMRKNesting {
    address private _equippableAddress;

    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_)
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNesting)
        returns (bool)
    {
        return
            interfaceId == type(IRMRKNestingExternalEquip).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Used to unnest a child from the parent.
     * @dev The function is overriden, so that additional verification is added, making sure that the child is not
     *  currently equipped when trying to unnest it.
     * @param tokenId ID of the parent token from which to unnest a given child token
     * @param to Address that should receive the token once unnested
     * @param childIndex Index of the child token in the array in which it is located (pending or active children array)
     * @param childAddress Address of the expected child token's collection smart contract
     * @param childId Expected ID of the child token being unnested in its own collection smart contract
     * @param isPending Boolean value indicating whether the token is in the pending array of the parent (`true`) or in
     *  the active array (`false`)
     */
    function _unnestChild(
        uint256 tokenId,
        address to,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual override {
        if (!isPending) {
            _requireMinted(tokenId);
            if (
                IRMRKEquippable(_equippableAddress).isChildEquipped(
                    tokenId,
                    childAddress,
                    childId
                )
            ) revert RMRKMustUnequipFirst();
        }

        super._unnestChild(
            tokenId,
            to,
            childIndex,
            childAddress,
            childId,
            isPending
        );
    }

    /**
     * @notice Used to set the address of the `Equippable` smart contract.
     * @param equippable Address of the `Equippable` smart contract
     */
    function _setEquippableAddress(address equippable) internal virtual {
        address oldAddress = _equippableAddress;
        _equippableAddress = equippable;
        emit EquippableAddressSet(oldAddress, equippable);
    }

    /**
     * @notice Used to retrieve the address of the `Equippable` smart contract.
     * @return address Address of the `Equippable` smart contract
     */
    function getEquippableAddress() external view virtual returns (address) {
        return _equippableAddress;
    }

    /**
     * @notice Used to verify that the specified address is either the owner of the given token or approved by the owner
     *  to manage it.
     * @param spender Address that we are verifying
     * @param tokenId ID of the token we are checking
     * @return bool A boolean value indicating whether the specified address is the owner of the given token or approved
     *  to manage it
     */
    function isApprovedOrOwner(address spender, uint256 tokenId)
        external
        view
        virtual
        returns (bool)
    {
        return _isApprovedOrOwner(spender, tokenId);
    }

    /**
     * @notice Used to clear approvals for the given token.
     * @param tokenId ID of the token for which the approvals should be cleared
     */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        IRMRKMultiResource(_equippableAddress).approveForResources(
            address(0),
            tokenId
        );
    }
}
