// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../../RMRK/library/RMRKErrors.sol";
import "../../core/RMRKCoreUpgradeable.sol";
import "./IERC6454betaUpgradeable.sol";

/**
 * @title RMRKSoulboundUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Soulbound module.
 */
abstract contract RMRKSoulboundUpgradeable is
    IERC6454betaUpgradeable,
    RMRKCoreUpgradeable
{
    function __RMRKSoulboundUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __RMRKSoulboundUpgradeable_init_unchained();
        __RMRKCoreUpgradeable_init(name_, symbol_);
    }

    function __RMRKSoulboundUpgradeable_init_unchained()
        internal
        onlyInitializing
    {}

    /**
     * @notice Hook that is called before any token transfer. This includes minting and burning.
     * @dev This is a hook ensuring that all transfers of tokens are reverted if the token is soulbound.
     * @dev The only exception of transfers being allowed is when the tokens are minted or when they are being burned.
     * @param from Address from which the token is originating (current owner of the token)
     * @param to Address to which the token would be sent
     * @param tokenId ID of the token that would be transferred
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (!isTransferable(tokenId, from, to))
            revert RMRKCannotTransferSoulbound();

        super._beforeTokenTransfer(from, to, tokenId);
    }

    function isTransferable(
        uint256,
        address from,
        address to
    ) public view virtual returns (bool) {
        return ((from == address(0) || // Exclude minting
            to == address(0)) && from != to); // Exclude Burning // Besides the obvious transfer to self, if both are address 0 (general transferability check), it returns false
    }

    /**
     * @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return interfaceId == type(IERC6454betaUpgradeable).interfaceId;
    }

    uint256[50] private __gap;
}
