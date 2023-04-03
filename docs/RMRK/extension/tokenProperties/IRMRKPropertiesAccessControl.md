# IRMRKPropertiesAccessControl









## Methods

### isCollaborator

```solidity
function isCollaborator(address collaborator, address collection, enum IRMRKPropertiesAccessControl.ParameterType parameterType, uint256 parameterId) external view returns (bool)
```

Used to check if the specified address is listed as a collaborator of the given collection&#39;s parameter.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collaborator | address | Address to be checked. |
| collection | address | Address of the collection. |
| parameterType | enum IRMRKPropertiesAccessControl.ParameterType | Type of the parameter being checked. |
| parameterId | uint256 | ID of the parameter being checked. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating if the address is a collaborator of the given collection&#39;s parameter (`true`) or  not (`false`). |

### isSpecificAddress

```solidity
function isSpecificAddress(address specificAddress, address collection, enum IRMRKPropertiesAccessControl.ParameterType parameterType, uint256 parameterId) external view returns (bool)
```

Used to check if the specified address is listed as a specific address of the given collection&#39;s  parameter.



#### Parameters

| Name | Type | Description |
|---|---|---|
| specificAddress | address | Address to be checked. |
| collection | address | Address of the collection. |
| parameterType | enum IRMRKPropertiesAccessControl.ParameterType | Type of the parameter being checked. |
| parameterId | uint256 | ID of the parameter being checked. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Boolean value indicating if the address is a specific address of the given collection&#39;s parameter  (`true`) or not (`false`). |

### manageAccessControl

```solidity
function manageAccessControl(address collection, enum IRMRKPropertiesAccessControl.ParameterType parameterType, uint256 parameterId, enum IRMRKPropertiesAccessControl.AccessType accessType, address[] collaboratorAddresses, bool[] collaboratorAddressAccess, address[] specificAddresses, bool[] specificAddressAccess) external nonpayable
```

Used to manage the access control settings for a specific parameter.

*Only the `issuer` of the collection can call this function.The `collaboratorAddresses` and `collaboratorAddressAccess` arrays must be of the same length.The `specificAddresses` and `specificAddressAccess` arrays must be of the same length.the possible `parameterType` values are:  [      STRING,      ADDRESS,      BYTES,      UINT,      BOOL  ]The possible `accessType` values are:  [      Issuer,      Collaborator,      IssuerOrCollaborator,      TokenOwner,      SpecificAddress,  ]Emits an {AccessControlUpdated} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The address of the collection being managed. |
| parameterType | enum IRMRKPropertiesAccessControl.ParameterType | Type of the parameter being managed. |
| parameterId | uint256 | ID of the parameter being managed. |
| accessType | enum IRMRKPropertiesAccessControl.AccessType | The type of access control to be applied to the parameter. |
| collaboratorAddresses | address[] | The array of addresses to be added or removed from the list of collaborators. |
| collaboratorAddressAccess | bool[] | The array of boolean values to indicate if the address should be added as a  collaborator (`true`) or removed (`false`). |
| specificAddresses | address[] | The array of addresses to be added or removed from the list of specific addresses. |
| specificAddressAccess | bool[] | The array of boolean values to indicate if the address should be added as a specific  address (`true`) or removed (`false`). |

### registerAccessControl

```solidity
function registerAccessControl(address collection, address issuer, bool useOwnable) external nonpayable
```

Used to register a collection to use the RMRK token properties repository.

*If the collection does not implement the Ownable interface, the `useOwnable` value must be set to `false`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| collection | address | The address of the collection that will use the RMRK token properties repository. |
| issuer | address | The address of the issuer of the collection. |
| useOwnable | bool | The boolean value to indicate if the collection implements the Ownable interface and whether it  should be used to validate that the caller is the issuer (`true`) or to use the manually set issuer address  (`false`). |



## Events

### AccessControlUpdated

```solidity
event AccessControlUpdated(address indexed collection, enum IRMRKPropertiesAccessControl.ParameterType parameterType, uint256 parameterId, enum IRMRKPropertiesAccessControl.AccessType accessType, address[] collaboratorAddresses, bool[] collaboratorAddressAccess, address[] specificAddresses, bool[] specificAddressAccess)
```

Used to noitfy listeners that the access control settings for a specific parameter have been updated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| collection `indexed` | address | Address of the collection. |
| parameterType  | enum IRMRKPropertiesAccessControl.ParameterType | The type of parameter for which the access control settings have been updated. |
| parameterId  | uint256 | The ID of the parameter for which the access control settings have been updated. |
| accessType  | enum IRMRKPropertiesAccessControl.AccessType | The AccessType of the parameter for which the access control settings have been updated. |
| collaboratorAddresses  | address[] | The array of collaborator addresses that have been updated. |
| collaboratorAddressAccess  | bool[] | The boolean array of the access values for the collaborator addresses. |
| specificAddresses  | address[] | The array of specific addresses that have been updated. |
| specificAddressAccess  | bool[] | The boolean array of the access values for the specific addresses. |



