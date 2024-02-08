// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    IRMRKRevealable
} from "../../../RMRK/extension/revealable/IRMRKRevealable.sol";
import {
    RMRKRevealable
} from "../../../RMRK/extension/revealable/RMRKRevealable.sol";
import {RMRKMultiAssetMock} from "../../RMRKMultiAssetMock.sol";
import {RMRKMultiAsset} from "../../../RMRK/multiasset/RMRKMultiAsset.sol";

contract RMRKMultiAssetRevealableMock is RMRKMultiAssetMock, RMRKRevealable {
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKMultiAsset, RMRKRevealable)
        returns (bool)
    {
        return
            RMRKMultiAsset.supportsInterface(interfaceId) ||
            RMRKRevealable.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc IRMRKRevealable
     */
    function setRevealer(address revealer) external {
        _setRevealer(revealer);
    }

    /**
     * @inheritdoc RMRKRevealable
     */
    function _addAndAcceptAssetToToken(
        uint256 tokenId,
        uint64 newAssetId,
        uint64 assetToReplaceId
    ) internal override {
        _addAssetToToken(tokenId, newAssetId, assetToReplaceId);
        _acceptAsset(tokenId, _pendingAssets[tokenId].length - 1, newAssetId);
    }

    /**
     * @inheritdoc RMRKRevealable
     */
    function _checkRevealPermissions(
        uint256[] memory tokenIds
    ) internal view override {
        uint256 length = tokenIds.length;
        for (uint256 i; i < length; ) {
            _onlyApprovedForAssetsOrOwner(tokenIds[i]);
            unchecked {
                ++i;
            }
        }
    }
}
