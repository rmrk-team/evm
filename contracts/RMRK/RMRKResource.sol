import "./RMRKNestable.sol";
import "./access/Ownable.sol";

contract RMRKResource is RMRKNestable, Ownable {

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

  mapping(uint256 => bytes32[]) public priority;

  enum ResType { Partate, Override }

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

  //Resource struct is a bit overloaded at the moment. Must contain all vars necessary for
  struct Resource {
      uint32 slot; //4 bytes
      uint32 z; //4 bytes
      bool pending; // 1 byte
      bool exists; //1 byte
      bool isAltArt; //1 byte
      bytes8[] parts; // n bytes
      bytes32 src; //32
      bytes32 thumb; //32
      string metadataURI; //32+
  }

  struct PartResource {
      
  }

  struct OverrideResource {

  }

  // Y I K E S -- gotta just redo resource storage / access
  // Stack too deep territory for sure here
  function addResource(
      uint256 _tokenId,
      bytes8 _id, //Previously named _id, have seen it called id in RMRK examples / documentation, ask for clarification
      uint32 slot,
      uint32 z,
      bool _pending, //Consider dropping pending and relying on a strict preapproval structure
      bool _exists,
      bool _isAltArt,
      bytes8[] _parts,
      bytes32 _src,
      bytes32 _thumb,
      string memory _metadataURI

  ) public onlyOwner {
      bool p = false;
      if (!isApprovedOrOwner(_msgSender(), _tokenId)) {
          p = true;
      }
      Resource memory _r = Resource({
          src: _src,
          metadataURI: _metadataURI,
          thumb: _thumb,
          pending: p,
          exists: true
      });
      _resources[_tokenId][_id] = _r;
      emit ResAdd(_tokenId, _id);
  }

  function acceptResource(uint256 _tokenId, bytes8 _id) public {
      require(
          ownerOf(_tokenId) == msg.sender,
          "RMRK: Attempting to accept a resource in non-owned NFT"
      );
      if (_resources[_tokenId][_id].exists) {
          _resources[_tokenId][_id].pending = false;
          emit ResAccept(_tokenId, _id);
          return;
      }
  }

  function setPriority(uint256 _tokenId, bytes8[] memory _ids) public {
      require(
          ownerOf(_tokenId) == msg.sender,
          "RMRK: Attempting to set priority in non-owned NFT"
      );
      for (uint256 i = 0; i < _ids.length; i++) {
          require(
              _resources[_tokenId][_ids[i]].exists,
              "RMRK: Trying to reprioritize a non-existant resource"
          );
      }
      // @todo loop through _ids and make sure all exist
      priority[_tokenId] = _ids;
      emit ResPrio(_tokenId);
  }
}
