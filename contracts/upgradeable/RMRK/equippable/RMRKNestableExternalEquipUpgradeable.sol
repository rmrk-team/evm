// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../RMRK/equippable/IERC6220Upgradeable.sol";
import "../../RMRK/equippable/IRMRKExternalEquipUpgradeable.sol";
import "../../RMRK/equippable/IRMRKNestableExternalEquipUpgradeable.sol";
import "../../RMRK/nestable/RMRKNestableUpgradeable.sol";
import "../security/InitializationGuard.sol";

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
    IRMRKNestableExternalEquipUpgradeable,
    InitializationGuard,
    RMRKNestableUpgradeable
{
    address private _equippableAddress;

    /**
     * @notice Used to initialize the smart contract.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    function initialize(
        string memory name_,
        string memory symbol_
    ) public virtual override initializable {
        RMRKNestableUpgradeable.initialize(name_, symbol_);
    }

    /**
     * @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165Upgradeable, RMRKNestableUpgradeable)
        returns (bool)
    {
        return
            interfaceId ==
            type(IRMRKNestableExternalEquipUpgradeable).interfaceId ||
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
                IERC6220Upgradeable(_equippableAddress).isChildEquipped(
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
     * @inheritdoc IRMRKNestableExternalEquipUpgradeable
     */
    function getEquippableAddress() external view virtual returns (address) {
        return _equippableAddress;
    }

    /**
     * @inheritdoc IRMRKNestableExternalEquipUpgradeable
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
        IERC5773Upgradeable(_equippableAddress).approveForAssets(
            address(0),
            tokenId
        );
    }
}
