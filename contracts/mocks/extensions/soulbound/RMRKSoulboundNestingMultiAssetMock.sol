// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import "../../RMRKNestingMultiAssetMock.sol";

contract RMRKSoulboundNestingMultiAssetMock is
    RMRKSoulbound,
    RMRKNestingMultiAssetMock
{
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiAssetMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKSoulbound, RMRKNestingMultiAsset)
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
