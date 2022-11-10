// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKNesting is IERC165 {
    struct RMRKOwner {
        uint256 tokenId;
        address ownerAddress;
        bool isNft;
    }

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     * from indicates the immediate owner, which is a contract if nested.
     * If token was nested, `fromTokenId` indicates former parent id.
     * If destination is an NFT, `toTokenId` indicates the new parent id.
     */
    event NestTransfer(
        address indexed from,
        address indexed to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 indexed tokenId
    );

    /**
     * @dev emitted when a child NFT is added to a token's pending array
     */
    event ChildProposed(
        uint256 indexed tokenId,
        uint256 childIndex,
        address indexed childAddress,
        uint256 indexed childId
    );

    /**
     * @dev emitted when a child NFT accepts a token from its pending array, migrating it to the active array.
     */
    event ChildAccepted(
        uint256 indexed tokenId,
        uint256 childIndex,
        address indexed childAddress,
        uint256 indexed childId
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
        uint256 childIndex,
        address indexed childAddress,
        uint256 indexed childId,
        bool fromPending
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
    function burn(uint256 tokenId, uint256 maxRecursiveBurns)
        external
        returns (uint256);

    /**
     * @dev Function to be called into by other instances of RMRK nesting contracts to update the `child` struct
     * of the parent.
     *
     * Requirements:
     *
     * - `ownerOf` on the child contract must resolve to the called contract.
     * - the pending array of the parent contract must not be full.
     */
    function addChild(uint256 parentId, uint256 childId) external;

    /**
     * @notice Sends an instance of Child from the pending children array at index to children array for tokenId.
     * @param parentId tokenId of parent token to accept a child on
     * @param childAddress address of the child contract
     * @param childId token Id of the child
     */
    function acceptChild(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) external;

    /**
     * @dev Function called to reject all pending children. Removes the children from the pending array mapping.
     * The children's ownership structures are not updated.
     *
     * Requirements:
     *
     * - `parentId` must exist
     *
     */
    function rejectAllChildren(uint256 parentId) external;

    /**
     * @notice Function to unnest a child from the active token array.
     * @param tokenId is the tokenId of the parent token to unnest from.
     * @param to is the address to transfer this
     * @param childAddress address of the child expected to be in the index.
     * @param childId token Id of the child expected to be in the index
     * @param isPending Boolean value indicating whether the token is in the pending array of the parent (`true`) or in
     *  the active array (`false`)
     */
    function unnestChild(
        uint256 tokenId,
        address to,
        address childAddress,
        uint256 childId,
        bool isPending
    ) external;

    /**
     * @dev Returns array of child objects existing for `parentId`.
     *
     */
    function childrenOf(uint256 parentId)
        external
        view
        returns (Child[] memory);

    /**
     * @dev Returns array of pending child objects existing for `parentId`.
     *
     */
    function pendingChildrenOf(uint256 parentId)
        external
        view
        returns (Child[] memory);

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
