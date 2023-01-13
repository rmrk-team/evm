# Solidity API

## RMRKCollectionMetadata

Smart contract of the RMRK Collection metadata module.

### constructor

```solidity
constructor(string collectionMetadata_) public
```

Used to initialize the contract with the given metadata.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collectionMetadata_ | string | The collection metadata with which to initialize the smart contract |

### _setCollectionMetadata

```solidity
function _setCollectionMetadata(string newMetadata) internal
```

Used to set the metadata of the collection.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newMetadata | string | The new metadata of the collection |

### collectionMetadata

```solidity
function collectionMetadata() public view returns (string)
```

Used to retrieve the metadata of the collection.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string The metadata URI of the collection |

