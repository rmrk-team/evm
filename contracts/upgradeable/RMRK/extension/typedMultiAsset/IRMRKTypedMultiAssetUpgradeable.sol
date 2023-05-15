// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

// import "../../multiasset/IERC5773.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

/**
 * @title IRMRKTypedMultiAssetUpgradeable
 * @author RMRK team
 * @notice Interface smart contract of the upgreadeable RMRK typed multi asset module.
 */
interface IRMRKTypedMultiAssetUpgradeable is IERC165Upgradeable {
    /**
     * @notice Used to get the type of the asset.
     * @param assetId ID of the asset to check
     * @return The type of the asset
     */
    function getAssetType(uint64 assetId) external view returns (string memory);
}
