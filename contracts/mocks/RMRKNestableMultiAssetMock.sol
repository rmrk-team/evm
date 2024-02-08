// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKNestableMultiAsset
} from "../RMRK/nestable/RMRKNestableMultiAsset.sol";

//Minimal public implementation of RMRKNestableMultiAsset for testing.
contract RMRKNestableMultiAssetMock is RMRKNestableMultiAsset {
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId, "");
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId, "");
    }

    function safeMint(address to, uint256 tokenId, bytes memory _data) public {
        _safeMint(to, tokenId, _data);
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external {
        _nestMint(to, tokenId, destinationId, "");
    }

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) external {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    function addAssetEntry(uint64 id, string memory metadataURI) external {
        _addAssetEntry(id, metadataURI);
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
