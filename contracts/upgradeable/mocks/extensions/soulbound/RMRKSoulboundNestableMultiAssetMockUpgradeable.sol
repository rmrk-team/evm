// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../../RMRK/extension/soulbound/IERC6454.sol";
import "../../RMRKNestableMultiAssetMockUpgradeable.sol";

contract RMRKSoulboundNestableMultiAssetMockUpgradeable is
    RMRKNestableMultiAssetMockUpgradeable,
    IERC6454
{
    function initialize(
        string memory name,
        string memory symbol
    ) public override initializer {
        super.initialize(name, symbol);
    }

    function isTransferable(
        uint256,
        address from,
        address to
    ) public view virtual returns (bool) {
        return ((from == address(0) || // Exclude minting
            to == address(0)) && from != to); // Exclude Burning // Besides the obvious transfer to self, if both are address 0 (general transferability check), it returns false
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, RMRKNestableMultiAssetUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC6454).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKCoreUpgradeable) {
        if (!isTransferable(tokenId, from, to))
            revert RMRKCannotTransferSoulbound();

        super._beforeTokenTransfer(from, to, tokenId);
    }
}
