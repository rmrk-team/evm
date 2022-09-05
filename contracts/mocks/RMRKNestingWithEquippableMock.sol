// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/equippable/RMRKNestingExternalEquip.sol";

// import "hardhat/console.sol";

//Minimal public implementation of IRMRKNesting for testing.
contract RMRKNestingWithEquippableMock is RMRKNestingExternalEquip {
    constructor(string memory name_, string memory symbol_)
        RMRKNestingExternalEquip(name_, symbol_)
    {}

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        _safeMint(to, tokenId, _data);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destId
    ) external {
        _nestMint(to, tokenId, destId);
    }

    //update for reentrancy
    function burn(uint256 tokenId) public onlyApprovedOrDirectOwner(tokenId) {
        _burn(tokenId);
    }

    function setEquippableAddress(address equippable) external {
        _setEquippableAddress(equippable);
    }

    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId);
    }
}
