// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./MultiResourceAbstractBase.sol";
import "../interfaces/IMultiResource.sol";
import "../library/MultiResourceLib.sol";
import "../utils/Address.sol";
import "../utils/Strings.sol";
import "../utils/Context.sol";

abstract contract MultiResourceAbstract is Context, IMultiResource, MultiResourceAbstractBase {

    using Strings for uint256;

    //mapping of uint32 Ids to resource object
    mapping(uint32 => Resource) private _resources;
    using MultiResourceLib for uint64[];

    function getResource(
        uint32 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        require(
            resource.id != uint32(0),
            "RMRK: No resource matching Id"
        );
        return resource;
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal override view returns (string memory) {
        if (_activeResources[tokenId].length > index)  {
            uint32 activeResId = _activeResources[tokenId][index];
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
        uint32 id,
        string memory metadataURI,
        uint64[] memory custom
    ) internal {
        require(id != uint32(0), "RMRK: Write to zero");
        require(
            _resources[id].id == uint32(0),
            "RMRK: resource already exists"
        );
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
        uint32 resourceId,
        uint64 customResourceId
    ) internal {
        _resources[resourceId].custom.push(customResourceId);
        emit ResourceCustomDataAdded(resourceId, customResourceId);
    }

    function _removeCustomDataFromResource(
        uint32 resourceId,
        uint256 index
    ) internal {
        uint64 customResourceId = _resources[resourceId].custom[index];
        _resources[resourceId].custom.removeItemByIndex(index);
        emit ResourceCustomDataRemoved(resourceId, customResourceId);
    }

    function _addResourceToToken(
        uint256 tokenId,
        uint32 resourceId,
        uint32 overwrites
    ) internal {
        if(_tokenResources[tokenId][resourceId])
            revert MultiResourceAlreadyExists();

        require(
            getResource(resourceId).id != uint32(0),
            "MultiResource: Resource not found in storage"
        );

        if(_pendingResources[tokenId].length >= 128)
            revert MultiResourceMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint32(0)) {
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
        uint32 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        uint32 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getFullResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        uint32[] memory activeResources = _activeResources[tokenId];
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
        uint32[] memory pendingResources = _pendingResources[tokenId];
        uint256 len = pendingResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(pendingResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

}
