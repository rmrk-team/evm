// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/nestable/RMRKNestable.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtils.sol";
import "../../RMRK/utils/RMRKTokenURI.sol";

error RMRKMintZero();

/**
 * @title RMRKAbstractNestableImpl
 * @author RMRK team
 * @notice Abstract implementation of RMRK nestable module.
 */
abstract contract RMRKAbstractNestableImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKTokenURI,
    RMRKNestable
{
    /**
     * @notice Used to calculate the token IDs of tokens to be minted.
     * @param numToMint Amount of tokens to be minted
     * @return uint256 The ID of the first token to be minted in the current minting cycle
     * @return uint256 The ID of the last token to be minted in the current minting cycle
     */
    function _preMint(
        uint256 numToMint
    ) internal virtual returns (uint256, uint256) {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        _charge(mintPriceRequired);

        uint256 nextToken = _totalSupply + 1;
        unchecked {
            _totalSupply += numToMint;
        }
        uint256 totalSupplyOffset = _totalSupply + 1;

        return (nextToken, totalSupplyOffset);
    }

    /**
     * @notice Used to verify that the amount of native currency accompanying the transaction equals the expected value.
     * @param value The expected amount of native currency to accompany the transaction
     */
    function _charge(uint256 value) internal virtual;

    /**
     * @inheritdoc RMRKRoyalties
     */
    function updateRoyaltyRecipient(
        address newRoyaltyRecipient
    ) public virtual override onlyOwner {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }

    /**
     * @notice Used to update the tokenURI and define it as enumerable or not
     * @param tokenURI_ Metadata URI to apply to all tokens, either as base or as full URI for every token
     * @param isEnumerable Whether to treat the tokenURI as enumerable or not. If true, the tokenID will be appended to the base when getting the tokenURI
     */
    function updateTokenURI(
        string memory tokenURI_,
        bool isEnumerable
    ) public virtual onlyOwner {
        _setTokenURI(tokenURI_, isEnumerable);
    }

    /**
     * @notice Prevents from ever modifying the token URI again
     */
    function freezeTokenURI() public virtual onlyOwner {
        _freezeTokenURI();
    }
}
