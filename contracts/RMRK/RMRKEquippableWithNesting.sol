// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

/*
* RMRK Equippables accessory contract, responsible for state storage and management of equippable items.
*/

pragma solidity ^0.8.15;

import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippableWithNesting.sol";
import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingWithEquippable.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "hardhat/console.sol";

// MultiResource
error RMRKBadPriorityListLength();
error RMRKIndexOutOfRange();
error RMRKMaxPendingResourcesReached();
error RMRKNoResourceMatchingId();
error RMRKResourceAlreadyExists();
error RMRKWriteToZero();
error RMRKNotApprovedForResourcesOrOwner();
error RMRKApprovalForResourcesToCurrentOwner();
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
error RMRKApproveForResourcesToCaller();

error ERC721InvalidTokenId();
error ERC721NotApprovedOrOwner();
error RMRKBaseRequiredForParts();
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKNotComposableResource();
error RMRKNotEquipped();
error RMRKSlotAlreadyUsed();
error RMRKTokenDoesNotHaveActiveResource();

contract RMRKEquippableWithNesting is Context, IRMRKEquippableWithNesting {

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

    // ------------------- RESOURCES --------------
    //mapping of uint64 Ids to resource object
    mapping(uint64 => string) internal _resources;

    //mapping of tokenId to new resource, to resource to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) internal _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => uint64[]) internal _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) internal _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(uint64 => bool)) internal _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => uint64[]) internal _pendingResources;

    //List of all resources
    uint64[] internal _allResources;

    // Mapping from token ID to approved address for resources
    mapping(uint256 => address) internal _tokenApprovalsForResources;

    // Mapping from owner to operator approvals for resources
    mapping(address => mapping(address => bool)) internal _operatorApprovalsForResources;

    // ------------------- Equippable --------------

    address private _nestingAddress;

    //mapping of uint64 Ids to resource object
    mapping(uint64 => address) private _baseAddresses;
    mapping(uint64 => uint64) private _equippableRefIds;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    //mapping of token id to base address to slot part Id to equipped information. Used to compose an NFT
    mapping(uint => mapping(address => mapping(uint64 => Equipment))) private _equipments;

    //mapping of token id to child (nesting) address to child Id to count of equips. Used to check if equipped.
    mapping(uint => mapping(address => mapping(uint => uint8))) private _equipCountPerChild;

    //Mapping of refId to parent contract address and valid slotId
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    function _onlyApprovedOrOwner(uint tokenId) internal view {
        if (!IRMRKNestingWithEquippable(_nestingAddress).isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        _onlyApprovedOrOwner(tokenId);
        _;
    }

    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
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

    constructor(address nestingAddress) {
        _setNestingAddress(nestingAddress);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKEquippableWithNesting).interfaceId ||
            interfaceId == type(IRMRKEquippable).interfaceId ||
            interfaceId == type(IRMRKMultiResource).interfaceId ||
            interfaceId == type(IERC165).interfaceId
        );
    }

    function _setNestingAddress(address nestingAddress) internal {
        address oldAddress = _nestingAddress;
        _nestingAddress = nestingAddress;
        emit NestingAddressSet(oldAddress, nestingAddress);
    }

    function getNestingAddress() external view returns(address) {
        return _nestingAddress;
    }

    // ------------------------------- RESOURCES ------------------------------

    // --------------------------- GETTING RESOURCES --------------------------

    function getResource(
        uint64 resourceId
    ) public view virtual returns (Resource memory)
    {
        string memory resourceData = _resources[resourceId];
        if(bytes(resourceData).length == 0)
            revert RMRKNoResourceMatchingId();
        Resource memory resource = Resource({
            id: resourceId,
            metadataURI: resourceData
        });
        return resource;
    }

    function getAllResources() public view virtual returns (uint64[] memory) {
        return _allResources;
    }

    function getResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(Resource memory) {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(
        uint256 tokenId,
        uint256 index
    ) external view virtual returns(Resource memory) {
        uint64 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

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

    function getActiveResources(
        uint256 tokenId
    ) public view virtual returns(uint64[] memory) {
        return _activeResources[tokenId];
    }

    function getPendingResources(
        uint256 tokenId
    ) public view virtual returns(uint64[] memory) {
        return _pendingResources[tokenId];
    }

    function getActiveResourcePriorities(
        uint256 tokenId
    ) public view virtual returns(uint16[] memory) {
        return _activeResourcePriorities[tokenId];
    }

    function getResourceOverwrites(
        uint256 tokenId,
        uint64 resourceId
    ) public view virtual returns(uint64) {
        return _resourceOverwrites[tokenId][resourceId];
    }

    // --------------------------- HANDLING RESOURCES -------------------------

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

    function _acceptResource(uint256 tokenId, uint256 index) internal {
        if(index >= _pendingResources[tokenId].length) revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = _resourceOverwrites[tokenId][resourceId];
        if (overwrite != uint64(0)) {
            // We could check here that the resource to overwrite actually exists but it is probably harmless.
            _activeResources[tokenId].removeItemByValue(overwrite);
            emit ResourceOverwritten(tokenId, overwrite, resourceId);
            delete(_resourceOverwrites[tokenId][resourceId]);
        }
        _activeResources[tokenId].push(resourceId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        _activeResourcePriorities[tokenId].push(uint16(0));
        emit ResourceAccepted(tokenId, resourceId);
    }

    function _rejectResource(uint256 tokenId, uint256 index) internal {
        if(index >= _pendingResources[tokenId].length) revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);
        _tokenResources[tokenId][resourceId] = false;
        delete(_resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
    }

    function _rejectAllResources(uint256 tokenId) internal {
        uint256 len = _pendingResources[tokenId].length;
        for (uint i; i<len;) {
            uint64 resourceId = _pendingResources[tokenId][i];
            delete _resourceOverwrites[tokenId][resourceId];
            unchecked {++i;}
        }

        delete(_pendingResources[tokenId]);
        emit ResourceRejected(tokenId, uint64(0));
    }

    function _setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) internal {
        uint256 length = priorities.length;
        if(length != _activeResources[tokenId].length) revert RMRKBadPriorityListLength();
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    // This is expected to be implemented with custom guard:
    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal {
        if(_tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if(bytes(_resources[resourceId]).length == 0)
            revert RMRKNoResourceMatchingId();

        if(_pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    // ----------------------------- TOKEN URI --------------------------------
    /**
     * @dev See {IERC721Metadata-tokenURI}. Overwritten for MR
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        return _tokenURIAtIndex(tokenId, 0);
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    function tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) public view virtual returns (string memory) {
        return _tokenURIAtIndex(tokenId, index);
    }

    function _tokenURIAtIndex(
        uint256 tokenId,
        uint256 index
    ) internal virtual view returns (string memory) {
        _requireMinted(tokenId);
        // TODO: Discuss is this is the best default path.
        // We could return empty string so it returns something if a token has no resources, but it might hide erros
        if (!(index < _activeResources[tokenId].length))
            revert RMRKIndexOutOfRange();

        uint64 activeResId = _activeResources[tokenId][index];
        Resource memory _activeRes = getResource(activeResId);
        string memory uri = string(
            abi.encodePacked(_baseURI(), _activeRes.metadataURI)
        );

        return uri;
    }

    // ----------------------- APPROVALS FOR RESOURCES ------------------------

    function approveForResources(address to, uint256 tokenId) external virtual {
        address owner = ownerOf(tokenId);
        if(to == owner)
            revert RMRKApprovalForResourcesToCurrentOwner();

        // We want to bypass the check if the caller is the linked nesting contract and it's simply removing approvals
        bool isNestingCallToRemoveApprovals = (_msgSender() == _nestingAddress &&  to == address(0));

        if(!isNestingCallToRemoveApprovals && _msgSender() != owner && !isApprovedForAllForResources(owner, _msgSender()))
            revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(to, tokenId);
    }

    function getApprovedForResources(uint256 tokenId) public virtual view returns (address) {
        _requireMinted(tokenId);
        return _tokenApprovalsForResources[tokenId];
    }

    function setApprovalForAllForResources(address operator, bool approved) external virtual {
        address owner = _msgSender();
        if(owner == operator)
            revert RMRKApproveForResourcesToCaller();

        _operatorApprovalsForResources[owner][operator] = approved;
        emit ApprovalForAllForResources(owner, operator, approved);
    }

    function isApprovedForAllForResources(address owner, address operator) public virtual view returns (bool) {
        return _operatorApprovalsForResources[owner][operator];
    }

    function _approveForResources(address to, uint256 tokenId) internal virtual {
        _tokenApprovalsForResources[tokenId] = to;
        emit ApprovalForResources(ownerOf(tokenId), to, tokenId);
    }

    function _cleanApprovals(address owner, uint256 tokenId) internal virtual {
        _approveForResources(owner, tokenId);
    }

    // ------------------------------- EQUIPPING ------------------------------

    function equip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyApprovedOrOwner(tokenId) {
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
        address childEquippable = IRMRKNestingWithEquippable(child.contractAddress).getEquippableAddress();

        // Check from child perspective intention to be used in part
        if (!IRMRKEquippable(childEquippable).canTokenBeEquippedWithResourceIntoSlot(
            address(this), child.tokenId, childResourceId, slotPartId)
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
        _equipCountPerChild[tokenId][child.contractAddress][child.tokenId] += 1;

        // TODO: When replacing, this event is emmited in the middle (bad practice). Shall we change it?
        emit ChildResourceEquipped(
            tokenId,
            resourceId,
            slotPartId,
            child.tokenId,
            childEquippable,
            childResourceId
        );
    }

    function unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) external onlyApprovedOrOwner(tokenId) {
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
        address childNestingAddress = IRMRKEquippableWithNesting(equipment.childEquippableAddress).getNestingAddress();
        _equipCountPerChild[tokenId][childNestingAddress][equipment.childTokenId] -= 1;

        emit ChildResourceUnequipped(
            tokenId,
            resourceId,
            slotPartId,
            equipment.childTokenId,
            equipment.childEquippableAddress,
            equipment.childResourceId
        );
    }

    function replaceEquipment(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId,
        uint256 childIndex,
        uint64 childResourceId
    ) external onlyApprovedOrOwner(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
        _equip(tokenId, resourceId, slotPartId, childIndex, childResourceId);
    }

    function isChildEquipped(
        uint tokenId,
        address childAddress,
        uint childTokenId
    ) external view returns(bool) {
        return _equipCountPerChild[tokenId][childAddress][childTokenId] != uint8(0);
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
    function _setValidParentRefId(uint64 referenceId, address parentAddress, uint64 slotPartId) internal {
        _validParentSlots[referenceId][parentAddress] = slotPartId;
        emit ValidParentReferenceIdSet(referenceId, slotPartId, parentAddress);
    }

    // Checks on the base contract that the child can go into the part id
    function _validateBaseEquip(address baseContract, address childContract, uint64 partId) private view returns (bool isEquippable) {
        isEquippable = IRMRKBaseStorage(baseContract).checkIsEquippable(partId, childContract);
    }

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
    //       MANAGING EXTENDED RESOURCES
    ////////////////////////////////////////

    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) internal {
        uint64 id = resource.id;

        if(id == uint64(0))
            revert RMRKWriteToZero();
        if(bytes(_resources[id]).length > 0)
            revert RMRKResourceAlreadyExists();
        if (resource.baseAddress == address(0) && (fixedPartIds.length > 0 || slotPartIds.length > 0))
            revert RMRKBaseRequiredForParts();

        _resources[id] = resource.metadataURI;
        _allResources.push(id);

        _baseAddresses[resource.id] = resource.baseAddress;
        _equippableRefIds[resource.id] = resource.equippableRefId;
        _fixedPartIds[resource.id] = fixedPartIds;
        _slotPartIds[resource.id] = slotPartIds;

        emit ResourceSet(id);
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
            extendedResources[i] = getExtendedResource(resourceIds[i]);
            unchecked {++i;}
        }

        return extendedResources;
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */
    function _requireMinted(uint256 tokenId) internal view virtual {
        if(!_exists(tokenId))
            revert ERC721InvalidTokenId();
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return ownerOf(tokenId) != address(0);
    }


    function ownerOf(uint tokenId) internal view returns(address) {
        return IRMRKNesting(_nestingAddress).ownerOf(tokenId);
    }
}
