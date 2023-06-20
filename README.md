# RMRK Solidity

A set of Solidity smart contracts implementing [RMRK](https://rmrk.app) legos and the compatible extensions for them.

For each of the MultiAsset, Nestable and Equippable lego combinations, both simple and advanced sample uses are
presented in the [sample RMRK EVM contracts repository](https://github.com/rmrk-team/evm-sample-contracts).

**NOTE: RMRK smart contract documentation as well as usage instructions and examples can be found in the
[RMRK EVM developer documentation](https://evm.rmrk.app)**

## Usage

To use the RMRK legos and smart contracts contained in this repository, simply add them to your project:

```shell
yarn add @rmrk-team/evm-contract
```

or

```shell
npm -i @rmrk-team/evm-contracts
```

Once the dependency is added to your project, simply import the smart contracts you wish to utilize into your own smart
contract.

## RMRK Legos

RMRK is a set of NFT standards which compose several "NFT 2.0 lego" primitives. Putting these legos together allows a
user to create NFT systems of arbitrary complexity.

There are various possibilities on how to combine these legos, all of which are ERC721 compatible:

1. MultiAsset (Context-Dependent Multi-Asset Tokens)
   - Only uses the MultiAsset RMRK lego
2. Nestable (Parent-Governed Nestable Non-Fungible Tokens)
   - Only uses the Nestable RMRK lego
3. Nestable with MultiAsset
   - Uses both Nestable and MultiAsset RMRK legos
4. Equippable MultiAsset with Nestable and Catalog
   - Merged equippable is a more compact RMRK lego composite that uses less smart contracts, but has less space for
     custom logic implementation
   - Split equippable is a more customizable RMRK lego composite that uses more smart contracts, but has more space for
     custom logic implementation

![RMRK Legos infographic](img/RMRKLegoInfographics.png)

While we strongly encourage to refer to the [documentation](http://evm.rmrk.app), we provide some quick-start notes for
the use of our legos:

### MultiAsset ([RMRKMultiAsset](./contracts/RMRK/multiasset/RMRKMultiAsset.sol)): [ERC-5773: Context-Dependent Multi-Asset Tokens](https://eips.ethereum.org/EIPS/eip-5773)

1. Deploy the `MultiAsset` contract.
2. Admin must add assets on a **_per-token_** basis. This could be very gas-intensive, so we recommend adding them in
   batches.
3. Mint the tokens using your preferred method.

### Nestable ([RMRKNestable](./contracts/RMRK/nestable/RMRKNestable.sol)): [EIP-6059: Parent-Governed Nestable Non-Fungible Tokens](https://eips.ethereum.org/EIPS/eip-6059)

1. Deploy like a regular ERC-721 compliant smart contract.

That's it! This contract can receive and be nested by other instances of RMRKNestable.

**NOTE: A smart contract that is only Nestable WILL NOT be compatible with other equippable contracts as a standalone.**

### Nestable with MultiAsset

A combination of Nestable and MultiAsset lego is a powerful way of designing Non-Fungible Tokens. To quickstart this
implementation ([RMRKNestableMultiAsset](./contracts/RMRK/nestable/RMRKNestableMultiAsset.sol)), you only need to follow
the steps outlined for the [MultiAsset lego](#multiasset-rmrkmultiasset-erc-5773-context-dependent-multi-asset-tokens).

### Equippable: [EIP-6220: Composable NFTs utilizing Equippable Parts](https://eips.ethereum.org/EIPS/eip-6220)

RMRK Equippable lego composite comes in two configurations: Merged and Split Equippable. The former is a single contract
designed to handle the full implementation of MultiAsset, Nestable, and Equippable. The latter separates Nestable and
Equippable with MultiAsset into two mutually dependent contracts to allow for more custom logic in each, if necessary.

#### Quick-start Merged Equippable

1. Deploy the [RMRKEquippable](./contracts/RMRK/equippable/RMRKEquippable.sol). This contract implements minting,
   burning and asset management logic.
2. Deploy the [RMRKCatalog](./contracts/RMRK/catalog/RMRKCatalog.sol).
3. Initialize your catalog parts (fixed and slot). Address of the RMRKCatalog along with the catalog part IDs need to be
   passed when initializing your assets in RMRKEquippable.
4. Assign token assets in RMRKEquippable as you would in the MultiAsset above, with the added `ExtendedAsset` params,
   `equippableRefId` and `catalogAddress`.

#### Quick-start Split Equippable

1. Deploy the [RMRKNestableExternalEquippable](./contracts/RMRK/equippable/RMRKNestableExternalEquip.sol). This contract
   contains core transfer and minting logic.
2. Deploy the [RMRKExternalEquip](./contracts/RMRK/equippable/RMRKExternalEquip.sol). This contract contains equippable
   and asset management logic.
3. Initialize the address of RMRKExternalEquippable in RMRKNestableExternalEquippable via an exposed
   `setEquippalbeAddress` method. If you're not using a prefab RMRK top-level implementation (found in the
   [`implementations`](./contracts/implementations/) directory), you will need to expose this yourself.
4. Deploy [RMRKCatalog](./contracts/RMRK/catalog/RMRKCatalog.sol).
5. Initialize your catalog parts (fixed and slot). Address of the RMRKCatalog along with the catalog part IDs need to be
   passed when initializing your assets in RMRKExternalEquip.
6. Assign token assets in RMRKExternalEquippable as you would in the MultiAsset above, with the added `ExtendedAsset`
   params, `equippableRefId` and `catalogAddress`.

**NOTE: Please be aware that RMRKEquippable is likely very close to the maximum smart contract deployment size allowed
by most EVM environments. If you need more space for custom business logic implementation, we suggest you consider
[RMRKNestableExternalEquippable](./contracts/RMRK/equippable/RMRKNestableExternalEquip.sol).**

### Emotable

One of the extensions present in this repository is [`Emotable`](./contracts/RMRK/extension/emotable/RMRKEmotable.sol).
It provides the ability for users to react to NFTs using Unicode emojis.

To use it, just import the [`Emotable`](./contracts/RMRK/extension/emotable/RMRKEmotable.sol) smart contract into the
one you wish to utilize it.

## Interfaces

The interfaces of all of the smart contracts are included in this repository. They are prefixed with an `I`; so the
interface for the `RMRKNestable` is `IRMRKNestable`. If you wish to interact with any of the RMRK smart contracts from
your own, you only need to import the desired interface.

## Implementations

In addition to the raw RMRK legos and extensions, this repository also contains implementations of all of them in the
[`implementations/`](./contracts/implementations/) directory. These implementations are opinionated and utilize the
extensions that we feel provide the most utility for each of the implementations.

<!-- ## Fractional

> TBD

Turning NFTs into fractional tokens after a deposit of RMRK.
The deposit size should be read from Settings.

## Settings

> TBD

A storage contract containing values like the RMRK Fungibilization deposit (how many tokens you need to make an NFT into a collection of fungibles) and other governance-settable values.

## Logic

> TBD

JSONlogic for front-end variability based on on-chain values.
Logic should go into a Logic field of the NFT's body, and is executed exclusively in the client.

## Harberger

> TBD

An extension for the contracts to make them Harberger-taxable by default, integrating the selling and taxing functionality right into the NFT's mint. This does mean the NFT can never not be Harb-taxed, but there can be an on-off flag for this that the _ultimate owner_ (a new owner type?) can flip. -->
