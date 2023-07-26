// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./RMRKNestableLazyMintErc20.sol";
import "../../RMRK/extension/soulbound/RMRKSoulbound.sol";

contract RMRKNestableLazyMintErc20Soulbound is
    RMRKSoulbound,
    RMRKNestableLazyMintErc20
{
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKNestableLazyMintErc20(
            name,
            symbol,
            collectionMetadata,
            baseTokenURI,
            data
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
        override(RMRKSoulbound, RMRKAbstractNestable)
        returns (bool)
    {
        return
            RMRKAbstractNestable.supportsInterface(interfaceId) ||
            RMRKSoulbound.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulbound, RMRKAbstractNestable) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKAbstractNestable._beforeTokenTransfer(from, to, tokenId);
    }
}
