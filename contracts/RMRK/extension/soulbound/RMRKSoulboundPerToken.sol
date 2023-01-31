// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./RMRKSoulbound.sol";

/**
 * @title RMRKSoulbound variant where transfers are allowed or not, is set by NFT.
 * @author RMRK team
 * @notice Smart contract of the RMRK Soulbound per token module.
 */
abstract contract RMRKSoulboundPerToken is RMRKSoulbound {
    // Mapping of token ID to soulbound state
    mapping(uint256 => bool) private _isSoulbound;

    /**
     * @notice Sets the soulbound state of a token
     * @dev This can be gated however the specific case needs
     * @param tokenId ID of the token
     * @param state New soulbound state
     */
    function _setSoulbound(uint256 tokenId, bool state) internal virtual {
        _isSoulbound[tokenId] = state;
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
