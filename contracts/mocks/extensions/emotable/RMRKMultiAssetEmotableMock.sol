// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/multiasset/RMRKMultiAsset.sol";
import "../../../RMRK/extension/emotable/RMRKEmotable.sol";

contract RMRKMultiAssetEmotableMock is RMRKEmotable, RMRKMultiAsset {
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKEmotable, RMRKMultiAsset)
        returns (bool)
    {
        return
            RMRKEmotable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function emote(uint256 tokenId, bytes4 emoji, bool on) public {
        _emote(tokenId, emoji, on);
    }

    function _beforeEmote(
        uint256 tokenId,
        bytes4,
        bool
    ) internal view override {
        _requireMinted(tokenId);
    }
}
