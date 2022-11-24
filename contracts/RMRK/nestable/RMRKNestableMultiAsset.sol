// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.16;

import "../multiasset/AbstractMultiAsset.sol";
import "./IRMRKNestable.sol";
import "./RMRKNestable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title RMRKNestableMultiAsset
 * @author RMRK team
 * @notice Smart contract of the joined RMRK Nestable and Multi asset module.
 */
contract RMRKNestableMultiAsset is RMRKNestable, AbstractMultiAsset {
    // ------------------- ASSETS --------------

    // Mapping from token ID to approver address to approved address for assets
    // The approver is necessary so approvals are invalidated for nested children on transfer
    // WARNING: If a child NFT returns the original root owner, old permissions would be active again
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForAssets;

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the assets on the given token.
     * @dev If the caller is not the owner of the given token or approved by its owner to manage the assets on the
     *  given token, the execution will be reverted.
     * @param tokenId ID of the token being checked
     */
    function _onlyApprovedForAssetsOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForAssetsOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForAssetsOrOwner();
    }

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the assets on the given token.
     * @param tokenId ID of the token being checked
     */
    modifier onlyApprovedForAssetsOrOwner(uint256 tokenId) {
        _onlyApprovedForAssetsOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` of the token collection.
     */
    constructor(string memory name_, string memory symbol_)
        RMRKNestable(name_, symbol_)
    {}

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNestable)
        returns (bool)
    {
        return
            RMRKNestable.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKMultiAsset).interfaceId;
    }

    // ------------------------------- ASSETS ------------------------------

    // --------------------------- HANDLING ASSETS -------------------------

    /**
     * @notice Accepts an asset from the pending array of given token.
     * @dev Migrates the asset from the token's pending asset array to the token's active asset array.
     * @dev Active assets cannot be removed by anyone, but can be replaced by a new asset.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's assets
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending asset array.
     * @dev Emits an {AssetAccepted} event.
     * @param tokenId ID of the token for which to accept the pending asset
     * @param index Index of the asset in the pending array to accept
     * @param assetId ID of the asset expected to be located at the specified index
     */
    function acceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _acceptAsset(tokenId, index, assetId);
    }

    /**
     * @notice Rejects an asset from the pending array of given token.
     * @dev Removes the asset from the token's pending asset array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's assets
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending asset array.
     * @dev Emits a {AssetRejected} event.
     * @param tokenId ID of the token that the asset is being rejected from
     * @param index Index of the asset in the pending array to be rejected
     * @param assetId ID of the asset expected to be located at the specified index
     */
    function rejectAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _rejectAsset(tokenId, index, assetId);
    }

    /**
     * @notice Rejects all assets from the pending array of a given token.
     * @dev Effecitvely deletes the pending array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's assets
     *  - `tokenId` must exist.
     *  - If there are more resouces than `maxRejections`, the execution will be reverted
     * @dev Emits a {AssetRejected} event with assetId = 0.
     * @param tokenId ID of the token of which to clear the pending array.
     * @param maxRejections Maximum number of expected assets to reject, used to prevent from
     *  rejecting assets which arrive just before this operation.
     */
    function rejectAllAssets(uint256 tokenId, uint256 maxRejections)
        public
        virtual
        onlyApprovedForAssetsOrOwner(tokenId)
    {
        _rejectAllAssets(tokenId, maxRejections);
    }

    /**
     * @notice Sets a new priority array for a given token.
     * @dev The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest
     *  priority.
     * @dev Value `0` of a priority is a special case equivalent to unitialized.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's assets
     *  - `tokenId` must exist.
     *  - The length of `priorities` must be equal the length of the active assets array.
     * @dev Emits a {AssetPrioritySet} event.
     * @param tokenId ID of the token to set the priorities for
     * @param priorities An array of priorities of active assets. The succesion of items in the priorities array
     *  matches that of the succesion of items in the active array
     */
    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForAssetsOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    // ----------------------- APPROVALS FOR ASSETS ------------------------

    /**
     * @notice Used to grant permission to the user to manage token's assets.
     * @dev This differs from transfer approvals, as approvals are not cleared when the approved party accepts or
     *  rejects an asset, or sets asset priorities. This approval is cleared on token transfer.
     * @dev Only a single account can be approved at a time, so approving the `0x0` address clears previous approvals.
     * @dev Requirements:
     *
     *  - The caller must own the token or be an approved operator.
     *  - `tokenId` must exist.
     * @dev Emits an {ApprovalForAssets} event.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval to manage the assets is granted
     */
    function approveForAssets(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForAssetsToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForAssets(owner, _msgSender())
        ) revert RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll();
        _approveForAssets(to, tokenId);
    }

    /**
     * @notice Used to retrieve the address of the account approved to manage assets of a given token.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @param tokenId ID of the token for which to retrieve the approved address
     * @return address Address of the account that is approved to manage the specified token's assets
     */
    function getApprovedForAssets(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);
        return _tokenApprovalsForAssets[tokenId][ownerOf(tokenId)];
    }

    /**
     * @notice Used to grant an approval to an address to manage assets of a given token.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval is being given
     */
    function _approveForAssets(address to, uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        _tokenApprovalsForAssets[tokenId][owner] = to;
        emit ApprovalForAssets(owner, to, tokenId);
    }

    /**
     * @notice Used to remove approvals to manage the assets for a given token.
     * @param tokenId ID of the token for which to clear the approvals
     */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        _approveForAssets(address(0), tokenId);
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    /**
     * @notice Internal function to check whether the queried user is either:
     *   1. The root owner of the token associated with `tokenId`.
     *   2. Is approved for all assets of the current owner via the `setApprovalForAllForAssets` function.
     *   3. Is granted approval for the specific tokenId for asset management via the `approveForAssets` function.
     * @param user Address of the user we are checking for permission
     * @param tokenId ID of the token to query for permission for a given `user`
     * @return bool A boolean value indicating whether the user is approved to manage the token or not
     */
    function _isApprovedForAssetsOrOwner(address user, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = ownerOf(tokenId);
        return (user == owner ||
            isApprovedForAllForAssets(owner, user) ||
            getApprovedForAssets(tokenId) == user);
    }
}
