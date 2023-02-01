// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./RMRKSoulbound.sol";

/**
 * @title RMRKSoulboundPerToken
 * @author RMRK team
 * @notice Smart contract of the RMRK Soulbound module where the transfers are permitted or prohibited on a per-token basis.
 */
abstract contract RMRKSoulboundPerToken is RMRKSoulbound {
    /**
     * @notice Emitted when a token's soulbound state changes.
     * @param tokenId ID of the token
     * @param state New soulbound state
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
     * @inheritdoc IRMRKSoulbound
     */
    function isSoulbound(
        uint256 tokenId
    ) public view virtual override returns (bool) {
        return _isSoulbound[tokenId];
    }
}
