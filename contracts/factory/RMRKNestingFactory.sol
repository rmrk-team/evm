// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../implementations/RMRKNestingMultiResourceImpl.sol";

contract RMRKNestingFactory {

    address[] public nestingCollections;

    event NewRMRKNestingContract(address indexed nestingContract, address indexed deployer);

    function deployRMRKNesting(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 pricePerMint //in WEI
    ) public {
        RMRKNestingMultiResourceImpl nestingContract = new RMRKNestingMultiResourceImpl(name, symbol, maxSupply, pricePerMint);
        nestingCollections.push(address(nestingContract));
        emit NewRMRKNestingContract(address(nestingContract), msg.sender);
    }
}
