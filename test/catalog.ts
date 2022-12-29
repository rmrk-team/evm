import shouldBehaveLikeCatalog from './behavior/Catalog';

describe('CatalogMock', async () => {
  shouldBehaveLikeCatalog('RMRKCatalogMock', 'ipfs//:meta', 'misc');
});
