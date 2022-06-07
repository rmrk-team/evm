// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "./IMultiResource.sol";
import "./IRMRKNesting.sol";
import "./IRMRKRoyalties.sol";

interface IRMRKCore is IRMRKMultiResource, IRMRKNesting, IRMRKRoyalties {

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );

  event Approval(
      address indexed owner,
      address indexed approved,
      uint256 indexed tokenId
  );

  function rmrkCoreCheck(
      address,
      address,
      uint256,
      bytes calldata
  ) external returns (bytes4);

}
