// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {RMRKCatalogImpl} from "./RMRKCatalogImpl.sol";

/**
 * @title RMRKCatalogFactory
 * @author RMRK team
 * @notice Smart contract to deploy catalog implementations and keep track of deployers.
 */
contract RMRKCatalogFactory {
    mapping(address deployer => address[] catalogs) private _deployerCatalogs;

    event CatalogDeployed(address indexed deployer, address indexed catalog);

    /**
     * @notice Used to deploy a new RMRKCatalog implementation.
     * @param metadataURI Base metadata URI of the catalog
     * @param type_ The type of the catalog
     * @return The address of the deployed catalog
     */
    function deployCatalog(
        string memory metadataURI,
        string memory type_
    ) public returns (address) {
        RMRKCatalogImpl catalog = new RMRKCatalogImpl(metadataURI, type_);
        _deployerCatalogs[msg.sender].push(address(catalog));
        emit CatalogDeployed(msg.sender, address(catalog));
        return address(catalog);
    }

    /**
     * @notice Used to get all catalogs deployed by a given deployer.
     * @param deployer The address of the deployer
     * @return An array of addresses of the catalogs deployed by the deployer
     */
    function getDeployerCatalogs(
        address deployer
    ) public view returns (address[] memory) {
        return _deployerCatalogs[deployer];
    }

    /**
     * @notice Used to get the total number of catalogs deployed by a given deployer.
     * @param deployer The address of the deployer
     * @return total The total number of catalogs deployed by the deployer
     */
    function getTotalDeployerCatalogs(
        address deployer
    ) public view returns (uint256 total) {
        total = _deployerCatalogs[deployer].length;
    }

    /**
     * @notice Used to get a catalog deployed by a given deployer at a given index.
     * @param deployer The address of the deployer
     * @param index The index of the catalog
     * @return catalogAddress The address of the catalog
     */
    function getDeployerCatalogAtIndex(
        address deployer,
        uint256 index
    ) public view returns (address catalogAddress) {
        catalogAddress = _deployerCatalogs[deployer][index];
    }

    /**
     * @notice Used to get the last catalog deployed by a given deployer.
     * @param deployer The address of the deployer
     * @return catalogAddress The address of the last catalog deployed by the deployer
     */
    function getLastDeployerCatalog(
        address deployer
    ) public view returns (address catalogAddress) {
        catalogAddress = _deployerCatalogs[deployer][
            _deployerCatalogs[deployer].length - 1
        ];
    }
}
