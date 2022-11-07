// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../nesting/RMRKNesting.sol";
import "./IRMRKReclaimableChild.sol";

/**
 * @title RMRKReclaimableChild
 * @author RMRK team
 * @notice Smart contract of the RMRK Reclaimable child module.
 */
abstract contract RMRKReclaimableChild is IRMRKReclaimableChild, RMRKNesting {
    /**
     * @dev WARNING: This mapping is not updated on burn or reject all, to save gas.
     * @dev This is only used to cheaply forbid reclaiming a child which is pending.
     */
    mapping(address => mapping(uint256 => uint256)) private _childIsInPending;

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
            interfaceId == type(IRMRKReclaimableChild).interfaceId;
    }

    /**
     * @notice Used to reclaim an abandoned child token.
     * @dev Child token is created by unnesting with `to` as the `0x0` address or by rejecting children.
     * @dev This function will set the child's owner to the `rootOwner` of the caller, allowing the `rootOwner`
     * management permissions for the child.
     * @dev Requirements:
     *
     *  - `tokenId` must exist
     * @param tokenId ID of the last parent token of the child token being recovered
     * @param childAddress Address of the child token's smart contract
     * @param childId ID of the child token being reclaimed
     */
    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _reclaimChild(tokenId, childAddress, childId);
    }

    function _reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) internal virtual {
        if (childIsInActive(childAddress, childId))
            revert RMRKInvalidChildReclaim();
        if (_childIsInPending[childAddress][childId] != 0)
            revert RMRKInvalidChildReclaim();

        (address owner, uint256 ownerTokenId, bool isNft) = IRMRKNesting(
            childAddress
        ).rmrkOwnerOf(childId);
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
     * @param childAddress address of the child expected to be in the index.
     * @param childId token Id of the child expected to be in the index
     */
    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    )
        internal
        virtual
        override
    {
        super._beforeAddChild(tokenId, childAddress, childId);
        _childIsInPending[childAddress][childId] = 1; // We use 1 as true
    }

    /**
     * @notice A hook used to be called before accepting a child token.
     * @dev we use this hook to keep track of children which are in pending, so they cannot be reclaimed from there.
     * @param parentId tokenId of parent token to accept a child on
     * @param childIndex index of child in _pendingChildren array to accept.
     * @param childAddress address of the child expected to be in the index.
     * @param childId token Id of the child expected to be in the index
     */
    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual override {
        super._beforeAcceptChild(
            parentId,
            childIndex,
            childAddress,
            childId
        );
        delete _childIsInPending[childAddress][childId];
    }

    /**
     * @notice A hook used to be called before unnesting a child token.
     * @dev The `Child` struct contains the following arguments:
     *  [
     *      ID of the child token,
     *      address of the child token's collection smart contract
     *  ]
     * @dev we use this hook to keep track of children which are in pending, so they cannot be reclaimed from there.
     * @param tokenId ID of the token unnesting the child token
     * @param childIndex index of child in _pendingChildren array to accept.
     * @param childAddress address of the child expected to be in the index.
     * @param childId token Id of the child expected to be in the index
     * @param isPending A boolean value signifying whether the child token is located in the parent's active or pending
     *  child token array
     */
    function _beforeUnnestChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual override {
        super._beforeUnnestChild(
            tokenId,
            childIndex,
            childAddress,
            childId,
            isPending
        );
        if (isPending)
            delete _childIsInPending[childAddress][childId];
    }
}
