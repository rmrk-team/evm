// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKNesting is IERC165 {
    struct RMRKOwner {
        uint256 tokenId;
        address ownerAddress;
        bool isNft;
    }

    /**
     * @dev emitted when a child NFT is added to a token's pending array
     */
    event ChildProposed(
        uint256 indexed tokenId,
        address indexed childAddress,
        uint256 indexed childId,
        uint256 childIndex
    );

    /**
     * @dev emitted when a child NFT accepts a token from its pending array, migrating it to the active array.
     */
    event ChildAccepted(
        uint256 indexed tokenId,
        address indexed childAddress,
        uint256 indexed childId,
        uint256 childIndex
    );

    /**
     * @dev emitted when a token accepts removes a child token from its pending array.
     */
    event ChildRejected(
        uint256 indexed tokenId,
        address indexed childAddress,
        uint256 indexed childId,
        uint256 childIndex
    );

    /**
     * @dev emitted when a token removes all a child tokens from its pending array.
     */
    event AllChildrenRejected(uint256 indexed tokenId);

    /**
     * @dev emitted when a token unnests a child from itself, transferring ownership to the root owner.
     */
    event ChildUnnested(
        uint256 indexed tokenId,
        address indexed childAddress,
        uint256 indexed childId,
        uint256 childIndex
    );

    /**
     * @dev Struct used to store child object data.
     */
    struct Child {
        uint256 tokenId;
        address contractAddress;
    }

    /**
     * @dev Returns the 'root' owner of an NFT. If this is a child of another NFT, this will return an EOA
     * address. Otherwise, it will return the immediate owner.
     *
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Returns the immediate owner of an NFT -- if the owner is another RMRK NFT, the uint256 will reflect
     *
     */
    function rmrkOwnerOf(uint256 tokenId)
        external
        view
        returns (
            address,
            uint256,
            bool
        );

    //TODO: Docs
    function burnChild(uint256 tokenId, uint256 childIndex) external;

    //TODO: Docs
    function burn(uint256 tokenId) external;

    /**
     * @dev Function to be called into by other instances of RMRK nesting contracts to update the `child` struct
     * of the parent.
     *
     * Requirements:
     *
     * - `ownerOf` on the child contract must resolve to the called contract.
     * - the pending array of the parent contract must not be full.
     */
    function addChild(uint256 parentTokenId, uint256 childTokenId) external;

    /**
     * @dev Function called to accept a pending child. Migrates the child at `index` on `parentTokenId` to
     * the accepted children array.
     *
     * Requirements:
     *
     * - `parentTokenId` must exist
     *
     */
    function acceptChild(uint256 parentTokenId, uint256 index) external;

    /**
     * @dev Function called to reject a pending child. Removes the child from the pending array mapping.
     * The child's ownership structures are not updated.
     *
     * Requirements:
     *
     * - `parentTokenId` must exist
     *
     */
    function rejectChild(
        uint256 parentTokenId,
        uint256 index,
        address to
    ) external;

    /**
     * @dev Function called to reject all pending children. Removes the children from the pending array mapping.
     * The children's ownership structures are not updated.
     *
     * Requirements:
     *
     * - `parentTokenId` must exist
     *
     */
    function rejectAllChildren(uint256 parentTokenId) external;

    /**
     * @dev Function called to unnest a child from `tokenId`'s child array. The owner of the token
     * is set to `to`, or is not updated in the event `to` is the zero address
     *
     * Requirements:
     *
     * - `tokenId` must exist
     *
     */
    function unnestChild(
        uint256 tokenId,
        uint256 index,
        address to,
        bool isPending
    ) external;

    /**
     * @dev Function called to reclaim an abandoned child created by unnesting with `to` as the zero
     * address. This function will set the child's owner to the rootOwner of the caller, allowing
     * the rootOwner management permissions for the child.
     *
     * Requirements:
     *
     * - `tokenId` must exist
     *
     */
    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) external;

    /**
     * @dev Returns array of child objects existing for `parentTokenId`.
     *
     */
    function childrenOf(uint256 parentTokenId)
        external
        view
        returns (Child[] memory);

    /**
     * @dev Returns array of pending child objects existing for `parentTokenId`.
     *
     */
    function pendingChildrenOf(uint256 parentTokenId)
        external
        view
        returns (Child[] memory);

    /**
     * @dev Returns a single child object existing at `index` on `parentTokenId`.
     *
     */
    function childOf(uint256 parentTokenId, uint256 index)
        external
        view
        returns (Child memory);

    /**
     * @dev Returns a single pending child object existing at `index` on `parentTokenId`.
     *
     */
    function pendingChildOf(uint256 parentTokenId, uint256 index)
        external
        view
        returns (Child memory);

    /**
     * @dev Function called when calling transferFrom with the target as another NFT via `tokenId`
     * on `to`.
     *
     */
    function nestTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external;
}
