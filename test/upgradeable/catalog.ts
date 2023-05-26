import shouldBehaveLikeCatalog from './behavior/catalog';

describe('CatalogMockUpgradeable', async () => {
  shouldBehaveLikeCatalog('RMRKCatalogMockUpgradeable', 'ipfs//:meta', 'misc');
});
