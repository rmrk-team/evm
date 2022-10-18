import { ethers } from 'hardhat';
import { LightmInit__factory } from '../typechain-types';
import { ILightmUniversalFactory } from '../typechain-types/contracts/RMRK/LightmUniversalFactory';
import {
  create2DeployerAddress,
  deployCreate2Deployer,
  oneTimeDeploy,
  versionSuffix,
} from './deploy_diamond_equippable';

export default async function deployUniversalFactory(
  create2DeployerAddress: string,
  constructParams: ILightmUniversalFactory.ConstructParamsStruct,
) {
  const signers = await ethers.getSigners();
  const create2Deployer = await ethers.getContractAt('Create2Deployer', create2DeployerAddress);
  const UniversalFactory = await ethers.getContractFactory('LightmUniversalFactory', signers[0]);

  const hash = ethers.utils.id(`LightmUniversalFactory${versionSuffix}`);

  const constructorParams = ethers.utils.defaultAbiCoder.encode(
    [
      'tuple(address validatorLibAddress,address mrRenderUtilsAddress,address diamondCutFacetAddress,address diamondLoupeFacetAddress,address nestingFacetAddress,address multiResourceFacetAddress,address equippableFacetAddress,address collectionMetadataFacetAddress,address initContractAddress,address implContractAddress,tuple cuts(address facetAddress,uint8 action,bytes4[] functionSelectors)[])',
    ],
    [constructParams],
  );

  const bytecode = ethers.utils.concat([UniversalFactory.bytecode, constructorParams]);

  const tx = await create2Deployer.deploy(0, hash, bytecode);
  console.log('Factory deployment tx: ', tx.hash);
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Factory deployment failed: ${tx.hash}`);
  }

  return await create2Deployer['computeAddress(bytes32,bytes32)'](
    hash,
    ethers.utils.keccak256(bytecode),
  );
}

async function deploy() {
  const signers = await ethers.getSigners();

  const create2DeployerAddress = await deployCreate2Deployer();
  const create2Deployer = await ethers.getContractAt(
    'Create2Deployer',
    create2DeployerAddress,
    signers[0],
  );

  const lightmInitHash = ethers.utils.id(`LightmInit${versionSuffix}`);
  await create2Deployer.deploy(0, lightmInitHash, LightmInit__factory.bytecode);

  const lightmInitAddress = await create2Deployer['computeAddress(bytes32,bytes32)'](
    lightmInitHash,
    ethers.utils.keccak256(LightmInit__factory.bytecode),
  );

  const { cut, ...rest } = await oneTimeDeploy(create2DeployerAddress, false, true);

  const factoryAddress = await deployUniversalFactory(create2DeployerAddress, {
    validatorLibAddress: rest.lightmValidatorLibAddress,
    mrRenderUtilsAddress: rest.rmrkMultiResourceRenderUtilsAddress,
    diamondCutFacetAddress: rest.diamondCutFacetAddress,
    diamondLoupeFacetAddress: cut[0].facetAddress,
    multiResourceFacetAddress: cut[1].facetAddress,
    nestingFacetAddress: cut[2].facetAddress,
    equippableFacetAddress: cut[3].facetAddress,
    implContractAddress: cut[4].facetAddress,
    collectionMetadataFacetAddress: cut[5].facetAddress,
    initContractAddress: lightmInitAddress,
    cuts: cut,
  });
  console.log(`UniversalFactory Address: ${factoryAddress}`);

  const universalFactory = await ethers.getContractAt('LightmUniversalFactory', factoryAddress);
  const tx = await universalFactory.deployCollection({
    name: 'Test',
    symbol: 'TEST',
    fallbackURI: '',
  });
  const txRec = await tx.wait();
  const { events } = txRec;
  const createdEvent = events?.find(
    (eventRecord) => eventRecord.event === 'LightmCollectionCreated',
  );
  console.log(`Deploy collection: ${createdEvent?.args?.[0]}`);
  console.log('Deployment success');
}

deploy();
