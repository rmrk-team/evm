// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../RMRK/equippable/RMRKNestableExternalEquipUpgradeable.sol";

//Minimal upgradeable public implementation of IERC6059 for testing.
contract RMRKNestableExternalEquipMockUpgradeable is
    RMRKNestableExternalEquipUpgradeable
{
    function initialize(
        string memory name_,
        string memory symbol_
    ) public virtual initializer {
        __RMRKNestableExternalEquipUpgradeable_init(name_, symbol_);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId, "");
    }

    function safeMint(address to, uint256 tokenId, bytes memory _data) public {
        _safeMint(to, tokenId, _data);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId, "");
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
