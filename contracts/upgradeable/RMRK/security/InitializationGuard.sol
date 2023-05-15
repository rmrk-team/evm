// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/library/RMRKErrors.sol";

contract InitializationGuard {
    bool private _initialized;

    modifier initializable() {
        _initialize();
        _;
    }

    function _initialize() internal {
        if (_initialized) {
            revert RMRKAlreadyInitialized();
        }
        _initialized = true;
    }
}
