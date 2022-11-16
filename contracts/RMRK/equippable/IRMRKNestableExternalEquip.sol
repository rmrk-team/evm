// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKNestableExternalEquip
 * @author RMRK team
 * @notice Interface smart contract of the RMRK nestable with external equippable module.
 */
interface IRMRKNestableExternalEquip is IERC165 {
    /**
     * @notice sed to notify the listeners that the address of the `Equippable` associated smart contract has been set.
     * @dev When the address is set fot the first time, the `old` value should equal `0x0` address.
     * @param old Address of the previous `Equippable` smart contract
     * @param new_ Address of the new `Equippable` smart contract
     */
    event EquippableAddressSet(address old, address new_);

    /**
     * @notice Used to retrieve the `Equippable` smart contract's address.
     * @return address Address of the `Equippable` smart contract
     */
    function getEquippableAddress() external view returns (address);

    /**
     * @notice Used to verify that the specified address is either the owner of the given token or approved to manage
     *  it.
     * @param spender Address of the account we are checking for ownership or approval
     * @param tokenId ID of the token that we are checking
     * @return bool A boolean value indicating whether the specified address is the owner of the given token or approved
     *  to manage it
     */
    function isApprovedOrOwner(address spender, uint256 tokenId)
        external
        view
        returns (bool);
}
