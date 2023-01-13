# Solidity API

## IRMRKInitData

Interface representation of RMRK initialization data.

_This interface provides a struct used to pack data to avoid stack too deep error for too many arguments._

### InitData

```solidity
struct InitData {
  address erc20TokenAddress;
  bool tokenUriIsEnumerable;
  address royaltyRecipient;
  uint16 royaltyPercentageBps;
  uint256 maxSupply;
  uint256 pricePerMint;
}
```

