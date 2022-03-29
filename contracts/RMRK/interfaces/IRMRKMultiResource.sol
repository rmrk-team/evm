// SPDX-License-Identifier: Apache-2.0

import "./IRMRKResourceCore.sol";

pragma solidity ^0.8.0;

interface IRMRKMultiResource {
  function addResourceEntry(
    bytes8 _id,
    string memory _src,
    string memory _thumb,
    string memory _metadataURI
  ) external;

  function addResourceToToken(
      uint256 _tokenId,
      IRMRKResourceCore _resourceAddress,
      bytes8 _resourceId,
      bytes16 _overwrites
  ) external;

  function acceptResource(uint256 _tokenId, uint256 index) external;

  function rejectResource(uint256 _tokenId, uint256 index) external;

  function rejectAllResources(uint256 _tokenId) external;

  function setPriority(uint256 _tokenId, uint16[] memory _ids) external;
}
