# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.4.4] - 2024-02-08

### Changed

  - Moves @openzeppelin/contracts from devDependencies to dependencies.

## [2.4.3] - 2024-01-30

### Changed

  - Now requires node>=18.
  - Moves dependencies to devDependencies.
  - Adds missing prettier and linting devDependencies.
  - Renames prepare script to prepare:commit so prettier and dodoc do not run on installation.

## [2.4.2] - 2024-01-16

### Changed

  - Adds replacedAssetId on _afterAcceptAsset hook on RMRKMinifiedEquippable.

## [2.4.1] - 2024-01-16

### Changed

  - Removes unnecessary package dependency.
  - Adds replacedAssetId on _afterAcceptAsset hook.
  - _contractURI is no internal on RMRKImplementationBase.

## [2.4.0] - 2024-01-11

### Changed

  - Upgrades to Ethers V6
  - Upgrades all packages to latest versions.
  - Includes token holder interface and Abstract Implementation (EIP-7590)
  - Updates packate README

## [2.3.2] - 2024-01-04

### Changed

- Uses `msgSender()` instead of `msg.sender` where possible.
- Uses explicit imports.
- Removes several unused errors.
- Uses named returns in most places.
- Metadata updates from collection utils are now inspired by `ERC4906`
- Updates configuration files to include more networks.
- Improves docs for `directOwnerOf` method on `ERC7401`.
- Adds methods to identify equipments where the parent or child asset was replaced.
- Removes annoying warnings about unused variables.

## [2.3.1] - 2023-12-04

### Changed

- Upgrades to Openzeppelin v5.

## [2.3.0] - 2023-11-09

### Added
- Adds `RMRKRoyaltiesSplitter` to split native and ERC20 payments into multiple beneficiaries with customizable shares.
- Adds `CatalogUtils` contract, to retrieve multiple data points from a catalog in a single call.
- `CollectionUtils` now includes methods to trigger events to refresh metadata.

### Changed

- On implementation base `collectionMetadata` was replaced by `contractURI`, to be compatible with suggestion from OpenSea.
- Uses `memory` instead of `callback` for catalog core and implementation methods.
- On `ERC-7508` (draft) Removes 'Token' from getter methods for consistency.

### Fixed

- Changelog had truncated version headers for 2.2.0 and 2.1.1

### Removed

- TokenProperties extension in favor of `ERC-7508`

## [2.2.0] - 2023-10-06

### Added

- Adds Revealable and Revealer Interfaces, with Abstract implementation for Revealable. The purpose is to make the reveal flow much easier for the holders and cheaper for the issuer.

### Changed

- Makes methods to check for permissions internal instead of private on core implementations:
  - \_onlyApprovedForAssetsOrOwner
  - \_onlyApprovedOrDirectOwner
  - \_onlyApprovedOrOwner

## [2.1.1] - 2023-09-21

### Changed

- Most asset and equipping related variables are changed from `private` to `internal` visibility, to allow for more flexibility on implementations.

## [2.1.0] - 2023-09-19

This release covers minor improvements and updates the numbers for Nestable and Emotable ERCs.

The original Nestable standard (ERC-6059) was missing parameter in the specification due to a method modified during the EIP process. The `interfaceId` of the specified interface was correct, so all the collections deployed using this package in the past were using the newly finalized ERC-7401 instead of ERC-6059.

The need to update the Emotes standard (ERC-6381) was noticed before it was released into production. The implementation was incompatible with the full set of Unicode emojis due to them having additional flags, and their codes extended well over the `bytes4` storage available. The updated standard (ERC-7409) uses `string` type values to store the emoji codes and is now compatible with all existing emojis as well as any of those that will be added in the future. Our emotes.app has used ERC-7409 since its release, so you don't need to worry that some reactions might be lost; they are all there.

To reiterate: you do not need to worry about upgrading or fixing previously deployed collections using these ERCs, since they are already built based on the latest specification ever since they have been released into the public domain.

