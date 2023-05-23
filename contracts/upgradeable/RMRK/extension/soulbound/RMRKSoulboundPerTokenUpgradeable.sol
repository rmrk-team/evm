// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./RMRKSoulboundUpgradeable.sol";

/**
 * @title RMRKSoulboundPerTokenUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Soulbound module where the transfers are permitted or prohibited on a per-token basis.
 */
contract RMRKSoulboundPerTokenUpgradeable is RMRKSoulboundUpgradeable {
    function __RMRKSoulboundPerTokenUpgradeable_init()
        internal
        onlyInitializing
    {
        __RMRKSoulboundUpgradeable_init_unchained();
    }

    /**
     * @notice Emitted when a token's soulbound state changes.
     * @param tokenId ID of the token
     * @param state A boolean value signifying whether the token became soulbound (`true`) or transferrable (`false`)
     */
    event Soulbound(uint256 indexed tokenId, bool state);

    // Mapping of token ID to soulbound state
    mapping(uint256 => bool) private _isSoulbound;

    /**
     * @notice Sets the soulbound state of a token.
     * @dev Custom access control has to be implemented when exposing this method in a smart contract that utillizes it.
     * @param tokenId ID of the token
     * @param state New soulbound state
     */
    function _setSoulbound(uint256 tokenId, bool state) internal virtual {
        _isSoulbound[tokenId] = state;
        emit Soulbound(tokenId, state);
    }

    /**
     * @inheritdoc IERC6454betaUpgradeable
     */
    function isTransferable(
        uint256 tokenId,
        address from,
        address to
    ) public view virtual override returns (bool) {
        return (from == address(0) || // Exclude minting
            to == address(0) || // Exclude Burning
            !_isSoulbound[tokenId]);
    }
}
