// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../../nestable/RMRKNestable.sol";
import "./IRMRKReclaimableChild.sol";

/**
 * @title RMRKReclaimableChild
 * @author RMRK team
 * @notice Smart contract of the RMRK Reclaimable child module.
 */
abstract contract RMRKReclaimableChild is IRMRKReclaimableChild, RMRKNestable {
    /**
     * @notice WARNING: This mapping is not updated on burn or reject all, to save gas.
     * @dev This is only used to cheaply forbid reclaiming a child which is pending.
     */
    mapping(address => mapping(uint256 => uint256)) private _childIsInPending;

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, RMRKNestable) returns (bool) {
        return
            RMRKNestable.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKReclaimableChild).interfaceId;
    }

    /**
     * @inheritdoc IRMRKReclaimableChild
     */
    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _reclaimChild(tokenId, childAddress, childId);
    }

    /**
     * @notice Used to reclaim an abandoned child token.
     * @dev Child token was abandoned by transferring it with `to` as the `0x0` address.
     * @dev This function will set the child's owner to the `rootOwner` of the caller, allowing the `rootOwner`
     *  management permissions for the child.
     * @dev Requirements:
     *
     *  - `tokenId` must exist
     * @param tokenId ID of the last parent token of the child token being recovered
     * @param childAddress Address of the child token's smart contract
     * @param childId ID of the child token being reclaimed
     */
    function _reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) internal virtual {
        if (_childIsInActive[childAddress][childId] == 1)
            revert RMRKInvalidChildReclaim();
        if (_childIsInPending[childAddress][childId] != 0)
            revert RMRKInvalidChildReclaim();

        (address owner, uint256 ownerTokenId, bool isNft) = IERC7401(
            childAddress
        ).directOwnerOf(childId);
        if (owner != address(this) || ownerTokenId != tokenId || !isNft)
            revert RMRKInvalidChildReclaim();
        IERC721(childAddress).safeTransferFrom(
            address(this),
            _msgSender(),
            childId
        );
    }

    /**
     * @notice A hook used to be called before adding a child token.
     * @dev we use this hook to keep track of children which are in pending, so they cannot be reclaimed from there.
     * @param tokenId ID of the token receiving the child token
     * @param childAddress Address of the collection smart contract of the token expected to be at the given index
     * @param childId ID of the token expected to be located at the given index in its collection smart contract
     * @param data Additional data of unspecified format to be passed along the transaction
     */
    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId,
        bytes memory data
    ) internal virtual override {
        super._beforeAddChild(tokenId, childAddress, childId, data);
        _childIsInPending[childAddress][childId] = 1; // We use 1 as true
    }

    /**
     * @notice A hook used to be called before accepting a child token.
     * @dev We use this hook to keep track of children which are in pending, so they cannot be reclaimed from there.
     * @param parentId ID of the parent token for which the child token is being accepted
     * @param childIndex Index of the pending child token in the pending children array of a given parent token
     * @param childAddress Address of the collection smart contract of the pending child token expected to be at the given index
     * @param childId ID of the pending child token expected to be located at the given index
     */
    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual override {
        super._beforeAcceptChild(parentId, childIndex, childAddress, childId);
        delete _childIsInPending[childAddress][childId];
    }

    /**
     * @notice A hook used to be called before transferring a child token.
     * @dev The `Child` struct contains the following arguments:
     *  [
     *      ID of the child token,
     *      address of the child token's collection smart contract
     *  ]
     * @dev we use this hook to keep track of children which are in pending, so they cannot be reclaimed from there.
     * @param tokenId ID of the token transferring the child token
     * @param childIndex Index of the token in the parent token's child tokens array
     * @param childAddress Address of the collection smart contract of the child token expected to be at the given index
     * @param childId ID of the child token expected to be located at the given index
     * @param isPending A boolean value signifying whether the child token is located in the parent's active or pending
     *  child token array
     * @param data Additional data of unspecified format to be passed along the transaction
     */
    function _beforeTransferChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending,
        bytes memory data
    ) internal virtual override {
        super._beforeTransferChild(
            tokenId,
            childIndex,
            childAddress,
            childId,
            isPending,
            data
        );
        if (isPending) delete _childIsInPending[childAddress][childId];
    }
}
