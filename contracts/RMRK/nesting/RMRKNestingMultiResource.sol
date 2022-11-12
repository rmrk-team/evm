// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.16;

import "../multiresource/AbstractMultiResource.sol";
import "./IRMRKNesting.sol";
import "./RMRKNesting.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// import "hardhat/console.sol";

/**
 * @title RMRKNestingMultiResource
 * @author RMRK team
 * @notice Smart contract of the joined RMRK Nesting and Multi resource module.
 */
contract RMRKNestingMultiResource is RMRKNesting, AbstractMultiResource {
    // ------------------- RESOURCES --------------

    // Mapping from token ID to approver address to approved address for resources
    // The approver is necessary so approvals are invalidated for nested children on transfer
    // WARNING: If a child NFT returns the original root owner, old permissions would be active again
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForResources;

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the resources on the given token.
     * @dev If the caller is not the owner of the given token or approved by its owner to manage the resources on the
     *  given token, the execution will be reverted.
     * @param tokenId ID of the token being checked
     */
    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the resources on the given token.
     * @param tokenId ID of the token being checked
     */
    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` of the token collection.
     */
    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_)
    {}

    /**
     * @inheritdoc IERC165
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

    /**
     * @notice Accepts a resource from the pending array of given token.
     * @dev Migrates the resource from the token's pending resource array to the token's active resource array.
     * @dev Active resources cannot be removed by anyone, but can be replaced by a new resource.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending resource array.
     * @dev Emits an {ResourceAccepted} event.
     * @param tokenId ID of the token for which to accept the pending resource
     * @param index Index of the resource in the pending array to accept
     * @param resourceId ID of the resource expected to be located at the specified index
     */
    function acceptResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) public virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _acceptResource(tokenId, index, resourceId);
    }

    /**
     * @notice Rejects a resource from the pending array of given token.
     * @dev Removes the resource from the token's pending resource array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending resource array.
     * @dev Emits a {ResourceRejected} event.
     * @param tokenId ID of the token that the resource is being rejected from
     * @param index Index of the resource in the pending array to be rejected
     * @param resourceId ID of the resource expected to be located at the specified index
     */
    function rejectResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) public virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectResource(tokenId, index, resourceId);
    }

    /**
     * @notice Rejects all resources from the pending array of a given token.
     * @dev Effecitvely deletes the pending array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - If there are more resouces than `maxRejections`, the execution will be reverted
     * @dev Emits a {ResourceRejected} event with resourceId = 0.
     * @param tokenId ID of the token of which to clear the pending array
     * @param maxRejections The maximum amount of resources to reject
     */
    function rejectAllResources(uint256 tokenId, uint256 maxRejections)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId, maxRejections);
    }

    /**
     * @notice Sets a new priority array for a given token.
     * @dev The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest
     *  priority.
     * @dev Value `0` of a priority is a special case equivalent to unitialized.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - The length of `priorities` must be equal the length of the active resources array.
     * @dev Emits a {ResourcePrioritySet} event.
     * @param tokenId ID of the token to set the priorities for
     * @param priorities An array of priorities of active resources. The succesion of items in the priorities array
     *  matches that of the succesion of items in the active array
     */
    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    // ----------------------- APPROVALS FOR RESOURCES ------------------------

    /**
     * @notice Used to grant permission to the user to manage token's resources.
     * @dev This differs from transfer approvals, as approvals are not cleared when the approved party accepts or
     *  rejects a resource, or sets resource priorities. This approval is cleared on token transfer.
     * @dev Only a single account can be approved at a time, so approving the `0x0` address clears previous approvals.
     * @dev Requirements:
     *
     *  - The caller must own the token or be an approved operator.
     *  - `tokenId` must exist.
     * @dev Emits an {ApprovalForResources} event.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval to manage the resources is granted
     */
    function approveForResources(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForResourcesToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForResources(owner, _msgSender())
        ) revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(to, tokenId);
    }

    /**
     * @notice Used to retrieve the address of the account approved to manage resources of a given token.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @param tokenId ID of the token for which to retrieve the approved address
     * @return address Address of the account that is approved to manage the specified token's resources
     */
    function getApprovedForResources(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);
        return _tokenApprovalsForResources[tokenId][ownerOf(tokenId)];
    }

    /**
     * @notice Used to grant an approval to an address to manage resources of a given token.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval is being given
     */
    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        address owner = ownerOf(tokenId);
        _tokenApprovalsForResources[tokenId][owner] = to;
        emit ApprovalForResources(owner, to, tokenId);
    }

    /**
     * @notice Used to remove approvals to manage the resources for a given token.
     * @param tokenId ID of the token for which to clear the approvals 
     */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        _approveForResources(address(0), tokenId);
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    /**
     * @notice Internal function to check whether the queried user is either:
     *   1. The root owner of the token associated with `tokenId`.
     *   2. Is approved for all resources of the current owner via the `setApprovalForAllForResources` function.
     *   3. Is granted approval for the specific tokenId for resource management via the `approveForResources` function.
     * @param user Address of the user we are checking for permission
     * @param tokenId ID of the token to query for permission for a given `user`
     * @return bool A boolean value indicating whether the user is approved to manage the token or not
     */
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
