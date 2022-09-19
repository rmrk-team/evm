// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKMultiResource is IERC165 {
    /**
     * @notice emitted when a resource object is initialized at resourceId
     */
    event ResourceSet(uint64 indexed resourceId);

    /**
     * @notice emitted when a resource object at resourceId is added to tokenId's pendingResource array
     */
    event ResourceAddedToToken(
        uint256 indexed tokenId,
        uint64 indexed resourceId
    );

    /**
     * @notice emitted when a resource object at resourceId is accepted by tokenId and migrated from tokenId's pendingResource array to resource array
     */
    event ResourceAccepted(uint256 indexed tokenId, uint64 indexed resourceId);

    /**
     * @notice emitted when a resource object at resourceId is rejected from tokenId and is dropped from the pendingResource array
     */
    event ResourceRejected(uint256 indexed tokenId, uint64 indexed resourceId);

    /**
     * @notice emitted when tokenId's prioritiy array is reordered.
     */
    event ResourcePrioritySet(uint256 indexed tokenId);

    /**
     * @notice emitted when a resource object at resourceId is proposed to tokenId, and that proposal will initiate an overwrite of overwrites with resourceId if accepted.
     */
    event ResourceOverwriteProposed(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed overwritesId
    );

    /**
     * @notice emitted when a pending resource with an overwrite is accepted, overwriting tokenId's resource overwritten
     */
    event ResourceOverwritten(
        uint256 indexed tokenId,
        uint64 indexed oldResourceId,
        uint64 indexed newResourceId
    );

    /**
     * @notice emitted when owner approves approved to manage the resources of tokenId. Approvals are cleared on action.
     */
    event ApprovalForResources(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );

    /**
     * @notice emitted when owner approves operator to manage the resources of tokenId. Approvals are not cleared on action.
     */
    event ApprovalForAllForResources(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    /**
     * @dev Resource object used by the RMRK NFT protocol
     */
    struct Resource {
        uint64 id; //8 bytes
        string metadataURI; //32+
    }

    /**
     * @notice Accepts a resource at `index` on pending array of `tokenId`.
     * Migrates the resource from the token's pending resource array to the active resource array.
     *
     * Active resources cannot be removed by anyone, but can be replaced by a new resource.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     * - `index` must be in range of the length of the pending resource array.
     *
     * Emits an {ResourceAccepted} event.
     */
    function acceptResource(uint256 tokenId, uint256 index) external;

    /**
     * @notice Rejects a resource at `index` on pending array of `tokenId`.
     * Removes the resource from the token's pending resource array.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     * - `index` must be in range of the length of the pending resource array.
     *
     * Emits a {ResourceRejected} event.
     */
    function rejectResource(uint256 tokenId, uint256 index) external;

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
    function getResourceMeta(uint64 resourceId)
        external
        view
        returns (string memory);

    /**
     * @notice Fetches resource data for the token's active resource with the given index.
     * @dev Resources are stored by reference mapping _resources[resourceId]
     * @dev Can be overriden to implement enumerate, fallback or other custom logic
     */
    function getResourceMetaForToken(uint256 tokenId, uint64 resourceIndex)
        external
        view
        returns (string memory);

    /**
     * @notice Returns the ids of all stored resources
     */
    function getAllResources() external view returns (uint64[] memory);

    // Approvals

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
