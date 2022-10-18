// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../library/RMRKLib.sol";
import "../interfaces/IRMRKNesting.sol";
import "./ERC721Internal.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {NestingStorage} from "./Storage.sol";

import "hardhat/console.sol";

error RMRKChildIndexOutOfRange();
error RMRKDuplicateAdd();
error RMRKInvalidChildReclaim();
error RMRKIsNotContract();
error RMRKIsNotNestingImplementer();
error RMRKMaxPendingChildrenReached();
error RMRKMintToNonRMRKImplementer();
error RMRKNestingTransferToNonRMRKNestingImplementer();
error RMRKNotApprovedOrDirectOwner();
error RMRKTransferToSelf();
error RMRKParentChildMismatch();
error RMRKPendingChildIndexOutOfRange();

abstract contract RMRKNestingInternal is
    IRMRKNestingEventsAndStruct,
    ERC721Internal
{
    using RMRKLib for uint256;
    using Address for address;

    function getNestingState()
        internal
        pure
        returns (NestingStorage.State storage)
    {
        return NestingStorage.getState();
    }

    // ------------------------ Ownership ------------------------

    function _ownerOf(uint256 tokenId)
        internal
        view
        virtual
        override
        returns (address)
    {
        (address owner, uint256 ownerTokenId, bool isNft) = _rmrkOwnerOf(
            tokenId
        );

        if (isNft) {
            owner = IRMRKNesting(owner).ownerOf(ownerTokenId);
        }
        if (owner == address(0)) revert ERC721InvalidTokenId();
        return owner;
    }

    /**
     * @dev Returns the immediate provenance data of the current RMRK NFT. In the event the NFT is owned
     * by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the
     * contract address and tokenID of the owner NFT, as well as its isNft flag.
     */
    function _rmrkOwnerOf(uint256 tokenId)
        internal
        view
        virtual
        returns (
            address,
            uint256,
            bool
        )
    {
        RMRKOwner storage owner = getNestingState()._RMRKOwners[tokenId];
        if (owner.ownerAddress == address(0)) revert ERC721InvalidTokenId();

        return (owner.ownerAddress, owner.tokenId, owner.isNft);
    }

    function _isApprovedOrDirectOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        (address owner, uint256 parentTokenId, ) = _rmrkOwnerOf(tokenId);
        if (parentTokenId != 0) {
            return (spender == owner);
        }
        return (spender == owner ||
            _isApprovedForAll(owner, spender) ||
            _getApproved(tokenId) == spender);
    }

    /**
     * @notice Internal function for checking token ownership relative to immediate parent.
     * @dev This does not delegate to ownerOf, which returns the root owner.
     * Reverts if caller is not immediate owner.
     * Used for parent-scoped transfers.
     * @param tokenId tokenId to check owner against.
     */
    function _onlyApprovedOrDirectOwner(uint256 tokenId) private view {
        if (!_isApprovedOrDirectOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedOrDirectOwner();
    }

    modifier onlyApprovedOrDirectOwner(uint256 tokenId) {
        _onlyApprovedOrDirectOwner(tokenId);
        _;
    }

    /**
     * @dev Returns all confirmed children
     */

    function _childrenOf(uint256 parentTokenId)
        internal
        view
        returns (Child[] memory)
    {
        Child[] memory children = getNestingState()._children[parentTokenId];
        return children;
    }

    function _pendingChildrenOf(uint256 parentTokenId)
        internal
        view
        returns (Child[] memory)
    {
        Child[] memory pendingChildren = getNestingState()._pendingChildren[
            parentTokenId
        ];
        return pendingChildren;
    }

    function _childOf(uint256 parentTokenId, uint256 index)
        internal
        view
        returns (Child memory)
    {
        _isOverLength(parentTokenId, index, false);

        Child memory child = getNestingState()._children[parentTokenId][index];
        return child;
    }

    function _pendingChildOf(uint256 parentTokenId, uint256 index)
        internal
        view
        returns (Child memory)
    {
        _isOverLength(parentTokenId, index, true);

        Child memory child = getNestingState()._pendingChildren[parentTokenId][
            index
        ];
        return child;
    }

    function _hasChild(
        uint256 tokenId,
        address childContract,
        uint256 childTokenId
    )
        internal
        view
        returns (
            bool found,
            bool isPending,
            uint256 index
        )
    {
        _requireMinted(tokenId);

        NestingStorage.State storage ns = getNestingState();

        uint256 _index = ns._posInChildArray[childContract][childTokenId];

        if (_index > 0) {
            found = true;
            index = _index;

            Child memory _pendingChild = ns._pendingChildren[tokenId][index];

            if (
                _pendingChild.contractAddress == childContract &&
                _pendingChild.tokenId == childTokenId
            ) {
                isPending = true;
            }
        } else {
            (address parentContract, , bool isNft) = IRMRKNesting(childContract)
                .rmrkOwnerOf(childTokenId);

            if (isNft && parentContract == address(this)) {
                if (ns._children[tokenId].length > 0) {
                    Child memory child = ns._children[tokenId][0];
                    if (
                        child.contractAddress == childContract &&
                        child.tokenId == childTokenId
                    ) {
                        found = true;
                        return (found, isPending, index);
                    }
                }

                if (ns._pendingChildren[tokenId].length > 0) {
                    Child memory pendingChild = ns._pendingChildren[tokenId][0];
                    if (
                        pendingChild.contractAddress == childContract &&
                        pendingChild.tokenId == childTokenId
                    ) {
                        found = true;
                        isPending = true;
                    }
                }
            }
        }
    }

    // ------------------------ MINTING ------------------------

    function _mint(
        address to,
        uint256 tokenId,
        bool isNft,
        uint256 destinationId
    ) internal {
        if (to == address(0)) revert ERC721MintToTheZeroAddress();
        if (_exists(tokenId)) revert ERC721TokenAlreadyMinted();

        if (isNft) {
            _isNestingContract(to, 1);
        }

        _beforeTokenTransfer(address(0), to, tokenId);

        getState()._balances[to] += 1;

        if (isNft) {
            getNestingState()._RMRKOwners[tokenId] = RMRKOwner({
                ownerAddress: to,
                tokenId: destinationId,
                isNft: true
            });

            _sendToNFT(tokenId, to, destinationId);
        } else {
            getNestingState()._RMRKOwners[tokenId] = RMRKOwner({
                ownerAddress: to,
                tokenId: 0,
                isNft: false
            });
        }

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }

    function _mint(address to, uint256 tokenId) internal virtual override {
        _mint(to, tokenId, false, 0);
    }

    function _nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal virtual {
        _mint(to, tokenId, true, destinationId);
    }

    function _sendToNFT(
        uint256 tokenId,
        address to,
        uint256 destinationId
    ) private {
        IRMRKNesting destContract = IRMRKNesting(to);

        destContract.addChild(destinationId, tokenId);
    }

    // ------------------------ BURNING ------------------------

    function _burn(uint256 tokenId) internal virtual override {
        (address rmrkOwner, , ) = _rmrkOwnerOf(tokenId);
        address owner = _ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        ERC721Storage.State storage s = getState();
        NestingStorage.State storage ns = getNestingState();

        _approve(address(0), tokenId);
        _cleanApprovals(address(0), tokenId);

        s._balances[rmrkOwner] -= 1;
        delete ns._RMRKOwners[tokenId];
        delete ns._pendingChildren[tokenId];
        delete ns._children[tokenId];
        delete s._tokenApprovals[tokenId];

        _afterTokenTransfer(owner, address(0), tokenId);
        emit Transfer(owner, address(0), tokenId);
    }

    function _burnChild(uint256 tokenId, uint256 index) internal virtual {
        NestingStorage.State storage ns = getNestingState();

        if (ns._children[tokenId].length <= index)
            revert RMRKChildIndexOutOfRange();

        _removeItemByIndexAndUpdateLastChildIndex(ns._children[tokenId], index);

        Child memory child = ns._children[tokenId][index];
        IRMRKNesting(child.contractAddress).burn(child.tokenId);
    }

    // ------------------------ TRANSFERING ------------------------

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        _transfer(from, to, tokenId, false, 0);
    }

    function _nestTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal virtual {
        _transfer(from, to, tokenId, true, destinationId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId,
        bool isNft,
        uint256 destinationId
    ) private {
        (address directOwner, , ) = _rmrkOwnerOf(tokenId);
        if (directOwner != from) revert ERC721TransferFromIncorrectOwner();
        if (to == address(0)) revert ERC721TransferToTheZeroAddress();
        if (isNft) {
            _isNestingContract(to, 2);

            if (to == address(this) && tokenId == destinationId) {
                revert RMRKTransferToSelf();
            }
        }

        _beforeTokenTransfer(from, to, tokenId);

        getState()._balances[from] -= 1;
        _updateOwnerAndClearApprovals(
            tokenId,
            isNft ? destinationId : 0,
            to,
            isNft
        );
        getState()._balances[to] += 1;

        if (isNft) _sendToNFT(tokenId, to, destinationId);

        emit Transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
    }

    function _updateOwnerAndClearApprovals(
        uint256 tokenId,
        uint256 destinationId,
        address to,
        bool isNft
    ) internal {
        getNestingState()._RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: isNft
        });

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);
        _cleanApprovals(to, tokenId);
    }

    function _cleanApprovals(address owner, uint256 tokenId) internal virtual {}

    function _exists(uint256 tokenId)
        internal
        view
        virtual
        override
        returns (bool)
    {
        return
            getNestingState()._RMRKOwners[tokenId].ownerAddress != address(0);
    }

    // ------------------------ CHILD MANAGEMENT ------------------------

    function _unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) internal virtual {
        _isOverLength(tokenId, index, false);

        NestingStorage.State storage ns = getNestingState();

        Child memory child = ns._children[tokenId][index];
        address childContract = child.contractAddress;
        uint256 childTokenId = child.tokenId;

        delete ns._posInChildArray[child.contractAddress][child.tokenId];
        _removeItemByIndexAndUpdateLastChildIndex(ns._children[tokenId], index);

        if (to != address(0)) {
            IERC721(childContract).safeTransferFrom(
                address(this),
                to,
                childTokenId
            );
        }

        emit ChildUnnested(tokenId, childContract, childTokenId, index);
    }

    /**
     * @dev Adds an instance of Child to the pending children array for tokenId. This is hardcoded to be 128 by default.
     */
    function _addChildToPending(uint256 tokenId, Child memory child) internal {
        NestingStorage.State storage ns = getNestingState();
        uint256 len = ns._pendingChildren[tokenId].length;
        if (len < 128) {
            ns._posInChildArray[child.contractAddress][child.tokenId] = len;
            ns._pendingChildren[tokenId].push(child);
        } else {
            revert RMRKMaxPendingChildrenReached();
        }
    }

    /**
     * @dev Adds an instance of Child to the children array for tokenId.
     */
    function _addChildToChildren(uint256 tokenId, Child memory child) internal {
        NestingStorage.State storage ns = getNestingState();

        ns._posInChildArray[child.contractAddress][child.tokenId] = ns
            ._children[tokenId]
            .length;

        ns._children[tokenId].push(child);
    }

    // ------------------------ HELPERS ------------------------

    // For child storage array
    function _removeItemByIndex(Child[] storage array, uint256 index) internal {
        array[index] = array[array.length - 1];
        array.pop();
    }

    function _removeItemByIndexAndUpdateLastChildIndex(
        Child[] storage array,
        uint256 index
    ) internal {
        uint256 len = array.length;
        Child storage lastChild = array[len - 1];
        address lastChildContract = lastChild.contractAddress;
        uint256 lastChildTokenId = lastChild.tokenId;

        // after this operation, the last child will replace the target child position in `_children`/`_pendingChildren`
        _removeItemByIndex(array, index);

        // so have to change last child's index record in `posInChildArray`
        getNestingState()._posInChildArray[lastChildContract][
            lastChildTokenId
        ] = index;
    }

    function _isNestingContract(address contractAddress, uint256 errorIndex)
        internal
        view
    {
        if (!contractAddress.isContract()) revert RMRKIsNotContract();
        if (
            !IERC165(contractAddress).supportsInterface(
                type(IRMRKNesting).interfaceId
            )
        ) {
            if (errorIndex == 1) {
                revert RMRKMintToNonRMRKImplementer();
            } else if (errorIndex == 2) {
                revert RMRKNestingTransferToNonRMRKNestingImplementer();
            } else {
                revert RMRKIsNotNestingImplementer();
            }
        }
    }

    function _isOverLength(
        uint256 tokenId,
        uint256 index,
        bool isPending
    ) internal view {
        if (isPending) {
            if (getNestingState()._pendingChildren[tokenId].length <= index)
                revert RMRKPendingChildIndexOutOfRange();
        } else {
            if (getNestingState()._children[tokenId].length <= index)
                revert RMRKChildIndexOutOfRange();
        }
    }
}
