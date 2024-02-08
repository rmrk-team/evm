// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKSoulbound
} from "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import {RMRKMultiAsset} from "../../../RMRK/multiasset/RMRKMultiAsset.sol";
import {RMRKMultiAssetMock} from "../../RMRKMultiAssetMock.sol";

contract RMRKSoulboundMultiAssetMock is RMRKSoulbound, RMRKMultiAssetMock {
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
