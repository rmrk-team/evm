# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0] - 2023-08-01

This Release has major breaking changes in all ready to use implementations. The inheritance flow was highly simplified by merging all extra utilities which a marketplace would typically expect, into a single abstract contract: `RMRKImplementationBase`. This replaces `RMRKCollectionMetadata`, `RMRKMintingUtils` contracts, and `name` and `symbol` from all core implementations.

The contract includes royalties, a method to update the royalties recipient, internal utils to keep tack of next token and asset Ids, and these getters which marketplaces typically expect:

- `totalSupply`
- `maxSupply`
- `name`
- `symbol`
- `collectionMetadata`

Implementations no longer share the same constructor data, they take only the minimum needed. This reduces the size of the contracts giving more room to custom logic on top.

Core implementations also have breaking changes, as name and symbol were removed from them to keep them fully non-opinionated.

### Added

- Added Soulbound implementation versions for all ready to use implementations.
- Added `CollectionUtils` with methods to get several data points in a single call. This is a utility contract that needs to be deployed only once per chain, as `RenderUtils`. `getPaginatedMintedIds` Was moved from render utils to this contract.
- Added new Render Utils: `getTotalDescendants`, `hasMoreThanOneLevelOfNesting`
- Added `TokenPropertiesRepository`.
- Added `TokenHolder` extension.
- Added new networks on hardhat config: Sepolia, Polygon Mumbai, Polygon and Mainnet. Removed Goerli.
- Started Changelog.

### Changed

- Recreated all ready to use implementations for premint and lazy minting with native token or custom ERC20.
- Reduced size of `MinifiedEquippable` contract.
- Premint versions now receive `tokenURI` on mint. Lazy mint versions use base URL on constructor and append `tokenId` to get the `tokenURI`.
- Removed Split Implementations, which kept `MultiAsset` and `Equippable` legos in a different contract to `Nestable`.
- Merged all the extras needed for a full implementation into a single contract: `RMRKImplementationBase`.
- Splits tokenURI extension into 2 versions, one using Id per token, `RMRKTokenURIPerToken` and one using base URI, appending tokenId, `RMRKTokenURIEnumerated`.
- Removes several unneeded mocks.
- Rellocates all errors into `RMRKErrors` lib.
- Adds `IERC721Metadata` interface support on implementations
- Emotes extension was removed in favor of shared repository.
- All contracts now use solidity version 0.8.21
- Upgrades dependencies.
- Increases Istanbul code coverage to
  - Statements: 100%
  - Branches: 96.78%
  - Functions: 99.72%
  - Lines: 99.64%

### Fixed

- Fix on `Transfer` event, which was sending root owner instead of direct owner in some cases.
- Fixes reducing on balance of owner before the `_beforeTransfer` hooks in some contracts.
- Fixes emotes repository so it supports every possible emoji, and relocates out of extensions folder.
