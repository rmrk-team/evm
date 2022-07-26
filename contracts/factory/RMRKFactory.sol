// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../implementations/RMRKMultiResourceImpl.sol";

contract RMRKFactory {

    address[] public multiResourceNftCollections;

    event NewRMRKMultiResourceContract(address indexed multiResourceContract, address indexed deployer);


    function deployRMRKMultiResource(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 pricePerMint //in WEI
    ) public {
        RMRKMultiResourceImpl multiResourceContract = new RMRKMultiResourceImpl(name, symbol, maxSupply, pricePerMint);
        multiResourceNftCollections.push(address(multiResourceContract));
        emit NewRMRKMultiResourceContract(address(multiResourceContract), msg.sender);
    }
}
