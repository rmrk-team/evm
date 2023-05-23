// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/multiasset/RMRKMultiAssetUpgradeable.sol";
import "../../../RMRK/extension/emotable/RMRKEmotableUpgradeable.sol";

contract RMRKMultiAssetEmotableMockUpgradeable is
    RMRKEmotableUpgradeable,
    RMRKMultiAssetUpgradeable
{
    function __RMRKMultiAssetEmotableMockUpgradeable_init(
        string memory name,
        string memory symbol
    ) public onlyInitializing {
        __RMRKMultiAssetUpgradeable_init(name, symbol);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKEmotableUpgradeable, RMRKMultiAssetUpgradeable)
        returns (bool)
    {
        return
            RMRKEmotableUpgradeable.supportsInterface(interfaceId) ||
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
