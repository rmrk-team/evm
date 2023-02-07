// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

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
        string memory name,
        string memory symbol,
        uint256 lastBlockToTransfer
    )
        RMRKMultiAssetMock(name, symbol)
        RMRKSoulboundAfterBlockNumber(lastBlockToTransfer)
    {}

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
    ) internal virtual override(RMRKCore, RMRKSoulbound) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundAfterTransactionsMock is
    RMRKSoulboundAfterTransactions,
    RMRKMultiAssetMock
{
    mapping(uint256 => bool) soulboundExempt;

    constructor(
        string memory name,
        string memory symbol,
        uint256 numberOfTransfers
    )
        RMRKMultiAssetMock(name, symbol)
        RMRKSoulboundAfterTransactions(numberOfTransfers)
    {}

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
    ) internal virtual override(RMRKCore, RMRKSoulbound) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKCore, RMRKSoulboundAfterTransactions) {
        super._afterTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundPerTokenMock is
    RMRKSoulboundPerToken,
    RMRKMultiAssetMock,
    Ownable
{
    mapping(uint256 => bool) soulboundExempt;

    constructor(
        string memory name,
        string memory symbol
    ) RMRKMultiAssetMock(name, symbol) {}

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
    ) internal virtual override(RMRKCore, RMRKSoulbound) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function setSoulbound(uint256 tokenId, bool state) public onlyOwner {
        _setSoulbound(tokenId, state);
    }
}
