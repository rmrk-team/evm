import shouldBehaveLikeEquippableWithParts from './behavior/equippableParts';
import shouldBehaveLikeEquippableResources from './behavior/equippableResources';
import shouldBehaveLikeEquippableWithSlots from './behavior/equippableSlots';

describe.only('Equippable with Parts', async () => {
  shouldBehaveLikeEquippableWithParts(
    'RMRKEquippableMock',
    'RMRKNestingEquippableMock',
    'RMRKBaseStorageMock',
  );
});

describe.only('Equippable with Slots', async () => {
  shouldBehaveLikeEquippableWithSlots(
    'RMRKEquippableMock',
    'RMRKNestingEquippableMock',
    'RMRKBaseStorageMock',
  );
});

describe.only('Equippable Resources', async () => {
  shouldBehaveLikeEquippableResources('RMRKEquippableMock', 'RMRKNestingEquippableMock');
});
