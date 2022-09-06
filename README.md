# RMRK Solidity

A set of Solidity contracts for RMRK.app.

For each of the Multiresource, Nesting and Equippable combinations, we provide samples of simple and advance usage in [this repo](https://github.com/rmrk-team/evm-sample-contracts).

## Multiresource (RMRKMultiresource)

WORKFLOW NOTES:

1. Deploy the Multiresource contract.
2. Admin must add resources on a PER-TOKEN basis. This could be very gas-expensive, so it's recommended that this be done
in batches.
3. Mint the tokens after your preferred method.

## Nesting (RMRKNesting)

1. Deploy like a regular ERC721. That's it! This contract can recieve and be nested by other instances of RMRKNesting.
Note that it WILL NOT be compatible with other equippable contracts as a standalone.

RMRK also offers Nesting + Multiresource (RMRKNestingMultiresource). To deploy, follow instructions after Multiresource.

## Equippable

RMRK Equippable comes in two flavors: RMRKEquippable and RMRKNestingExternalEquippable. The former is a single contract designed to handle the full implementation of multiresource, nesting, and equippable. The latter separates Nesting and Equippable into two
mutually dependent contracts to allow for more custom logic in each, if necessary.

1. Deploy the RMRKNestingExternalEquippable. This contract contains core transfer and minting logic.

2. Deploy the RMRKExternalEquippable. This contract contains equippable and resource management logic.

3. Initialize the address of RMRKExternalEquippable on RMRKNestingExternalEquippable via an exposed
setEquippalbeAddress method. If you're not using a prefab RMRK top-level implementation, you will added
need to expose this yourself.

4. Deploy RMRKBaseStorage. Initialize your base parts (fixed and slot). You will pass the address of RMRKBaseStorage and corresponding base part IDs when initializing your resources on RMRKExternalEquippable.

5. Assign token resources on RMRKExternalEquippable as you would the above Multiresource, with the added ExtendedResource params, equippableRefId and baseAddress.

DEV NOTE: Please be aware that RMRKEquippable is likely very close to the maximum contract deployment size allowed for most EVM environments. If you need more space, consider RMRKNestingExternalEquippable.

## Emotable

> TBD

Emotes are useful, but very expensive to store. Some important considerations are documented here: https://github.com/rmrk-team/pallet-emotes and here: https://hackmd.io/JjqT6THTSoqMj-_ucPEJAw?view - needs storage oprimizations considerations vs wasting gas on looping. Benchmarking would be GREAT.

# Interface

This interface defines the standard for RMRK multi-resource tokens. While this repository will not enforce inheritance from another interface that defines a spec for token provenance or transfer, please note that most practical implementations will do so, the implementation provided in this repository included.

# Implementation

Provided are two examples of a RMRK multiresource token -- one which inherits from ERC721, and one which inherits from RMRK nesting, which may be considered a ERC721 compatible replacement.

## Fractional

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

An extension for the contracts to make them Harberger-taxable by default, integrating the selling and taxing functionality right into the NFT's mint. This does mean the NFT can never not be Harb-taxed, but there can be an on-off flag for this that the _ultimate owner_ (a new owner type?) can flip.

---

## Develop

Just run `npx hardhat compile` to check if it works. Refer to the rest below.

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

## Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/sample-script.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
