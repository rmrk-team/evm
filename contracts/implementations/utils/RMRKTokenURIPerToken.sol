// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

/**
 * @title RMRKTokenURIPerToken
 * @author RMRK team
 * @notice Implementation of token URI per token.
 */
contract RMRKTokenURIPerToken {
    mapping(uint256 => string) private _tokenURIs;

    /**
     * @notice Used to retrieve the metadata URI of a token.
     * @param tokenId ID of the token to retrieve the metadata URI for
     * @return Metadata URI of the specified token
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        return _tokenURIs[tokenId];
    }

    /**
     * @notice Used to set the token URI configuration.
     * @param tokenId ID of the token to set the metadata URI for
     * @param tokenURI_ Metadata URI to apply to all tokens, either as base or as full URI for every token
     */
    function _setTokenURI(
        uint256 tokenId,
        string memory tokenURI_
    ) internal virtual {
        _tokenURIs[tokenId] = tokenURI_;
    }
}
