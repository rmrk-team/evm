// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./RMRKMultiAssetPreMint.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

/**
 * @title RMRKMultiAssetPreMintSoulbound
 * @author RMRK team
 * @notice Implementation of non-transferable RMRK multi asset module with pre-minting.
 */
contract RMRKMultiAssetPreMintSoulbound is
    RMRKSoulbound,
    RMRKMultiAssetPreMint
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKMultiAssetPreMint(
            name,
            symbol,
            collectionMetadata,
            maxSupply,
            royaltyRecipient,
            royaltyPercentageBps
        )
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKAbstractMultiAsset)
        returns (bool)
    {
        return
            RMRKAbstractMultiAsset.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractMultiAsset) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractMultiAsset._beforeTokenTransfer(from, to, tokenId);
    }
}
