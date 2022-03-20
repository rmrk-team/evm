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

  //Double mapping of tokenId to active resources
  mapping(uint256 => mapping(bytes16 => bool)) private _tokenResources;

  //Double mapping of tokenId to active resources -- experimental bytes17 using abi.encodePacked of ID and boolean
  //Save on a keccak256 call of double mapping
  mapping(uint256 => bytes17) private _tokenResourcesExperimental;

  //mapping of tokenId to all resources by priority
  mapping(uint256 => bytes16[]) private _pendingResources;

  // AccessControl roles and nest flag constants
  RMRKResourceCore public resourceStorage;

  string private _fallbackURI;

  //Resource events
  event ResourceStorageSet(bytes8 id);
  event ResourceAddedToToken(uint256 indexed tokenId, bytes16 localResourceId);
  event ResourceAccepted(uint256 indexed tokenId, bytes16 localResourceId);
  //Emits bytes16(0) as localResourceId in the event all resources are deleted
  event ResourceRejected(uint256 indexed tokenId, bytes16 localResourceId);
  event ResourcePrioritySet(uint256 indexed tokenId);
  event ResourceOverwriteProposed(uint256 indexed tokenId, bytes16 localResourceId, bytes16 overwrites);
  event ResourceOverwritten(uint256 indexed tokenId, bytes16 overwritten);

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
    emit ResourceStorageSet(_id);
  }

  function _addResourceToToken(
      uint256 _tokenId,
      IRMRKResourceCore _resourceAddress,
      bytes8 _resourceId,
      bytes16 _overwrites
  ) internal virtual {

      bytes16 localResourceId = hashResource16(_resourceAddress, _resourceId);

      require(
        _tokenResources[_tokenId][localResourceId] == false,
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

      //gas saving if check for repeated resource usage
      if (address(_resources[localResourceId].resourceAddress) == address(0)){
          _resources[localResourceId] = resource_;
      }
      _tokenResources[_tokenId][localResourceId] = true;

      _pendingResources[_tokenId].push(localResourceId);

      if (_overwrites != bytes16(0)) {
        _resourceOverwrites[_tokenId][localResourceId] = _overwrites;
        emit ResourceOverwriteProposed(_tokenId, localResourceId, _overwrites);
      }

      emit ResourceAddedToToken(_tokenId, localResourceId);
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
        emit ResourceOverwritten(_tokenId, overwrite);
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
      _tokenResources[_tokenId][_localResourceId] = false;

      emit ResourceRejected(_tokenId, _localResourceId);
  }

  function _rejectAllResources(uint256 _tokenId) internal virtual {
    delete(_pendingResources[_tokenId]);
    emit ResourceRejected(_tokenId, bytes16(0));
  }

  /*
  This function must be gas tested. Tests involve:
    1. Algorithm design (Can we sum and hash the elements of the array to ensure integrity instead? Is this robust?)
    and/or:
    2. Checking relative cost of elements of _activeResources vs checking the resourceExists double mapping
    3. Finding a robust way to ensure that elements of the array are not repeated
  */

  function _setPriority(uint256 _tokenId, bytes16[] memory _ids) internal virtual {
      uint256 length = _ids.length;
      require(
        length == _activeResources[_tokenId].length,
          "RMRK: Bad priority list length"
      );
      bytes16[] memory checkArr = new bytes16[](length);
      for (uint256 i = 0; i < length; i = i.u_inc()) {
          require(_activeResources[_tokenId].contains(_ids[i]),
          "RMRKCore: Token does not have resource");
          require(!checkArr.contains(_ids[i]),
          "RMRKCore: Resource double submission");
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
