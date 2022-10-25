// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import "../../RMRKMultiResourceMock.sol";

contract RMRKSoulboundMultiResourceMock is
    RMRKSoulbound,
    RMRKMultiResourceMock
{
    constructor(string memory name, string memory symbol)
        RMRKMultiResourceMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKSoulbound, RMRKMultiResource)
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
