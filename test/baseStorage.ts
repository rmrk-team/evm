import shouldBehaveLikeBase from './behavior/baseStorage';

describe('BaseStorageMock', async () => {
  shouldBehaveLikeBase('RMRKBaseStorageMock', 'ipfs//:meta', 'misc');
});
