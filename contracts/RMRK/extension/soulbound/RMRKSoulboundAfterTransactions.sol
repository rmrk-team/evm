// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC6454} from "./IERC6454.sol";
import {RMRKSoulbound} from "./RMRKSoulbound.sol";

/**
 * @title RMRKSoulboundAfterTransactions
 * @author RMRK team
 * @notice Smart contract of the RMRK Soulbound module where transfers are allowed for a limited a number of transfers.
 */
abstract contract RMRKSoulboundAfterTransactions is RMRKSoulbound {
    /**
     * @notice Emitted when a token becomes soulbound.
     * @param tokenId ID of the token
     */
    event Soulbound(uint256 indexed tokenId);

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
     * @notice Hook that is called after any transfer of tokens. This includes minting and burning.
     * @dev Calling conditions:
     *
     *  - When `from` and `to` are both non-zero.
     *  - `from` and `to` are never zero at the same time.
     *
     *  To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     * @param from Address from which the token has been transferred
     * @param to Address to which the token has been transferred
     * @param tokenId ID of the token that has been transferred
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        // We won't count minting:
        if (from != address(0)) {
            _transfersPerToken[tokenId]++;
            emit Soulbound(tokenId);
        }
    }

    /**
     * @notice Gets the maximum number of transfers before a token becomes soulbound.
     * @return Maximum number of transfers before a token becomes soulbound
     */
    function getMaxNumberOfTransfers() public view returns (uint256) {
        return _maxNumberOfTransfers;
    }

    /**
     * @notice Gets the current number of transfer the specified token.
     * @param tokenId ID of the token
     * @return Number of the token's transfers to date
     */
    function getTransfersPerToken(
        uint256 tokenId
    ) public view returns (uint256) {
        return _transfersPerToken[tokenId];
    }

    /**
     * @inheritdoc IERC6454
     */
    function isTransferable(
        uint256 tokenId,
        address,
        address
    ) public view virtual override returns (bool) {
        return _transfersPerToken[tokenId] < _maxNumberOfTransfers;
    }
}
