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

    function burn(uint256 tokenId)
        public
        virtual
        onlyApprovedOrDirectOwner(tokenId)
        returns (uint256)
    {
        return _burn(tokenId, 0);
    }

    function burn(uint256 tokenId, uint256 maxRecursiveBurns)
        public
        virtual
        onlyApprovedOrDirectOwner(tokenId)
        returns (uint256)
    {
        return _burn(tokenId, maxRecursiveBurns);
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
        _addChild(parentTokenId, childTokenId);
    }

    /**
     * @dev Sends an instance of Child from the pending children array at index to children array for tokenId.
     */
    function acceptChild(
        uint256 tokenId,
        address childContractAddress,
        uint256 childTokenId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _acceptChild(tokenId, childContractAddress, childTokenId);
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
        NestingStorage.State storage ns = getNestingState();
        for (uint256 i; i < ns._pendingChildren[tokenId].length; ) {
            Child memory child = ns._pendingChildren[tokenId][i];
            address childContract = child.contractAddress;
            uint256 childTokenId = child.tokenId;

            delete ns._posInChildArray[childContract][childTokenId];

            unchecked {
                ++i;
            }
        }
        delete getNestingState()._pendingChildren[tokenId];

        emit AllChildrenRejected(tokenId);
    }

    function unnestChild(
        uint256 tokenId,
        address to,
        address childContractAddress,
        uint256 childTokenId,
        bool isPending
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _unnestChild(
            tokenId,
            to,
            childContractAddress,
            childTokenId,
            isPending
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
}
