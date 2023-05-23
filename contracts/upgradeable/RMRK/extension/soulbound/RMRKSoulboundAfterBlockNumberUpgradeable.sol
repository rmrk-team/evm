// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./RMRKSoulboundUpgradeable.sol";

/**
 * @title RMRKSoulboundAfterBlockNumberUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Soulbound module where transfers are only allowed until a certain block number.
 */
abstract contract RMRKSoulboundAfterBlockNumberUpgradeable is
    RMRKSoulboundUpgradeable
{
    // Last block number where transfers are allowed
    uint256 private _lastBlockToTransfer;

    /**
     * @notice Used to initialize the smart contract.
     * @param lastBlockToTransfer Last block number where transfers are allowed
     */
    function __RMRKSoulboundAfterBlockNumberUpgradeable_init(
        uint256 lastBlockToTransfer
    ) internal onlyInitializing {
        _lastBlockToTransfer = lastBlockToTransfer;
    }

    /**
     * @notice Gets the last block number where transfers are allowed
     * @return The block number after which tokens are soulbound
     */
    function getLastBlockToTransfer() public view returns (uint256) {
        return _lastBlockToTransfer;
    }

    /**
     * @inheritdoc IERC6454betaUpgradeable
     */
    function isTransferable(
        uint256,
        address,
        address
    ) public view virtual override returns (bool) {
        return _lastBlockToTransfer > block.number;
    }
}
