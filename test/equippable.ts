import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';

describe('Equippable with Parts', async () => {
  shouldBehaveLikeEquippableWithParts(
    'RMRKEquippableMock',
    'RMRKNestingMock',
    'RMRKBaseStorageMock',
  );
});

describe.only('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots();
});

describe('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingMock');
});
