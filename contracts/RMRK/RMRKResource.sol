// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./access/AccessControl.sol";

contract RMRKResource is AccessControl {

  /**
  @dev Ancillary RMRK resource storage contract. By default this is expected to be deployed
  * by an instance of RMRKCore, but can also be deployed in a standalone fashion.
  * Resources are added to the RMRKCore contract via an (address resourceAddress, bytes8 resourceId)
  * pair.
  */

  //TODO: Further abstract resource internals to be non-repeating (as much as possibe)

  bytes32 private constant issuer = keccak256("ISSUER");

  string private _resourceName;

  struct Resource {
      bytes8 id; //8 bytes
      uint16 slot; //4 bytes
      address baseAddress; //20 bytes
      bytes8[] basePartIds; // n bytes
      string src; //32+
      string thumb; //32+
      string metadataURI; //32+
  }

  //Mapping of bytes8 to Resource. Consider an incrementer for zero collision chance.
  mapping(bytes8 => Resource) private _resources;
  bytes8[] private allResources;

  event ResourcePrioritySet(uint256 indexed tokenId);

  constructor(string memory resourceName_) {
    _grantRole(issuer, msg.sender);
    _setRoleAdmin(issuer, issuer);
    setResourceName(resourceName_);
  }

  function addResourceEntry(
      bytes8 _id, //Previously named _id, have seen it called id in RMRK examples / documentation, ask for clarification
      uint16 _slot,
      address _baseAddress,
      bytes8[] memory _basePartIds,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI

  ) public onlyRole(issuer) {
      require(_id != bytes8(0),
        "RMRK: Write to zero"
      );
      require(_resources[_id].id == bytes8(0),
        "RMRK: resource already exists"
      );
      Resource memory resource_ = Resource({
          id: _id,
          slot: _slot,
          baseAddress: _baseAddress,
          basePartIds: _basePartIds,
          src: _src,
          thumb: _thumb,
          metadataURI: _metadataURI
      });
      _resources[_id] = resource_;
      allResources.push(_id);
  }

  function getResourceName () public view returns (string memory) {
    return _resourceName;
  }

  function setResourceName (string memory resourceName) internal {
    _resourceName = resourceName;
  }

}
