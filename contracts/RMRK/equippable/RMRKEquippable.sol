// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../base/IRMRKBaseStorage.sol";
import "../library/RMRKLib.sol";
import "../nesting/RMRKNesting.sol";
import "./IRMRKEquippable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
// import "hardhat/console.sol";

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
// Equippable
error RMRKBaseRequiredForParts();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKMustUnequipFirst();
error RMRKNotEquipped();
error RMRKSlotAlreadyUsed();
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();

contract RMRKEquippable is RMRKNesting, IRMRKEquippable {
    using RMRKLib for uint64[];

    // ------------------- RESOURCES --------------
    //mapping of uint64 Ids to resource object
    mapping(uint64 => string) private _resources;

    //mapping of tokenId to new resource, to resource to be replaced
    mapping(uint256 => mapping(uint64 => uint64)) private _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => uint64[]) private _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) private _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(uint64 => bool)) private _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => uint64[]) private _pendingResources;

    //List of all resources
    uint64[] private _allResources;

    // ------------------- RESOURCE APPROVALS --------------

    // Mapping from token ID to approver address to approved address for resources
    // The approver is necessary so approvals are invalidated for nested children on transfer
    // WARNING: If a child NFT returns the original root owner, old permissions would be active again
    mapping(uint256 => mapping(address => address)) private _tokenApprovalsForResources;

    // Mapping from owner to operator approvals for resources
    mapping(address => mapping(address => bool))
        private _operatorApprovalsForResources;

    // ------------------- EQUIPPABLE --------------
    //Mapping of uint64 resource ID to corresponding base address
    mapping(uint64 => address) private _baseAddresses;
    //Mapping of uint64 Ids to resource object
    mapping(uint64 => uint64) private _equippableRefIds;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    //mapping of token id to base address to slot part Id to equipped information. Used to compose an NFT
    mapping(uint256 => mapping(address => mapping(uint64 => Equipment)))
        private _equipments;

    //mapping of token id to child (nesting) address to child Id to count of equips. Used to check if equipped.
    mapping(uint256 => mapping(address => mapping(uint256 => uint8)))
        private _equipCountPerChild;

    //Mapping of refId to parent contract address and valid slotId
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNesting)
        returns (bool)
    {
        return
            RMRKNesting.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKMultiResource).interfaceId ||
            interfaceId == type(IRMRKEquippable).interfaceId;
    }

    // ------------------------------- RESOURCES ------------------------------

    // --------------------------- RESOURCE GETTERS ---------------------------

    function getResource(uint64 resourceId)
        public
        view
        virtual
        returns (Resource memory)
    {
        string memory resourceData = _resources[resourceId];
        if (bytes(resourceData).length == 0) revert RMRKNoResourceMatchingId();
        Resource memory resource = Resource({
            id: resourceId,
            metadataURI: resourceData
        });
        return resource;
    }

    function getAllResources() public view virtual returns (uint64[] memory) {
        return _allResources;
    }

    function getActiveResources(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _activeResources[tokenId];
    }

    function getPendingResources(uint256 tokenId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _pendingResources[tokenId];
    }

    function getActiveResourcePriorities(uint256 tokenId)
        public
        view
        virtual
        returns (uint16[] memory)
    {
        return _activeResourcePriorities[tokenId];
    }

    function getResourceOverwrites(uint256 tokenId, uint64 resourceId)
        public
        view
        virtual
        returns (uint64)
    {
        return _resourceOverwrites[tokenId][resourceId];
    }

    // --------------------------- RESOURCE HANDLERS -------------------------

    function acceptResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = _resourceOverwrites[tokenId][resourceId];
        if (overwrite != uint64(0)) {
            // We could check here that the resource to overwrite actually exists but it is probably harmless.
            _activeResources[tokenId].removeItemByValue(overwrite);
            emit ResourceOverwritten(tokenId, overwrite, resourceId);
            delete (_resourceOverwrites[tokenId][resourceId]);
        }
        _activeResources[tokenId].push(resourceId);
        //Push 0 value of uint16 to array, e.g., uninitialized
        _activeResourcePriorities[tokenId].push(uint16(0));
        emit ResourceAccepted(tokenId, resourceId);
    }

    function rejectResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);
        delete _tokenResources[tokenId][resourceId];
        delete (_resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
    }

    function rejectAllResources(uint256 tokenId)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        uint256 len = _pendingResources[tokenId].length;
        for (uint256 i; i < len; ) {
            uint64 resourceId = _pendingResources[tokenId][i];
            delete _resourceOverwrites[tokenId][resourceId];
            unchecked {
                ++i;
            }
        }

        delete (_pendingResources[tokenId]);
        emit ResourceRejected(tokenId, uint64(0));
    }

    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        uint256 length = priorities.length;
        if (length != _activeResources[tokenId].length)
            revert RMRKBadPriorityListLength();
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    // --------------------------- RESOURCE INTERNALS -------------------------

    // This is expected to be implemented with custom guard:
    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) internal {
        uint64 id = resource.id;
        if (id == uint64(0)) revert RMRKWriteToZero();
        if (bytes(_resources[id]).length != 0)
            revert RMRKResourceAlreadyExists();
        if (
            resource.baseAddress == address(0) &&
            (fixedPartIds.length != 0 || slotPartIds.length != 0)
        ) revert RMRKBaseRequiredForParts();

        _resources[id] = resource.metadataURI;
        _allResources.push(id);

        _baseAddresses[resource.id] = resource.baseAddress;
        _equippableRefIds[resource.id] = resource.equippableRefId;
        _fixedPartIds[resource.id] = fixedPartIds;
        _slotPartIds[resource.id] = slotPartIds;

        emit ResourceSet(id);
    }

    // This is expected to be implemented with custom guard:
    function _addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) internal {
        if (_tokenResources[tokenId][resourceId])
            revert RMRKResourceAlreadyExists();

        if (bytes(_resources[resourceId]).length == 0)
            revert RMRKNoResourceMatchingId();

        if (_pendingResources[tokenId].length >= 128)
            revert RMRKMaxPendingResourcesReached();

        _tokenResources[tokenId][resourceId] = true;

        _pendingResources[tokenId].push(resourceId);

        if (overwrites != uint64(0)) {
            _resourceOverwrites[tokenId][resourceId] = overwrites;
            emit ResourceOverwriteProposed(tokenId, resourceId, overwrites);
        }

        emit ResourceAddedToToken(tokenId, resourceId);
    }

    // ----------------------- RESOURCE APPROVALS ------------------------

    function approveForResources(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForResourcesToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForResources(owner, _msgSender())
        ) revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(to, tokenId);
    }

    function getApprovedForResources(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);
        return _tokenApprovalsForResources[tokenId][ownerOf(tokenId)];
    }

    function setApprovalForAllForResources(address operator, bool approved)
        public
        virtual
    {
        address owner = _msgSender();
        if (owner == operator) revert RMRKApproveForResourcesToCaller();

        _operatorApprovalsForResources[owner][operator] = approved;
        emit ApprovalForAllForResources(owner, operator, approved);
    }

    function isApprovedForAllForResources(address owner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _operatorApprovalsForResources[owner][operator];
    }

    /**
     * @notice Internal function to check three conditions: the queried user is either:
     *   1. The root owner of tokenId
     *   2. Is approved for all given the current owner via the setApprovalForAllForResources function
     *   3. Was granted one-time approval for resource management via the approveForResources function
     * @param user user to query for permissioning
     * @param tokenId tokenId to query for permissioning given `user`
     * @return bool returns true if user is approved, false if not.
     */
    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = ownerOf(tokenId);
        return (user == owner ||
            isApprovedForAllForResources(owner, user) ||
            getApprovedForResources(tokenId) == user);
    }

    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        address owner = ownerOf(tokenId);
        _tokenApprovalsForResources[tokenId][owner] = to;
        emit ApprovalForResources(owner, to, tokenId);
    }

    function _cleanApprovals(uint256 tokenId)
        internal
        virtual
        override
    {
        _approveForResources(address(0), tokenId);
    }

    // ------------------------------- EQUIPPING ------------------------------

    function unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        Child memory child = childOf(tokenId, index);
        if (isChildEquipped(tokenId, child.contractAddress, child.tokenId))
            revert RMRKMustUnequipFirst();
        super.unnestChild(tokenId, index, to);
    }

    function equip(IntakeEquip memory data)
        public
        onlyApprovedOrOwner(data.tokenId)
    {
        _equip(data);
    }

    function _equip(IntakeEquip memory data) private {
        if (
            _equipments[data.tokenId][_baseAddresses[data.resourceId]][
                data.slotPartId
            ].childEquippableAddress != address(0)
        ) revert RMRKSlotAlreadyUsed();

        IRMRKNesting.Child memory child = childOf(
            data.tokenId,
            data.childIndex
        );

        // Check from child perspective intention to be used in part
        if (
            !IRMRKEquippable(child.contractAddress)
                .canTokenBeEquippedWithResourceIntoSlot(
                    address(this),
                    child.tokenId,
                    data.childResourceId,
                    data.slotPartId
                )
        ) revert RMRKTokenCannotBeEquippedWithResourceIntoSlot();

        // Check from base perspective
        if (
            !IRMRKBaseStorage(_baseAddresses[data.resourceId])
                .checkIsEquippable(data.slotPartId, child.contractAddress)
        ) revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: data.resourceId,
            childResourceId: data.childResourceId,
            childTokenId: child.tokenId,
            childEquippableAddress: child.contractAddress
        });

        _equipments[data.tokenId][_baseAddresses[data.resourceId]][
            data.slotPartId
        ] = newEquip;
        _equipCountPerChild[data.tokenId][child.contractAddress][
            child.tokenId
        ] += 1;

        // TODO: Decouple Equip and Unequip events.
        // TODO: Add ChildReplaced event.
        emit ChildResourceEquipped(
            data.tokenId,
            data.resourceId,
            data.slotPartId,
            child.tokenId,
            child.contractAddress,
            data.childResourceId
        );
    }

    function unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) public onlyApprovedOrOwner(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
    }

    function _unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) private {
        address targetBaseAddress = _baseAddresses[resourceId];
        Equipment memory equipment = _equipments[tokenId][targetBaseAddress][
            slotPartId
        ];
        if (equipment.childEquippableAddress == address(0))
            revert RMRKNotEquipped();
        delete _equipments[tokenId][targetBaseAddress][slotPartId];
        _equipCountPerChild[tokenId][equipment.childEquippableAddress][
            equipment.childTokenId
        ] -= 1;

        emit ChildResourceUnequipped(
            tokenId,
            resourceId,
            slotPartId,
            equipment.childTokenId,
            equipment.childEquippableAddress,
            equipment.childResourceId
        );
    }

    //FIXME: This can probably be optimized. Instead of running unequip first, can we just replace the data?
    function replaceEquipment(IntakeEquip memory data)
        public
        onlyApprovedOrOwner(data.tokenId)
    {
        _unequip(data.tokenId, data.resourceId, data.slotPartId);
        _equip(data);
    }

    function isChildEquipped(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) public view returns (bool) {
        return
            _equipCountPerChild[tokenId][childAddress][childTokenId] !=
            uint8(0);
    }

    function getBaseAddressOfResource(uint64 resourceId)
        public
        view
        returns (address)
    {
        return _baseAddresses[resourceId];
    }

    // --------------------- ADMIN VALIDATION ---------------------

    // Declares that resources with this refId, are equippable into the parent address, on the partId slot
    function _setValidParentRefId(
        uint64 referenceId,
        address parentAddress,
        uint64 slotPartId
    ) internal {
        _validParentSlots[referenceId][parentAddress] = slotPartId;
        emit ValidParentReferenceIdSet(referenceId, slotPartId, parentAddress);
    }

    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint256 tokenId,
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

    // --------------------- Getting Extended Resources ---------------------

    function getExtendedResource(uint64 resourceId)
        public
        view
        virtual
        returns (ExtendedResource memory)
    {
        Resource memory resource = getResource(resourceId);

        return
            ExtendedResource({
                id: resource.id,
                equippableRefId: _equippableRefIds[resource.id],
                baseAddress: _baseAddresses[resource.id],
                metadataURI: resource.metadataURI
            });
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    function getSlotPartIds(uint64 resourceId)
        public
        view
        returns (uint64[] memory)
    {
        return _slotPartIds[resourceId];
    }

    function getFixedPartIds(uint64 resourceId)
        public
        view
        returns (uint64[] memory)
    {
        return _fixedPartIds[resourceId];
    }

    function getEquipment(
        uint256 tokenId,
        address targetBaseAddress,
        uint64 slotPartId
    ) public view returns (Equipment memory) {
        return _equipments[tokenId][targetBaseAddress][slotPartId];
    }
}
