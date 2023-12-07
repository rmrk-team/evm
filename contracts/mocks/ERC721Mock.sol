// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ERC721Mock
 * Used for tests with non RMRK implementer
 */
contract ERC721Mock is ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
