// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

/**
 * @title IRMRKCoreUpgradeable
 * @author RMRK team
 * @notice Interface smart contract for upgradeable RMRK core module.
 */
interface IRMRKCoreUpgradeable {
    /**
     * @notice Used to retrieve the collection name.
     * @return Name of the collection
     */
    function name() external view returns (string memory);

    /**
     * @notice Used to retrieve the collection symbol.
     * @return Symbol of the collection
     */
    function symbol() external view returns (string memory);
}
