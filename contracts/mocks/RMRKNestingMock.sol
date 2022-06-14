// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.14;

import "../RMRK/RMRKNesting.sol";
import "../RMRK/interfaces/IRMRKNestingReceiver.sol";
// import "hardhat/console.sol";

//Minimal public implementation of RMRKCore for testing.

error RMRKCoreTransferCallerNotOwnerOrApproved();

contract RMRKNestingMock is RMRKNesting, IRMRKNestingReceiver {
    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 destId,
        bytes calldata data
    ) external {
        _mint(to, tokenId, destId, data);
    }

    //update for reentrancy
    function burn(uint256 tokenId) public {
        if(!_isApprovedOrOwner(_msgSender(), tokenId)) revert RMRKCoreTransferCallerNotOwnerOrApproved();
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
}
