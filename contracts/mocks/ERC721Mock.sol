// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../RMRK/standard/ERC721.sol";

/**
 * @title ERC721Mock
 * This mock just provides a public safeMint, mint, and burn functions for testing purposes
 Based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/ERC721Mock.sol
 */
contract ERC721Mock is ERC721 {
    string private _baseTokenURI;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    function setBaseURI(string calldata newBaseTokenURI) public {
        _baseTokenURI = newBaseTokenURI;
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

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

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}
