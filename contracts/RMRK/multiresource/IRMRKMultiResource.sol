// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKMultiResource
 * @author RMRK team
 * @notice Interface smart contract of the RMRK multi resource module.
 */
interface IRMRKMultiResource is IERC165 {
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
     */
    event ResourceAddedToToken(
        uint256 indexed tokenId,
        uint64 indexed resourceId
    );

    /**
     * @notice Used to notify listeners that a resource object at `resourceId` is accepted by the token and migrated
     *  from token's pending resources array to active resources array of the token.
     * @param tokenId ID of the token that had a new resource accepted
     * @param resourceId ID of the resource that was accepted
     */
    event ResourceAccepted(uint256 indexed tokenId, uint64 indexed resourceId);

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
     * @notice Used to notify listeners that a resource object at `resourceId` is proposed to token, and that the
     *  proposal will initiate an overwrite of the resource with a new one if accepted.
     * @param tokenId ID of the token that had the resource overwrite proposed
     * @param resourceId ID of the resource that would overwrite the current resource
     * @param overwritesId ID of the resource that would be overwritten
     */
    event ResourceOverwriteProposed(
        uint256 indexed tokenId,
        uint64 indexed resourceId,
        uint64 indexed overwritesId
    );

    /**
     * @notice Used to notify listeners that a pending resource with an overwrite is accepted, overwriting a token's
     *  resource.
     * @param tokenId ID of the token that had a resource overwritten
     * @param oldResourceId ID of the resource that was overwritten
     * @param newResourceId ID of the resource that overwrote the old resource
     */
    event ResourceOverwritten(
        uint256 indexed tokenId,
        uint64 indexed oldResourceId,
        uint64 indexed newResourceId
    );

