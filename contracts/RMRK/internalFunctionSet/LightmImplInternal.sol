// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LightmImplStorage} from "./Storage.sol";

abstract contract LightmImplInternal {
    function getLightmImplState()
        internal
        pure
        returns (LightmImplStorage.State storage)
    {
        return LightmImplStorage.getState();
    }

    modifier onlyOwner() {
        require(
            getLightmImplState()._owner == msg.sender,
            "LightmImpl:Not Owner"
        );
        _;
    }
}
