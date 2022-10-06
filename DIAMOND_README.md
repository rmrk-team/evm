## RMRK_DIAMOND_IMPLEMENTATION

RMRK Diamond Implementation use the [EIP-2535](https://eips.ethereum.org/EIPS/eip-2535)'s [diamond 3](https://github.com/mudgen/diamond-3-hardhat) implementation to implement [RMRK Spec](https://github.com/rmrk-team/rmrk-spec/tree/master/standards/abstract).

### Note


### Deployment

Go to [./scripts/deploy_diamond_equippable.ts](./scripts/deploy_diamond_equippable.ts).

| Contract                                                                                  | Description                                                         | Can reuse                                |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| [Create2Deployer](./contracts/RMRK/Create2Deployer.sol)                                   | A create2 contract deployer                                         | yes                                      |
| [DiamondCutFacet](./contracts/RMRK/DiamondCutFacet.sol)                                   | The diamond raw facet used to add/remove/replace facet of diamond   | yes                                      |
| [DiamondLoupeFacet](./contracts/RMRK/DiamondLoupeFacet.sol)                               | The diamond raw facet used to explore facets of diamond             | yes                                      |
| [RMRKEquippableNestingFacet](./contracts/RMRK/RMRKEquippableNestingFacet.sol)             | The nesting part of equipment function supported facet              | optional (check the comment in the file) |
| [RMRKEquippableMultiResourceFacet](./contracts/RMRK/RMRKEquippableMultiResourceFacet.sol) | The multi-resource part of equipment function supported facet       | yes                                      |
| [Diamond](./contracts/RMRK/Diamond.sol)                                                   | The real contract that store all state                              | no                                       |
| [EquippableInit](./contracts/RMRK/EquippableInit.sol)                                     | The diamond raw facet used to initializes the state of the contract | no                                       |
