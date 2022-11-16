// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../RMRK/equippable/RMRKEquippable.sol";

/* import "hardhat/console.sol"; */

//Minimal public implementation of RMRKEquippable for testing.
contract RMRKEquippableMock is RMRKEquippable {
    constructor(string memory name, string memory symbol)
        RMRKEquippable(name, symbol)
    {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external {
        _nestMint(to, tokenId, destinationId);
    }

    // Utility transfers:

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

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 overwrites
    ) external {
        _addAssetToToken(tokenId, assetId, overwrites);
    }

    function addAssetEntry(
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) external {
        _addAssetEntry(
            id,
            equippableGroupId,
            baseAddress,
            metadataURI,
            fixedPartIds,
            slotPartIds
        );
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) external {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            partId
        );
    }
}
