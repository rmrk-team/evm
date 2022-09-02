// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./interfaces/IRMRKBaseStorage.sol";
import "./interfaces/IRMRKEquippable.sol";
import "./interfaces/IRMRKNesting.sol";
import "./library/RMRKLib.sol";
import "./RMRKNesting.sol";
import "./RMRKEquippableViews.sol";
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
error RMRKNotComposableResource();
error RMRKNotEquipped();
error RMRKSlotAlreadyUsed();
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();
error RMRKTokenDoesNotHaveActiveResource();

contract RMRKEquippable is RMRKNesting, IRMRKEquippable {
    using RMRKLib for uint64[];

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
    mapping(address => mapping(address => bool))
        internal _operatorApprovalsForResources;

    // ------------------- Equippable --------------

    // External contract used for heavy views to save contract size. Deployed on contructor
    RMRKEquippableViews private _views;

    //mapping of uint64 Ids to resource object
    mapping(uint64 => address) private _baseAddresses;
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
    {
        _views = new RMRKEquippableViews(address(this));
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            RMRKNesting.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKMultiResource).interfaceId ||
            interfaceId == type(IRMRKEquippable).interfaceId;
    }

    // ------------------------------- RESOURCES ------------------------------

    // --------------------------- GETTING RESOURCES --------------------------

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

    function getResObjectByIndex(uint256 tokenId, uint256 index)
        external
        view
        virtual
        returns (Resource memory)
    {
        uint64 resourceId = getActiveResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getPendingResObjectByIndex(uint256 tokenId, uint256 index)
        external
        view
        virtual
        returns (Resource memory)
    {
        uint64 resourceId = getPendingResources(tokenId)[index];
        return getResource(resourceId);
    }

    function getResourcesById(uint64[] calldata resourceIds)
        public
        view
        virtual
        returns (Resource[] memory)
    {
        uint256 len = resourceIds.length;
        Resource[] memory resources = new Resource[](len);
        for (uint256 i; i < len; ) {
            resources[i] = getResource(resourceIds[i]);
            unchecked {
                ++i;
            }
        }
        return resources;
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

    // --------------------------- HANDLING RESOURCES -------------------------

    function acceptResource(uint256 tokenId, uint256 index)
        external
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
        external
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        if (index >= _pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = _pendingResources[tokenId][index];
        _pendingResources[tokenId].removeItemByIndex(index);
        _tokenResources[tokenId][resourceId] = false;
        delete (_resourceOverwrites[tokenId][resourceId]);

        emit ResourceRejected(tokenId, resourceId);
    }

    function rejectAllResources(uint256 tokenId)
        external
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
        external
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        uint256 length = priorities.length;
        if (length != _activeResources[tokenId].length)
            revert RMRKBadPriorityListLength();
        _activeResourcePriorities[tokenId] = priorities;

        emit ResourcePrioritySet(tokenId);
    }

    // This is expected to be implemented with custom guard:
    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) internal {
        uint64 id = resource.id;
        if (id == uint64(0)) revert RMRKWriteToZero();
        if (bytes(_resources[id]).length > 0)
            revert RMRKResourceAlreadyExists();
        if (
            resource.baseAddress == address(0) &&
            (fixedPartIds.length > 0 || slotPartIds.length > 0)
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

    // ----------------------------- TOKEN URI --------------------------------

    /**
     * @dev See {IERC721Metadata-tokenURI}. Overwritten for MR
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(RMRKNesting, IRMRKMultiResource)
        returns (string memory)
    {
        return _tokenURIAtIndex(tokenId, 0);
    }

    function tokenURIAtIndex(uint256 tokenId, uint256 index)
        public
        view
        virtual
        returns (string memory)
    {
        return _tokenURIAtIndex(tokenId, index);
    }

    function _tokenURIAtIndex(uint256 tokenId, uint256 index)
        internal
        view
        virtual
        returns (string memory)
    {
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
        return _tokenApprovalsForResources[tokenId];
    }

    function setApprovalForAllForResources(address operator, bool approved)
        external
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

    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        _tokenApprovalsForResources[tokenId] = to;
        emit ApprovalForResources(ownerOf(tokenId), to, tokenId);
    }

    function _cleanApprovals(address owner, uint256 tokenId)
        internal
        virtual
        override
    {
        _approveForResources(owner, tokenId);
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

    function equip(IntakeEquip memory data) external onlyApprovedOrOwner(data.tokenId) {
        _equip(data);
    }

    function _equip(IntakeEquip memory data) private {
        if (
            _equipments[data.tokenId][_baseAddresses[data.resourceId]][data.slotPartId]
                .childEquippableAddress != address(0)
        ) revert RMRKSlotAlreadyUsed();

        IRMRKNesting.Child memory child = childOf(data.tokenId, data.childIndex);

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
            !IRMRKBaseStorage(_baseAddresses[data.resourceId]).checkIsEquippable(
                data.slotPartId,
                child.contractAddress
            )
        ) revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: data.resourceId,
            childResourceId: data.childResourceId,
            childTokenId: child.tokenId,
            childEquippableAddress: child.contractAddress
        });

        _equipments[data.tokenId][_baseAddresses[data.resourceId]][data.slotPartId] = newEquip;
        _equipCountPerChild[data.tokenId][child.contractAddress][child.tokenId] += 1;

        // TODO: When replacing, this event is emmited in the middle (bad practice). Shall we change it?
        emit ChildResourceEquipped(
            data.tokenId,
            data.resourceId,
            data.slotPartId,
            child.tokenId,
            child.contractAddress,
            data.childResourceId
        );
    }

    function unequip(uint256 tokenId, uint64 resourceId, uint64 slotPartId) external onlyApprovedOrOwner(tokenId) {
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

    function replaceEquipment(
        IntakeEquip memory data
    ) external onlyApprovedOrOwner(data.tokenId) {
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

    function getEquipped(uint64 tokenId, uint64 resourceId)
        public
        view
        returns (uint64[] memory slotParts, Equipment[] memory childrenEquipped)
    {
        return _views.getEquipped(tokenId, resourceId, _baseAddresses[resourceId]);
    }

    //Gate for equippable array in here by check of slotPartDefinition to slotPartId
    function composeEquippables(uint256 tokenId, uint64 resourceId)
        public
        view
        returns (
            ExtendedResource memory resource,
            FixedPart[] memory fixedParts,
            SlotPart[] memory slotParts
        )
    {
        // We make sure token has that resource. Alternative is to receive index but makes equipping more complex.
        (, bool found) = getActiveResources(tokenId).indexOf(resourceId);
        if (!found) revert RMRKTokenDoesNotHaveActiveResource();

        address targetBaseAddress = _baseAddresses[resourceId];
        if (targetBaseAddress == address(0)) revert RMRKNotComposableResource();
        return _views.composeEquippables(tokenId, resourceId, targetBaseAddress);
    }

    // --------------------- VALIDATION ---------------------

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
        external
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

    function getSlotPartIds(uint64 resourceId) external view returns (uint64[] memory) {
        return _slotPartIds[resourceId];
    }

    function getFixedPartIds(uint64 resourceId) external view returns (uint64[] memory) {
        return _fixedPartIds[resourceId];
    }

    function getEquipment(uint tokenId, address targetBaseAddress, uint64 slotPartId) external view returns (Equipment memory) {
        return _equipments[tokenId][targetBaseAddress][slotPartId];
    }

}
