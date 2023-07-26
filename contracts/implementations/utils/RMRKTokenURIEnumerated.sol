// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RMRKTokenURIEnumerated
 * @author RMRK team
 * @notice Implementation of enumerable token URI.
 */
contract RMRKTokenURIEnumerated {
    using Strings for uint256;

    string private _baseTokenURI;

    constructor(string memory baseTokenURI) {
        _baseTokenURI = baseTokenURI;
    }

    /**
     * @notice Used to retrieve the metadata URI of a token.
     * @param tokenId ID of the token to retrieve the metadata URI for
     * @return Metadata URI of the specified token
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }
}
