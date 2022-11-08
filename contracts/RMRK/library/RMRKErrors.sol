// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

/// @title RMRKErrors
/// @author RMRK team
/// @notice A collection of errors used in the RMRK suite
/// @dev Errors are kept in a centralised file in order to provide a central point of reference and to avoid error
///  naming collisions due to inheritance

/// Attempting to grant the token to 0x0 address
error ERC721AddressZeroIsNotaValidOwner();
/// Attempting to grant approval to the current owner of the token
error ERC721ApprovalToCurrentOwner();
/// Attempting to grant approval when not being owner or approved for all should not be permitted
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll();
/// Attempting to get approvals for a token owned by 0x0 (considered non-existent)
error ERC721ApprovedQueryForNonexistentToken();
/// Attempting to grant approval to self
error ERC721ApproveToCaller();
/// Attempting to use an invalid token ID
error ERC721InvalidTokenId();
/// Attempting to mint to 0x0 address
error ERC721MintToTheZeroAddress();
/// Attempting to manage a token without being its owner or approved by the owner
error ERC721NotApprovedOrOwner();
/// Attempting to mint an already minted token
error ERC721TokenAlreadyMinted();
/// Attempting to transfer the token from an address that is not the owner
error ERC721TransferFromIncorrectOwner();
/// Attempting to safe transfer to an address that is unable to receive the token
error ERC721TransferToNonReceiverImplementer();
/// Attempting to transfer the token to a 0x0 address
error ERC721TransferToTheZeroAddress();
/// Attempting to grant approval of resources to their current owner
error RMRKApprovalForResourcesToCurrentOwner();
/// Attempting to grant approval of resources without being the caller or approved for all
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
/// Attempting to incorrectly configue a Base item
error RMRKBadConfig();
/// Attempting to set the priorities with an array of length that doesn't match the length of active resources array
error RMRKBadPriorityListLength();
/// Attempting to add a resource entry with `Part`s, without setting the `Base` address
error RMRKBaseRequiredForParts();
/// Attempting to transfer a soulbound (non-transferrable) token
error RMRKCannotTransferSoulbound();
/// Attempting to accept a child that has already been accepted
error RMRKChildAlreadyExists();
/// Attempting to interact with a child, using index that is higher than the number of children
error RMRKChildIndexOutOfRange();
/// Attempting to equip a `Part` with a child not approved by the base
error RMRKEquippableEquipNotAllowedByBase();
/// Attempting to use ID 0, which is not supported
/// @dev The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation
error RMRKIdZeroForbidden();
/// Attempting to interact with a resource, using index greater than number of resources
error RMRKIndexOutOfRange();
/// Attempting to reclaim a child that can't be reclaimed
error RMRKInvalidChildReclaim();
/// Attempting to interact with an end-user account when the contract account is expected
error RMRKIsNotContract();
/// Attempting to interact with a contract that had its operation locked
error RMRKLocked();
/// Attempting to add a pending child after the number of pending children has reached the limit (default limit is 128)
error RMRKMaxPendingChildrenReached();
/// Attempting to add a pending resource after the number of pending resources has reached the limit (default limit is
///  128)
error RMRKMaxPendingResourcesReached();
/// Attempting to burn a total number of recursive children higher than maximum set
/// @param childContract Address of the collection smart contract in which the maximum number of recursive burns was reached
/// @param childId ID of the child token at which the maximum number of recursive burns was reached
error RMRKMaxRecursiveBurnsReached(address childContract, uint256 childId);
/// Attempting to mint a number of tokens that would cause the total supply to be greater than maximum supply
error RMRKMintOverMax();
/// Attempting to mint a nested token to a smart contract that doesn't support nesting
error RMRKMintToNonRMRKImplementer();
/// Attempting to unnest a child before it is unequipped
error RMRKMustUnequipFirst();
/// Attempting to nest a child over the nesting limit (current limit is 100 levels of nesting)
error RMRKNestingTooDeep();
/// Attempting to nest the token to own descendant, which would create a loop and leave the looped tokens in limbo
error RMRKNestingTransferToDescendant();
/// Attempting to nest the token to a smart contract that doesn't support nesting
error RMRKNestingTransferToNonRMRKNestingImplementer();
/// Attempting to nest the token into itself
error RMRKNestingTransferToSelf();
/// Attempting to interact with a resource that can not be found
error RMRKNoResourceMatchingId();
/// Attempting to manage a resource without owning it or having been granted permission by the owner to do so
error RMRKNotApprovedForResourcesOrOwner();
/// Attempting to interact with a token without being its owner or having been granted permission by the
///  owner to do so
/// @dev When a token is nested, only the direct owner (NFT parent) can mange it. In that case, approved addresses are
///  not allowed to manage it, in order to ensure the expected behaviour
error RMRKNotApprovedOrDirectOwner();
/// Attempting to compose a resource wihtout having an associated Base
error RMRKNotComposableResource();
/// Attempting to unequip an item that isn't equipped
error RMRKNotEquipped();
/// Attempting to interact with a management function without being the smart contract's owner
error RMRKNotOwner();
/// Attempting to interact with a function without being the owner or contributor of the collection
error RMRKNotOwnerOrContributor();
/// Attempting to transfer the ownership to the 0x0 address
error RMRKNewOwnerIsZeroAddress();
/// Attempting to assign a 0x0 address as a contributor
error RMRKNewContributorIsZeroAddress();
/// Attempting to add a `Part` with an ID that is already used
error RMRKPartAlreadyExists();
/// Attempting to use a `Part` that doesn't exist
error RMRKPartDoesNotExist();
/// Attempting to use a `Part` that is `Fixed` when `Slot` kind of `Part` should be used
error RMRKPartIsNotSlot();
/// Attempting to interact with a pending child using an index greater than the size of pending array
error RMRKPendingChildIndexOutOfRange();
/// Attempting to add a resource using an ID that has already been used
error RMRKResourceAlreadyExists();
/// Attempting to equip an item into a slot that already has an item equipped
error RMRKSlotAlreadyUsed();
/// Attempting to equip an item into a `Slot` that the target resource does not implement
error RMRKTargetResourceCannotReceiveSlot();
/// Attempting to equip a child into a `Slot` and parent that the child's collection doesn't support
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();
/// Attempting to compose a NFT of a token without active resources
error RMRKTokenDoesNotHaveResource();
/// Attempting to determine the resource with the top priority on a token without resources
error RMRKTokenHasNoResources();
/// Attempting to accept or unnest a child which does not match the one at the specified index
error RMRKUnexpectedChildId();
/// Attempting to reject all resources but more resources than expected are pending
error RMRKUnexpectedNumberOfResources();
/// Attempting to accept or reject a resource which does not match the one at the specified index
error RMRKUnexpectedResourceId();
/// Attempting not to pass an empty array of equippable addresses when adding or setting the equippable addresses
error RMRKZeroLengthIdsPassed();
