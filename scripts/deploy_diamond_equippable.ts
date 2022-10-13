import { Contract } from 'ethers';
import { ethers } from 'hardhat';

import { getSelectors, FacetCutAction } from './libraries/diamond';

const HARDHAT_NETWORK_CHAIN_ID = 31337;
const PUBLIC_ACCOUNT_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const TRANSACTION_SIGNER_ADDRESS = '0xFBa50dD46Af71D60721C6E38F40Bce4d2416A34B';

const versionSuffix = '-0.2.0-alpha';
const create2DeployerAddress = '0xcf2281070e6a50e4050694eef1a9a7376628d663';

async function isHardhatChain() {
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  if (chainId === HARDHAT_NETWORK_CHAIN_ID) {
    return true;
  }

  return false;
}

export async function deployCreate2Deployer() {
  // if is in local chain, send some value to transaction signer address
  if (await isHardhatChain()) {
    const publicAccount = new ethers.Wallet(PUBLIC_ACCOUNT_PRIVATE_KEY, ethers.provider);

    await publicAccount.sendTransaction({
      to: TRANSACTION_SIGNER_ADDRESS,
      value: ethers.constants.WeiPerEther.mul(20),
    });
  }

  // This pre-signed transaction is signed by 0xFBa50dD46Af71D60721C6E38F40Bce4d2416A34B,
  // gasLimit at 300_000, gasPrice at 100Gwei.
  // The EIP-155 is disabled to make sure transaction can be replayed on every single EVM chain,
  // to let Create2Deployer address same and then every facet contract address will be same on
  // every EVM chain.
  // NOTE that now a lot of RPC nodes will not support pre-signed transaction without `chainId`,
  // because it's a default config in go-ethereum client, to be able to send pre-signed transaction below,
  // you can install `geth`(or similar client from other chain) yourself and add `--rpc.allow-unprotected-txs`
  // flag when you run the full node, and you can also find and try available RPCs on https://chainlist.org.

  const preSignedTransaction =
    '0xf904158085174876e800830493e08080b903c2608060405234801561001057600080fd5b506103a2806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063481286e61461004657806366cfa057146100755780637806530614610088575b600080fd5b61005961005436600461022b565b61009b565b6040516001600160a01b03909116815260200160405180910390f35b610059610083366004610263565b6100af565b610059610096366004610327565b6100c4565b60006100a88383306100c4565b9392505050565b60006100bc848484610121565b949350505050565b604080516001600160f81b03196020808301919091526bffffffffffffffffffffffff19606085901b16602183015260358201869052605580830186905283518084039091018152607590920190925280519101206000906100bc565b600080844710156101795760405162461bcd60e51b815260206004820152601d60248201527f437265617465323a20696e73756666696369656e742062616c616e636500000060448201526064015b60405180910390fd5b82516000036101ca5760405162461bcd60e51b815260206004820181905260248201527f437265617465323a2062797465636f6465206c656e677468206973207a65726f6044820152606401610170565b8383516020850187f590506001600160a01b0381166100bc5760405162461bcd60e51b815260206004820152601960248201527f437265617465323a204661696c6564206f6e206465706c6f79000000000000006044820152606401610170565b6000806040838503121561023e57600080fd5b50508035926020909101359150565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561027857600080fd5b8335925060208401359150604084013567ffffffffffffffff8082111561029e57600080fd5b818601915086601f8301126102b257600080fd5b8135818111156102c4576102c461024d565b604051601f8201601f19908116603f011681019083821181831017156102ec576102ec61024d565b8160405282815289602084870101111561030557600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b60008060006060848603121561033c57600080fd5b833592506020840135915060408401356001600160a01b038116811461036157600080fd5b80915050925092509256fea26469706673582212201f9fe2803ac8899d261e3d051dcdeb776303ddea50a3f731d492db8a2fab05f964736f6c634300081000331ba069cb3319d1af304d3e28e72959c77c4bdec0c32fe1dfe36809fa843406615411a02c7cb4752a8fdb2793e6b2659903aa95b8258123770a1ebdab66e901f56c883b';
  const transactionRes = await ethers.provider.sendTransaction(preSignedTransaction);

  console.log('Transaction Response is', transactionRes);

  return create2DeployerAddress;
}

