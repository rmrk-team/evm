// import { ethers } from 'hardhat';
// import { expect } from 'chai';
// import { RMRKBaseStorageMock } from '../typechain';
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// describe('MultiResource', async () => {
//   let testBase: RMRKBaseStorageMock;

//   let owner: SignerWithAddress;
//   let addrs: any[];

//   const emptyOverwrite = 0
//   const baseName = 'RmrkBaseStorageTest';

//   const srcDefault = 'src';
//   const fallbackSrcDefault = 'fallback';
//   const metaURIDefault = 'metaURI';

//   const slotType = 0;
//   const fixedType = 1;

//   const customDefault: string[] = [];

//   beforeEach(async () => {
//     const [signersOwner, ...signersAddr] = await ethers.getSigners();
//     owner = signersOwner;
//     addrs = signersAddr;

//     const Base = await ethers.getContractFactory('RMRKBaseStorageMock');
//     testBase = await Base.deploy(baseName);
//     await testBase.deployed();

//   });

//   describe('Init Base Storage', async function () {
//     it('Name', async function () {
//       expect(await testBase.name()).to.equal(baseName);
//     });
//   });

//   // const items = [
//   //   {
//   //     name: "Item 1",
//   //     value: 0,
//   //     supply: 100
//   //   }
//   // ]
//   // contract.createCampaign({ name: "name", campaignType : 0, items })

//   describe('Add base entries', async function () {
//     it('Add fixed entires', async function () {
//       const id = 11;

//       const baseData = {
//         itemType: 1,
//         z: 0,
//         src: srcDefault,
//         fallbackSrc: fallbackSrcDefault
//       }

//       await testBase.connect(owner).addBaseEntry(
//         {id: id, base: baseData}
//       );
//       expect(await testBase.getBaseEntry(id)).to.eql([
//         1,
//         0,
//         srcDefault,
//         fallbackSrcDefault
//       ]);
//     });

//     it('Add slot entires', async function () {
//       const id = 11;

//       const baseData = {
//         itemType: 2,
//         z: 0,
//         src: srcDefault,
//         fallbackSrc: fallbackSrcDefault
//       }

//       await testBase.connect(owner).addBaseEntry(
//         {id: id, base: baseData}
//       );
//       expect(await testBase.getBaseEntry(id)).to.eql([
//         2,
//         0,
//         srcDefault,
//         fallbackSrcDefault
//       ]);
//     });
//   });

// });
