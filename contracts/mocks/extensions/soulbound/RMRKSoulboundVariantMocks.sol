// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {Ownable} from "../../../RMRK/access/Ownable.sol";
import {
    RMRKSoulboundAfterBlockNumber
} from "../../../RMRK/extension/soulbound/RMRKSoulboundAfterBlockNumber.sol";
import {
    RMRKSoulboundAfterTransactions
} from "../../../RMRK/extension/soulbound/RMRKSoulboundAfterTransactions.sol";
import {RMRKMultiAsset} from "../../../RMRK/multiasset/RMRKMultiAsset.sol";
import {
    RMRKSoulboundPerToken
} from "../../../RMRK/extension/soulbound/RMRKSoulboundPerToken.sol";
import {RMRKMultiAssetMock} from "../../RMRKMultiAssetMock.sol";
import {
    RMRKSoulbound
} from "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";

contract RMRKSoulboundAfterBlockNumberMock is
    RMRKSoulboundAfterBlockNumber,
    RMRKMultiAssetMock
{
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
