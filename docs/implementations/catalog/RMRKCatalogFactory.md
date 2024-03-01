# RMRKCatalogFactory

*RMRK team*

> RMRKCatalogFactory

Smart contract to deploy catalog implementations and keep track of deployers.



## Methods

### deployCatalog

```solidity
function deployCatalog(string metadataURI, string type_) external nonpayable returns (address)
```

Used to deploy a new RMRKCatalog implementation.



#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataURI | string | Base metadata URI of the catalog |
| type_ | string | The type of the catalog |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address of the deployed catalog |

### getDeployerCatalogAtIndex

```solidity
function getDeployerCatalogAtIndex(address deployer, uint256 index) external view returns (address catalogAddress)
```

Used to get a catalog deployed by a given deployer at a given index.



#### Parameters

| Name | Type | Description |
|---|---|---|
| deployer | address | The address of the deployer |
| index | uint256 | The index of the catalog |

#### Returns

| Name | Type | Description |
|---|---|---|
| catalogAddress | address | The address of the catalog |

### getDeployerCatalogs

```solidity
function getDeployerCatalogs(address deployer) external view returns (address[])
```

Used to get all catalogs deployed by a given deployer.



#### Parameters

| Name | Type | Description |
|---|---|---|
| deployer | address | The address of the deployer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | An array of addresses of the catalogs deployed by the deployer |

### getLastDeployerCatalog

```solidity
function getLastDeployerCatalog(address deployer) external view returns (address catalogAddress)
```

Used to get the last catalog deployed by a given deployer.



#### Parameters

| Name | Type | Description |
|---|---|---|
| deployer | address | The address of the deployer |

#### Returns

| Name | Type | Description |
|---|---|---|
| catalogAddress | address | The address of the last catalog deployed by the deployer |

### getTotalDeployerCatalogs

```solidity
function getTotalDeployerCatalogs(address deployer) external view returns (uint256 total)
```

Used to get the total number of catalogs deployed by a given deployer.



#### Parameters

| Name | Type | Description |
|---|---|---|
| deployer | address | The address of the deployer |

#### Returns

| Name | Type | Description |
|---|---|---|
| total | uint256 | The total number of catalogs deployed by the deployer |



## Events

### CatalogDeployed

```solidity
event CatalogDeployed(address indexed deployer, address indexed catalog)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| deployer `indexed` | address | undefined |
| catalog `indexed` | address | undefined |



