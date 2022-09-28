// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../core/RMRKCore.sol";
import "./IRMRKSoulbound.sol";

error RMRKCannotTransferSoulbound();

abstract contract RMRKSoulbound is IRMRKSoulbound, RMRKCore {
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (
            from != address(0) && // Exclude minting
            to != address(0) && // Exclude Burning
            isSoulbound(tokenId)
        ) revert RMRKCannotTransferSoulbound();

        super._beforeTokenTransfer(from, to, tokenId);
    }

    function isSoulbound(uint256) public view virtual returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return interfaceId == type(IRMRKSoulbound).interfaceId;
    }
}
