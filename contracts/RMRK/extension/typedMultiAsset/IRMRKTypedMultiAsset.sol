// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

// import "../../multiasset/IRMRKMultiAsset.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKTypedMultiAsset
 * @author RMRK team
 * @notice Interface smart contract of the RMRK typed multi asset module.
 */
interface IRMRKTypedMultiAsset is IERC165 {
    /**
     * @notice Used to get the type of the asset.
     * @param assetId ID of the asset to check
     * @return string The type of the asset
     */
    function getAssetType(uint64 assetId) external view returns (string memory);
}
