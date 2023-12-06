// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/Context.sol";
import "../../../RMRK/extension/revealable/IRMRKRevealer.sol";
import "../../RMRKMultiAssetMock.sol";

error AlreadyRevealed(uint256 tokenId);
error CallerIsNotRevealable();

contract RMRKRevealerMock is IRMRKRevealer, Context {
    uint64 private _revealedAssetId;
    address private _revealableContract;
    mapping(uint256 tokenId => bool revealed) private _revealed;

    constructor(uint64 revealedAssetId, address revealableContract) {
        _revealedAssetId = revealedAssetId;
        _revealableContract = revealableContract;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return interfaceId == type(IRMRKRevealer).interfaceId;
    }

    /**-
     * @inheritdoc IRMRKRevealer
     */
    function getRevealableTokens(
        uint256[] memory tokenIds
    ) external view returns (bool[] memory revealable) {
        uint256 length = tokenIds.length;
        revealable = new bool[](length);
        for (uint256 i; i < length; ) {
            revealable[i] = !_revealed[tokenIds[i]];
            unchecked {
                ++i;
            }
        }
    }

    /**-
     * @inheritdoc IRMRKRevealer
     */
    function reveal(
        uint256[] memory tokenIds
    )
        external
        returns (
            uint64[] memory revealedAssetsIds,
            uint64[] memory assetsToReplaceIds
        )
    {
        if (_msgSender() != _revealableContract) {
            revert CallerIsNotRevealable();
        }
        uint256 length = tokenIds.length;
        revealedAssetsIds = new uint64[](length);
        assetsToReplaceIds = new uint64[](length);
        for (uint256 i; i < length; ) {
            uint256 tokenId = tokenIds[i];
            if (_revealed[tokenId]) {
                revert AlreadyRevealed(tokenId);
            }
            _revealed[tokenId] = true;
            uint64[] memory activeAssets = RMRKMultiAssetMock(_msgSender())
                .getActiveAssets(tokenId);
            // Asumes that the token has at least one asset
            revealedAssetsIds[i] = _revealedAssetId;
            assetsToReplaceIds[i] = activeAssets[0];
            unchecked {
                ++i;
            }
        }
        emit Revealed(tokenIds, revealedAssetsIds, assetsToReplaceIds);
    }
}
