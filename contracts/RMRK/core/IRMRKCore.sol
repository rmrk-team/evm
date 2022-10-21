// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

/**
 * @title IRMRKCore
 * @author RMRK team
 * @notice Interface smart contract for RMRK core module.
 */
interface IRMRKCore {
    /**
     * @notice Used to retrieve the collection name.
     * @return string Name of the collection
     */
    function name() external view returns (string memory);

    /**
     * @notice Used to retrieve the collection symbol.
     * @return string Symbol of the collection
     */
    function symbol() external view returns (string memory);

    /**
     * @notice Used to retrieve the metadata URI of a token.
     * @param tokenId ID of the token to retrieve the metadata URI for
     * @return string Metadata URI of the specified token
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
