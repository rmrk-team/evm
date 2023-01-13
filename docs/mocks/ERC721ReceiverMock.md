# Solidity API

## ERC721ReceiverMock

### Error

```solidity
enum Error {
  None,
  RevertWithMessage,
  RevertWithoutMessage,
  Panic
}
```

### _retval

```solidity
bytes4 _retval
```

### _error

```solidity
enum ERC721ReceiverMock.Error _error
```

### Received

```solidity
event Received(address operator, address from, uint256 tokenId, bytes data)
```

### constructor

```solidity
constructor(bytes4 retval, enum ERC721ReceiverMock.Error error) public
```

### onERC721Received

```solidity
function onERC721Received(address operator, address from, uint256 tokenId, bytes data) public returns (bytes4)
```

_Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
by `operator` from `from`, this function is called.

It must return its Solidity selector to confirm the token transfer.
If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.

The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`._

