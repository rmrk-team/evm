// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./interfaces/IRMRKMultiResource.sol";
import "./interfaces/IRMRKResourceCore.sol";
import "./RMRKResourceCore.sol";
import "./library/RMRKLib.sol";

contract RMRKMultiResource {

  using RMRKLib for uint256;
  using RMRKLib for bytes16[];

  struct Resource {
    IRMRKResourceCore resourceAddress;
    bytes8 resourceId;
  }

  //mapping resourceContract to resource entry
  mapping(bytes16 => Resource) private _resources;

  //mapping tokenId to current resource to replacing resource
  mapping(uint256 => mapping(bytes16 => bytes16)) private _resourceOverwrites;

  //mapping of tokenId to all resources by priority
  mapping(uint256 => bytes16[]) private _activeResources;

  //mapping of tokenId to all resources by priority
  mapping(uint256 => bytes16[]) private _pendingResources;

  // AccessControl roles and nest flag constants
  RMRKResourceCore public resourceStorage;

  string private _fallbackURI;

  //Resource events
  event ResourceAdded(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResourceAccepted(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResourceRejected(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResourcePrioritySet(uint256 indexed tokenId);

  constructor(string memory resourceName) {
    resourceStorage = new RMRKResourceCore(resourceName);
  }

  ////////////////////////////////////////
  //              RESOURCES
  ////////////////////////////////////////

  function _addResourceEntry(
      bytes8 _id,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI
  ) internal virtual {
    resourceStorage.addResourceEntry(
      _id,
      _src,
      _thumb,
      _metadataURI
      );
  }

  function _addResourceToToken(
      uint256 _tokenId,
      IRMRKResourceCore _resourceAddress,
      bytes8 _resourceId,
      bytes16 _overwrites
  ) internal virtual {

      bytes16 localResourceId = hashResource16(_resourceAddress, _resourceId);

      //Dunno if this'll even work
      require(
        address(_resources[localResourceId].resourceAddress) == address(0),
        "RMRKCore: Resource already exists on token"
      );
      //This error code will never be triggered because of the interior call of
      //resourceStorage.getResource. Left in for posterity.

      //Abstract this out to IRMRKResourceStorage
      require(
        resourceStorage.getResource(_resourceId).id != bytes8(0),
        "RMRKCore: Resource not found in storage"
      );

      //Construct Resource object
      Resource memory resource_ = Resource({
        resourceAddress: _resourceAddress,
        resourceId: _resourceId
      });

      _resources[localResourceId] = resource_;

      _pendingResources[_tokenId].push(localResourceId);

      if (_overwrites != bytes16(0)) {
        _resourceOverwrites[_tokenId][localResourceId] = _overwrites;
      }

      emit ResourceAdded(_tokenId, _resourceId);
  }

  function _acceptResource(uint256 _tokenId, uint256 index) internal virtual {
      bytes16 _localResourceId = _pendingResources[_tokenId][index];
      require(
          address(_resources[_localResourceId].resourceAddress) != address(0),
          "RMRK: resource does not exist"
      );

      _pendingResources[_tokenId].removeItemByIndex(0);

      bytes16 overwrite = _resourceOverwrites[_tokenId][_localResourceId];
      if (overwrite != bytes16(0)) {
        // We could check here that the resource to overwrite actually exists but it is probably harmless.
        _activeResources[_tokenId].removeItemByValue(overwrite);
      }
      _activeResources[_tokenId].push(_localResourceId);
      emit ResourceAccepted(_tokenId, _localResourceId);
  }

  function _rejectResource(uint256 _tokenId, uint256 index) internal virtual {
      require(
        _pendingResources[_tokenId].length > index,
        "RMRKcore: Pending child index out of range"
      );

      bytes16 _localResourceId = _pendingResources[_tokenId][index];
      _pendingResources[_tokenId].removeItemByValue(_localResourceId);

      emit ResourceRejected(_tokenId, _localResourceId);
  }

  function _rejectAllResources(uint256 _tokenId) internal virtual {
    delete(_pendingResources[_tokenId]);
  }

  function _setPriority(uint256 _tokenId, bytes16[] memory _ids) internal virtual {
      uint256 length = _ids.length;
      require(
        length == _activeResources[_tokenId].length,
          "RMRK: Bad priority list length"
      );
      for (uint256 i = 0; i < length; i = i.u_inc()) {
          require(
            (_resources[_ids[i]].resourceId !=bytes16(0)),
              "RMRK: Trying to reprioritize a non-existant resource"
          );
      }
      _activeResources[_tokenId] = _ids;
      emit ResourcePrioritySet(_tokenId);
  }

  function getActiveResources(uint256 tokenId) public virtual view returns(bytes16[] memory) {
    return _activeResources[tokenId];
  }

  function getPendingResources(uint256 tokenId) public virtual view returns(bytes16[] memory) {
    return _pendingResources[tokenId];
  }

  function getRenderableResource(uint256 tokenId) public virtual view returns (Resource memory resource) {
    bytes16 resourceId = getActiveResources(tokenId)[0];
    return _resources[resourceId];
  }

  function getResourceObject(IRMRKResourceCore _storage, bytes8 _id) public virtual view returns (IRMRKResourceCore.Resource memory resource) {
    return _storage.getResource(_id);
  }

  function getResObjectByIndex(uint256 _tokenId, uint256 _index) public virtual view returns(IRMRKResourceCore.Resource memory resource) {
    bytes16 localResourceId = getActiveResources(_tokenId)[_index];
    Resource memory _resource = _resources[localResourceId];
    (IRMRKResourceCore _storage, bytes8 _id) = (_resource.resourceAddress, _resource.resourceId);
    return getResourceObject(_storage, _id);
  }

  function getResourceOverwrites(uint256 _tokenId, bytes16 _resId) public view returns(bytes16) {
    return _resourceOverwrites[_tokenId][_resId];
  }

  function hashResource16(IRMRKResourceCore _address, bytes8 _id) public pure returns (bytes16) {
    return bytes16(keccak256(abi.encodePacked(_address, _id)));
  }

  function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
    if (_activeResources[tokenId].length > 0)  {
      Resource memory activeRes = _resources[_activeResources[tokenId][0]];
      IRMRKResourceCore resAddr = activeRes.resourceAddress;
      bytes8 resId = activeRes.resourceId;

      IRMRKResourceCore.Resource memory _activeRes = IRMRKResourceCore(resAddr).getResource(resId);
      string memory URI = _activeRes.src;
      return URI;
    }

    else {
      return _fallbackURI;
    }
  }
}
