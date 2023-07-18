// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./RMRKEquippablePreMint.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

contract RMRKEquippablePreMintSoulbound is
    RMRKSoulbound,
    RMRKEquippablePreMint
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKEquippablePreMint(
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
        override(RMRKSoulbound, RMRKAbstractEquippable)
        returns (bool)
    {
        return
            RMRKAbstractEquippable.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractEquippable) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractEquippable._beforeTokenTransfer(from, to, tokenId);
    }
}
