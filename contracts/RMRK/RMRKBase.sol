pragma solidity ^0.8.9;

//Just a storage contract for base items at the moment.
//TODO: standardize access controls

import "./access/IssuerControl.sol";

contract RMRKBase is IssuerControl {

  //bytes8 is sort of arbitrary here--resource IDs in RMRK substrate are bytes8 for reference
  mapping (bytes8 => Base) private bases;

  bytes8[] private baseIds;

  enum ItemType { Slot, Fixed }

  event AddedEquippablesToEntry (bytes8 baseId, bytes8[] equippableIds);
  event AddedEquippableToAll (bytes8 equippableId);

  //Inquire about using an index instead of hashed ID to prevent any chance of collision
  struct IntakeStruct {
    bytes8 id;
    Base base;
  }

  //Consider merkel tree for equippables array if stuff gets crazy

  struct Base {
    ItemType itemType; //1 byte
    uint8 z; //1 byte
    bool exists; //1 byte
    bytes8[] equippableIds; //n bytes, probably uses its own storage slot anyway
    string src; //n bytes
    string fallbackSrc; //n bytes
  }

  //Passing structs is messy Arrays of structs containing other structs a bit moreso. Make sure this is acceptable.
  constructor(IntakeStruct[] memory intakeStruct) {
    addBaseEntryList(intakeStruct);
  }

  function addBaseEntryList (IntakeStruct[] memory intakeStruct) private {
    for (uint i = 0; i<intakeStruct.length; i++) {
      addBaseEntry(intakeStruct[i]);
    }
  }

  function addBaseEntry (IntakeStruct memory intakeStruct) private {
    require(!bases[intakeStruct.id].exists, "Base already exists");
    intakeStruct.base.exists = true; //enforce exists, can swap to require if need be.
    bases[intakeStruct.id] = intakeStruct.base;
    baseIds.push(intakeStruct.id);
  }

  function addEquippableIds (bytes8 _baseEntryid, bytes8[] memory _equippableIds) public onlyIssuer {
    require(_equippableIds.length > 0, "RMRK: Zero-length ids passed.");
    require(bases[_baseEntryid].exists, "RMRK: Base entry does not exist.");
    bases[_baseEntryid].equippableIds = _equippableIds;
    emit AddedEquippablesToEntry(_baseEntryid, _equippableIds);
  }

  //Handle this function with care, this function can be extremely gas-expensive.
  function addEquippableIdToAll (bytes8 _equippableId) public onlyIssuer {
    for(uint i=0; i<baseIds.length; i++) {
      bytes8 baseId_ = baseIds[i];
      if (bases[baseId_].itemType == ItemType.Slot) {
        bases[baseId_].equippableIds.push(_equippableId);
      }
    }
    emit AddedEquippableToAll(_equippableId);
  }

  function getBaseEntry (bytes8 _id) external view returns (Base memory) {
    return (bases[_id]);
  }

  function getBaseEntries (bytes8[] calldata _ids) external view returns (Base[] memory) {
    Base[] memory baseEntries;
    for (uint i=0; i<_ids.length; i++) {
      baseEntries[i] = bases[_ids[i]];
    }
    return baseEntries;
  }

}
