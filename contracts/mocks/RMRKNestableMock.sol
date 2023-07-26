// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../RMRK/nestable/RMRKNestable.sol";

//Minimal public implementation of IERC6059 for testing.
contract RMRKNestableMock is RMRKNestable {
    // This is used to test the usage of hooks
    mapping(address => mapping(uint256 => uint256)) private _balancesPerNft;

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

    // Utility transfers:

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

    function _beforeNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId,
        bytes memory data
    ) internal virtual override {
        super._beforeNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId,
            data
        );
        if (from != address(0)) _balancesPerNft[from][fromTokenId] -= 1;
    }

    function _afterNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId,
        bytes memory data
    ) internal virtual override {
        super._afterNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId,
            data
        );
        if (to != address(0)) _balancesPerNft[to][toTokenId] += 1;
    }

    function balancePerNftOf(
        address owner,
        uint256 parentId
    ) public view returns (uint256) {
        return _balancesPerNft[owner][parentId];
    }
}
