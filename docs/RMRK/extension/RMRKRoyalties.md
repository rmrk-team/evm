# Solidity API

## RMRKRoyalties

Smart contract of the RMRK Royalties module.

### constructor

```solidity
constructor(address royaltyRecipient, uint256 royaltyPercentageBps) internal
```

Used to initiate the smart contract.

_`royaltyPercentageBps` is expressed in basis points, so 1 basis point equals 0.01% and 500 basis points
 equal 5%._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| royaltyRecipient | address | Address to which royalties should be sent |
| royaltyPercentageBps | uint256 | The royalty percentage expressed in basis points |

### updateRoyaltyRecipient

```solidity
function updateRoyaltyRecipient(address newRoyaltyRecipient) external virtual
```

Used to update recipient of royalties.

_Custom access control has to be implemented to ensure that only the intended actors can update the
 beneficiary._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRoyaltyRecipient | address | Address of the new recipient of royalties |

### _setRoyaltyRecipient

```solidity
function _setRoyaltyRecipient(address newRoyaltyRecipient) internal
```

Used to update the royalty recipient.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRoyaltyRecipient | address | Address of the new recipient of royalties |

### getRoyaltyRecipient

```solidity
function getRoyaltyRecipient() external view virtual returns (address)
```

Used to retrieve the recipient of royalties.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address Address of the recipient of royalties |

### getRoyaltyPercentage

```solidity
function getRoyaltyPercentage() external view virtual returns (uint256)
```

Used to retrieve the specified royalty percentage.
     + @return uint256 The royalty percentage expressed in the basis points

### royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view virtual returns (address receiver, uint256 royaltyAmount)
```

Used to retrieve the information about who shall receive royalties of a sale of the specified token and
 how much they will be.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the royalty info is being retrieved |
| salePrice | uint256 | Price of the token sale |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | The beneficiary receiving royalties of the sale |
| royaltyAmount | uint256 | The value of the royalties recieved by the `receiver` from the sale |

