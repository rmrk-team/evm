// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.9;

import "./abstracts/MultiResourceAbstractBase.sol";
import "./RMRKNesting.sol";
import "./interfaces/IRMRKEquippableResource.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./library/RMRKLib.sol";
import "./library/MultiResourceLib.sol";
import "./utils/Address.sol";
import "./utils/Strings.sol";
import "./utils/Context.sol";
// import "hardhat/console.sol";

error RMRKEquippableBasePartNotEquippable();
error RMRKEquippableEquipNotAllowedByBase();

contract RMRKEquippable is RMRKNesting, IRMRKEquippableResource, MultiResourceAbstractBase {

    constructor(string memory _name, string memory _symbol)
    RMRKNesting(_name, _symbol)
    {

    }

    using MultiResourceLib for bytes8[];
    using MultiResourceLib for bytes16[];
    using Strings for uint256;

    //TODO: private setter/getters
    //TODO: Check to see is moving the array into Resource struct is cheaper

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(bytes8 => bytes8[]) public fixedPartIds;
    mapping(bytes8 => bytes8[]) public slotPartIds;

    //mapping of resourceId to slot to equipped children
    mapping(bytes8 => mapping(bytes8 => Equipment)) private equipped;

    //Mapping of equippableRefId to slotId to bool for is valid slot ID
    mapping(bytes8 => mapping(bytes8 => bool)) private isValidBasePartId;

    //TODO: Gate to owner of tokenId
    function equip(
        uint256 tokenId,
        bytes8 targetResourceId,
        uint256 slotPartIndex,
        uint256 childIndex,
        uint256 childResourceIndex
    ) public {
        Resource storage targetResource = _resources[targetResourceId];
        Child memory child = childrenOf(tokenId)[childIndex];

        Resource memory childResource = IRMRKEquippableResource(child.contractAddress).getResObjectByIndex(childIndex, childResourceIndex);

        if(!isValidBasePartId[targetResource.equippableRefId][childResource.slotId])
            revert RMRKEquippableBasePartNotEquippable();

        if(!validateEquip(childResource.baseAddress, childResource.slotId))
            revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            tokenId: child.tokenId,
            contractAddress: child.contractAddress,
            childResourceId: childResource.id
        });

        bytes8 slotPartId = slotPartIds[targetResourceId][slotPartIndex];
        equipped[targetResourceId][slotPartId] = newEquip;
    }

    //TODO: Gate to owner of tokenId
    function unequip(
        uint256 tokenId,
        bytes8 targetResourceId,
        bytes8 slotPartId
    ) public {
        delete equipped[targetResourceId][slotPartId];
    }

    //Gate to owner of tokenId
    function replaceEquipment(
        uint256 tokenId,
        bytes8 targetResourceId,
        uint256 slotPartIndex,
        uint256 childIndex,
        uint256 childResourceIndex
    ) public {



    }

    // THIS CALL IS EASILY BYPASSED BY ANY GIVEN IMPLEMENTER. For obvious reasons, this function is
    // included to encourage good-faith adherence to a standard, but in no way should be considered
    // a secure feature from the perspective of a Base deployer.
    function validateEquip(address baseContract, bytes8 baseId) private view returns (bool isEquippable) {
        isEquippable = IRMRKBaseStorage(baseContract).checkIsEquippable(baseId, address(this));
    }

    function getEquipped(bytes8 targetResourceId) public view returns (bytes8[] memory slotsEquipped, Equipment[] memory childrenEquipped) {
        bytes8[] memory slotPartIds_ = slotPartIds[targetResourceId];
        uint256 len = slotPartIds_.length;
        for (uint i; i<len;) {
          Equipment memory childEquipped = equipped[targetResourceId][slotPartIds_[i]];
          if (childEquipped.tokenId != uint256(0)) {
              uint256 childrenEquippedLen = childrenEquipped.length;
              childrenEquipped[childrenEquippedLen] = childEquipped;
              slotsEquipped[childrenEquippedLen] = slotPartIds_[i];
          }
          unchecked {++i;}
        }
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    function composeEquippables(uint256 tokenId, bytes8 targetResourceId) public view returns (bytes8[] memory basePartIds) {
        //get Resource of target token
        /* Resource storage targetResource = _resources[targetResourceId];

        //get fixed part length -- always 16 by default
        //Check gas efficiency of scoping like this
        //fixed IDs
        {
          uint256 len = fixedPartIds[targetResourceId].length;
          uint256 basePartIdsLen = basePartIds.length;
          for (uint i; i<fixedLen;) {
              bytes8 partId = fixedPartIds[targetResourceId][i];
              if (partId != bytes8(0)) {
                  basePartIds[basePartIdsLen] = partId;
                  unchecked {++basePartIdsLen;}
              }
              unchecked {++i;}
          }
        }
        //Slot IDs
        {
          uint256 len = slotPartIds[targetResourceId].length;
          uint256 basePartIdsLen = basePartIds.length;
          for (uint i; i<slotLen;) {
              bytes8 partId = fixedPartIds[targetResourceId][i];
              if (partId != bytes8(0)) {
                  basePartIds[basePartIdsLen] = partId;
                  unchecked {++basePartIdsLen;}
              }
              unchecked {++i;}
          }
        } */
        /* //Recurse
        Equipment[16] memory equippedChildren = getEquipped(targetResourceId);
        uint256 equippedLen = equippedChildren.length;

        //Get tokenID and resourceID of equipped child
        for (uint i; i<equippedLen;) {
            // Check gas of caching the equippedChildren iterator
            Equipment memory equipped = equippedChildren[i];
            uint256 childId = equipped.childId;
            bytes8 childResourceId = equipped.childResourceId;
            Resource memory childRes = IRMRKEquippableResource(
                targetResource.equippedChildren[i].contractAddress
                ).getResource(
                    targetResource.slotPartDefinitions[i]
                    );

            unchecked {++i;}
        } */

    }

    /* function _returnTreeFixedSlots(uint256 equippedLen) internal view returns(bytes8[] memory basePartIds) {
        bytes8[] memory internalBaseParts = _returnTreeFixedSlots();
        uint256 len = internalBaseParts.length;
        for(uint i; i<len;) {
            basePartIds
            unchecked{++i;}
        }

    } */

    //Rewrite in assembly if time
    /* function returnMinPos(uint256[] memory array) public view returns(uint256 pos) {

      assembly {

      }

    } */

    function returnMinPos(uint256[] memory array) public pure returns(uint256 pos) {
      uint256 min = array[0];
      uint256 len = array.length;
      for(uint256 i=1; i<len;) {
        if(min > array[i]) {
          min = array[i];
          pos = i;
        }
        unchecked {++i;}
      }
    }

    //mapping of bytes8 Ids to resource object
    mapping(bytes8 => Resource) private _resources;

    function getResource(
        bytes8 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == bytes8(0)) revert RMRKNoResourceMatchingId();
        return resource;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(NestingAbstract, IRMRKMultiResourceBase, MultiResourceAbstractBase) virtual returns (string memory) {
        return _tokenURIAtIndex(tokenId, 0);
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal override view returns (string memory) {
        if (_activeResources[tokenId].length > index)  {
            bytes8 activeResId = _activeResources[tokenId][index];
            string memory URI;
            Resource memory _activeRes = getResource(activeResId);
            if (!_tokenEnumeratedResource[activeResId]) {
                URI = _activeRes.metadataURI;
            }
            else {
                string memory baseURI = _activeRes.metadataURI;
                URI = bytes(baseURI).length > 0 ?
                    string(abi.encodePacked(baseURI, tokenId.toString())) : "";
            }
            return URI;
        }
        else {
            return _fallbackURI;
        }
    }

    // To be implemented with custom guards
    // TODO make take a resource struct and additional params for mappings

    function _addResourceEntry(
        bytes8 id,
        bytes8 equippableRefId,
        string memory metadataURI,
        address baseAddress,
        bytes8 slotId,
        bytes16[] memory custom
    ) internal {
        if(id == bytes8(0)) revert RMRKWriteToZero();
        if(_resources[id].id != bytes8(0)) revert RMRKResourceAlreadyExists();

        Resource memory resource = Resource({
            id: id,
            metadataURI: metadataURI,
            equippableRefId: equippableRefId,
            baseAddress: baseAddress,
            slotId: slotId,
            custom: custom
        });

        _resources[id] = resource;

        _allResources.push(id);

        emit ResourceSet(id);
    }

    function _addCustomDataToResource(
        bytes8 resourceId,
        bytes16 customResourceId
    ) internal {
        _resources[resourceId].custom.push(customResourceId);
        emit ResourceCustomDataAdded(resourceId, customResourceId);
    }

    function _removeCustomDataFromResource(
        bytes8 resourceId,
        uint256 index
    ) internal {
        bytes16 customResourceId = _resources[resourceId].custom[index];
        _resources[resourceId].custom.removeItemByIndex(index);
        emit ResourceCustomDataRemoved(resourceId, customResourceId);
    }

    //For equipped storage array
    function removeEquipmentByIndex(Equipment[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    function _addResourceToToken(
        uint256 tokenId,
        bytes8 resourceId,
        bytes8 overwrites
    ) internal {
        if(_tokenResources[tokenId][resourceId]) revert MultiResourceAlreadyExists();

        if( getResource(resourceId).id == bytes8(0)) revert MultiResourceResourceNotFoundInStorage();

        if(_pendingResources[tokenId].length >= 128) revert MultiResourceMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != bytes8(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    // Utilities

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        bytes8 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns(Resource memory) {
        bytes8 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getFullResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        bytes8[] memory activeResources = _activeResources[tokenId];
        uint256 len = activeResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(activeResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function getFullPendingResources(
        uint256 tokenId
    ) public view virtual returns (Resource[] memory) {
        bytes8[] memory pendingResources = _pendingResources[tokenId];
        uint256 len = pendingResources.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(pendingResources[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function acceptResource(uint256 tokenId, uint256 index) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert MultiResourceNotOwner();
        _setPriority(tokenId, priorities);
    }

}
