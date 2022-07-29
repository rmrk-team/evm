import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';

describe.only('Equippable with Parts', async () => {
  shouldBehaveLikeEquippableWithParts(
    'RMRKEquippableMock',
    'RMRKNestingMock',
    'RMRKBaseStorageMock',
  );
});

describe.only('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots(
    'RMRKEquippableMock',
    'RMRKNestingMock',
    'RMRKBaseStorageMock',
  );
});

describe.only('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingMock');
});
