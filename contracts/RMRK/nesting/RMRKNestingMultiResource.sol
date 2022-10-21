// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../multiresource/AbstractMultiResource.sol";
import "./IRMRKNesting.sol";
import "./RMRKNesting.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// import "hardhat/console.sol";

/**
 * @dev Mid-level contract implementing multiresource on top of nesting.
 *
 */

contract RMRKNestingMultiResource is RMRKNesting, AbstractMultiResource {
    // ------------------- RESOURCES --------------

    // Mapping from token ID to approver address to approved address for resources
    // The approver is necessary so approvals are invalidated for nested children on transfer
    // WARNING: If a child NFT returns the original root owner, old permissions would be active again
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForResources;

    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNesting)
        returns (bool)
    {
        return
            RMRKNesting.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKMultiResource).interfaceId;
    }

    // ------------------------------- RESOURCES ------------------------------

    // --------------------------- HANDLING RESOURCES -------------------------

    function acceptResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId);
    }

    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    // ----------------------- APPROVALS FOR RESOURCES ------------------------

    function approveForResources(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForResourcesToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForResources(owner, _msgSender())
        ) revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(to, tokenId);
    }

    function getApprovedForResources(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);
        return _tokenApprovalsForResources[tokenId][ownerOf(tokenId)];
    }

    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        address owner = ownerOf(tokenId);
        _tokenApprovalsForResources[tokenId][owner] = to;
        emit ApprovalForResources(owner, to, tokenId);
    }

    function _cleanApprovals(uint256 tokenId) internal virtual override {
        _approveForResources(address(0), tokenId);
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = ownerOf(tokenId);
        return (user == owner ||
            isApprovedForAllForResources(owner, user) ||
            getApprovedForResources(tokenId) == user);
    }
}
