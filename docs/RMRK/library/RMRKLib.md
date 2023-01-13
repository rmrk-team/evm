# Solidity API

## RMRKLib

RMRK library smart contract.

### removeItemByIndex

```solidity
function removeItemByIndex(uint64[] array, uint256 index) internal
```

Used to remove an item from the array using the specified index.

_The item is removed by replacing it with the last item and removing the last element._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| array | uint64[] | An array of items containing the item to be removed |
| index | uint256 | Index of the item to remove |

### indexOf

```solidity
function indexOf(uint64[] A, uint64 a) internal pure returns (uint256, bool)
```

Used to determine the index of the item in the array by spedifying its value.

_This was adapted from Cryptofin-Solidity `arrayUtils`.
If the item is not found the index returned will equal `0`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| A | uint64[] | The array containing the item to be found |
| a | uint64 | The value of the item to find the index of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The index of the item in the array |
| [1] | bool | bool A boolean value specifying whether the item was found |

