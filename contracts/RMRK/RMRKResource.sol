import "./RMRKNestable.sol";
import "./access/Ownable.sol";

contract RMRKResource is RMRKNestable, Ownable {

  //TODO: Abstract resources to be stored once instead of per-token, token refers to storage for data
  //TODO: Further abstract resource internals to be non-repeating (as much as possibe),
  //      allow for common base URI for content-addressed archives

  constructor()
  RMRKNestable("RmrkTest", "TST")
  {
  }

  mapping(uint256 => mapping(bytes32 => Resource)) public _resources;

  event ResAdd(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResAccept(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResPrio(uint256 indexed tokenId);

  mapping(uint256 => bytes32[]) public priority;

  struct Resource {
      string metadataURI;
      bytes32 src;
      bytes32 license;
      bytes32 thumb;
      bytes32 uuid;
      bool pending;
      bool exists;
  }

  function addResource(
      string calldata _metadataURI,
      bytes32 _uuid,
      bytes32 _src,
      bytes32 _license,
      bytes32 _thumb,
      uint256 _tokenId
  ) public onlyOwner {
      bool p = false;
      if (ownerOf(_tokenId) != msg.sender) {
          p = true;
      }
      Resource memory _r = Resource({
          uuid: _uuid,
          src: _src,
          metadataURI: _metadataURI,
          license: _license,
          thumb: _thumb,
          pending: p,
          exists: true
      });
      _resources[_tokenId][_uuid] = _r;
      emit ResAdd(_tokenId, _uuid);
  }

  function acceptResource(uint256 _tokenId, bytes32 _uuid) public {
      require(
          ownerOf(_tokenId) == msg.sender,
          "RMRK: Attempting to accept a resource in non-owned NFT"
      );
      if (_resources[_tokenId][_uuid].exists) {
          _resources[_tokenId][_uuid].pending = false;
          emit ResAccept(_tokenId, _uuid);
          return;
      }
  }

  function setPriority(uint256 _tokenId, bytes32[] memory _uuids) public {
      require(
          ownerOf(_tokenId) == msg.sender,
          "RMRK: Attempting to set priority in non-owned NFT"
      );
      for (uint256 i = 0; i < _uuids.length; i++) {
          require(
              _resources[_tokenId][_uuids[i]].exists,
              "RMRK: Trying to reprioritize a non-existant resource"
          );
      }
      // @todo loop through _uuids and make sure all exist
      priority[_tokenId] = _uuids;
      emit ResPrio(_tokenId);
  }
}
