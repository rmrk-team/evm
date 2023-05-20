// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/soulbound/RMRKSoulboundUpgradeable.sol";
import "../../RMRKNestableExternalEquipMockUpgradeable.sol";
import "../../../RMRK/security/InitializationGuard.sol";

contract RMRKSoulboundNestableExternalEquippableMock is
    InitializationGuard,
    RMRKSoulboundUpgradeable,
    RMRKNestableExternalEquipMockUpgradeable
{
    function initialize(
        string memory name,
        string memory symbol
    ) public override initializable {
        super.initialize(name, symbol);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulboundUpgradeable, RMRKNestableExternalEquipUpgradeable)
        returns (bool)
    {
        return
            RMRKSoulboundUpgradeable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKCoreUpgradeable, RMRKSoulboundUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
