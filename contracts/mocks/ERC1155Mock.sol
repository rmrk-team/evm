// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title ERC1155Mock
 * Used for tests with non RMRK implementer
 */
contract ERC1155Mock is ERC1155 {
    constructor(string memory uri) ERC1155(uri) {}

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(to, tokenId, amount, data);
    }
}
