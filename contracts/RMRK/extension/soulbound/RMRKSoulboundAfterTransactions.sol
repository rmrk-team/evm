// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./RMRKSoulbound.sol";

/**
 * @title RMRKSoulbound variant where transfers are allowed for a limited a number of transfers
 * @author RMRK team
 * @notice Smart contract of the RMRK Soulbound after a number of transactions module.
 */
abstract contract RMRKSoulboundAfterTransactions is RMRKSoulbound {
    // Max number of transfers before a token becomes soulbound
    uint256 private _maxNumberOfTransfers;
    // Mapping of token ID to number of transfers
    mapping(uint256 => uint256) private _transfersPerToken;

    /**
     * @notice Used to initialize the smart contract.
     * @param maxNumberOfTransfers Max number of transfers before a token becomes soulbound
     */
    constructor(uint256 maxNumberOfTransfers) {
        _maxNumberOfTransfers = maxNumberOfTransfers;
    }

    /**
     * @inheritdoc RMRKCore
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._afterTokenTransfer(from, to, tokenId);
        // We won't count minting:
        if (from != address(0)) {
            _transfersPerToken[tokenId]++;
        }
    }

    /**
     * @notice Gets the max number of transfers before a token becomes soulbound
     * @return Max number of transfer   s before a token becomes soulbound
     */
    function getMaxNumberOfTransfers() public view returns (uint256) {
        return _maxNumberOfTransfers;
    }

    /**
     * @notice Gets the current number of transfer for a specific token
     * @param tokenId ID of the token
     * @return Number of transfers for the token
     */
    function getTransfersPerToken(
        uint256 tokenId
    ) public view returns (uint256) {
        return _transfersPerToken[tokenId];
    }

    /**
     * @inheritdoc IRMRKSoulbound
     */
    function isSoulbound(
        uint256 tokenId
    ) public view virtual override returns (bool) {
        return _transfersPerToken[tokenId] >= _maxNumberOfTransfers;
    }
}
