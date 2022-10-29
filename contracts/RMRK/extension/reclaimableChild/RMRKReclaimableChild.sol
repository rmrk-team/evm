// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../nesting/RMRKNesting.sol";
import "./IRMRKReclaimableChild.sol";

error RMRKInvalidChildReclaim();

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
     * @param childTokenId ID of the child token being reclaimed
     */
    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        if (childIsInActive(childAddress, childTokenId))
            revert RMRKInvalidChildReclaim();
        if (_childIsInPending[childAddress][childTokenId] != 0)
            revert RMRKInvalidChildReclaim();

        (address owner, uint256 ownerTokenId, bool isNft) = IRMRKNesting(
            childAddress
        ).rmrkOwnerOf(childTokenId);
        if (owner != address(this) || ownerTokenId != tokenId || !isNft)
            revert RMRKInvalidChildReclaim();
        IERC721(childAddress).safeTransferFrom(
            address(this),
            _msgSender(),
            childTokenId
        );
    }

    /**
     * @notice A hook used to be called before adding a child token.
     * @dev The `Child` struct contains the following arguments:
     *  [
     *      ID of the child token,
     *      address of the child token's collection smart contract
     *  ]
     * @param tokenId ID of the token receiving the child token
     * @param child A `Child` struct containing the data of the child token being added
     */
    function _beforeAddChild(uint256 tokenId, Child memory child)
        internal
        virtual
        override
    {
        super._beforeAddChild(tokenId, child);
        _childIsInPending[child.contractAddress][child.tokenId] = 1; // We use 1 as true
    }

    /**
     * @notice A hook used to be called before accepting a child token.
     * @dev The `Child` struct contains the following arguments:
     *  [
     *      ID of the child token,
     *      address of the child token's collection smart contract
     *  ]
     * @param tokenId ID of the token accepting the child token
     * @param index Index of the token in the parent token's pending child tokens array
     * @param child A `Child` struct containing the data of the child token being accepted
     */
    function _beforeAcceptChild(
        uint256 tokenId,
        uint256 index,
        Child memory child
    ) internal virtual override {
        super._beforeAcceptChild(tokenId, index, child);
        delete _childIsInPending[child.contractAddress][child.tokenId];
    }

    /**
     * @notice A hook used to be called before unnesting a child token.
     * @dev The `Child` struct contains the following arguments:
     *  [
     *      ID of the child token,
     *      address of the child token's collection smart contract
     *  ]
     * @param tokenId ID of the token unnesting the child token
     * @param index Index of the token in the parent token's child tokens array
     * @param child A `Child` struct containing the data of the child token being unnested
     * @param isPending A boolean value signifying whether the child token is located in the parent's active or pending
     *  child token array
     */
    function _beforeUnnestChild(
        uint256 tokenId,
        uint256 index,
        Child memory child,
        bool isPending
    ) internal virtual override {
        super._beforeUnnestChild(tokenId, index, child, isPending);
        if (isPending)
            delete _childIsInPending[child.contractAddress][child.tokenId];
    }
}
