# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.1.0] - 2023-09-19

This release covers minor improvements and updates the numbers for Nestable and Emotable EIPs. 

The original Nestable EIP (6059) had a missing parameter on a method which was added during the EIP process. Luckily the interfaceId was correct, so all collections deployed using this package actually always used 7401 instead of 6059. For the Emotes EIP, we found before releasing in production that 6381 was not compatible with all current emojis, so we proposed 7409 to fix this and ensure forward compatibility. emotes.app always used 7409. To be extra clear, you do not need to worry about upgrading or fixing previously deployed collections using these EIPs, all Nestable collections deployed using any of RMRK products or libraries has always used 7401, the detection through interfaceId ensures that.

### Changed
- Equip and Unequip are now gated for owner or approved for assets, permission over transferring is no longer needed to delegate equipping.
- Renames 6059 to 7401.
- Renames emotes repository to 7409.
- Adds base network on testing and production.
- Improves hardhat config and .env.example for network configuration.

### Fixed
- No longer restricts child catalog to match parent's catalog to consider the child equippable on RMRKEquipRenderUtils.
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
