# Solidity API

## RMRKMintZero

```solidity
error RMRKMintZero()
```

## RMRKAbstractNestableImpl

Abstract implementation of RMRK nestable module.

### _preMint

```solidity
function _preMint(uint256 numToMint) internal virtual returns (uint256, uint256)
```

Used to calculate the token IDs of tokens to be minted.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| numToMint | uint256 | Amount of tokens to be minted |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The ID of the first token to be minted in the current minting cycle |
| [1] | uint256 | uint256 The ID of the last token to be minted in the current minting cycle |

### _charge

```solidity
function _charge(uint256 value) internal virtual
```

Used to verify and/or receive the payment for the mint.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The expected amount to be received for the mint |

### updateRoyaltyRecipient

```solidity
function updateRoyaltyRecipient(address newRoyaltyRecipient) public virtual
```

Used to update recipient of royalties.

_Custom access control has to be implemented to ensure that only the intended actors can update the
 beneficiary._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRoyaltyRecipient | address | Address of the new recipient of royalties |

