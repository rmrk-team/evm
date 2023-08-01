// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
// import "../../../RMRK/equippable/RMRKEquippable.sol";
import "../../RMRKEquippableMock.sol";

contract RMRKSoulboundEquippableMock is RMRKSoulbound, RMRKEquippableMock {
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKEquippable)
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
    ) internal virtual override(RMRKNestable, RMRKSoulbound) {
        RMRKSoulbound._beforeTokenTransfer(from, to, tokenId);
        RMRKNestable._beforeTokenTransfer(from, to, tokenId);
    }
}
