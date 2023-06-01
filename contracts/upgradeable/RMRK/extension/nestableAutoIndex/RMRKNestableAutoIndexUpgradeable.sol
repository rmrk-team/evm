// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../../RMRK/extension/nestableAutoIndex/IRMRKNestableAutoIndex.sol";
import "../../nestable/RMRKNestableUpgradeable.sol";

/**
 * @title RMRKNestableAutoIndexUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Nestable AutoIndex module.
 */
contract RMRKNestableAutoIndexUpgradeable is
    IRMRKNestableAutoIndex,
    RMRKNestableUpgradeable
{
    // Mapping of tokenId to childAddress to childId to index on the _pendingChildren array
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _pendingChildrenIndex;

    // Mapping of tokenId to childAddress to childId to index on the _activeChildren array
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _activeChildrenIndex;

    /**
     * @notice Initializes the contract and the inherited contracts.
     */
    function __RMRKNestableAutoIndexUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __RMRKNestableAutoIndexUpgradeable_init_unchained();
        __RMRKNestableUpgradeable_init(name_, symbol_);
    }

    function __RMRKNestableAutoIndexUpgradeable_init_unchained()
        internal
        onlyInitializing
    {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165, RMRKNestableUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IRMRKNestableAutoIndex).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId,
        bytes memory
    ) internal virtual override {
        _pendingChildrenIndex[tokenId][childAddress][
            childId
        ] = _pendingChildren[tokenId].length;
    }

    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual override {
        _activeChildrenIndex[parentId][childAddress][childId] = _activeChildren[
            parentId
        ].length;
        _removePendingChildIndex(parentId, childIndex);
    }

    function _beforeTransferChild(
        uint256 tokenId,
        uint256 childIndex,
        address,
        uint256,
        bool isPending,
        bytes memory
    ) internal virtual override {
        if (isPending) _removePendingChildIndex(tokenId, childIndex);
        else _removeActiveChildIndex(tokenId, childIndex);
    }

    function _removePendingChildIndex(
        uint256 parentId,
        uint256 childIndex
    ) private {
        // We need to update the childIndex for the last child since it will be swapped when removing this
        uint256 lastChildIndex = _pendingChildren[parentId].length - 1;
        Child memory lastChild = _pendingChildren[parentId][lastChildIndex];
        if (lastChildIndex == childIndex) {
            delete _pendingChildrenIndex[parentId][lastChild.contractAddress][
                lastChild.tokenId
            ];
        } else {
            _pendingChildrenIndex[parentId][lastChild.contractAddress][
                lastChild.tokenId
            ] = childIndex;
        }
    }

    function _removeActiveChildIndex(
        uint256 parentId,
        uint256 childIndex
    ) private {
        // We need to update the childIndex for the last child since it will be swapped when removing this
        uint256 lastChildIndex = _activeChildren[parentId].length - 1;
        Child memory lastChild = _activeChildren[parentId][lastChildIndex];
        if (lastChildIndex == childIndex) {
            delete _activeChildrenIndex[parentId][lastChild.contractAddress][
                lastChild.tokenId
            ];
        } else {
            _activeChildrenIndex[parentId][lastChild.contractAddress][
                lastChild.tokenId
            ] = childIndex;
        }
    }

    function acceptChild(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) public {
        _acceptChild(parentId, childAddress, childId);
    }

    function _acceptChild(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) internal {
        uint256 childIndex = _pendingChildrenIndex[parentId][childAddress][
            childId
        ];
        _acceptChild(parentId, childIndex, childAddress, childId);
    }

    function transferChild(
        uint256 tokenId,
        address to,
        uint256 destinationId,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
    ) public {
        _transferChild(
            tokenId,
            to,
            destinationId,
            childAddress,
            childId,
            isPending,
            data
        );
    }

    function _transferChild(
        uint256 tokenId,
        address to,
        uint256 destinationId,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
    ) internal {
        uint256 childIndex = isPending
            ? _pendingChildrenIndex[tokenId][childAddress][childId]
            : _activeChildrenIndex[tokenId][childAddress][childId];
        _transferChild(
            tokenId,
            to,
            destinationId,
            childIndex,
            childAddress,
            childId,
            isPending,
            data
        );
    }

    function ownerOf(
        uint256 tokenId
    )
        public
        view
        virtual
        override(IERC6059, RMRKNestableUpgradeable)
        returns (address)
    {
        return super.ownerOf(tokenId);
    }

    uint256[50] private __gap;
}
