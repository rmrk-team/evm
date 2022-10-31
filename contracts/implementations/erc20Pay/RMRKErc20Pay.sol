// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/utils/IERC20.sol";
import "./IRMRKErc20Pay.sol";

error RMRKNotEnoughAllowance();

abstract contract RMRKErc20Pay is IRMRKErc20Pay {
    address private immutable _erc20TokenAddress;

    constructor(address erc20TokenAddress_) {
        _erc20TokenAddress = erc20TokenAddress_;
    }

    function _chargeFromToken(
        address from,
        address to,
        uint256 value
    ) internal virtual {
        if (IERC20(_erc20TokenAddress).allowance(from, to) < value)
            revert RMRKNotEnoughAllowance();
        IERC20(_erc20TokenAddress).transferFrom(from, to, value);
    }

    function erc20TokenAddress() public view virtual returns (address) {
        return _erc20TokenAddress;
    }
}
