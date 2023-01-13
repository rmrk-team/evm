# Solidity API

## ERC721AddressZeroIsNotaValidOwner

```solidity
error ERC721AddressZeroIsNotaValidOwner()
```

Attempting to grant the token to 0x0 address

## ERC721ApprovalToCurrentOwner

```solidity
error ERC721ApprovalToCurrentOwner()
```

Attempting to grant approval to the current owner of the token

## ERC721ApproveCallerIsNotOwnerNorApprovedForAll

```solidity
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval when not being owner or approved for all should not be permitted

## ERC721ApprovedQueryForNonexistentToken

```solidity
error ERC721ApprovedQueryForNonexistentToken()
```

Attempting to get approvals for a token owned by 0x0 (considered non-existent)

## ERC721ApproveToCaller

```solidity
error ERC721ApproveToCaller()
```

Attempting to grant approval to self

## ERC721InvalidTokenId

```solidity
error ERC721InvalidTokenId()
```

Attempting to use an invalid token ID

## ERC721MintToTheZeroAddress

```solidity
error ERC721MintToTheZeroAddress()
```

Attempting to mint to 0x0 address

## ERC721NotApprovedOrOwner

```solidity
error ERC721NotApprovedOrOwner()
```

Attempting to manage a token without being its owner or approved by the owner

## ERC721TokenAlreadyMinted

```solidity
error ERC721TokenAlreadyMinted()
```

Attempting to mint an already minted token

## ERC721TransferFromIncorrectOwner

```solidity
error ERC721TransferFromIncorrectOwner()
```

Attempting to transfer the token from an address that is not the owner

## ERC721TransferToNonReceiverImplementer

```solidity
error ERC721TransferToNonReceiverImplementer()
```

Attempting to safe transfer to an address that is unable to receive the token

## ERC721TransferToTheZeroAddress

```solidity
error ERC721TransferToTheZeroAddress()
```

Attempting to transfer the token to a 0x0 address

## RMRKApprovalForAssetsToCurrentOwner

```solidity
error RMRKApprovalForAssetsToCurrentOwner()
```

Attempting to grant approval of assets to their current owner

## RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll

```solidity
error RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll()
```

Attempting to grant approval of assets without being the caller or approved for all

## RMRKBadConfig

```solidity
error RMRKBadConfig()
```

Attempting to incorrectly configue a Catalog item

## RMRKBadPriorityListLength

```solidity
error RMRKBadPriorityListLength()
```

Attempting to set the priorities with an array of length that doesn't match the length of active assets array

## RMRKCatalogRequiredForParts

```solidity
error RMRKCatalogRequiredForParts()
```

Attempting to add an asset entry with `Part`s, without setting the `Catalog` address

## RMRKCannotTransferSoulbound

```solidity
error RMRKCannotTransferSoulbound()
```

Attempting to transfer a soulbound (non-transferrable) token

## RMRKChildAlreadyExists

```solidity
error RMRKChildAlreadyExists()
```

Attempting to accept a child that has already been accepted

## RMRKChildIndexOutOfRange

```solidity
error RMRKChildIndexOutOfRange()
```

Attempting to interact with a child, using index that is higher than the number of children

## RMRKEquippableEquipNotAllowedByCatalog

```solidity
error RMRKEquippableEquipNotAllowedByCatalog()
```

Attempting to equip a `Part` with a child not approved by the Catalog

## RMRKIdZeroForbidden

```solidity
error RMRKIdZeroForbidden()
```

Attempting to use ID 0, which is not supported

_The ID 0 in RMRK suite is reserved for empty values. Guarding against its use ensures the expected operation_

## RMRKIndexOutOfRange

```solidity
error RMRKIndexOutOfRange()
```

Attempting to interact with an asset, using index greater than number of assets

## RMRKInvalidChildReclaim

```solidity
error RMRKInvalidChildReclaim()
```

Attempting to reclaim a child that can't be reclaimed

## RMRKIsNotContract

```solidity
error RMRKIsNotContract()
```

Attempting to interact with an end-user account when the contract account is expected

## RMRKLocked

```solidity
error RMRKLocked()
```

Attempting to interact with a contract that had its operation locked

## RMRKMaxPendingChildrenReached

```solidity
error RMRKMaxPendingChildrenReached()
```

Attempting to add a pending child after the number of pending children has reached the limit (default limit is 128)

## RMRKMaxPendingAssetsReached

```solidity
error RMRKMaxPendingAssetsReached()
```

Attempting to add a pending asset after the number of pending assets has reached the limit (default limit is
 128)

## RMRKMaxRecursiveBurnsReached

```solidity
error RMRKMaxRecursiveBurnsReached(address childContract, uint256 childId)
```

Attempting to burn a total number of recursive children higher than maximum set

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| childContract | address | Address of the collection smart contract in which the maximum number of recursive burns was reached |
| childId | uint256 | ID of the child token at which the maximum number of recursive burns was reached |

## RMRKMintOverMax

```solidity
error RMRKMintOverMax()
```

Attempting to mint a number of tokens that would cause the total supply to be greater than maximum supply

## RMRKMintToNonRMRKNestableImplementer

```solidity
error RMRKMintToNonRMRKNestableImplementer()
```

Attempting to mint a nested token to a smart contract that doesn't support nesting

## RMRKMustUnequipFirst

```solidity
error RMRKMustUnequipFirst()
```

Attempting to transfer a child before it is unequipped

## RMRKNestableTooDeep

```solidity
error RMRKNestableTooDeep()
```

Attempting to nest a child over the nestable limit (current limit is 100 levels of nesting)

## RMRKNestableTransferToDescendant

```solidity
error RMRKNestableTransferToDescendant()
```

Attempting to nest the token to own descendant, which would create a loop and leave the looped tokens in limbo

## RMRKNestableTransferToNonRMRKNestableImplementer

```solidity
error RMRKNestableTransferToNonRMRKNestableImplementer()
```

Attempting to nest the token to a smart contract that doesn't support nesting

## RMRKNestableTransferToSelf

```solidity
error RMRKNestableTransferToSelf()
```

Attempting to nest the token into itself

## RMRKNoAssetMatchingId

```solidity
error RMRKNoAssetMatchingId()
```

Attempting to interact with an asset that can not be found

## RMRKNotApprovedForAssetsOrOwner

```solidity
error RMRKNotApprovedForAssetsOrOwner()
```

Attempting to manage an asset without owning it or having been granted permission by the owner to do so

## RMRKNotApprovedOrDirectOwner

```solidity
error RMRKNotApprovedOrDirectOwner()
```

Attempting to interact with a token without being its owner or having been granted permission by the
 owner to do so

_When a token is nested, only the direct owner (NFT parent) can mange it. In that case, approved addresses are
 not allowed to manage it, in order to ensure the expected behaviour_

## RMRKNotComposableAsset

```solidity
error RMRKNotComposableAsset()
```

Attempting to compose an asset wihtout having an associated Catalog

## RMRKNotEquipped

```solidity
error RMRKNotEquipped()
```

Attempting to unequip an item that isn't equipped

## RMRKNotOwner

```solidity
error RMRKNotOwner()
```

Attempting to interact with a management function without being the smart contract's owner

## RMRKNotOwnerOrContributor

```solidity
error RMRKNotOwnerOrContributor()
```

Attempting to interact with a function without being the owner or contributor of the collection

## RMRKNewOwnerIsZeroAddress

```solidity
error RMRKNewOwnerIsZeroAddress()
```

Attempting to transfer the ownership to the 0x0 address

## RMRKNewContributorIsZeroAddress

```solidity
error RMRKNewContributorIsZeroAddress()
```

Attempting to assign a 0x0 address as a contributor

## RMRKPartAlreadyExists

```solidity
error RMRKPartAlreadyExists()
```

Attempting to add a `Part` with an ID that is already used

## RMRKPartDoesNotExist

```solidity
error RMRKPartDoesNotExist()
```

Attempting to use a `Part` that doesn't exist

## RMRKPartIsNotSlot

```solidity
error RMRKPartIsNotSlot()
```

Attempting to use a `Part` that is `Fixed` when `Slot` kind of `Part` should be used

## RMRKPendingChildIndexOutOfRange

```solidity
error RMRKPendingChildIndexOutOfRange()
```

Attempting to interact with a pending child using an index greater than the size of pending array

## RMRKAssetAlreadyExists

```solidity
error RMRKAssetAlreadyExists()
```

Attempting to add an asset using an ID that has already been used

## RMRKSlotAlreadyUsed

```solidity
error RMRKSlotAlreadyUsed()
```

Attempting to equip an item into a slot that already has an item equipped

## RMRKTargetAssetCannotReceiveSlot

```solidity
error RMRKTargetAssetCannotReceiveSlot()
```

Attempting to equip an item into a `Slot` that the target asset does not implement

## RMRKTokenCannotBeEquippedWithAssetIntoSlot

```solidity
error RMRKTokenCannotBeEquippedWithAssetIntoSlot()
```

Attempting to equip a child into a `Slot` and parent that the child's collection doesn't support

## RMRKTokenDoesNotHaveAsset

```solidity
error RMRKTokenDoesNotHaveAsset()
```

Attempting to compose a NFT of a token without active assets

## RMRKTokenHasNoAssets

```solidity
error RMRKTokenHasNoAssets()
```

Attempting to determine the asset with the top priority on a token without assets

## RMRKUnexpectedChildId

```solidity
error RMRKUnexpectedChildId()
```

Attempting to accept or transfer a child which does not match the one at the specified index

## RMRKUnexpectedNumberOfAssets

```solidity
error RMRKUnexpectedNumberOfAssets()
```

Attempting to reject all pending assets but more assets than expected are pending

## RMRKUnexpectedNumberOfChildren

```solidity
error RMRKUnexpectedNumberOfChildren()
```

Attempting to reject all pending children but children assets than expected are pending

## RMRKUnexpectedAssetId

```solidity
error RMRKUnexpectedAssetId()
```

Attempting to accept or reject an asset which does not match the one at the specified index

## RMRKZeroLengthIdsPassed

```solidity
error RMRKZeroLengthIdsPassed()
```

Attempting not to pass an empty array of equippable addresses when adding or setting the equippable addresses

