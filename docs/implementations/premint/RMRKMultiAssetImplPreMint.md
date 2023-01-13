# Solidity API

## RMRKMultiAssetImplPreMint

Implementation of RMRK multi asset module with pre minting by collection owner.

### constructor

```solidity
constructor(string name_, string symbol_, string collectionMetadata_, string tokenURI_, struct IRMRKInitData.InitData data) public
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
| name_ | string | Name of the token collection |
| symbol_ | string | Symbol of the token collection |
| collectionMetadata_ | string | The collection metadata URI |
| tokenURI_ | string | The base URI of the token metadata |
| data | struct IRMRKInitData.InitData | The `InitData` struct containing additional initialization data |

### mint

```solidity
function mint(address to, uint256 numToMint) public virtual
```

Used to mint the desired number of tokens to the specified address.

_The `data` value of the `_safeMint` method is set to an empty value.
Can only be called while the open sale is open._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | Address to which to mint the token |
| numToMint | uint256 | Number of tokens to mint |

