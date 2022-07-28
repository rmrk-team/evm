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

describe('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingMock');
});

describe('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots();
});
