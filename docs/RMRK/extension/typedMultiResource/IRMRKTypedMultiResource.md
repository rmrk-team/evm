# IRMRKTypedMultiResource

*RMRK team*

> IRMRKTypedMultiResource

Interface smart contract of the RMRK typed multi resource module.



## Methods

### getResourceType

```solidity
function getResourceType(uint64 resourceId) external view returns (string)
```

Used to get the type of the resource.



#### Parameters

| Name | Type | Description |
|---|---|---|
| resourceId | uint64 | ID of the resource to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The type of the resource |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




