// SPDX-License-Identifier: Apache-2.0

// RMRKMR facet style which could be used alone

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./interfaces/IERC721Metadata.sol";

import "./internalFunctionSet/RMRKEquippableInternal.sol";
import "./interfaces/IRMRKMultiResource.sol";
import "./library/RMRKLib.sol";
import "./library/RMRKMultiResourceRenderUtils.sol";

// !!!
// Before use, make sure you know the description below
// !!!
/**
    @dev NOTE that MultiResource take NFT as a real unique item on-chain,
    so if you `burn` a NFT, it means that you NEVER wanna `mint` it again,
    if you do so, you are trying to raising the soul of a dead man
    (the `activeResources` etc. of this burned token will not be removed when `burn`),
    instead of creating a new life by using a empty shell.
    You are responsible for any unknown consequences of this action, so take care of
    `mint` logic in your own implementer.
 */

contract RMRKEquippableMultiResourceFacet is
    IERC165,
    IERC721,
    IERC721Metadata,
    IRMRKMultiResource,
    RMRKEquippableInternal
{
    using RMRKLib for uint256;
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
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
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IRMRKMultiResource).interfaceId;
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
        override
        returns (address)
    {
        return _ownerOf(tokenId);
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

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        _onlyApprovedOrOwner(tokenId);

        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        _onlyApprovedOrOwner(tokenId);
        _safeTransfer(from, to, tokenId, data);
    }

    // ------------------------ RESOURCES ------------------------

    function acceptResource(uint256 tokenId, uint256 index)
        external
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index)
        external
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId)
        external
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId);
    }

    function setPriority(uint256 tokenId, uint16[] memory priorities)
        external
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    function approveForResources(address to, uint256 tokenId) external virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForResourcesToCurrentOwner();

        if (
            _msgSender() != owner &&
            !_isApprovedForAllForResources(owner, _msgSender())
        ) revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();

        _approveForResources(to, tokenId);
    }

    function setApprovalForAllForResources(address operator, bool approved)
        external
        virtual
    {
        address owner = _msgSender();
        if (owner == operator) revert RMRKApproveForResourcesToCaller();

        _setApprovalForAllForResources(owner, operator, approved);
    }

    function getResourceMeta(uint64 resourceId)
        public
        view
        virtual
        returns (string memory)
    {
        return _getResourceMeta(resourceId);
    }

    function getResourceMetaForToken(uint256 tokenId, uint64 resourceIndex)
        public
        view
        virtual
        returns (string memory)
    {
        return _getResourceMetaForToken(tokenId, resourceIndex);
    }

    function getActiveResources(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _getActiveResources(tokenId);
    }

    function getPendingResources(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _getPendingResources(tokenId);
    }

    function getActiveResourcePriorities(uint256 tokenId)
        public
        view
        virtual
        returns (uint16[] memory)
    {
        return _getActiveResourcePriorities(tokenId);
    }

    function getResourceOverwrites(uint256 tokenId, uint64 resourceId)
        public
        view
        virtual
        returns (uint64)
    {
        return _getResourceOverwrites(tokenId, resourceId);
    }

    function getApprovedForResources(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        return _getApprovedForResources(tokenId);
    }

    function isApprovedForAllForResources(address owner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _isApprovedForAllForResources(owner, operator);
    }

    function getAllResources() public view virtual returns (uint64[] memory) {
        return _getAllResources();
    }

    function getFullResources(uint256 tokenId)
        external
        view
        virtual
        returns (Resource[] memory)
    {
        return _getFullResources(tokenId);
    }

    function getFullPendingResources(uint256 tokenId)
        external
        view
        virtual
        returns (Resource[] memory)
    {
        return _getFullPendingResources(tokenId);
    }
}
