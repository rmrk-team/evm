// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.16;

import "../../RMRK/equippable/IRMRKEquippable.sol";
import "../../RMRK/equippable/IRMRKExternalEquip.sol";
import "../../RMRK/equippable/IRMRKNestableExternalEquip.sol";
import "../../RMRK/nestable/RMRKNestable.sol";

/**
 * @title RMRKNestableExternalEquip
 * @author RMRK team
 * @notice Smart contract of the RMRK Nestable External Equippable module.
 * @dev This is a RMRKNestable smart contract with external `Equippable` smart contract for space saving purposes. It is
 *  expected to be deployed along an instance of `RMRKExternalEquip`. To make use of the equippable module with this
 *  contract, the `_setEquippableAddress` function has to be exposed and used to set the corresponding equipment
 *  contract after deployment. Consider using `RMRKOwnableLock` to lock the equippable address after deployment.
 */
contract RMRKNestableExternalEquip is IRMRKNestableExternalEquip, RMRKNestable {
    address private _equippableAddress;

    constructor(string memory name_, string memory symbol_)
        RMRKNestable(name_, symbol_)
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNestable)
        returns (bool)
    {
        return
            interfaceId == type(IRMRKNestableExternalEquip).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Used to transfer a child from the given parent.
     * @dev The function doesn't contain a check validating `to`. To ensure that a token is not
     *  transferred to an incompatible smart contract, custom validation has to be added when usin
     * @param tokenId ID of the parent token from which the child token is being transferred
     * @param to Address to which to transfer the token to
     * @param destinationId ID of the token to receive this child token (MUST be 0 if the destination is not a token)
     * @param childIndex Index of a token we are transfering, in the array it belongs to (can be either active array or
     *  pending array)
     * @param childAddress Address of the child token's collection smart contract.
     * @param childId ID of the child token in its own collection smart contract.
     * @param isPending A boolean value indicating whether the child token being transferred is in the pending array of the
     *  parent token (`true`) or in the active array (`false`)
     * @param data Additional data with no specified format, sent in call to `_to`
     */
    function _transferChild(
        uint256 tokenId,
        address to,
        uint256 destinationId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
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

        super._transferChild(
            tokenId,
            to,
            destinationId,
            childIndex,
            childAddress,
            childId,
            isPending,
            data
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
        IRMRKMultiAsset(_equippableAddress).approveForAssets(
            address(0),
            tokenId
        );
    }
}
