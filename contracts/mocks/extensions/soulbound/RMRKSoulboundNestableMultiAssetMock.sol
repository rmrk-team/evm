// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKSoulbound
} from "../../../RMRK/extension/soulbound/RMRKSoulbound.sol";
import {RMRKNestable} from "../../../RMRK/nestable/RMRKNestable.sol";
import {
    RMRKNestableMultiAsset
} from "../../../RMRK/nestable/RMRKNestableMultiAsset.sol";
import {RMRKNestableMultiAssetMock} from "../../RMRKNestableMultiAssetMock.sol";

contract RMRKSoulboundNestableMultiAssetMock is
    RMRKSoulbound,
    RMRKNestableMultiAssetMock
{
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKNestableMultiAsset)
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