export async function oneTimeDeploy(create2DeployerAddress: string, deployed = false) {
  const create2Deployer = await ethers.getContractAt('Create2Deployer', create2DeployerAddress);
  const RMRKMultiResourceRenderUtils = await ethers.getContractFactory(
    'RMRKMultiResourceRenderUtils',
  );
  const RMRKValidatorLib = await ethers.getContractFactory('RMRKValidatorLib');

  // ---------- Normal deployment
  // if (!deployed) {
  //   const rmrkMultiResourceRenderUtils = await RMRKMultiResourceRenderUtils.deploy();

  //   await rmrkMultiResourceRenderUtils.deployed();
  // }
  // -----------------

  // ---------- Create2 deployment
  const rmrkMultiResourceRenderUtilsHash = ethers.utils.id('RMRKMultiResourceRenderUtils');
  if (!deployed) {
    await create2Deployer.deploy(
      0,
      rmrkMultiResourceRenderUtilsHash,
      RMRKMultiResourceRenderUtils.bytecode,
    );
  }

  const rmrkMultiResourceRenderUtilsAddress = await create2Deployer[
    'computeAddress(bytes32,bytes32)'
  ](
    rmrkMultiResourceRenderUtilsHash,
    ethers.utils.keccak256(RMRKMultiResourceRenderUtils.bytecode),
  );
  const rmrkMultiResourceRenderUtils = await ethers.getContractAt(
    'RMRKValidatorLib',
    rmrkMultiResourceRenderUtilsAddress,
  );

  console.log('RMRKMultiResourceRender Utils deployed', rmrkMultiResourceRenderUtils.address);
  // ------------------

  // ---------- Normal deployment
  // if (!deployed) {
  //   const rmrkValidatorLib = await RMRKValidatorLib.deploy();

  //   await rmrkValidatorLib.deployed();
  // }
  // -----------------

  // ---------- Create2 deployment
  const rmrkValidatorLibHash = ethers.utils.id('RMRKValidatorLib');
  if (!deployed) {
    await create2Deployer.deploy(0, rmrkValidatorLibHash, RMRKValidatorLib.bytecode);
  }

  const rmrkValidatorLibAddress = await create2Deployer['computeAddress(bytes32,bytes32)'](
    rmrkValidatorLibHash,
    ethers.utils.keccak256(RMRKValidatorLib.bytecode),
  );
  const rmrkValidatorLib = await ethers.getContractAt('RMRKValidatorLib', rmrkValidatorLibAddress);

  console.log('RMRKValidator Lib deployed', rmrkValidatorLib.address);
  // ------------------

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  // ---------- Normal deployment
  // if (!deployed) {
  //   const diamondCutFacet = await DiamondCutFacet.deploy();
  //   await diamondCutFacet.deployed();
  // }
  // -----------------

  // ---------- Create2 deployment
  const diamondCutFacetHash = ethers.utils.id('DiamondCutFacet');
  if (!deployed) {
    await create2Deployer.deploy(0, diamondCutFacetHash, DiamondCutFacet.bytecode);
  }

  const diamondCutFacetAddress = await create2Deployer['computeAddress(bytes32,bytes32)'](
    diamondCutFacetHash,
    ethers.utils.keccak256(DiamondCutFacet.bytecode),
  );
  const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondCutFacetAddress);

  console.log('DiamondCutFacet deployed:', diamondCutFacet.address);
  // ------------------

  // deploy facets
  console.log('');
  console.log('Deploying facets');
  const FacetNames = [
    'DiamondLoupeFacet',
    'RMRKEquippableMultiResourceFacet',
    'RMRKEquippableNestingFacet',
    'RMRKEquippableFacet',
    'RMRKCollectionMetadataFacet',
    'RMRKEquippableImpl',
  ];
  const useNormalDeploy: { [k: string]: boolean } = {
    RMRKEquippableImpl: true,
  };
  const hashConcat: { [k: string]: string } = {
    RMRKEquippableMultiResourceFacet: versionSuffix,
    RMRKEquippableNestingFacet: versionSuffix,
  };
  const constructorParams: { [k: string]: [any[], any[]] } = {
    RMRKEquippableNestingFacet: [
      ['string', 'string'],
      ['RMRKNesting-0.2.0-alpha', 'RN-0.2.0-alpha'],
    ],
    RMRKEquippableMultiResourceFacet: [
      ['string', 'string'],
      ['RMRKMultiResource-0.2.0-alpha', 'RMR-0.2.0-alpha'],
    ],
  };
  const libraryLinking: { [k: string]: any } = {
    RMRKEquippableMultiResourceFacet: {
      libraries: {
        RMRKMultiResourceRenderUtils: rmrkMultiResourceRenderUtils.address,
      },
    },
    RMRKEquippableFacet: {
      libraries: {
        RMRKValidatorLib: rmrkValidatorLib.address,
      },
    },
  };
  const toBeRemovedFunctions: { [k: string]: string[] } = {
    RMRKEquippableNestingFacet: [
      // Take them in RMRKMultiResource
      'tokenURI(uint256)',
    ],
    RMRKEquippableMultiResourceFacet: [
      // Take them in RMRKNesting
      'name()',
      'symbol()',
      'ownerOf(uint256)',
      'balanceOf(address)',
      'safeTransferFrom(address,address,uint256,bytes)',
      'safeTransferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
      'approve(address,uint256)',
      'setApprovalForAll(address,bool)',
      'getApproved(uint256)',
      'isApprovedForAll(address,address)',
    ],
  };
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await (libraryLinking[FacetName]
      ? ethers.getContractFactory(FacetName, libraryLinking[FacetName])
      : ethers.getContractFactory(FacetName));
    let facet: Contract;

    if (useNormalDeploy[FacetName]) {
      // ---------- Normal deployment
      facet = await Facet.deploy();
      await facet.deployed();
      // -----------------
    } else {
      // ---------- Create2 deployment
      const facetHash = ethers.utils.id(`${FacetName}${hashConcat[FacetName] || ''}`);
      const constructorParam = constructorParams[FacetName];
      const facetByteCode = constructorParam
        ? ethers.utils.concat([
            Facet.bytecode,
            ethers.utils.defaultAbiCoder.encode(...constructorParam),
          ])
        : Facet.bytecode;
      if (!deployed) {
        await create2Deployer.deploy(0, facetHash, facetByteCode);
      }

      const facetAddress = await create2Deployer['computeAddress(bytes32,bytes32)'](
        facetHash,
        ethers.utils.keccak256(facetByteCode),
      );
      facet = await ethers.getContractAt(FacetName, facetAddress);
      // -----------------
    }
    console.log(`${FacetName} deployed: ${facet.address}`);

    // use `DiamondLoupeFacet`'s `supportsInterface` function
    let facetFunctionSelectors = getSelectors(facet);
    facetFunctionSelectors =
      FacetName !== 'DiamondLoupeFacet' &&
      facetFunctionSelectors.get!(['supportsInterface(bytes4)']).length > 0
        ? facetFunctionSelectors.remove!(['supportsInterface(bytes4)'])
        : facetFunctionSelectors;
    facetFunctionSelectors = toBeRemovedFunctions[FacetName]
      ? facetFunctionSelectors.remove!(toBeRemovedFunctions[FacetName])
      : facetFunctionSelectors;

    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: facetFunctionSelectors,
    });
  }

  // wait 1min
  if (!deployed && !(await isHardhatChain())) {
    console.log('Wait 1 min to make sure block is confirmed');

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 6e4);
    });
  }

  return [diamondCutFacetAddress, cut];
}

