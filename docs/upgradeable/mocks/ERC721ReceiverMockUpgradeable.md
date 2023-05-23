# ERC721ReceiverMockUpgradeable









## Methods

### __ERC721ReceiverMockUpgradeable_init

```solidity
function __ERC721ReceiverMockUpgradeable_init(bytes4 retval, enum ERC721ReceiverMockUpgradeable.Error error) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| retval | bytes4 | undefined |
| error | enum ERC721ReceiverMockUpgradeable.Error | undefined |

### onERC721Received

```solidity
function onERC721Received(address operator, address from, uint256 tokenId, bytes data) external nonpayable returns (bytes4)
```



*Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom} by `operator` from `from`, this function is called. It must return its Solidity selector to confirm the token transfer. If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted. The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| from | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | undefined |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### Received

```solidity
event Received(address operator, address from, uint256 tokenId, bytes data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator  | address | undefined |
| from  | address | undefined |
| tokenId  | uint256 | undefined |
| data  | bytes | undefined |



