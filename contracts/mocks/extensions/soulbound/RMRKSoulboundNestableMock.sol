// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import "../../RMRKNestableMock.sol";

contract RMRKSoulboundNestableMock is RMRKSoulbound, RMRKNestableMock {
    constructor(
        string memory name,
        string memory symbol
    ) RMRKNestableMock(name, symbol) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(RMRKSoulbound, RMRKNestable) returns (bool) {
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