### Changed

- `equip` and `unequip` methods are now gated to the owner or approved for assets, transfer permission no longer needs to be granted alongside equip/unequip permission.
- Renames ERC-6059 to ERC-7401.
- Renames emotes repository to ERC-7409.
- Adds Base test and mainnet networks
- Improves hardhat config and .env.example for network configuration.

### Fixed

- No longer restricts child catalog from being different than parent's catalog to consider the child equippable in RMRKEquipRenderUtils.
- Fixes soulbound detection on RenderUtils.getExtendedNFT.

## [2.0.0] - 2023-08-01

This Release has significant breaking changes in all ready-to-use implementations. The inheritance flow was highly simplified, by merging all extra utilities, which a marketplace would typically expect, into a single abstract contract: `RMRKImplementationBase`. This contract replaces `RMRKCollectionMetadata`, `RMRKMintingUtils` contracts and `name` and `symbol` of all core implementations.

The contract includes royalties, a method to update the royalties recipient, internal utils to keep track of next token and asset IDs, and the following getters that marketplaces commonly expect:

- `totalSupply`
- `maxSupply`
- `name`
- `symbol`
- `collectionMetadata`

Implementations no longer share the same constructor data; they only accept the necessary data. This reduces the size of the contracts allowing for more custom logic within your smart contract.

Core implementations updates include breaking changes as well; names and symbols were removed from them to keep them fully non-opinionated.

### Added

- Added Soulbound implementation versions for all ready-to-use implementations.
- Added `CollectionUtils` with methods to get several data points with a single call. This is a utility contract that only needs to be deployed once per chain, just like `RenderUtils`. `getPaginatedMintedIds` was moved from render utils to this contract.
- Added new Render Utils methods: `getTotalDescendants`, `hasMoreThanOneLevelOfNesting`
- Added `TokenPropertiesRepository`.
- Added `TokenHolder` extension.
- Added new networks to Hardhat config: Sepolia, Polygon Mumbai, Polygon, and Mainnet. Removed Görli.
- Started keeping a Changelog.

### Changed

- Recreated all ready-to-use implementations for premint and lazy minting with native tokens or custom ERC20 tokens.
- Reduced size of `MinifiedEquippable` contract.
- Premint versions now receive `tokenURI` on mint. Lazy mint versions use the base URL passed to a constructor and append `tokenId` to compose the `tokenURI`.
- Removed Split Equippable implementations, which kept `MultiAsset` and `Equippable` legos in a different contract to `Nestable`.
- Merged all the extras needed for a full implementation into a single contract: `RMRKImplementationBase`.
- Splits `tokenURI` extension into two versions, one using ID per token (`RMRKTokenURIPerToken`) and one using base URI, appending tokenId, (`RMRKTokenURIEnumerated`).
- Removes several unneeded mocks.
- Rellocates all errors into `RMRKErrors` lib.
- Adds `IERC721Metadata` interface support to implementations.
- Emotes extension was removed in favor of the shared repository.
- All contracts now use solidity version 0.8.21.
- Upgrades dependencies.
- Increases Istanbul code coverage:
|                	| **Previous** 	| **Current** 	| **Change** 	|
|:--------------:	|:------------:	|:-----------:	|------------	|
| **Statements** 	|   100.00 %   	|   100.00 %  	|  + 0.00 %  	|
|  **Branches**  	|    95.53 %   	|   96.78 %   	|  + 1.25 %  	|
|  **Functions** 	|    99.60 %   	|   99.72 %   	|  + 0.12 %  	|
|    **Lines**   	|    99.63 %   	|   99.46 %   	|  - 0.17 %  	|

### Fixed

- Fixes `Transfer` event, which was sometimes sending root owner instead of the direct owner.
- Fixes reducing the owner's balance before the `_beforeTransfer` hooks in some contracts.
- Fixes emotes repository to support every possible emoji and relocate it from the extensions folder.
