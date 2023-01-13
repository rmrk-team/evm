# Solidity API

## RMRKCatalogMock

### constructor

```solidity
constructor(string metadataURI, string type_) public
```

### addPart

```solidity
function addPart(struct IRMRKCatalog.IntakeStruct intakeStruct) external
```

### addPartList

```solidity
function addPartList(struct IRMRKCatalog.IntakeStruct[] intakeStructs) external
```

### addEquippableAddresses

```solidity
function addEquippableAddresses(uint64 partId, address[] equippableAddresses) external
```

### setEquippableAddresses

```solidity
function setEquippableAddresses(uint64 partId, address[] equippableAddresses) external
```

### setEquippableToAll

```solidity
function setEquippableToAll(uint64 partId) external
```

### resetEquippableAddresses

```solidity
function resetEquippableAddresses(uint64 partId) external
```

