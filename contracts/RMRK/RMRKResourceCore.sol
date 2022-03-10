// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./access/AccessControl.sol";

contract RMRKResourceCore is AccessControl {

  /**
  @dev Ancillary RMRK resource storage contract. By default this is expected to be deployed
  * by an instance of RMRKCore, but can also be deployed in a standalone fashion.
  * Resources are added to the RMRKCore contract via an (address resourceAddress, bytes8 resourceId)
  * pair.
  */

  //TODO: Further abstract resource internals to be non-repeating (as much as possibe)

  //Previous base resource before Equippables lego
  /* struct Resource {
      bytes8 id; //8 bytes
      uint16 slot; //4 bytes
      address baseAddress; //20 bytes
      bytes8[] basePartIds; // n bytes
      string src; //32+
      string thumb; //32+
      string metadataURI; //32+
  } */

  struct Resource {
      bytes8 id; //8 bytes
      string src; //32+
      string thumb; //32+
      string metadataURI; //32+
  }

  /* struct baseResource {
      bytes8 id; //8 bytes
      uint16 slot; //4 bytes
      address baseAddress; //20 bytes
      bytes8[] basePartIds; // n bytes
  } */

  //Mapping of bytes8 to Resource. Consider an incrementer for zero collision chance.
  mapping(bytes8 => Resource) private _resources;

  //List of all resources
  bytes8[] private allResources;

  //Name of resource collection
  string private _resourceName;

  bytes32 private constant issuer = keccak256("ISSUER");

  constructor(string memory resourceName_) {
    _grantRole(issuer, msg.sender);
    _setRoleAdmin(issuer, issuer);
    setResourceName(resourceName_);
  }

  /**
   * @dev Function to handle adding a resource entry to the storage contract. Callable by the issuer role, which may also
   * be an instance of the CORE contract, if deployed by the CORE.
   * param1 _id is a unique resource identifier.
   * param2 _src is the primary URI of the resource (used for non-base resources)
   * param3 _thumb is the thumbnail URI of the resource
   * param4 _metadataURI is the URI of the resource's metadata
   */

  function addResourceEntry(
      bytes8 _id, //Previously named _id, have seen it called id in RMRK examples / documentation, ask for clarification
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
          src: _src,
          thumb: _thumb,
          metadataURI: _metadataURI
      });
      _resources[_id] = resource_;
      allResources.push(_id);
  }

  function getResource(bytes8 resourceId) public view returns (Resource memory) {
    Resource memory resource_ = _resources[resourceId];
    require(resource_.id != bytes8(0), "RMRKResource: No resource at index");
    return resource_;
  }

  /**
   * @dev Resource name getter
   */

  function getResourceName() public view returns (string memory) {
    return _resourceName;
  }

  /**
   * @dev Resource name setter
   */

  function setResourceName(string memory resourceName) internal {
    _resourceName = resourceName;
  }

}
