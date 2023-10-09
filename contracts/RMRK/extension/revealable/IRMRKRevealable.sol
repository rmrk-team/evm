// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

interface IRMRKRevealable {
    /**
     * @notice Gets the `IRMRKRevealer` associated with the contract.
     * @return revealer The `IRMRKRevealer` associated with the contract
     */
    function getRevealer() external view returns (address);

    /**
     * @notice Sets the `IRMRKRevealer` associated with the contract.
     * @param revealer The `IRMRKRevealer` to associate with the contract
     */
    function setRevealer(address revealer) external;

    /** @notice Reveals the asset for the given tokenIds by adding and accepting and new one.
     * @dev SHOULD ask revealer which assetId should be added to the token and which asset to replace through `IRMRKRevealer.getAssetsToReveal`
     * @dev SHOULD be called by the owner or approved for assets
     * @dev SHOULD add the new asset to each token and accept it
     */
    function reveal(uint256[] memory tokenIds) external;
}
