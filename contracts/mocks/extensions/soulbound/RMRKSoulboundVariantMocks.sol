// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../../../RMRK/access/Ownable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundAfterBlockNumber.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundAfterTransactions.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundPerToken.sol";
import "../../RMRKMultiAssetMock.sol";

contract RMRKSoulboundAfterBlockNumberMock is
    RMRKSoulboundAfterBlockNumber,
    RMRKMultiAssetMock
{
    mapping(uint256 => bool) soulboundExempt;

    constructor(
        uint256 lastBlockToTransfer
    ) RMRKSoulboundAfterBlockNumber(lastBlockToTransfer) {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKMultiAsset)
        returns (bool)
    {
        return
            RMRKSoulbound.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKMultiAsset, RMRKSoulbound) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKMultiAsset._beforeTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundAfterTransactionsMock is
    RMRKSoulboundAfterTransactions,
    RMRKMultiAssetMock
{
    mapping(uint256 => bool) soulboundExempt;

    constructor(
        uint256 numberOfTransfers
    ) RMRKSoulboundAfterTransactions(numberOfTransfers) {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKMultiAsset)
        returns (bool)
    {
        return
            RMRKSoulbound.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKMultiAsset, RMRKSoulbound) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKMultiAsset._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    )
        internal
        virtual
        override(RMRKMultiAsset, RMRKSoulboundAfterTransactions)
    {
        RMRKSoulboundAfterTransactions._afterTokenTransfer(from, to, tokenId);
        RMRKMultiAsset._afterTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundPerTokenMock is
    RMRKSoulboundPerToken,
    RMRKMultiAssetMock,
    Ownable
{
    mapping(uint256 => bool) soulboundExempt;

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKMultiAsset)
        returns (bool)
    {
        return
            RMRKSoulbound.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKMultiAsset, RMRKSoulbound) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKMultiAsset._beforeTokenTransfer(from, to, tokenId);
    }

    function setSoulbound(uint256 tokenId, bool state) public onlyOwner {
        _setSoulbound(tokenId, state);
    }
}
