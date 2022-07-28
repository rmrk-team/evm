import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';

describe('Equippable with Parts', async () => {
  shouldBehaveLikeEquippableWithParts(
    'RMRKEquippableMock',
    'RMRKNestingWithEquippableMock',
    'RMRKBaseStorageMock',
  );
});

describe('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingWithEquippableMock');
});

describe('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots();
});
