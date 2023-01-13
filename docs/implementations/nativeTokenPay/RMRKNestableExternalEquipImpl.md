# Solidity API

## RMRKMintUnderpriced

```solidity
error RMRKMintUnderpriced()
```

## RMRKMintZero

```solidity
error RMRKMintZero()
```

## RMRKNestableExternalEquipImpl

Implementation of RMRK nestable external equip module.

### constructor

```solidity
constructor(address equippableAddress_, string name_, string symbol_, string collectionMetadata_, string tokenURI_, struct IRMRKInitData.InitData data) public
```

Used to initialize the smart contract.

_The full `InitData` looks like this:
 [
     erc20TokenAddress,
     tokenUriIsEnumerable,
     royaltyRecipient,
     royaltyPercentageBps,
     maxSupply,
     pricePerMint
 ]_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippableAddress_ | address |  |
| name_ | string | Name of the token collection |
| symbol_ | string | Symbol of the token collection |
| collectionMetadata_ | string | The collection metadata URI |
| tokenURI_ | string | The base URI of the token metadata |
| data | struct IRMRKInitData.InitData | The `InitData` struct containing additional initialization data |

### mint

```solidity
function mint(address to, uint256 numToMint) public payable virtual
```

Used to mint the desired number of tokens to the specified address.

_The `data` value of the `_safeMint` method is set to an empty value.
Can only be called while the open sale is open._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to which to mint the token |
| numToMint | uint256 | Number of tokens to mint |

### nestMint

```solidity
function nestMint(address to, uint256 numToMint, uint256 destinationId) public payable virtual
```

Used to mint a desired number of child tokens to a given parent token.

_The `data` value of the `_safeMint` method is set to an empty value.
Can only be called while the open sale is open._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address of the collection smart contract of the token into which to mint the child token |
| numToMint | uint256 | Number of tokens to mint |
| destinationId | uint256 | ID of the token into which to mint the new child token |

### setEquippableAddress

```solidity
function setEquippableAddress(address equippable) public virtual
```

Used to set the address of the `Equippable` smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| equippable | address | Address of the `Equippable` smart contract |

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

