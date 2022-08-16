// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/interfaces/IRMRKNestingReceiver.sol";
import "../RMRK/RMRKNesting.sol";
// import "hardhat/console.sol";

//Minimal public implementation of IRMRKNesting for testing.
contract RMRKNestingMock is  IRMRKNestingReceiver, RMRKNesting {

    constructor(
        string memory name_,
        string memory symbol_
    ) RMRKNesting(name_, symbol_) {}

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

    function safeMintNesting(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public {
        _safeMintNesting(to, tokenId, destinationId);
    }

    function safeMintNesting(
        address to,
        uint256 tokenId,
        uint256 destinationId,
        bytes memory _data
    ) public {
        _safeMintNesting(to, tokenId, destinationId, _data);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external {
        _mint(to, tokenId, destinationId);
    }

    //update for reentrancy
    function burn(uint256 tokenId) public onlyHasTransferPerm(tokenId) {
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

}
