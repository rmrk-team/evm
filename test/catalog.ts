import shouldBehaveLikeCatalog from './behavior/catalog';

describe('CatalogMock', async () => {
  shouldBehaveLikeCatalog('RMRKCatalogMock', 'ipfs//:meta', 'misc');
});
