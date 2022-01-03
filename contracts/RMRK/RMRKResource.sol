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

  mapping(uint256 => mapping(bytes8 => Resource)) public _resources;

  //Does double duty as a list of all resources. Potential greif vector if filled via unauthorized. Recommend only preauthorization.
  mapping(uint256 => bytes8[]) public priority;

  //enum ResType { Partate, Override }

  event ResAdd(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResAccept(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResPrio(uint256 indexed tokenId);

  /**
  Issue: Resource struct contains too much data generally, going to lead to inefficient storage.
  src field is only used by resources that override those from base -- override also requires flag.
  parts[] vice-versa.
  Consider storage solution that splits resource into two types, overrides and non-overrides.
  Figure out how to set priority on resources of various types. Will an NFT ever display more than one resource?
  */

  //Resource struct is a bit overloaded at the moment. Must contain all vars necessary for all types.
  //The resource is assumed to be alt art if parts.length returns zero.
  /*
  //Ideally a struct would contain only the data types to render a given asset. Consider implementing
  //two standard resource types, partsResource and overrideResource, of the following forms:

  struct partsResource {
      uint32 slot;
      bool pending;
      bool exists;
      bytes8[] parts;
      string metadataURI;
  }

  struct overrideResource {
      string src;
      string thumb;
      string metadataURI;
  }
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
      priority[_tokenId].push(_id);
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
      priority[_tokenId] = _ids;
      emit ResPrio(_tokenId);
  }
}
