// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../RMRK/utils/IERC20.sol";
import "./IRMRKErc20Pay.sol";

/**
 * @title RMRKNestable
 * @author RMRK team
 * @notice Smart contract of the RMRK Nestable module.
 */
abstract contract RMRKErc20Pay is IRMRKErc20Pay {
    address private immutable _erc20TokenAddress;

    /**
     * @notice Used to initialize the smart contract.
     * @param erc20TokenAddress_ Address of the ERC20 token supported by this smart contract
     */
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
        IERC20(_erc20TokenAddress).transferFrom(from, to, value);
    }

    /**
     * @notice Used to retrieve the address of the ERC20 token this smart contract supports.
     * @return Address of the ERC20 token's smart contract
     */
    function erc20TokenAddress() public view virtual returns (address) {
        return _erc20TokenAddress;
    }
}
