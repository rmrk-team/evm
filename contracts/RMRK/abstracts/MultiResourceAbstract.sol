// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./MultiResourceAbstractBase.sol";
import "../interfaces/IRMRKMultiResource.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";

abstract contract MultiResourceAbstract is Context, IRMRKMultiResource, MultiResourceAbstractBase {

    using Strings for uint256;

    //mapping of uint64 Ids to resource object
    mapping(uint64 => Resource) private _resources;
    using RMRKLib for uint128[];

    function getResource(
        uint64 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == uint64(0))
            revert RMRKNoResourceMatchingId();
        return resource;
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal override view returns (string memory) {
        if (_activeResources[tokenId].length > index)  {
            uint64 activeResId = _activeResources[tokenId][index];
            string memory URI;
            Resource memory _activeRes = getResource(activeResId);
            if (!_tokenEnumeratedResource[activeResId]) {
                URI = _activeRes.metadataURI;
            }
            else {
                string memory baseURI = _activeRes.metadataURI;
                URI = bytes(baseURI).length > 0 ?
                    string(abi.encodePacked(baseURI, tokenId.toString())) : "";
            }
            return URI;
        }
        else {
            return _fallbackURI;
        }
    }

    // To be implemented with custom guards

    function _addResourceEntry(
        uint64 id,
        string memory metadataURI,
        uint128[] memory custom
    ) internal {
        if(id == uint64(0))
            revert RMRKWriteToZero();
        if(_resources[id].id != uint64(0))
            revert RMRKResourceAlreadyExists();

        Resource memory resource = Resource({
            id: id,
            metadataURI: metadataURI,
            custom: custom
        });
        _resources[id] = resource;
        _allResources.push(id);

        emit ResourceSet(id);
    }

    function _addCustomDataToResource(
        uint64 resourceId,
        uint128 customResourceId
    ) internal {
        _resources[resourceId].custom.push(customResourceId);
        emit ResourceCustomDataAdded(resourceId, customResourceId);
    }

    function _removeCustomDataFromResource(
        uint64 resourceId,
        uint256 index
    ) internal {
        uint128 customResourceId = _resources[resourceId].custom[index];
        _resources[resourceId].custom.removeItemByIndex(index);
        emit ResourceCustomDataRemoved(resourceId, customResourceId);
    }

    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal {
        if(_tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if(getResource(resourceId).id == uint64(0))
            revert RMRKResourceNotFoundInStorage();

        if(_pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    // Utilities

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        uint64 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getFullResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        uint64[] memory activeResources = _activeResources[tokenId];
        uint256 len = activeResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(activeResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function getFullPendingResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        uint64[] memory pendingResources = _pendingResources[tokenId];
        uint256 len = pendingResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(pendingResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

}
