// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/RMRKIssuable.sol";
import "../RMRK/interfaces/IRMRKNestingReceiver.sol";
import "../RMRK/interfaces/IRMRKNestingWithEquippable.sol";
import "../RMRK/RMRKNesting.sol";
// import "hardhat/console.sol";

//Minimal public implementation of IRMRKNesting for testing.
contract RMRKNestingMock is  RMRKIssuable, IRMRKNestingWithEquippable, IRMRKNestingReceiver, RMRKNesting {

    address _equippableAdress;

    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

    function mint(address to, uint256 tokenId) external onlyIssuer {
        _mint(to, tokenId);
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 destId,
        bytes calldata data
    ) external onlyIssuer {
        _mint(to, tokenId, destId, data);
    }

    //update for reentrancy
    function burn(uint256 tokenId) public onlyApprovedOrOwner(tokenId) {
        _burn(tokenId);
    }

    function onRMRKNestingReceived(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IRMRKNestingReceiver.onRMRKNestingReceived.selector;
    }

    function setEquippableAddress(address equippable) external onlyIssuer {
        _equippableAdress = equippable;
    }

    function getEquippablesAddress() external view returns (address) {
        return _equippableAdress;
    }
}
