# RMRK EVM Package

A set of Solidity smart contracts implementing [RMRK](https://rmrk.app) modular NFTs and compatible extensions for them.

**Smart contracts documentation as well as usage instructions and tutorials can be found in the
[RMRK EVM developer documentation](https://evm.rmrk.app)**

## Usage

To use the RMRK legos and smart contracts contained in this repository, simply add them to your project:

```shell
bun add @rmrk-team/evm-contracts
```

Once the dependency is added to your project, simply import the smart contracts you wish to utilize into your own smart
contract.

## Development

```shell
bun install
bun run test
bun run coverage
bun run build:artifacts
bun run docs:prepare
bun run docs:build
```

## Docs workflow

Docs are built with Nextra/Next.js using the content in `pages/` plus the contract docs generated
from `docs/`:

- `bun run docs:prepare` runs `hardhat dodoc`, syncs the generated contract docs into
  `pages/evm-package/`, and generates `_meta.json` navigation.
- `bun run docs:build` runs `docs:prepare`, then `next build && next export` to emit the static site
  in `out/`.
- `bun run docs:dev` runs the local docs dev server.

## Automation

On each push to `master`, Cloudflare Pages builds and deploys the docs using the repo settings from
the CF UI.

On each published GitHub Release, GitHub Actions publishes the npm package: it installs
dependencies with Bun, runs `bun run test`, runs `bun run build:artifacts`, and publishes the
package with `bun publish --access public` when the package version is not already on npm.

Cloudflare Pages settings:

- **Build command**: `bun install && bun run docs:build`
- **Output directory**: `out`

npm publishing uses OIDC Trusted Publishing (no secrets required).

## RMRK Legos

RMRK is a set of NFT standards that compose several NFT module primitives. Putting these modules together allows a user to create NFT systems of arbitrary complexity.
So far we have created 6 modules as ERC proposals, all of which are ERC721 compatible. The first 5 are already standards, the 6th is still in Draft.

- MultiAsset: [ERC-5773: Context-Dependent Multi-Asset Tokens](https://eips.ethereum.org/EIPS/eip-5773)
- Nestable: [ERC-7401: Parent-Governed Non-Fungible Tokens Nesting](https://eips.ethereum.org/EIPS/eip-7401)
- Composable & Equippable: [ERC-6220: Composable NFTs utilizing Equippable Parts](https://eips.ethereum.org/EIPS/eip-6220)
- Soulbound: [ERC-6454: Minimal Transferable NFT detection interface](https://eips.ethereum.org/EIPS/eip-6454)
- Emotable: [ERC-7409: Public Non-Fungible Tokens Emote Repository](https://eips.ethereum.org/EIPS/eip-7409)
- Dynamic Attributes: [ERC-7508: Dynamic On-Chain Token Attributes Repository](https://eips.ethereum.org/EIPS/eip-7508)
- ERC20-Holder: [ERC-7590: ERC-20 Holder Extension for NFTs](https://eips.ethereum.org/EIPS/eip-7590)

![RMRK Modules](/img/General_Overview_Modules.png)