export async function deployDiamondAndCutFacet(
  create2DeployerAddress: string,
  diamondCutFacetAddress: string,
  cut: ReturnType<typeof oneTimeDeploy>,
) {
  const contractOwner = (await ethers.getSigners())[0];

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  // ---------- Normal deployment
  const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacetAddress);
  await diamond.deployed();
  // -----------------

  // ---------- Create2 deployment
  // const create2Deployer = await ethers.getContractAt('Create2Deployer', create2DeployerAddress);
  // const diamondHash = ethers.utils.id('Diamond');
  // const diamondByteCode = ethers.utils.concat([
  //   Diamond.bytecode,
  //   ethers.utils.defaultAbiCoder.encode(
  //     ['address', 'address'],
  //     [contractOwner.address, diamondCutFacetAddress],
  //   ),
  // ]);
  // await create2Deployer.deploy(0, diamondHash, diamondByteCode);

  // const diamondAddress = await create2Deployer['computeAddress(bytes32,bytes32)'](
  //   diamondHash,
  //   ethers.utils.keccak256(diamondByteCode),
  // );
  // const diamond = await ethers.getContractAt('Diamond', diamondAddress);
  // -------------------

  console.log('Diamond deployed:', diamond.address);

  // deploy EquippableInit
  // EquippableInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const EquippableInit = await ethers.getContractFactory('EquippableInit');

  // ---------- Normal deployment
  const equippableInit = await EquippableInit.deploy();
  await equippableInit.deployed();

  const equippableInitAddress = equippableInit.address;
  // -----------------

  // ---------- Create2 deployment
  // const equippableInitHash = ethers.utils.id('EquippableInit');

  // const equippableInitByteCode = EquippableInit.bytecode;
  // await create2Deployer.deploy(0, equippableInitHash, equippableInitByteCode);

  // const equippableInitAddress = await create2Deployer['computeAddress(bytes32,bytes32)'](
  //   equippableInitHash,
  //   ethers.utils.keccak256(equippableInitByteCode),
  // );
  // ------------------

  console.log('EquippableInit deployed:', equippableInitAddress);

  // upgrade diamond with facets
  console.log('');

  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address);

  // Write down your own token's name & symbol & fallbackURI below
  const nameAndSymbolAndFallbackURI = ['Test', 'TEST', ''];

  // call to init function
  const functionCall = EquippableInit.interface.encodeFunctionData(
    'init',
    nameAndSymbolAndFallbackURI,
  );
  const tx = await diamondCut.diamondCut(cut, equippableInitAddress, functionCall);
  console.log('Diamond cut tx: ', tx.hash);
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log('Completed diamond cut');
  return diamond.address;
}

async function deploy() {
  // If create2Deployer is already deployed, comment this line.
  const create2DeployerAddress = await deployCreate2Deployer();

  // If these one-time deployment contracts in this function have been deployed,
  // you could set the 2nd param to `true` to avoid deploying and take the return value for invoking `deployDiamondAndCutFacet`.
  const [diamondCutFacetAddress, cut] = await oneTimeDeploy(create2DeployerAddress, false);

  return await deployDiamondAndCutFacet(create2DeployerAddress, diamondCutFacetAddress, cut);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
