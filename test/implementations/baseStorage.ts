import shouldBehaveLikeBase from '../behavior/baseStorage';

describe('BaseStorageImpl', async () => {
  shouldBehaveLikeBase('RMRKBaseStorageImpl', 'ipfs//:meta', 'misc');
});
