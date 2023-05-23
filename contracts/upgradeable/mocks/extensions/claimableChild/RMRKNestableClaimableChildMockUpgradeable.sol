// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/extension/reclaimableChild/RMRKReclaimableChildUpgradeable.sol";
import "../../RMRKNestableMockUpgradeable.sol";

error RMRKTokenHasNoAssetsWithType();

contract RMRKNestableClaimableChildMockUpgradeable is
    RMRKNestableMockUpgradeable,
    RMRKReclaimableChildUpgradeable
{
    function __RMRKNestableClaimableChildMockUpgradeable_init(
        string memory name,
        string memory symbol
    ) public onlyInitializing {
        __RMRKNestableUpgradeable_init(name, symbol);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKNestableUpgradeable, RMRKReclaimableChildUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId,
        bytes memory data
    )
        internal
        virtual
        override(RMRKNestableUpgradeable, RMRKReclaimableChildUpgradeable)
    {
        super._beforeAddChild(tokenId, childAddress, childId, data);
    }

    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    )
        internal
        virtual
        override(RMRKNestableUpgradeable, RMRKReclaimableChildUpgradeable)
    {
        super._beforeAcceptChild(parentId, childIndex, childAddress, childId);
    }

    function _beforeTransferChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
    )
        internal
        virtual
        override(RMRKNestableUpgradeable, RMRKReclaimableChildUpgradeable)
    {
        super._beforeTransferChild(
            tokenId,
            childIndex,
            childAddress,
            childId,
            isPending,
            data
        );
    }

    function _beforeNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId,
        bytes memory data
    ) internal override(RMRKNestableMockUpgradeable, RMRKNestableUpgradeable) {
        super._beforeNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId,
            data
        );
    }

    function _afterNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId,
        bytes memory data
    ) internal override(RMRKNestableMockUpgradeable, RMRKNestableUpgradeable) {
        super._afterNestedTokenTransfer(
            from,
            to,
            fromTokenId,
            toTokenId,
            tokenId,
            data
        );
    }
}
