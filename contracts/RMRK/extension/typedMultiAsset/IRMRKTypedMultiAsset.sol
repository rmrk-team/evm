// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

// import {IERC5773} from "../../multiasset/IERC5773.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKTypedMultiAsset
 * @author RMRK team
 * @notice Interface smart contract of the RMRK typed multi asset module.
 */
interface IRMRKTypedMultiAsset is IERC165 {
    /**
     * @notice Used to get the type of the asset.
     * @param assetId ID of the asset to check
     * @return The type of the asset
     */
    function getAssetType(uint64 assetId) external view returns (string memory);
}
