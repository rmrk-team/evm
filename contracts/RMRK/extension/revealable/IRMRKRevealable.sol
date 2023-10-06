// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

interface IRMRKRevealable {
    function getRevealer() external view returns (address);

    function setRevealer(address revealer) external;

    // Should ask revealor which assetId should be added to the token and optionally which asset to replace.
    // It should send the active asset Ids for the token.
    // The Revealer might need to be added as contributor on the main contract to add assets if needed
    // This method should be called by the owner or approved for assets, and should add the asset to the token and accept it
    function reveal(uint256[] memory tokenIds) external;
}
