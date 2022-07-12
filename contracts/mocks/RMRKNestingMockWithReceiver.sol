// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../mocks/RMRKNestingMock.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "hardhat/console.sol";

//Minimal public implementation of IRMRKNesting for testing with receiver.
// In general, we will want nesting to always be a receiver, but we need a non receiver version to test ERC behavior.
contract RMRKNestingMockWithReceiver is IERC721Receiver, RMRKNestingMock {

    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNestingMock(name_, symbol_) {}

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