    /**
     * @notice Used to notify listeners that owner has granted an approval to the user to manage the resources of a
     *  given token.
     * @dev Approvals are cleared on action.
     * @param owner Address of the account that has granted the approval for all resources
     * @param approved Address of the account that has been granted approval to manage all resources
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
     * @param operator Address of the account that has been granted the approval to manage all resources on all of the
     *  tokens
     * @param approved Boolean value signifying whether the permission has been granted (`true`) or revoked (`false`)
     */
    event ApprovalForAllForResources(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    /**
     * @notice Resource object used by the RMRK NFT protocol.
     * @return id ID of the resource
     * @return metadataURI Metadata URI of the resource
     */
    struct Resource {
        uint64 id; //8 bytes
        string metadataURI; //32+
    }

    /**
     * @notice Accepts a resource at from the pending array of given token.
     * @dev Migrates the resource from the token's pending resource array to the token's active resource array.
     * @dev Active resources cannot be removed by anyone, but can be replaced by a new resource.
     * @dev Requirements:
     *
     *  - The caller must own the token or be an approved operator.
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending resource array.
     * @dev Emits an {ResourceAccepted} event.
     * @param tokenId ID of the token for which to accept the pending resource
     * @param index Index of the resource in the pending array to accept
     */
    function acceptResource(uint256 tokenId, uint256 index) external;

    /**
     * @notice Rejects a resource from the pending array of given token.
     * @dev Removes the resource from the token's pending resource array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be an approved operator.
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending resource array.
     * @dev Emits a {ResourceRejected} event.
     * @param tokenId ID of the token that the resource is being rejected from
     * @param index Index of the resource in the pending array to be rejected 
     */
    function rejectResource(uint256 tokenId, uint256 index) external;

    /**
     * @notice Rejects all resources from the pending array of a given token.
     * @dev Effecitvely deletes the pending array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be an approved operator.
     *  - `tokenId` must exist.
     * @dev Emits a {ResourceRejected} event with resourceId = 0.
     * @param tokenId ID of the token of which to clear the pending array
     */
    function rejectAllResources(uint256 tokenId) external;

    /**
     * @notice Sets a new priority array for a given token.
     * @dev The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest
     *  priority.
     * @dev Value `0` of a priority is a special case equivalent to unitialized.
     * @dev Requirements:
     *
     *  - The caller must own the token or be an approved operator.
     *  - `tokenId` must exist.
     *  - The length of `priorities` must be equal the length of the active resources array.
     * @dev Emits a {ResourcePrioritySet} event.
     * @param tokenId ID of the token to set the priorities for
     * @param priorities An array of priority values
     */
    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        external;

    /**
     * @notice Used to retrieve IDs od the active resources of given token.
     * @dev Resource data is stored by reference, in order to access the data corresponding to the ID, call
     *  `getResourceMeta(resourceId)`.
     * @param tokenId ID of the token to retrieve the IDs of the active resources
     * @return uint64[] An array of active resource IDs of the given token
     */
    function getActiveResources(uint256 tokenId)
        external
        view
        returns (uint64[] memory);

    /**
     * @notice Used to retrieve IDs od the active resources of given token.
     * @dev Resource data is stored by reference, in order to access the data corresponding to the ID, call
     *  `getResourceMeta(resourceId)`.
     * @param tokenId ID of the token to retrieve the IDs of the pending resources
     * @return uint64[] An array of pending resource IDs of the given token
     */
    function getPendingResources(uint256 tokenId)
        external
        view
        returns (uint64[] memory);

    /**
     * @notice Used to retrieve the priorities of the active resoources of a given token.
     * @param tokenId ID of the token for which to retrieve the priorities of the active resources
     * @return uint16[] An array of priorities of the active resources of the given token
     */
    function getActiveResourcePriorities(uint256 tokenId)
        external
        view
        returns (uint16[] memory);

    /**
     * @notice Used to retrieve the resource that will be overriden if a given resource from the token's pending array
     *  is accepted.
     * @dev Resource data is stored by reference, in order to access the data corresponding to the ID, call
     *  `getResourceMeta(resourceId)`.
     * @param tokenId ID of the token to check
     * @param resourceId ID of the resource that would be accepted
     * @return uint64 ID of the resource that would be overriden
     */
    function getResourceOverwrites(uint256 tokenId, uint64 resourceId)
        external
        view
        returns (uint64);

    /**
     * @notice Used to retrieve the metadata of the resource associated with `resourceId`.
     * @param resourceId The ID of the resource for which we are trying to retrieve the resource metadata
     * @return string The metadata of the resource with ID equal to `resourceId`
     */
    function getResourceMeta(uint64 resourceId)
        external
        view
        returns (string memory);

    /**
     * @notice Used to fetch the resource data for the token's active resource using its index.
     * @dev Resources are stored by reference mapping `_resources[resourceId]`.
     * @dev Can be overriden to implement enumerate, fallback or other custom logic.
     * @param tokenId ID of the token from which to retrieve the resource data
     * @param resourceIndex Index of the resource in the active resources array for which to retrieve the metadata
     * @return string The metadata of the resource belonging to the specified index in the token's active resources
     *  array
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
    function approveForResources(address to, uint256 tokenId) external;

    /**
     * @notice Used to retrieve the address of the account approved to manage resources of a given token.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @param tokenId ID of the token for which to retrieve the approved address
     * @return address Address of the account that is approved to manage the specified token's resources
     */
    function getApprovedForResources(uint256 tokenId)
        external
        view
        returns (address);

    /**
     * @notice Used to add or remove an operator of resources for the caller.
     * @dev Operators can call {acceptResource}, {rejectResource}, {rejectAllResources} or {setPriority} for any token
     *  owned by the caller.
     * @dev Requirements:
     *
     *  - The `operator` cannot be the caller.
     * @dev Emits an {ApprovalForAllForResources} event.
     * @param operator Address of the account to which the operator role is granted or revoked from
     * @param approved The boolean value indicating wether the operator role is being granted (`true`) or revoked
     *  (`false`)
     */
    function setApprovalForAllForResources(address operator, bool approved)
        external;

    /**
     * @notice Used to check whether the address has been granted the operator role by a given address or not.
     * @dev See {setApprovalForAllForResources}.
     * @param owner Address of the account that we are checking for whether it has granted the operator role
     * @param operator Address of the account that we are checking whether it has the operator role or not
     * @return bool The boolean value indicating wehter the account we are checking has been granted the operator role
     *  (`true`) or not (`false`)
     */
    function isApprovedForAllForResources(address owner, address operator)
        external
        view
        returns (bool);
}
