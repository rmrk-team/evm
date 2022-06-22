// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./abstracts/MultiResourceAbstractBase.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippableResource.sol";
import "./library/RMRKLib.sol";
import "./RMRKNesting.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";

error RMRKBadLength();
error RMRKEquippableBasePartNotEquippable();
error RMRKEquippableEquipNotAllowedByBase();

contract RMRKEquippable is RMRKNesting, IRMRKEquippableResource, MultiResourceAbstractBase {

    constructor(string memory _name, string memory _symbol)
    RMRKNesting(_name, _symbol)
    {

    }

    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
    using Strings for uint256;

    //TODO: private setter/getters
    //TODO: Check to see is moving the array into Resource struct is cheaper

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private fixedPartIds;
    mapping(uint64 => uint64[]) private slotPartIds;

    //mapping of resourceId to slotId to equipped children
    mapping(uint64 => mapping(uint64 => Equipment)) private equipped;

    // FIXME: name equippableRefId to equippableParentRefId
    //Mapping of equippableRefId to parent contract address uint64 slotId for equipping validation
    mapping(uint64 => mapping(address => uint64)) private validParentSlot;

    //TODO: Gate to owner of tokenId
    function equip(
        uint256 tokenId,
        uint64 targetResourceId,
        uint256 slotPartIndex,
        uint256 childIndex,
        uint256 childResourceIndex
    ) public {
        // Resource storage targetResource = _resources[targetResourceId];
        Child memory child = childrenOf(tokenId)[childIndex];

        Resource memory childResource = IRMRKEquippableResource(child.contractAddress).getResObjectByIndex(childIndex, childResourceIndex);

        if(!validateChildEquip(child.contractAddress, targetResourceId))
            revert RMRKEquippableBasePartNotEquippable();

        if(!validateBaseEquip(childResource.baseAddress, childResource.slotId))
            revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            tokenId: child.tokenId,
            contractAddress: child.contractAddress,
            childResourceId: childResource.id
        });

        uint64 slotPartId = slotPartIds[targetResourceId][slotPartIndex];
        equipped[targetResourceId][slotPartId] = newEquip;
    }

    //TODO: Gate to owner of tokenId
    function unequip(
        uint256 tokenId,
        uint64 targetResourceId,
        uint64 slotPartId
    ) public {
        delete equipped[targetResourceId][slotPartId];
    }

    //Gate to owner of tokenId
    function replaceEquipment(
        uint256 tokenId,
        uint64 targetResourceId,
        uint256 slotPartIndex,
        uint256 childIndex,
        uint256 childResourceIndex
    ) public {

    }

    //TODO: gate to admin
    function setEquippableRefIds(uint64 equippableRefId, address[] memory equippableAddress, uint64[] memory partId) public {
        uint256 len = partId.length;
        if(len != equippableAddress.length)
            revert RMRKBadLength();
        for(uint i; i<len;) {
          _setEquippableRefId(equippableRefId, equippableAddress[i], partId[i]);
          unchecked {++i;}
        }
    }

    //TODO: gate to admin
    function setEquippableRefId(uint64 equippableRefId, address equippableAddress, uint64 partId) public {
        _setEquippableRefId(equippableRefId, equippableAddress, partId);
    }



    function _setEquippableRefId(uint64 equippableRefId, address equippableAddress, uint64 partId) internal {
        validParentSlot[equippableRefId][equippableAddress] = partId;
    }

    // THIS CALL IS EASILY BYPASSED BY ANY GIVEN IMPLEMENTER. For obvious reasons, this function is
    // included to encourage good-faith adherence to a standard, but in no way should be considered
    // a secure feature from the perspective of a Base deployer.
    function validateBaseEquip(address baseContract, uint64 partId) private view returns (bool isEquippable) {
        isEquippable = IRMRKBaseStorage(baseContract).checkIsEquippable(partId, address(this));
    }

    //Return 0 means not equippable
    function validateChildEquip(address childContract, uint64 childResourceId) public view returns (bool isEquippable) {
        isEquippable = IRMRKEquippableResource(childContract).getCallerEquippableSlot(childResourceId) > uint64(0);
    }

    //Return 0 means not equippable
    function getCallerEquippableSlot(uint64 resourceId) public view returns (uint64 equippableSlot) {
        uint64 resourceRefId = _resources[resourceId].equippableRefId;
        equippableSlot = validParentSlot[resourceRefId][_msgSender()];
    }

    function getEquipped(uint64 targetResourceId) public view returns (uint64[] memory slotsEquipped, Equipment[] memory childrenEquipped) {
        uint64[] memory slotPartIds_ = slotPartIds[targetResourceId];
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
    function composeEquippables(
        uint256 tokenId,
        uint64 targetResourceId
    ) public view returns (uint64[] memory basePartIds, address[] memory baseAddresses) {
        //get Resource of target token
        Resource storage targetResource = _resources[targetResourceId];
        //Check gas efficiency of scoping like this
        address baseAddress = targetResource.baseAddress;
        //fixed IDs
        {
            uint64[] memory fixedPartIds_ = fixedPartIds[targetResourceId];
            uint256 len = fixedPartIds_.length;
            uint256 basePartIdsLen = basePartIds.length;
            unchecked {
                for (uint i; i<len;) {
                    uint64 partId = fixedPartIds_[i];
                    basePartIds[basePartIdsLen] = partId;
                    baseAddresses[basePartIdsLen] = baseAddress;
                    ++basePartIdsLen;
                    ++i;
                }
            }
        }
        //Slot IDs + recurse
        {
            uint64[] memory slotPartIds_ = slotPartIds[targetResourceId];
            uint256 len = slotPartIds_.length;
            uint256 basePartIdsLen = basePartIds.length;
            unchecked {
                for (uint i; i<len;) {
                    uint64 partId = slotPartIds_[i];
                    basePartIds[basePartIdsLen] = partId;
                    baseAddresses[basePartIdsLen] = baseAddress;
                    ++basePartIdsLen;
                    ++i;

                    uint256 equippedTokenId = equipped[targetResourceId][partId].tokenId;
                    uint64 equippedResourceId = equipped[targetResourceId][partId].childResourceId;
                    //Recuse while we're in this block, slotpartIds are initialized
                    (uint64[] memory equippedBasePartIds, address[] memory equippedBaseAddresses) = composeEquippables(
                        equippedTokenId, equippedResourceId
                    );
                    uint256 recLen = equippedBasePartIds.length;
                    for (uint i; i<recLen;) {
                        basePartIds[basePartIdsLen] = partId;
                        baseAddresses[basePartIdsLen] = baseAddress;
                        ++basePartIdsLen;
                        ++i;
                    }
                }
            }
        }
    }

    // function returnMinPos(uint256[] memory array) public pure returns(uint256 pos) {
    //     uint256 min = array[0];
    //     uint256 len = array.length;
    //     for(uint256 i=1; i<len;) {
    //         if(min > array[i]) {
    //         min = array[i];
    //         pos = i;
    //         }
    //         unchecked {++i;}
    //     }
    // }

    //mapping of uint64 Ids to resource object
    mapping(uint64 => Resource) private _resources;

    function getResource(
        uint64 resourceId
    ) public view virtual returns (Resource memory)
    {
        Resource memory resource = _resources[resourceId];
        if(resource.id == uint64(0))
            revert RMRKNoResourceMatchingId();
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
            uint64 activeResId = _activeResources[tokenId][index];
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
        Resource memory resource,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) internal {
        uint64 id = resource.id;
        if(id == uint64(0))
            revert RMRKWriteToZero();
        if(_resources[id].id != uint64(0))
            revert RMRKResourceAlreadyExists();

        _resources[id] = resource;

        _allResources.push(id);

        emit ResourceSet(id);
    }

    function _addCustomDataToResource(
        uint64 resourceId,
        uint128 customResourceId
    ) internal {
        _resources[resourceId].custom.push(customResourceId);
        emit ResourceCustomDataAdded(resourceId, customResourceId);
    }

    function _removeCustomDataFromResource(
        uint64 resourceId,
        uint256 index
    ) internal {
        uint128 customResourceId = _resources[resourceId].custom[index];
        _resources[resourceId].custom.removeItemByIndex(index);
        emit ResourceCustomDataRemoved(resourceId, customResourceId);
    }

    //For equipped storage array
    // function removeEquipmentByIndex(Equipment[] storage array, uint256 index) internal {
    //     //Check to see if this is already gated by require in all calls
    //     require(index < array.length);
    //     array[index] = array[array.length-1];
    //     array.pop();
    // }

    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal {
        if(_tokenResources[tokenId][resourceId]) revert RMRKResourceAlreadyExists();

        if( getResource(resourceId).id == uint64(0)) revert RMRKResourceNotFoundInStorage();

        if(_pendingResources[tokenId].length >= 128) revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    // Utilities

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(Resource memory) {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    // FIXME: Re enable functionality when enough space
    // function getPendingResObjectByIndex(
    //     uint256 tokenId,
    //     uint256 index
    // ) external view virtual returns(Resource memory) {
    //     uint64 resourceId = getPendingResources(tokenId)[index];
    //     return getResource(resourceId);
    // }

    function getFullResources(
        uint256 tokenId
    ) external view virtual returns (Resource[] memory) {
        uint64[] memory resourceIds = _activeResources[tokenId];
        return _getResourcesById(resourceIds);
    }

    function getFullPendingResources(
        uint256 tokenId
    ) external view virtual returns (Resource[] memory) {
        uint64[] memory resourceIds = _pendingResources[tokenId];
        return _getResourcesById(resourceIds);
    }

    function _getResourcesById(
        uint64[] memory resourceIds
    ) internal view virtual returns (Resource[] memory) {
        uint256 len = resourceIds.length;
        Resource[] memory resources = new Resource[](len);
        for (uint i; i<len;) {
            resources[i] = getResource(resourceIds[i]);
            unchecked {++i;}
        }
        return resources;
    }

    function acceptResource(uint256 tokenId, uint256 index) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert ERC721NotApprovedOrOwner();
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert ERC721NotApprovedOrOwner();
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert ERC721NotApprovedOrOwner();
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual {
        if(_msgSender() != ownerOf(tokenId)) revert ERC721NotApprovedOrOwner();
        _setPriority(tokenId, priorities);
    }

}
