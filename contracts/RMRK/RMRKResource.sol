pragma solidity ^0.8.9;

import "./RMRKNestable.sol";

contract RMRKResource is RMRKNestable {

  //Heavily under construction here. Reconsidering splitting resource storage into two distinct types -
  //partate (inherits from base) and override(carries own src).

  //TODO: Abstract resources to be stored once instead of per-token, token refers to storage for data
  //TODO: Further abstract resource internals to be non-repeating (as much as possibe),
  //      allow for common base URI for content-addressed archives

  //Account for: BASE resources and Additional Art Resources

  constructor()
  RMRKNestable("RmrkTest", "TST")
  {
  }

  mapping(uint256 => mapping(bytes8 => Resource)) private _resources;

  //Does double duty as a list of all resources. Potential greif vector if filled via unauthorized. Recommend only preauthorization.
  mapping(uint256 => bytes8[]) private _priority;

  //enum ResType { Partate, Override }

  event ResAdd(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResAccept(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResPrio(uint256 indexed tokenId);
  event ResEquipped();
  event ResUnequipped();

  /*
  //Resource struct is a bit overloaded at the moment. Must contain all vars necessary for all types.
  //The resource can be assumed to be alt art if parts.length returns zero.
  */

  //indexed via TokenId (uint256) => ResourceId (bytes8) => Resource Mapping;

  struct Resource {
      uint32 slot; //4 bytes
      bool pending; // 1 byte
      bool exists; //1 byte
      bytes8[] parts; // n bytes
      string src; //32+
      string thumb; //32+
      string metadataURI; //32+
  }

  /*
  FROM SPEC:
  The value of baseslot can change from "" to "base-4477293-kanaria_superbird.machine_gun_scope"
  ONLY if one of this child NFT's resources has this value as a slot property
  */

  function equip() public {

  }

  function unequip() public {

  }

  function addResource(
      uint256 _tokenId,
      bytes8 _id, //Previously named _id, have seen it called id in RMRK examples / documentation, ask for clarification
      uint32 _slot,
      bytes8[] memory _parts,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI

  ) public onlyIssuer {
      require(!_resources[_tokenId][_id].exists, "RMRK: resource already exists");
      bool _pending = false;
      if (!isApprovedOrOwner(_msgSender(), _tokenId)) {
          _pending = true;
      }
      Resource memory resource_ = Resource({
          slot: _slot,
          pending: _pending,
          exists: true,
          parts: _parts,
          src: _src,
          thumb: _thumb,
          metadataURI: _metadataURI
      });
      _resources[_tokenId][_id] = resource_;
      _priority[_tokenId].push(_id);
      emit ResAdd(_tokenId, _id);
  }

  //Check to see if loading struct into memory first saves gas or not
  function acceptResource(uint256 _tokenId, bytes8 _id) public {
      Resource memory resource = _resources[_tokenId][_id];
      require(
        isApprovedOrOwner(_msgSender(), _tokenId),
          "RMRK: Attempting to accept a resource in non-owned NFT"
      );
      require(resource.exists, "RMRK: resource does not exist");
      require(!resource.pending, "RMRK: resource is already approved");
      _resources[_tokenId][_id].pending = false;
      emit ResAccept(_tokenId, _id);
  }

  function setPriority(uint256 _tokenId, bytes8[] memory _ids) public {
      require(
        isApprovedOrOwner(_msgSender(), _tokenId),
          "RMRK: Attempting to set priority in non-owned NFT"
      );
      for (uint256 i = 0; i < _ids.length; i++) {
          require(
              _resources[_tokenId][_ids[i]].exists,
              "RMRK: Trying to reprioritize a non-existant resource"
          );
      }
      _priority[_tokenId] = _ids;
      emit ResPrio(_tokenId);
  }

  function getRenderableResource(uint256 tokenId) public view returns(Resource memory) {
    bytes8 resourceId = _priority[tokenId][0];
    return getResource(tokenId, resourceId);
  }

  function getResource(uint256 tokenId, bytes8 resourceId) public view returns(Resource memory) {
    return _resources[tokenId][resourceId];
  }

  function getPriorities(uint256 tokenId) public view returns(bytes8[] memory) {
    return _priority[tokenId];
  }
}
