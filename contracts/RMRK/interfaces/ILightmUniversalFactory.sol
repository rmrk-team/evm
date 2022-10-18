// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import {LightmInit} from "../LightmInit.sol";
import {IDiamondCut} from "./IDiamondCut.sol";

interface ILightmUniversalFactory {
    struct ConstructParams {
        address validatorLibAddress;
        address mrRenderUtilsAddress;
        address diamondCutFacetAddress;
        address diamondLoupeFacetAddress;
        address nestingFacetAddress;
        address multiResourceFacetAddress;
        address equippableFacetAddress;
        address collectionMetadataFacetAddress;
        address initContractAddress;
        address implContractAddress;
        IDiamondCut.FacetCut[] cuts;
    }

    event LightmCollectionCreated(address indexed collectionAddress);

    function deployCollection(LightmInit.InitStruct memory initStruct) external;

    function version() external pure returns (string memory);

    function cuts() external view returns (IDiamondCut.FacetCut[] memory);

    function validatorLibAddress() external view returns (address);

    function mrRenderUtilsAddress() external view returns (address);

    function nestingFacetAddress() external view returns (address);

    function multiResourceFacetAddress() external view returns (address);

    function equippableFacetAddress() external view returns (address);

    function collectionMetadataAddress() external view returns (address);

    function initContractAddress() external view returns (address);

    function implContractAddress() external view returns (address);
}
