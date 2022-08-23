// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/RMRKNestingMultiResource.sol";
// import "hardhat/console.sol";

//Minimal public implementation of RMRKNestingMultiResource for testing.
contract RMRKNestingMultiResourceMock is RMRKNestingMultiResource {

    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResource(name, symbol) {}

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

    function onRMRKNestingReceived(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IRMRKNestingReceiver.onRMRKNestingReceived.selector;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        if(ownerOf(tokenId) == address(0))
            revert ERC721InvalidTokenId();
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        uint64 id,
        string memory metadataURI
    ) external {
        _addResourceEntry(id, metadataURI);
    }

    function transfer(
        address to,
        uint256 tokenId
    ) public virtual {
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