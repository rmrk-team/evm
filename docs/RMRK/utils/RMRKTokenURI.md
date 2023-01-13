# Solidity API

## RMRKTokenURI

Implementation of token URI with option to be enumerable.

### constructor

```solidity
constructor(string tokenURI_, bool isEnumerable) public
```

Used to initiate the smart contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenURI_ | string | Metadata URI to apply to all tokens, either as base or as full URI for every token |
| isEnumerable | bool | Whether to treat the tokenURI as enumerable or not. If true, the tokenID will be appended to  the base when getting the tokenURI |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

Used to retrieve the metadata URI of a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token to retrieve the metadata URI for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string Metadata URI of the specified token |

### _setTokenURI

```solidity
function _setTokenURI(string tokenURI_, bool isEnumerable) internal virtual
```

Used to set the token URI configuration.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenURI_ | string | Metadata URI to apply to all tokens, either as base or as full URI for every token |
| isEnumerable | bool | Whether to treat the tokenURI as enumerable or not. If true, the tokenID will be appended to  the base when getting the tokenURI |

