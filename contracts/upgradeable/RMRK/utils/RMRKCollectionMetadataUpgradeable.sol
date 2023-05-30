// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title RMRKCollectionMetadataUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Collection metadata module.
 */
contract RMRKCollectionMetadataUpgradeable is Initializable {
    string private _collectionMetadata;

    /**
     * @notice Used to initialize the contract with the given metadata.
     * @param collectionMetadata_ The collection metadata with which to initialize the smart contract
     */
    function __RMRKCollectionMetadataUpgradeable_init(
        string memory collectionMetadata_
    ) internal onlyInitializing {
        _setCollectionMetadata(collectionMetadata_);
    }

    /**
     * @notice Used to set the metadata of the collection.
     * @param newMetadata The new metadata of the collection
     */
    function _setCollectionMetadata(string memory newMetadata) internal {
        _collectionMetadata = newMetadata;
    }

    /**
     * @notice Used to retrieve the metadata of the collection.
     * @return string The metadata URI of the collection
     */
    function collectionMetadata() public view returns (string memory) {
        return _collectionMetadata;
    }

    uint256[50] private __gap;
}
