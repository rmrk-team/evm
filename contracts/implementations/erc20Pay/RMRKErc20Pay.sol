// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/utils/IERC20.sol";
import "./IRMRKErc20Pay.sol";

error RMRKNotEnoughAllowance();

/**
 * @title RMRKNestable
 * @author RMRK team
 * @notice Smart contract of the RMRK Nestable module.
 * @dev This contract is hierarchy agnostic and can support an arbitrary number of nested levels up and down, as long as
 *  gas limits allow it.
 */
abstract contract RMRKErc20Pay is IRMRKErc20Pay {
    address private immutable _erc20TokenAddress;

    constructor(address erc20TokenAddress_) {
        _erc20TokenAddress = erc20TokenAddress_;
    }

    /**
     * @notice Used to charge an ERC20 token for a specified value. 
     * @param from Address from which to transfer the tokens
     * @param to Address to which to transfer the tokens
     * @param value The amount of tokens to transfer
     */
    function _chargeFromToken(
        address from,
        address to,
        uint256 value
    ) internal virtual {
        if (IERC20(_erc20TokenAddress).allowance(from, to) < value)
            revert RMRKNotEnoughAllowance();
        IERC20(_erc20TokenAddress).transferFrom(from, to, value);
    }

    /**
     * @notice Used to retrieve the address of the ERC20 token this smart contract supports.
     * @return address Address of the ERC20 token's smart contract
     */
    function erc20TokenAddress() public view virtual returns (address) {
        return _erc20TokenAddress;
    }
}
