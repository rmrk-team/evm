// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/equippable/RMRKNestableExternalEquip.sol";

//Minimal public implementation of IRMRKNestable for testing.
contract RMRKNestableExternalEquipMock is RMRKNestableExternalEquip {
    constructor(string memory name_, string memory symbol_)
        RMRKNestableExternalEquip(name_, symbol_)
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
        uint256 destinationId
    ) external {
        _nestMint(to, tokenId, destinationId, "");
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
        nestTransferFrom(_msgSender(), to, tokenId, destinationId, "");
    }
}
