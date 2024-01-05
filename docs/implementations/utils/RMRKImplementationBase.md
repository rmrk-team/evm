# RMRKImplementationBase

*RMRK team*

> RMRKImplementationBase

Smart contract of the RMRK minting utils module.

*This smart contract includes the top-level utilities for managing minting and implements Ownable by default.*

## Methods

### contractURI

```solidity
function contractURI() external view returns (string contractURI_)
```

Used to retrieve the metadata URI of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| contractURI_ | string | string The metadata URI of the collection |

### getRoyaltyPercentage

```solidity
function getRoyaltyPercentage() external view returns (uint256 royaltyPercentageBps)
```

Used to retrieve the specified royalty percentage.




#### Returns

| Name | Type | Description |
|---|---|---|
| royaltyPercentageBps | uint256 | The royalty percentage expressed in the basis points |

### getRoyaltyRecipient

```solidity
function getRoyaltyRecipient() external view returns (address recipient)
```

Used to retrieve the recipient of royalties.




#### Returns

| Name | Type | Description |
|---|---|---|
| recipient | address | Address of the recipient of royalties |

### isContributor

```solidity
function isContributor(address contributor) external view returns (bool isContributor_)
```

Used to check if the address is one of the contributors.



#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor whose status we are checking |

#### Returns

| Name | Type | Description |
|---|---|---|
| isContributor_ | bool | Boolean value indicating whether the address is a contributor or not |

### manageContributor

```solidity
function manageContributor(address contributor, bool grantRole) external nonpayable
```

Adds or removes a contributor to the smart contract.

*Can only be called by the owner.Emits ***ContributorUpdate*** event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor | address | Address of the contributor&#39;s account |
| grantRole | bool | A boolean value signifying whether the contributor role is being granted (`true`) or revoked  (`false`) |

### maxSupply

```solidity
function maxSupply() external view returns (uint256 maxSupply_)
```

Used to retrieve the maximum supply of the collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| maxSupply_ | uint256 | The maximum supply of tokens in the collection |

### name

```solidity
function name() external view returns (string name_)
```

Used to retrieve the collection name.




#### Returns

| Name | Type | Description |
|---|---|---|
| name_ | string | Name of the collection |

### owner

```solidity
function owner() external view returns (address owner_)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| owner_ | address | Address of the current owner |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Leaves the contract without owner. Functions using the `onlyOwner` modifier will be disabled.

*Can only be called by the current owner.Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is  only available to the owner.*


### royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount)
```

Used to retrieve the information about who shall receive royalties of a sale of the specified token and  how much they will be.



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | ID of the token for which the royalty info is being retrieved |
| salePrice | uint256 | Price of the token sale |

#### Returns

| Name | Type | Description |
|---|---|---|
| receiver | address | The beneficiary receiving royalties of the sale |
| royaltyAmount | uint256 | The value of the royalties recieved by the `receiver` from the sale |

### symbol

```solidity
function symbol() external view returns (string symbol_)
```

Used to retrieve the collection symbol.




#### Returns

| Name | Type | Description |
|---|---|---|
| symbol_ | string | Symbol of the collection |

### totalAssets

```solidity
function totalAssets() external view returns (uint256 totalAssets_)
```

Used to retrieve the total number of assets.




#### Returns

| Name | Type | Description |
|---|---|---|
| totalAssets_ | uint256 | The total number of assets |

### totalSupply

```solidity
function totalSupply() external view returns (uint256 totalSupply_)
```

Used to retrieve the total supply of the tokens in a collection.




#### Returns

| Name | Type | Description |
|---|---|---|
| totalSupply_ | uint256 | The number of tokens in a collection |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

Transfers ownership of the contract to a new owner.

*Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | Address of the new owner&#39;s account |

### updateRoyaltyRecipient

```solidity
function updateRoyaltyRecipient(address newRoyaltyRecipient) external nonpayable
```

Used to update recipient of royalties.

*Custom access control has to be implemented to ensure that only the intended actors can update the  beneficiary.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newRoyaltyRecipient | address | Address of the new recipient of royalties |



## Events

### ContributorUpdate

```solidity
event ContributorUpdate(address indexed contributor, bool isContributor)
```

Event that signifies that an address was granted contributor role or that the permission has been  revoked.

*This can only be triggered by a current owner, so there is no need to include that information in the event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| contributor `indexed` | address | Address of the account that had contributor role status updated |
| isContributor  | bool | A boolean value signifying whether the role has been granted (`true`) or revoked (`false`) |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

Used to anounce the transfer of ownership.



#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | Address of the account that transferred their ownership role |
| newOwner `indexed` | address | Address of the account receiving the ownership role |



## Errors

### RMRKNewContributorIsZeroAddress

```solidity
error RMRKNewContributorIsZeroAddress()
```

Attempting to assign a 0x0 address as a contributor




### RMRKNewOwnerIsZeroAddress

```solidity
error RMRKNewOwnerIsZeroAddress()
```

Attempting to transfer the ownership to the 0x0 address




### RMRKNotOwner

```solidity
error RMRKNotOwner()
```

Attempting to interact with a management function without being the smart contract&#39;s owner




### RMRKRoyaltiesTooHigh

```solidity
error RMRKRoyaltiesTooHigh()
```

Attempting to set the royalties to a value higher than 100% (10000 in basis points)





