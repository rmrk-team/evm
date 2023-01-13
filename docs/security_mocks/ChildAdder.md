# Solidity API

## ChildAdder

Smart contract of the child adder module.

_This smart contract is used to easily add a desired amount of child tokens to a desired token._

### addChild

```solidity
function addChild(address destContract, uint256 parentId, uint256 childId, uint256 numChildren) external
```

Used to add a specified amount of child tokens with the same IO to a given token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| destContract | address | The address of the smart contract of the token to which to add new child tokens |
| parentId | uint256 | ID of the token to which to add the child tokens |
| childId | uint256 | ID of the child tokens to be added |
| numChildren | uint256 | The number of child tokens to add |

