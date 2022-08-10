// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

/*
* RMRK Equippables accessory contract, responsible for state storage and management of equippable items.
*/

pragma solidity ^0.8.15;

import "./abstracts/MultiResourceAbstract.sol";
import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippable.sol";
import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingWithEquippable.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// import "hardhat/console.sol";

error ERC721NotApprovedOrOwner();
error RMRKAlreadyEquipped();
error RMRKBadLength();
error RMRKBaseRequiredForParts();
error RMRKCallerCannotChangeEquipStatus();
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKNotComposableResource();
error RMRKNotEquipped();
error RMRKSlotAlreadyUsed();
error RMRKTokenDoesNotHaveActiveResource();
error RMRKNotNesting();

contract RMRKEquippable is IRMRKEquippable, MultiResourceAbstract {

    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
    using Strings for uint256;

    struct Equipment {
        uint64 resourceId;
        uint64 childResourceId;
        uint childTokenId;
        address childEquippableAddress;
    }

    struct ExtendedResource { // Used for input/output only
        uint64 id; // ID of this resource
        uint64 equippableRefId;
        address baseAddress;
        string metadataURI;
    }

    struct FixedPart {
        uint64 partId;
        uint8 z; //1 byte
        string metadataURI; //n bytes 32+
    }

    struct SlotPart {
        uint64 partId;
        uint64 childResourceId;
        uint8 z; //1 byte
        uint childTokenId;
        address childAddress;
        string metadataURI; //n bytes 32+
    }

    constructor(address nestingAddress) {
        _setNestingAddress(nestingAddress);
    }

    address private _nestingAddress;

    //mapping of uint64 Ids to resource object
    mapping(uint64 => address) private _baseAddresses;
    mapping(uint64 => uint64) private _equippableRefIds;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    //mapping of token id to base address to slot part Id to equipped information.
    mapping(uint => mapping(address => mapping(uint64 => Equipment))) private _equipments;

    //mapping of token id to whether it is equipped into the parent
    mapping(uint => bool) private _isEquipped;


    //Mapping of refId to parent contract address and valid slotId
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    function _ownerOf(uint tokenId) internal view returns(address) {
        return IRMRKNesting(_nestingAddress).ownerOf(tokenId);
    }

    function _onlyOwnerOrApproved(uint tokenId) internal view {
        if (!IRMRKNestingWithEquippable(_nestingAddress).isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
    }

    modifier onlyOwnerOrApproved(uint256 tokenId) {
        _onlyOwnerOrApproved(tokenId);
        _;
    }

    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId) internal view virtual returns (bool) {
        address owner = _ownerOf(tokenId);
        return (user == owner || isApprovedForAllForResources(owner, user) || getApprovedForResources(tokenId) == user);
    }

    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if(!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    function _onlyNesting() internal view {
        if(_msgSender() != _nestingAddress) revert RMRKNotNesting();
    }

    modifier onlyNesting() {
        _onlyNesting();
        _;
    }

    function _setNestingAddress(address nestingAddress) internal {
        _nestingAddress = nestingAddress;
    }

    function getNestingAddress() external view returns(address) {
        return _nestingAddress;
    }

    function supportsInterface(bytes4 interfaceId) public virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKEquippable).interfaceId ||
            interfaceId == type(IRMRKMultiResource).interfaceId ||
            interfaceId == type(IERC165).interfaceId
        );
    }

    function equip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyOwnerOrApproved(tokenId) {
        _equip(tokenId, resourceId, slotPartId, childIndex, childResourceId);
    }

    function _equip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) private {
        if (_equipments[tokenId][_baseAddresses[resourceId]][slotPartId].childEquippableAddress != address(0))
            revert RMRKSlotAlreadyUsed();

        IRMRKNesting.Child memory child = IRMRKNesting(_nestingAddress).childOf(tokenId, childIndex);
        address childEquippable = IRMRKNestingWithEquippable(child.contractAddress).getEquippablesAddress();

        // Check from child perspective intention to be used in part
        if (!isChildEquipValid(
                childEquippable,
                child.tokenId,
                childResourceId,
                slotPartId
            )
        )
            revert RMRKTokenCannotBeEquippedWithResourceIntoSlot();

        // Check from base perspective
        if(!_validateBaseEquip(_baseAddresses[resourceId], childEquippable, slotPartId))
            revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: resourceId,
            childResourceId: childResourceId,
            childTokenId: child.tokenId,
            childEquippableAddress: childEquippable
        });

        _equipments[tokenId][_baseAddresses[resourceId]][slotPartId] = newEquip;
        IRMRKNestingWithEquippable(_nestingAddress).markChildEquipped(
            child.contractAddress, child.tokenId, childResourceId, slotPartId, true);
    }

    function unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) external onlyOwnerOrApproved(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
    }

    function _unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) private {
        address targetBaseAddress = _baseAddresses[resourceId];
        Equipment memory equipment = _equipments[tokenId][targetBaseAddress][slotPartId];
        if (equipment.childEquippableAddress == address(0))
            revert RMRKNotEquipped();
        delete _equipments[tokenId][targetBaseAddress][slotPartId];
        address childNestingAddress = IRMRKEquippable(equipment.childEquippableAddress).getNestingAddress();
        IRMRKNestingWithEquippable(_nestingAddress).markChildEquipped(
            childNestingAddress,
            equipment.childTokenId,
            equipment.childResourceId,
            slotPartId,
            false
        );
    }

    function replaceEquipment(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyOwnerOrApproved(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
        _equip(tokenId, resourceId, slotPartId, childIndex, childResourceId);
    }

    function markEquipped(
        uint tokenId,
        address equippingParent,
        uint64 resourceId,
        uint64 slotId,
        bool equipped
    ) external onlyNesting() {
        if (!canTokenBeEquippedWithResourceIntoSlot(equippingParent, tokenId, resourceId, slotId))
            revert RMRKTokenCannotBeEquippedWithResourceIntoSlot();

        if (_isEquipped[tokenId] && equipped)
            revert RMRKAlreadyEquipped();
        if(!_isEquipped[tokenId] && !equipped)
            revert RMRKNotEquipped();
        _isEquipped[tokenId] = equipped;
    }

    function isEquipped(uint tokenId) external view returns(bool) {
        return _isEquipped[tokenId];
    }

    function getEquipped(
        uint64 tokenId,
        uint64 resourceId
    ) public view returns (
        uint64[] memory slotParts,
        Equipment[] memory childrenEquipped
    ) {
        address targetBaseAddress = _baseAddresses[resourceId];
        uint64[] memory slotPartIds = _slotPartIds[resourceId];

        // TODO: Clarify on docs: Some children equipped might be empty.
        slotParts = new uint64[](slotPartIds.length);
        childrenEquipped = new Equipment[](slotPartIds.length);

        uint256 len = slotPartIds.length;
        for (uint i; i<len;) {
            slotParts[i] = slotPartIds[i];
            Equipment memory equipment = _equipments[tokenId][targetBaseAddress][slotPartIds[i]];
            if (equipment.resourceId == resourceId) {
                childrenEquipped[i] = equipment;
            }
            unchecked {++i;}
        }
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    function composeEquippables(
        uint tokenId,
        uint64 resourceId
    ) public view returns (
        ExtendedResource memory resource,
        FixedPart[] memory fixedParts,
        SlotPart[] memory slotParts
    ) {
        resource = getExtendedResource(resourceId);

        // We make sure token has that resource. Alternative is to receive index but makes equipping more complex.
        (, bool found) = _activeResources[tokenId].indexOf(resourceId);
        if (!found)
            revert RMRKTokenDoesNotHaveActiveResource();

        address targetBaseAddress = _baseAddresses[resourceId];
        if (targetBaseAddress == address(0))
            revert RMRKNotComposableResource();

        // Fixed parts:
        uint64[] memory fixedPartIds = _fixedPartIds[resourceId];
        fixedParts = new FixedPart[](fixedPartIds.length);

        uint256 len = fixedPartIds.length;
        if (len > 0) {
            IRMRKBaseStorage.Part[] memory baseFixedParts = IRMRKBaseStorage(targetBaseAddress).getParts(fixedPartIds);
            for (uint i; i<len;) {
                fixedParts[i] = FixedPart({
                    partId: fixedPartIds[i],
                    z: baseFixedParts[i].z,
                    metadataURI: baseFixedParts[i].metadataURI
                });
                unchecked {++i;}
            }
        }

        // Slot parts:
        uint64[] memory slotPartIds = _slotPartIds[resourceId];
        slotParts = new SlotPart[](slotPartIds.length);
        len = slotPartIds.length;

        if (len > 0) {
            IRMRKBaseStorage.Part[] memory baseSlotParts = IRMRKBaseStorage(targetBaseAddress).getParts(slotPartIds);
            for (uint i; i<len;) {
                Equipment memory equipment = _equipments[tokenId][targetBaseAddress][slotPartIds[i]];
                if (equipment.resourceId == resourceId) {
                    slotParts[i] = SlotPart({
                        partId: slotPartIds[i],
                        childResourceId: equipment.childResourceId,
                        z: baseSlotParts[i].z,
                        childTokenId: equipment.childTokenId,
                        childAddress: equipment.childEquippableAddress,
                        metadataURI: baseSlotParts[i].metadataURI
                    });
                }
                else {
                    slotParts[i] = SlotPart({
                        partId: slotPartIds[i],
                        childResourceId: uint64(0),
                        z: baseSlotParts[i].z,
                        childTokenId: uint(0),
                        childAddress: address(0),
                        metadataURI: baseSlotParts[i].metadataURI
                    });
                }
                unchecked {++i;}
            }
        }
    }

    // --------------------- VALIDATION ---------------------

    // Declares that resources with this refId, are equippable into the parent address, on the partId slot
    function _setValidParentRefId(uint64 refId, address parentAddress, uint64 partId) internal {
        _validParentSlots[refId][parentAddress] = partId;
    }

    // Checks on the base contract that the child can go into the part id
    function _validateBaseEquip(address baseContract, address childContract, uint64 partId) private view returns (bool isEquippable) {
        isEquippable = IRMRKBaseStorage(baseContract).checkIsEquippable(partId, childContract);
    }

    function isChildEquipValid(
        address childAddress,
        uint childTokenId,
        uint64 childResourceId,
        uint64 slotId
    ) public view returns (bool) {
        return IRMRKEquippable(childAddress).canTokenBeEquippedWithResourceIntoSlot(
            address(this),
            childTokenId,
            childResourceId,
            slotId
        );
    }

    // Not intented to check if it is already equipped, only if can be.
    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint tokenId,
        uint64 resourceId,
        uint64 slotId
    ) public view returns (bool) {
        uint64 refId = _equippableRefIds[resourceId];
        uint64 equippableSlot = _validParentSlots[refId][parent];
        if (equippableSlot == slotId) {
            (, bool found) = _activeResources[tokenId].indexOf(resourceId);
            return found;
        }
        return false;
    }

    ////////////////////////////////////////
    //                RESOURCES
    ////////////////////////////////////////

    function acceptResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _acceptResource(tokenId, index);
    }

    function rejectResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(
        uint256 tokenId
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _setPriority(tokenId, priorities);
    }

    ////////////////////////////////////////
    //       MANAGING EXTENDED RESOURCES
    ////////////////////////////////////////

    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) internal {
        if (resource.baseAddress == address(0) && (fixedPartIds.length > 0 || slotPartIds.length > 0))
            revert RMRKBaseRequiredForParts();

        _addResourceEntry(resource.id, resource.metadataURI);

        _baseAddresses[resource.id] = resource.baseAddress;
        _equippableRefIds[resource.id] = resource.equippableRefId;
        _fixedPartIds[resource.id] = fixedPartIds;
        _slotPartIds[resource.id] = slotPartIds;
    }

    function getExtendedResource(
        uint64 resourceId
    ) public view virtual returns (ExtendedResource memory)
    {
        Resource memory resource = getResource(resourceId);

        return ExtendedResource({
            id: resource.id,
            equippableRefId: _equippableRefIds[resource.id],
            baseAddress: _baseAddresses[resource.id],
            metadataURI: resource.metadataURI
        });
    }

    function getExtendedResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(ExtendedResource memory) {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getExtendedResource(resourceId);
    }

    function getPendingExtendedResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(ExtendedResource memory) {
        uint64 resourceId = getPendingResources(tokenId)[index];
        return getExtendedResource(resourceId);
    }

    function getFullExtendedResources(
        uint256 tokenId
    ) external view virtual returns (ExtendedResource[] memory) {
        uint64[] memory resourceIds = _activeResources[tokenId];
        return _getExtendedResourcesById(resourceIds);
    }

    function getFullPendingExtendedResources(
        uint256 tokenId
    ) external view virtual returns (ExtendedResource[] memory) {
        uint64[] memory resourceIds = _pendingResources[tokenId];
        return _getExtendedResourcesById(resourceIds);
    }

    function _getExtendedResourcesById(
        uint64[] memory resourceIds
    ) internal view virtual returns (ExtendedResource[] memory) {
        uint256 len = resourceIds.length;
        ExtendedResource[] memory extendedResources = new ExtendedResource[](len);
        for (uint i; i<len;) {
            Resource memory resource = getResource(resourceIds[i]);
            extendedResources[i] = ExtendedResource({
                id: resource.id,
                equippableRefId: _equippableRefIds[resource.id],
                baseAddress: _baseAddresses[resource.id],
                metadataURI: resource.metadataURI
            });
            unchecked {++i;}
        }

        return extendedResources;
    }

    // Approvals

    function approveForResources(address to, uint256 tokenId) external virtual {
        address owner = _ownerOf(tokenId);
        if(to == owner)
            revert RMRKApprovalForResourcesToCurrentOwner();

        // We want to bypass the check if the caller is the linked nesting contract and it's simply removing approvals
        bool isNestingCallToRemoveApprovals = (_msgSender() == _nestingAddress &&  to == address(0));

        if(!isNestingCallToRemoveApprovals && _msgSender() != owner && !isApprovedForAllForResources(owner, _msgSender()))
            revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(owner, to, tokenId);
    }

    function setApprovalForAllForResources(address operator, bool approved) external virtual {
        address owner = _msgSender();
        if(owner == operator)
            revert RMRKApproveForResourcesToCaller();
        _setApprovalForAllForResources(owner, operator, approved);
    }

    function _exists(uint256 tokenId) internal override view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
