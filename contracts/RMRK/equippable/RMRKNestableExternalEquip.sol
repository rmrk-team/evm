// SPDX-License-Identifier: Apache-2.0

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

    /**
     * @notice Used to initialize the smart contract.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNestable(name_, symbol_) {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, RMRKNestable) returns (bool) {
        return
            interfaceId == type(IRMRKNestableExternalEquip).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc RMRKNestable
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
     * @inheritdoc IRMRKNestableExternalEquip
     */
    function getEquippableAddress() external view virtual returns (address) {
        return _equippableAddress;
    }

    /**
     * @inheritdoc IRMRKNestableExternalEquip
     */
    function isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) external view virtual returns (bool) {
        return _isApprovedOrOwner(spender, tokenId);
    }

    /**
     * @inheritdoc RMRKNestable
     */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        IRMRKMultiAsset(_equippableAddress).approveForAssets(
            address(0),
            tokenId
        );
    }
}
