// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import "../../RMRKNestableMock.sol";

contract RMRKSemiSoulboundNestableMock is RMRKSoulbound, RMRKNestableMock {
    mapping(uint256 => bool) soulboundExempt;

    constructor(string memory name, string memory symbol)
        RMRKNestableMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKSoulbound, RMRKNestable)
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

    // This shows how the method can be overwritten for custom soulbound logic
    function isSoulbound(uint256 tokenId) public view override returns (bool) {
        return !soulboundExempt[tokenId];
    }

    function setSoulboundExempt(uint256 tokenId) public {
        soulboundExempt[tokenId] = true;
    }
}
