// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

/**
 * @title RMRKCore
 * @author RMRK team
 * @notice Smart contract of the RMRK core module.
 * @dev This is currently just a passthrough contract which allows for granular editing of base-level ERC721 functions.
 */
contract RMRKCore {
    string private constant _VERSION = "2.4.1";
    bytes4 private constant _RMRK_INTERFACE = 0x524D524B; // "RMRK" in ASCII hex

    /**
     * @notice Version of the @rmrk-team/evm-contracts package
     * @return version Version identifier for implementations of the @rmrk-team/evm-contracts package
     */
    function VERSION() public pure returns (string memory version) {
        version = _VERSION;
    }

    /**
     * @notice Interface identifier of the @rmrk-team/evm-contracts package
     * @return rmrkInterface Interface identifier for implementations of the @rmrk-team/evm-contracts package
     */
    function RMRK_INTERFACE() public pure returns (bytes4 rmrkInterface) {
        rmrkInterface = _RMRK_INTERFACE;
    }
}
