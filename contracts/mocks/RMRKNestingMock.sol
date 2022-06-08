// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "../RMRK/RMRKNesting.sol";
import "../RMRK/interfaces/IRMRKNestingReceiver.sol";
import "hardhat/console.sol";

//Minimal public implementation of RMRKCore for testing.

contract RMRKNestingMock is RMRKNesting, IRMRKNestingReceiver {
    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

    //The preferred method here is to overload the function, but hardhat tests prevent this.
    function doMint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function doMintNest(
        address to,
        uint256 tokenId,
        uint256 destId,
        bytes calldata data
    ) external {
        _mint(to, tokenId, destId, data);
    }

    //update for reentrancy
    function burn(uint256 tokenId) public {
        console.log("Called external burn");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "RMRKCore: transfer caller is not owner nor approved"
        );
        console.log("Will cal internal _burn");
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
