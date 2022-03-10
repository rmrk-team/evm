pragma solidity ^0.8.9;

import "./utils/Strings.sol";
//Just a storage contract for base items at the moment.
//TODO: standardize access controls

contract RMRKBase {
  using Strings for uint256;


  string commonSrcPrefix;
  string commonSrcSuffix;

  //bytes8 is sort of arbitrary here--resource IDs in RMRK substrate are bytes8 for reference
  mapping (bytes8 => Base) private bases;

  bytes8[] private baseIds;

  enum ItemType { Slot, Fixed }

  struct IntakeStruct {
    bytes8 id;
    Base base;
  }

  //If IPFS storage as pure index is acceptable, this format is gas-efficient.
  //Double check to make sure this is effectively one storage slot.
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
    addBaseResourceList(intakeStruct);
  }

  function addBaseResourceList (IntakeStruct[] memory intakeStruct) public {
    for (uint i = 0; i<intakeStruct.length; i++) {
      addBaseResource(intakeStruct[i]);
    }
  }

  function addBaseResource (IntakeStruct memory intakeStruct) public {
    require(!bases[intakeStruct.id].exists, "Base already exists");
    intakeStruct.base.exists = true; //enforce exists, can swap to require if need be.
    bases[intakeStruct.id] = intakeStruct.base;
    baseIds.push(intakeStruct.id);
  }

  /* //Overloaded function to add items piecemeal
  function addBaseResource (bytes8 _id, ItemType _itemType, uint32 _src, uint32 _fallbackSrc, uint8 _z, bytes8[] _equippable) public {
    bases[_id] = Base({
      itemType: _itemType,
      src: _src,
      fallbackSrc: _fallbackSrc,
      z: _z,
      exists: true,
      equippableIds: _equippable
      });
  } */

  function removeBaseResource (bytes8 _id) public {
    uint i;
    while (i < baseIds.length) {
      if (baseIds[i] == _id) {
        baseIds[i] = baseIds[baseIds.length-1];
        baseIds.pop();
      }
      i++;
    delete bases[_id];
    }
  }

  //Constructs src and fallbakcSrc from global constants. Gas-efficient if strict indexing of base by uint on IPFS is an acceptabe standard.
  //probably better if I reimplement Strings from uint256 to uint32, but this is still cheaper
  function getBaseResource (bytes8 _id) public view returns (Base memory, string memory, string memory) {
    Base memory base = bases[_id];
    string memory src = string(abi.encodePacked(commonSrcPrefix, srcInt.toString(), commonSrcSuffix));
    string memory fallbackSrc = string(abi.encodePacked(commonSrcPrefix, fallbackSrcInt.toString(), commonSrcSuffix));
    return (base, src, fallbackSrc);
  }

}
