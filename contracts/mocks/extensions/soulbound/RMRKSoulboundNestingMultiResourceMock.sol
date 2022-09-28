// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import "../../RMRKNestingMultiResourceMock.sol";

contract RMRKSoulboundNestingMultiResourceMock is
    RMRKSoulbound,
    RMRKNestingMultiResourceMock
{
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResourceMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKSoulbound, RMRKNestingMultiResource)
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
