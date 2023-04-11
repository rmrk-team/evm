// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./ERC721Mock.sol";
import "./OwnableLockMock.sol";

contract OwnableMintableERC721Mock is ERC721Mock, OwnableLockMock {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721Mock(name, symbol) {}
}
