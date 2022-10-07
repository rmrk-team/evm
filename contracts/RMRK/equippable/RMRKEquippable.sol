// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "../base/IRMRKBaseStorage.sol";
import "../library/RMRKLib.sol";
import "../multiresource/AbstractMultiResource.sol";
import "../nesting/RMRKNesting.sol";
import "./IRMRKEquippable.sol";
// import "hardhat/console.sol";

// MultiResource
error RMRKNotApprovedForResourcesOrOwner();
error RMRKApprovalForResourcesToCurrentOwner();
error RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
// Equippable
error RMRKBaseRequiredForParts();
error RMRKEquippableEquipNotAllowedByBase();
error RMRKMustUnequipFirst();
error RMRKNotEquipped();
error RMRKSlotAlreadyUsed();
error RMRKTargetResourceCannotReceiveSlot();
error RMRKTokenCannotBeEquippedWithResourceIntoSlot();

contract RMRKEquippable is RMRKNesting, AbstractMultiResource, IRMRKEquippable {
    using RMRKLib for uint64[];

    // ------------------- RESOURCES --------------

    // ------------------- RESOURCE APPROVALS --------------

    // Mapping from token ID to approver address to approved address for resources
    // The approver is necessary so approvals are invalidated for nested children on transfer
    // WARNING: If a child NFT returns the original root owner, old permissions would be active again
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForResources;

    // ------------------- EQUIPPABLE --------------
    //Mapping of uint64 resource ID to corresponding base address
    mapping(uint64 => address) private _baseAddresses;
    //Mapping of uint64 Ids to resource object
    mapping(uint64 => uint64) private _equippableGroupIds;

    //Mapping of resourceId to all base parts (slot and fixed) applicable to this resource. Check cost of adding these to resource struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    mapping(uint64 => uint64[]) private _slotPartIds;

    //mapping of token id to base address to slot part Id to equipped information. Used to compose an NFT
    mapping(uint256 => mapping(address => mapping(uint64 => Equipment)))
        private _equipments;

    //mapping of token id to child (nesting) address to child Id to count of equips. Used to check if equipped.
    mapping(uint256 => mapping(address => mapping(uint256 => uint8)))
        private _equipCountPerChild;

    //Mapping of equippableGroupId to parent contract address and valid slotId
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

    // --------------------------- RESOURCE HANDLERS -------------------------

    function acceptResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId);
    }

    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    // --------------------------- RESOURCE INTERNALS -------------------------

    // This is expected to be implemented with custom guard:
    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) internal {
        uint64 id = resource.id;
        _addResourceEntry(id, resource.metadataURI);

        if (
            resource.baseAddress == address(0) &&
            (fixedPartIds.length != 0 || slotPartIds.length != 0)
        ) revert RMRKBaseRequiredForParts();

        _baseAddresses[id] = resource.baseAddress;
        _equippableGroupIds[id] = resource.equippableGroupId;
        _fixedPartIds[id] = fixedPartIds;
        _slotPartIds[id] = slotPartIds;
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

    function _cleanApprovals(uint256 tokenId) internal virtual override {
        _approveForResources(address(0), tokenId);
    }

    // ------------------------------- EQUIPPING ------------------------------

    function unnestChild(
        uint256 tokenId,
        uint256 index,
        address to,
        bool isPending
    ) public virtual override onlyApprovedOrOwner(tokenId) {
        if (!isPending) {
            Child memory child = childOf(tokenId, index);
            if (isChildEquipped(tokenId, child.contractAddress, child.tokenId))
                revert RMRKMustUnequipFirst();
        }
        _unnestChild(tokenId, index, to, isPending);
    }

    function equip(IntakeEquip memory data)
        public
        onlyApprovedOrOwner(data.tokenId)
    {
        _equip(data);
    }

    function _equip(IntakeEquip memory data) private {
        address baseAddress = getBaseAddressOfResource(data.resourceId);
        uint64 slotPartId = data.slotPartId;
        if (
            _equipments[data.tokenId][baseAddress][slotPartId]
                .childEquippableAddress != address(0)
        ) revert RMRKSlotAlreadyUsed();

        // Check from parent's resource perspective:
        _checkResourceAcceptsSlot(data.resourceId, slotPartId);

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
                    slotPartId
                )
        ) revert RMRKTokenCannotBeEquippedWithResourceIntoSlot();

        // Check from base perspective
        if (
            !IRMRKBaseStorage(baseAddress).checkIsEquippable(
                slotPartId,
                child.contractAddress
            )
        ) revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: data.resourceId,
            childResourceId: data.childResourceId,
            childTokenId: child.tokenId,
            childEquippableAddress: child.contractAddress
        });

        _equipments[data.tokenId][baseAddress][slotPartId] = newEquip;
        _equipCountPerChild[data.tokenId][child.contractAddress][
            child.tokenId
        ] += 1;

        emit ChildResourceEquipped(
            data.tokenId,
            data.resourceId,
            slotPartId,
            child.tokenId,
            child.contractAddress,
            data.childResourceId
        );
    }

    function _checkResourceAcceptsSlot(uint64 resourceId, uint64 slotPartId)
        private
        view
    {
        (, bool found) = _slotPartIds[resourceId].indexOf(slotPartId);
        if (!found) revert RMRKTargetResourceCannotReceiveSlot();
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

    // Declares that resources with this equippableGroupId, are equippable into the parent address, on the partId slot
    function _setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 slotPartId
    ) internal {
        _validParentSlots[equippableGroupId][parentAddress] = slotPartId;
        emit ValidParentEquippableGroupIdSet(
            equippableGroupId,
            slotPartId,
            parentAddress
        );
    }

    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotId
    ) public view returns (bool) {
        uint64 equippableGroupId = _equippableGroupIds[resourceId];
        uint64 equippableSlot = _validParentSlots[equippableGroupId][parent];
        if (equippableSlot == slotId) {
            (, bool found) = getActiveResources(tokenId).indexOf(resourceId);
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
        string memory meta = getResourceMeta(resourceId);

        return
            ExtendedResource({
                id: resourceId,
                equippableGroupId: _equippableGroupIds[resourceId],
                baseAddress: _baseAddresses[resourceId],
                metadataURI: meta
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
