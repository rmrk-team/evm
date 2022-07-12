import shouldBehaveLikeBase from './behavior/baseStorage';

describe('MultiResource', async () => {
  shouldBehaveLikeBase('RMRKBaseStorageMock', 'BASE', 'misc');
});
