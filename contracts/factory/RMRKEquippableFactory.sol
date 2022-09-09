// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../implementations/RMRKEquippableImpl.sol";


contract RMRKEquippableFactory {
    address[] public equippableCollections;

    event NewRMRKEquippableContract(
        address indexed equippableContract,
        address indexed deployer
    );

    function getCollections() external view returns (address[] memory) {
        return equippableCollections;
    }

    function deployRMRKEquippable(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 pricePerMint //in WEI
    ) public {
        RMRKEquippableImpl equippableContract = new RMRKEquippableImpl(
            name,
            symbol,
            maxSupply,
            pricePerMint
        );

        equippableCollections.push(address(equippableContract));
        equippableContract.transferOwnership(msg.sender);
        emit NewRMRKEquippableContract(address(equippableContract), msg.sender);
    }
}
