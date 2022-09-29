pragma solidity ^0.8.16;

import "../RMRK/nesting/IRMRKNesting.sol";

import "hardhat/console.sol";

contract ChildAdder {
    function addChild(
        address destContract,
        uint256 parentId,
        uint256 childId,
        uint256 numChildren
    ) external {
        for (uint256 i; i < numChildren; i++) {
            IRMRKNesting(destContract).addChild(parentId, childId, address(0));
        }
    }
}
