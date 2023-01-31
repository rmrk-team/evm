// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "./RMRKSoulbound.sol";

/**
 * @title RMRKSoulbound variant where transfers are allowed until a certain block number;
 * @author RMRK team
 * @notice Smart contract of the RMRK Soulbound after specific Block module.
 */
abstract contract RMRKSoulboundAfterBlock is RMRKSoulbound {
    // Last block number where transfers are allowed
    uint256 private _lastBlockToTransfer;

    /**
     * @notice Used to initialize the smart contract.
     * @param lastBlockToTransfer Last block number where transfers are allowed
     */
    constructor(uint256 lastBlockToTransfer) {
        _lastBlockToTransfer = lastBlockToTransfer;
    }

    /**
     * @notice Gets the last block number where transfers are allowed
     */
    function getLastBlockToTransfer() public view returns (uint256) {
        return _lastBlockToTransfer;
    }

    /**
     * @inheritdoc IRMRKSoulbound
     */
    function isSoulbound(uint256) public view virtual override returns (bool) {
        return _lastBlockToTransfer <= block.number;
    }
}
