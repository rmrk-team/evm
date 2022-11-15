// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKMultiResourceEventsAndStruct {
    /**
     * @notice Used to notify listeners that a resource object is initialized at `resourceId`.
     * @param resourceId ID of the resource that was initialized
     */
    event ResourceSet(uint64 indexed resourceId);

    /**
     * @notice Used to notify listeners that a resource object at `resourceId` is added to token's pending resource
     *  array.
     * @param tokenId ID of the token that received a new pending resource
     * @param resourceId ID of the resource that has been added to the token's pending resources array
     * @param overwritesId ID of the resource that would be overwritten
     */
    event ResourceAddedToToken(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed overwritesId
    );

    /**
     * @notice Used to notify listeners that a resource object at `resourceId` is accepted by the token and migrated
     *  from token's pending resources array to active resources array of the token.
     * @param tokenId ID of the token that had a new resource accepted
     * @param resourceId ID of the resource that was accepted
     * @param overwritesId ID of the resource that would be overwritten
     */
    event ResourceAccepted(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed overwritesId
    );

    /**
     * @notice Used to notify listeners that a resource object at `resourceId` is rejected from token and is dropped
     *  from the pending resources array of the token.
     * @param tokenId ID of the token that had a resource rejected
     * @param resourceId ID of the resource that was rejected
     */
    event ResourceRejected(uint256 indexed tokenId, uint64 indexed resourceId);

    /**
     * @notice Used to notify listeners that token's prioritiy array is reordered.
     * @param tokenId ID of the token that had the resource priority array updated
     */
    event ResourcePrioritySet(uint256 indexed tokenId);

    /**
     * @notice Used to notify listeners that owner has granted an approval to the user to manage the resources of a
     *  given token.
     * @dev Approvals must be cleared on transfer
     * @param owner Address of the account that has granted the approval for all token's resources
     * @param approved Address of the account that has been granted approval to manage the token's resources
     * @param tokenId ID of the token on which the approval was granted
     */
    event ApprovalForResources(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );

    /**
     * @notice Used to notify listeners that owner has granted approval to the user to manage resources of all of their
     *  tokens.
     * @param owner Address of the account that has granted the approval for all resources on all of their tokens
     * @param operator Address of the account that has been granted the approval to manage the token's resources on all of the
     *  tokens
     * @param approved Boolean value signifying whether the permission has been granted (`true`) or revoked (`false`)
     */
    event ApprovalForAllForResources(
        address indexed owner,
        address indexed operator,
        bool approved
    );
}

interface IRMRKMultiResource is IERC165, IRMRKMultiResourceEventsAndStruct {
    /**
     * @notice Accepts a resource which id is `resourceId` in pending array of `tokenId`.
     * Migrates the resource from the token's pending resource array to the active resource array.
     *
     * Active resources cannot be removed by anyone, but can be replaced by a new resource.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     * - `resourceId` must exist.
     *
     * Emits an {ResourceAccepted} event.
     */
    function acceptResource(uint256 tokenId, uint64 resourceId) external;

    /**
     * @notice Rejects a resource which id is `resourceId` in pending array of `tokenId`.
     * Removes the resource from the token's pending resource array.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     * - `resourceId` must exist.
     *
     * Emits a {ResourceRejected} event.
     */
    function rejectResource(uint256 tokenId, uint64 resourceId) external;

    /**
     * @notice Rejects all resources from the pending array of `tokenId`.
     * Effecitvely deletes the array.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits a {ResourceRejected} event with resourceId = 0.
     */
    function rejectAllResources(uint256 tokenId) external;

    /**
     * @notice Sets a new priority array on `tokenId`.
     * The priority array is a non-sequential list of uint16s, where lowest uint64 is considered highest priority.
     * `0` priority is a special case which is equibvalent to unitialized.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     * - The length of `priorities` must be equal to the length of the active resources array.
     *
     * Emits a {ResourcePrioritySet} event.
     */
    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        external;

    /**
     * @notice Returns IDs of active resources of `tokenId`.
     * Resource data is stored by reference, in order to access the data corresponding to the id, call `getResourceMeta(resourceId)`
     */
    function getActiveResources(uint256 tokenId)
        external
        view
        returns (uint64[] memory);

    /**
     * @notice Returns IDs of pending resources of `tokenId`.
     * Resource data is stored by reference, in order to access the data corresponding to the id, call `getResourceMeta(resourceId)`
     */
    function getPendingResources(uint256 tokenId)
        external
        view
        returns (uint64[] memory);

    /**
     * @notice Returns priorities of active resources of `tokenId`.
     */
    function getActiveResourcePriorities(uint256 tokenId)
        external
        view
        returns (uint16[] memory);

    //TODO: review definition
    /**
     * @notice Returns the resource which will be overridden if resourceId is accepted from
     * a pending resource array on `tokenId`.
     * Resource data is stored by reference, in order to access the data corresponding to the id, call `getResourceMeta(resourceId)`
     */
    function getResourceOverwrites(uint256 tokenId, uint64 resourceId)
        external
        view
        returns (uint64);

    /**
     * @notice Returns raw bytes of `customResourceId` of `resourceId`
     * Raw bytes are stored by reference in a double mapping structure of `resourceId` => `customResourceId`
     *
     * Custom data is intended to be stored as generic bytes and decode by various protocols on an as-needed basis
     *
     */
    function getResourceMetadata(uint64 resourceId)
        external
        view
        returns (string memory);

    /**
     * @notice Gives permission to `to` to manage `tokenId` resources.
     * This differs from transfer approvals, as approvals are not cleared when the approved
     * party accepts or rejects a resource, or sets resource priorities. This approval is cleared on token transfer.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {ApprovalForResources} event.
     */
    function approveForResources(address to, uint256 tokenId) external;

    /**
     * @notice Returns the account approved to manage resources of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApprovedForResources(uint256 tokenId)
        external
        view
        returns (address);

    /**
     * @dev Approve or remove `operator` as an operator of resources for the caller.
     * Operators can call {acceptResource}, {rejectResource}, {rejectAllResources} or {setPriority} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAllForResources} event.
     */
    function setApprovalForAllForResources(address operator, bool approved)
        external;

    /**
     * @notice Returns if the `operator` is allowed to manage all resources of `owner`.
     *
     * See {setApprovalForAllForResources}
     */
    function isApprovedForAllForResources(address owner, address operator)
        external
        view
        returns (bool);
}
