# RMRK EVM Package

A set of Solidity smart contracts implementing [RMRK](https://rmrk.app) modular NFTs and compatible extensions for them.

**Smart contracts documentation as well as usage instructions and tutorials can be found in the
[RMRK EVM developer documentation](https://evm.rmrk.app)**

## Usage

To use the RMRK legos and smart contracts contained in this repository, simply add them to your project:

```shell
yarn add @rmrk-team/evm-contracts
```

or

```shell
npm -i @rmrk-team/evm-contracts
```

Once the dependency is added to your project, simply import the smart contracts you wish to utilize into your own smart
contract.

## RMRK Legos

RMRK is a set of NFT standards that compose several NFT module primitives. Putting these modules together allows a user to create NFT systems of arbitrary complexity.
So far we have created 6 modules as ERC proposals, all of which are ERC721 compatible. The first 5 are already standards, the 6th is still in Draft.

- MultiAsset: [ERC-5773: Context-Dependent Multi-Asset Tokens](https://eips.ethereum.org/EIPS/eip-5773)
- Nestable: [ERC-7401: Parent-Governed Non-Fungible Tokens Nesting](https://eips.ethereum.org/EIPS/eip-7401)
- Composable & Equippable: [ERC-6220: Composable NFTs utilizing Equippable Parts](https://eips.ethereum.org/EIPS/eip-6220)
- Soulbound: [ERC-6454: Minimal Transferable NFT detection interface](https://eips.ethereum.org/EIPS/eip-6454)
- Emotable: [ERC-7409: Public Non-Fungible Tokens Emote Repository](https://eips.ethereum.org/EIPS/eip-7409)
- Dynamic Attributes: [ERC-7508: Dynamic On-Chain Token Attributes Repository ](https://eips.ethereum.org/EIPS/eip-7508)

![RMRK Modules](/img/General_Overview_Modules.png)
