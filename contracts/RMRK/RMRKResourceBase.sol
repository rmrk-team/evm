// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./RMRKResourceCore.sol";
import "./interfaces/IRMRKResourceBase.sol";

contract RMRKResourceBase is RMRKResourceCore {

  constructor()RMRKResourceCore("dummyResource") {
  }

}
