pragma solidity ^0.8.9;

import "./RMRKNestable.sol";

contract RMRKResource is RMRKNestable {

  //TODO: Further abstract resource internals to be non-repeating (as much as possibe)

  constructor(string memory _name, string memory _symbol)
  RMRKNestable(_name, _symbol)
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
  */

  struct Resource {
      bool pending; // 1 byte
      bool exists; //1 byte
      uint32 slot; //4 bytes
      address baseAddress; //20 bytes
      bytes8[] basePartIds; // n bytes
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
      address _baseAddress,
      bytes8[] memory _basePartIds,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI

  ) public onlyRole(issuer) {
      require(!_resources[_tokenId][_id].exists, "RMRK: resource already exists");
      bool _pending = false;
      if (!isApprovedOrOwner(_msgSender(), _tokenId)) {
          _pending = true;
      }
      Resource memory resource_ = Resource({
          pending: _pending,
          exists: true,
          slot: _slot,
          baseAddress: _baseAddress,
          basePartIds: _basePartIds,
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
      require(resource.pending, "RMRK: resource is already accepted");
      _resources[_tokenId][_id].pending = false;
      emit ResAccept(_tokenId, _id);
  }

  function setPriority(uint256 _tokenId, bytes8[] memory _ids) public {
      require(
        _ids.length == _priority[_tokenId].length,
          "RMRK: Bad priority list length"
      );
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
    return getTokenResource(tokenId, resourceId);
  }

  function getTokenResource(uint256 tokenId, bytes8 resourceId) public view returns(Resource memory) {
    return _resources[tokenId][resourceId];
  }

  function getPriorities(uint256 tokenId) public view returns(bytes8[] memory) {
    return _priority[tokenId];
  }
}
