// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "../RMRK/RMRKEquippable.sol";

//Minimal public implementation of RMRKCore for testing.

contract RMRKEquippableMock is RMRKEquippable, IRMRKNestingReceiver {
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

    function burn(uint256 tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "RMRKCore: transfer caller is not owner nor approved"
        );
        _burn(tokenId);
    }

    function onRMRKNestingReceived(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        return IRMRKNestingReceiver.onRMRKNestingReceived.selector;
    }
}
