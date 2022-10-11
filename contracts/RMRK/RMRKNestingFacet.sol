// SPDX-License-Identifier: Apache-2.0

// RMRKNesting facet style which could be used alone

pragma solidity ^0.8.15;

import "./interfaces/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "./interfaces/IRMRKNesting.sol";
import "./library/RMRKLib.sol";
import "./internalFunctionSet/RMRKNestingInternal.sol";

contract RMRKNestingFacet is
    IERC165,
    IERC721,
    IERC721Metadata,
    IRMRKNesting,
    RMRKNestingInternal
{
    using RMRKLib for uint256;
    using Address for address;
    using Strings for uint256;

    constructor(string memory name_, string memory symbol_) {
        ERC721Storage.State storage s = getState();
        s._name = name_;
        s._symbol = symbol_;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IRMRKNesting).interfaceId;
    }

    // ------------------------ Metadata ------------------------

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return getState()._name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return getState()._symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return _tokenURI(tokenId);
    }

    // ------------------------ Ownership ------------------------

    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override(IERC721, IRMRKNesting)
        returns (address)
    {
        return _ownerOf(tokenId);
    }

    /**
    @dev Returns the immediate provenance data of the current RMRK NFT. In the event the NFT is owned
    * by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the
    * contract address and tokenID of the owner NFT, as well as its isNft flag.
    */
    function rmrkOwnerOf(uint256 tokenId)
        public
        view
        virtual
        returns (
            address,
            uint256,
            bool
        )
    {
        return _rmrkOwnerOf(tokenId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _balanceOf(owner);
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        if (to == owner) revert ERC721ApprovalToCurrentOwner();

        if (_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert ERC721ApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        return _getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _isApprovedForAll(owner, operator);
    }

    // ------------------------ BURNING ------------------------

    function burnChild(uint256 tokenId, uint256 index)
        public
        onlyApprovedOrDirectOwner(tokenId)
    {
        _burnChild(tokenId, index);
    }

    function burn(uint256 tokenId)
        public
        virtual
        onlyApprovedOrDirectOwner(tokenId)
    {
        _burn(tokenId);
    }

    // ------------------------ TRANSFERING ------------------------

    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual onlyApprovedOrDirectOwner(tokenId) {
        _transfer(from, to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId);
    }

    function nestTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual onlyApprovedOrDirectOwner(tokenId) {
        _nestTransfer(from, to, tokenId, destinationId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override onlyApprovedOrDirectOwner(tokenId) {
        _safeTransfer(from, to, tokenId, data);
    }

    // ------------------------ CHILD MANAGEMENT PUBLIC ------------------------

    /**
     * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
     * @param parentTokenId is the tokenId of the parent token on (this).
     * @param childTokenId is the tokenId of the child instance
     */
    function addChild(uint256 parentTokenId, uint256 childTokenId)
        public
        virtual
    {
        address childTokenAddress = _msgSender();
        _isNestingContract(childTokenAddress, 0);

        (bool isDuplicate, , ) = hasChild(
            parentTokenId,
            childTokenAddress,
            childTokenId
        );
        if (isDuplicate) revert RMRKDuplicateAdd();

        IRMRKNesting childTokenContract = IRMRKNesting(childTokenAddress);
        (address _parentContract, uint256 _parentTokenId, ) = childTokenContract
            .rmrkOwnerOf(childTokenId);
        if (_parentContract != address(this) || _parentTokenId != parentTokenId)
            revert RMRKParentChildMismatch();

        uint256 length = getNestingState()
            ._pendingChildren[parentTokenId]
            .length;

        Child memory child = Child({
            contractAddress: childTokenAddress,
            tokenId: childTokenId
        });

        _addChildToPending(parentTokenId, child);
        emit ChildProposed(
            parentTokenId,
            child.contractAddress,
            child.tokenId,
            length
        );
    }

    /**
     * @dev Sends an instance of Child from the pending children array at index to children array for tokenId.
     */
    function acceptChild(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedOrOwner(tokenId)
    {
        _isOverLength(tokenId, index, true);

        Child memory child = getNestingState()._pendingChildren[tokenId][index];

        _removeItemByIndexAndUpdateLastChildIndex(
            getNestingState()._pendingChildren[tokenId],
            index
        );

        _addChildToChildren(tokenId, child);
        emit ChildAccepted(
            tokenId,
            child.contractAddress,
            child.tokenId,
            index
        );
    }

    /**
     * @notice Deletes a single child from the pending array by index.
     * @param tokenId tokenId whose pending child is to be rejected
     * @param index index on tokenId pending child array to reject
     * @param to if an address which is not the zero address is passed, this will attempt to transfer
     * the child to `to` via a call-in to the child address.
     * @dev If `to` is the zero address, the child's ownership structures will not be updated, resulting in an
     * 'orphaned' child. If a call with a populated `to` field fails, call this function with `to` set to the
     * zero address to orphan the child. Orphaned children can be reclaimed by a call to reclaimChild on this
     * contract by the root owner.
     */
    function rejectChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _isOverLength(tokenId, index, true);

        RMRKNestingStorage.State storage ns = getNestingState();

        Child storage pendingChild = ns._pendingChildren[tokenId][index];
        address childContract = pendingChild.contractAddress;
        uint256 childTokenId = pendingChild.tokenId;

        _removeItemByIndexAndUpdateLastChildIndex(
            ns._pendingChildren[tokenId],
            index
        );

        if (to != address(0)) {
            IERC721(childContract).safeTransferFrom(
                address(this),
                to,
                childTokenId
            );
        }

        emit ChildRejected(tokenId, childContract, childTokenId, index);
    }

    /**
     * @notice Deletes all pending children.
     * @dev This does not update the ownership storage data on children. If necessary, ownership
     * can be reclaimed by the rootOwner of the previous parent (this).
     */
    function rejectAllChildren(uint256 tokenId)
        public
        virtual
        onlyApprovedOrOwner(tokenId)
    {
        RMRKNestingStorage.State storage ns = getNestingState();
        for (uint256 i; i < ns._pendingChildren[tokenId].length; ++i) {
            Child memory child = ns._pendingChildren[tokenId][i];
            address childContract = child.contractAddress;
            uint256 childTokenId = child.tokenId;

            delete ns._posInChildArray[childContract][childTokenId];
        }
        delete getNestingState()._pendingChildren[tokenId];

        emit AllChildrenRejected(tokenId);
    }

    /**
     * @notice Function to unnest a child from the active token array.
     * @param tokenId is the tokenId of the parent token to unnest from.
     * @param index is the index of the child token ID.
     * @param to is the address to transfer this
     */
    function unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _unnestChild(tokenId, index, to);
    }

    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) public onlyApprovedOrOwner(tokenId) {
        (address owner, uint256 ownerTokenId, bool isNft) = IRMRKNesting(
            childAddress
        ).rmrkOwnerOf(childTokenId);

        (bool inChildrenOrPending, , ) = hasChild(
            tokenId,
            childAddress,
            childTokenId
        );

        if (
            owner != address(this) ||
            ownerTokenId != tokenId ||
            !isNft ||
            inChildrenOrPending
        ) revert RMRKInvalidChildReclaim();

        IERC721(childAddress).safeTransferFrom(
            address(this),
            _msgSender(),
            childTokenId
        );
    }

    // ------------------------ CHILD MANAGEMENT GETTERS ------------------------

    /**
    @dev Returns all confirmed children
    */

    function childrenOf(uint256 parentTokenId)
        public
        view
        returns (Child[] memory)
    {
        return _childrenOf(parentTokenId);
    }

    /**
    @dev Returns all pending children
    */

    function pendingChildrenOf(uint256 parentTokenId)
        public
        view
        returns (Child[] memory)
    {
        return _pendingChildrenOf(parentTokenId);
    }

    function childOf(uint256 parentTokenId, uint256 index)
        external
        view
        returns (Child memory)
    {
        return _childOf(parentTokenId, index);
    }

    function pendingChildOf(uint256 parentTokenId, uint256 index)
        external
        view
        returns (Child memory)
    {
        return _pendingChildOf(parentTokenId, index);
    }

    function hasChild(
        uint256 tokenId,
        address childContract,
        uint256 childTokenId
    )
        public
        view
        returns (
            bool found,
            bool isPending,
            uint256 index
        )
    {
        return _hasChild(tokenId, childContract, childTokenId);
    }
}
