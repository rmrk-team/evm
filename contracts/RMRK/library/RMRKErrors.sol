// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

error ERC721AddressZeroIsNotaValidOwner();
error ERC721ApprovalToCurrentOwner();
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll();
error ERC721ApprovedQueryForNonexistentToken();
error ERC721ApproveToCaller();
error ERC721InvalidTokenId();
error ERC721MintToTheZeroAddress();
error ERC721NotApprovedOrOwner();
error ERC721TokenAlreadyMinted();
error ERC721TransferFromIncorrectOwner();
error ERC721TransferToNonReceiverImplementer();
error ERC721TransferToTheZeroAddress();
error RMRKApprovalForResourcesToCurrentOwner();
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
error RMRKApproveForResourcesToCaller();
error RMRKBadConfig();
error RMRKBadPriorityListLength();
error RMRKBaseRequiredForParts();
error RMRKCannotTransferSoulbound();
error RMRKChildAlreadyExists();
error RMRKChildIndexOutOfRange();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKIdZeroForbidden();
error RMRKIndexOutOfRange();
error RMRKInvalidChildReclaim();
error RMRKIsNotContract();
error RMRKLocked();
error RMRKMaxPendingChildrenReached();
error RMRKMaxPendingResourcesReached();
error RMRKMintOverMax();
error RMRKMintToNonRMRKImplementer();
error RMRKMustUnequipFirst();
error RMRKNestingTooDeep();
error RMRKNestingTransferToDescendant();
error RMRKNestingTransferToNonRMRKNestingImplementer();
error RMRKNestingTransferToSelf();
error RMRKNoResourceMatchingId();
error RMRKNotApprovedForResourcesOrOwner();
error RMRKNotApprovedOrDirectOwner();
error RMRKNotComposableResource();
error RMRKNotEquipped();
error RMRKNotOwner();
error RMRKNotOwnerOrContributor();
error RMRKNewOwnerIsZeroAddress();
error RMRKNewContributorIsZeroAddress();
error RMRKPartAlreadyExists();
error RMRKPartDoesNotExist();
error RMRKPartIsNotSlot();
error RMRKPendingChildIndexOutOfRange();
error RMRKResourceAlreadyExists();
error RMRKSlotAlreadyUsed();
error RMRKTargetResourceCannotReceiveSlot();
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();
error RMRKTokenDoesNotHaveActiveResource();
error RMRKTokenHasNoResources();
error RMRKZeroLengthIdsPassed();

contract RMRKErrors {

}