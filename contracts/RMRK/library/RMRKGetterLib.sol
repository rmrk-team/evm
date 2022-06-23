pragma solidity ^0.8.15;
library RMRKGetterLib {

  error RMRKNoResourceMatchingId();

  //Reorder this during optimization for packing
  struct Resource {
      uint64 id; // ID of this resource
      uint64 equippableRefId; // ID of mapping for applicable equippables
      string metadataURI;
      //describes this equippable status
      address baseAddress; // Base contract reference
      uint64 slotId; // Which slotId this resource is equippable in
      uint128[] custom; //Custom data
  }

  function _getResourcesById(
      uint64[] memory resourceIds
  ) external view returns (Resource[] memory) {
      uint256 len = resourceIds.length;
      Resource[] memory resources = new Resource[](len);
      for (uint i; i<len;) {
          Resource memory resource = resources[resourceIds[i]];
          if(resource.id == uint64(0))
              revert RMRKNoResourceMatchingId();
          resources[i] = resource;
          unchecked {++i;}
      }
      return resources;
  }
}
