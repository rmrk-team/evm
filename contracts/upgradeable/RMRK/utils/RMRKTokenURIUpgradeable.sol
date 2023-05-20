// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "../security/InitializationGuard.sol";

/**
 * @title RMRKTokenURIUpgradeable
 * @author RMRK team
 * @notice Implementation of upgradeable token URI with option to be enumerable.
 */
contract RMRKTokenURIUpgradeable is InitializationGuard {
    using StringsUpgradeable for uint256;

    string private _tokenUri;
    uint256 private _tokenUriIsEnumerable;

    /**
     * @notice Used to initiate the smart contract.
     * @param tokenURI_ Metadata URI to apply to all tokens, either as base or as full URI for every token
     * @param isEnumerable Whether to treat the tokenURI as enumerable or not. If true, the tokenID will be appended to
     *  the base when getting the tokenURI
     */
    function __RMRKTokenURIUpgradeable_init(string memory tokenURI_, bool isEnumerable) internal initializable {
        _setTokenURI(tokenURI_, isEnumerable);
    }

    /**
     * @notice Used to retrieve the metadata URI of a token.
     * @param tokenId ID of the token to retrieve the metadata URI for
     * @return Metadata URI of the specified token
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        return
            _tokenUriIsEnumerable == uint256(0)
                ? _tokenUri
                : string(abi.encodePacked(_tokenUri, tokenId.toString()));
    }

    /**
     * @notice Used to set the token URI configuration.
     * @param tokenURI_ Metadata URI to apply to all tokens, either as base or as full URI for every token
     * @param isEnumerable Whether to treat the tokenURI as enumerable or not. If true, the tokenID will be appended to
     *  the base when getting the tokenURI
     */
    function _setTokenURI(
        string memory tokenURI_,
        bool isEnumerable
    ) internal virtual {
        _tokenUri = tokenURI_;
        _tokenUriIsEnumerable = isEnumerable ? 1 : 0;
    }
}
