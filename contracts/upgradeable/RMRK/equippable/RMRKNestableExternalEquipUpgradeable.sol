// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/equippable/IERC6220.sol";
import "../../../RMRK/equippable/IRMRKExternalEquip.sol";
import "../../../RMRK/equippable/IRMRKNestableExternalEquip.sol";
import "../../RMRK/nestable/RMRKNestableUpgradeable.sol";

/**
 * @title RMRKNestableExternalEquipUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Nestable External Equippable module.
 * @dev This is a RMRKNestableUpgradeable smart contract with external `Equippable` smart contract for space saving
 *  purposes. It is expected to be deployed along an instance of `RMRKExternalEquipUpgradeable`. To make use of the
 *  equippable module with this contract, the `_setEquippableAddress` function has to be exposed and used to set the
 *  corresponding equipment contract after deployment. Consider using `RMRKOwnableLockUpgradeable` to lock the
 *  equippable address after deployment.
 */
contract RMRKNestableExternalEquipUpgradeable is
    IRMRKNestableExternalEquip,
    RMRKNestableUpgradeable
{
    address private _equippableAddress;

    /**
     * @notice Initializes the contract and the inherited contracts.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    function __RMRKNestableExternalEquipUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __RMRKNestableExternalEquipUpgradeable_init_unchained();
        __RMRKNestableUpgradeable_init(name_, symbol_);
    }

    /**
     * @notice Initializes the contract without the inherited contracts.
     */
    function __RMRKNestableExternalEquipUpgradeable_init_unchained()
        internal
        initializer
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, RMRKNestableUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IRMRKNestableExternalEquip).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc RMRKNestableUpgradeable
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
                IERC6220(_equippableAddress).isChildEquipped(
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
     * @dev Emits ***EquippableAddressSet*** event.
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
     * @inheritdoc RMRKNestableUpgradeable
     */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        IERC5773(_equippableAddress).approveForAssets(address(0), tokenId);
    }

    uint256[50] private __gap;
}
