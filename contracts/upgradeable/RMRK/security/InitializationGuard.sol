// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/library/RMRKErrors.sol";

contract InitializationGuard {
    bool private _initialized;

    modifier initializable() {
        _initializable();
        _;
        _initialized = true;
    }

    function _initializable() internal {
        if (_initialized) {
            revert RMRKAlreadyInitialized();
        }
    }
}
