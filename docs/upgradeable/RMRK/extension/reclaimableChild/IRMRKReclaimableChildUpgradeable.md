# IRMRKReclaimableChildUpgradeable

*RMRK team*

> IRMRKReclaimableChildUpgradeable

Interface smart contract of the upgradeable RMRK Reclaimable child module.



## Methods

### reclaimChild

```solidity
function reclaimChild(uint256 tokenId, address childAddress, uint256 childId) external nonpayable
```

Used to reclaim an abandoned child token.

*Child token was abandoned by transferring it with `to` as the `0x0` address.This function will set the child&#39;s owner to the `rootOwner` of the caller, allowing the `rootOwner`  management permissions for the child.Requirements:  - `tokenId` must exist*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the last parent token of the child token being recovered |
| childAddress | address | Address of the child token&#39;s smart contract |
| childId | uint256 | ID of the child token being reclaimed |

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




