// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../../../RMRK/extension/revealable/IRMRKRevealer.sol";
import "../../RMRKMultiAssetMock.sol";

contract RMRKRevealerMock is IRMRKRevealer {
    uint64 public revealedAssetId;

    constructor(uint64 revealedAssetId_) {
        revealedAssetId = revealedAssetId_;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return interfaceId == type(IRMRKRevealer).interfaceId;
    }

    /**
     * @inheritdoc IRMRKRevealer
     */
    function getRevealedAssets(
        uint256[] memory tokenIds
    )
        external
        view
        returns (
            uint64[] memory revealedAssetIds,
            uint64[] memory assetToReplaceIds
        )
    {
        uint256 length = tokenIds.length;
        revealedAssetIds = new uint64[](length);
        assetToReplaceIds = new uint64[](length);
        for (uint256 i; i < length; ) {
            uint256 tokenId = tokenIds[i];
            uint64[] memory activeAssets = RMRKMultiAssetMock(msg.sender)
                .getActiveAssets(tokenId);
            // Asumes that the token has at least one asset
            revealedAssetIds[i] = revealedAssetId;
            assetToReplaceIds[i] = activeAssets[0];
            unchecked {
                ++i;
            }
        }
    }
}
