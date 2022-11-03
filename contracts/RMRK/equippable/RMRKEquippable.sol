// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.16;

import "../base/IRMRKBaseStorage.sol";
import "../library/RMRKLib.sol";
import "../multiresource/AbstractMultiResource.sol";
import "../nesting/RMRKNesting.sol";
import "../security/ReentrancyGuard.sol";
import "./IRMRKEquippable.sol";

// import "hardhat/console.sol";

/**
 * @title RMRKEquippable
 * @author RMRK team
 * @notice Smart contract of the RMRK Equippable module.
 */
contract RMRKEquippable is
    ReentrancyGuard,
    RMRKNesting,
    AbstractMultiResource,
    IRMRKEquippable
{
    using RMRKLib for uint64[];

    // ------------------- RESOURCES --------------

    // ------------------- RESOURCE APPROVALS --------------

    /**
     * @notice Mapping from token ID to approver address to approved address for resources.
     * @dev The approver is necessary so approvals are invalidated for nested children on transfer.
     * @dev WARNING: If a child NFT returns the original root owner, old permissions would be active again.
    */
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForResources;

    // ------------------- EQUIPPABLE --------------
    /// Mapping of uint64 resource ID to corresponding base address.
    mapping(uint64 => address) private _baseAddresses;
    /// Mapping of uint64 ID to resource object.
    mapping(uint64 => uint64) private _equippableGroupIds;

    /// Mapping of resourceId to fixed base parts applicable to this resource. Check cost of adding these to resource
    ///  struct.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    /// Mapping of resourceId to slot base parts applicable to this resource. Check cost of adding these to resource
    ///  struct.
    mapping(uint64 => uint64[]) private _slotPartIds;

    /// Mapping of token ID to base address to slot part ID to equipmen information. Used to compose an NFT.
    mapping(uint256 => mapping(address => mapping(uint64 => Equipment)))
        private _equipments;

    /// Mapping of token ID to child (nesting) address to child ID to count equipped items. Used to check if equipped.
    mapping(uint256 => mapping(address => mapping(uint256 => uint8)))
        private _equipCountPerChild;

    /// Mapping of `equippableGroupId` to parent contract address and valid `slotId`.
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved to manage all resources
     *  of the owner.
     * @param tokenId ID of the token that we are checking
    */
    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    /**
     * @notice Used to ensure that the caller is either the owner of the given token or approved to manage all resources
     *  of the owner.
     * @dev If that is not the case, the execution of the function will be reverted.
     * @param tokenId ID of the token that we are checking
    */
    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` of the token collection.
     */
    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_)
    {}

    /**
     * @inheritdoc IERC165
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

    /**
     * @notice Used to accept a pending resource of a given token.
     * @dev Accepting is done using the index of a pending resource. The array of pending resources is modified every
     *  time one is accepted and the last pending resource is moved into its place.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage all of the owner's
     *  resources.
     * @param tokenId ID of the token for which we are accepting the resource
     * @param index Index of the resource to accept in token's pending arry
    */
    function acceptResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _acceptResource(tokenId, index);
    }

    /**
     * @notice Used to reject a pending resource of a given token.
     * @dev Rejecting is done using the index of a pending resource. The array of pending resources is modified every
     *  time one is rejected and the last pending resource is moved into its place.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage all of the owner's
     *  resources.
     * @param tokenId ID of the token for which we are rejecting the resource
     * @param index Index of the resource to reject in token's pending array
    */
    function rejectResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectResource(tokenId, index);
    }

    /**
     * @notice Used to reject all pending resources of a given token.
     * @dev When rejecting all resources, the pending array is indiscriminately cleared.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage all of the owner's
     *  resources.
     * @param tokenId ID of the token for which we are clearing the pending array
    */
    function rejectAllResources(uint256 tokenId)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId);
    }

    /**
     * @notice Used to set priorities of active resources of a token.
     * @dev Priorities define which resource we would rather have shown when displaying the token.
     * @dev The pending resources array length has to match the number of active resources, otherwise setting priorities
     *  will be reverted.
     * @param tokenId ID of the token we are managing the priorities of
     * @param priorities An array of priorities of active resources. The succesion of items in the priorities array
     *  matches that of the succesion of items in the active array
    */
    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    // --------------------------- RESOURCE INTERNALS -------------------------

    /**
     * @notice Used to add a resource entry.
     * @dev This internal function warrants custom access control to be implemented when used.
     * @dev `ExtendedResource` consists of the following parameters:
     *  [
     *      resourceId,
     *      childResourceId,
     *      childTokenId,
     *      childEquippableAddress
     *  ]
     * @param resource An `ExtendedResource` struct containing the components of a resource we are adding
     * @param fixedPartIds An array of IDs of fixed parts to be included in the resource
     * @param slotPartIds An array of IDs of slot parts to be included in the resource
    */
    function _addResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) internal virtual {
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

    /**
     * @notice Used to grant approvals for specific tokens to a specified address.
     * @dev This can only be called by the owner of the token or by an account that has been granted permission to
     *  manage all of the owner's resources.
     * @param to Address of the account to receive the approval to the specified token
     * @param tokenId ID of the token for which we are granting the permission
    */
    function approveForResources(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForResourcesToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForResources(owner, _msgSender())
        ) revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(to, tokenId);
    }

    /**
     * @notice Used to get the address of the user that is approved to manage the specified token from the current
     *  owner.
     * @param tokenId ID of the token we are checking
     * @return address Address of the account that is approved to manage the token
    */
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
     * @notice Internal function to check whether the queried user is either:
     *   1. The root owner of the token associated with `tokenId`.
     *   2. Is approved for all resources of the current owner via the `setApprovalForAllForResources` function.
     *   3. Was granted one-time approval for resource management via the `approveForResources` function.
     * @param user Address of the user we are checking for permission
     * @param tokenId ID of the token to query for permission for a given `user`
     * @return bool A boolean value indicating whether the user is approved to manage the token or not
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

    /**
     * @notice Internal function for granting approvals for a speciific token.
     * @param to Address of the account we are granting an approval to
     * @param tokenId ID of the token we are granting the approval for
    */
    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        address owner = ownerOf(tokenId);
        _tokenApprovalsForResources[tokenId][owner] = to;
        emit ApprovalForResources(owner, to, tokenId);
    }

    /**
     * @notice Used to clear the approvals on a given token.
     * @param tokenId ID of the token we are clearin the approvals of
    */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        _approveForResources(address(0), tokenId);
    }

    // ------------------------------- EQUIPPING ------------------------------

    /**
     * @notice Used to unnest a given child.
     * @dev The function doesn't contain a check validating that `to` is not a contract. To ensure that a token is not
     *  transferred to an incompatible smart contract, custom validation has to be added when using this function.
     * @param tokenId ID of the token we are unnesting a child from
     * @param index Index of a token we are unnesting in the array it belongs to (can be either active array or pending
     *  array)
     * @param to End user address to unnest the token to
     * @param isPending Specifies whether the child being unnested is in the pending array (`true`) or in an active
     *  array (`false`)
    */
    function _unnestChild(
        uint256 tokenId,
        uint256 index,
        address to,
        bool isPending
    ) internal virtual override {
        if (!isPending) {
            Child memory child = childOf(tokenId, index);
            if (isChildEquipped(tokenId, child.contractAddress, child.tokenId))
                revert RMRKMustUnequipFirst();
        }
        super._unnestChild(tokenId, index, to, isPending);
    }

    /**
     * @notice Used to equip a child into a token.
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      resourceId,
     *      slotPartId,
     *      childResourceId
     *  ]
     * @param data An `IntakeEquip` struct specifying the equip data
    */
    function equip(IntakeEquip memory data)
        public
        virtual
        onlyApprovedOrOwner(data.tokenId)
        nonReentrant
    {
        _equip(data);
    }

    /**
     * @notice Private function used to equip a child into a token.
     * @dev Execution will be reverted if the `Slot` already has an item equipped.
     * @dev If the child can't be used in the given `Slot`, the execution will be reverted.
     * @dev If the base doesn't allow this equip to happen, the execution will be reverted.
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      resourceId,
     *      slotPartId,
     *      childResourceId
     *  ]
     * @param data An `IntakeEquip` struct specifying the equip data
    */
    function _equip(IntakeEquip memory data) internal virtual {
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
        // We add reentrancy guard because of this call, it happens before updating state
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

        _beforeEquip(data);
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
        _afterEquip(data);
    }

    /**
     * @notice Private function to check if a given resource contains a given slot or not.
     * @dev Execution will be reverted if the `Slot` is not found on the resource.
     * @param resourceId ID of the resource being checked to contain the given `Slot`
     * @param slotPartId ID of the `Slot` being validated
    */
    function _checkResourceAcceptsSlot(uint64 resourceId, uint64 slotPartId)
        private
        view
    {
        (, bool found) = _slotPartIds[resourceId].indexOf(slotPartId);
        if (!found) revert RMRKTargetResourceCannotReceiveSlot();
    }

    /**
     * @notice Used to unequip child from parent token.
     * @dev This can only be called by the owner of the token or by an account that has been granted permission to
     *  manage the given token by the current owner.
     * @param tokenId ID of the parent from which the child is being unequipped
     * @param resourceId ID of the parent's resource that contains the `Slot` into which the child is equipped
     * @param slotPartId ID of the `Slot` from which to unequip the child
    */
    function unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _unequip(tokenId, resourceId, slotPartId);
    }

    /**
     * @notice Private function used to unequip child from parent token.
     * @param tokenId ID of the parent from which the child is being unequipped
     * @param resourceId ID of the parent's resource that contains the `Slot` into which the child is equipped
     * @param slotPartId ID of the `Slot` from which to unequip the child
    */
    function _unequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) internal virtual {
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

    /**
     * @notice Used to equip a child into a slot that already has a child equipped and unequip the current child at the
     *  same time.
     * @dev This can only be called by the owner of the token or by an account that has been granted permission to
     *  manage the given token by the current owner.
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      resourceId,
     *      slotPartId,
     *      childResourceId
     *  ]
     * @param data An `IntakeEquip` struct specifying the equip data
    */
    function replaceEquipment(IntakeEquip memory data)
        public
        virtual
        onlyApprovedOrOwner(data.tokenId)
        nonReentrant
    {
        _unequip(data.tokenId, data.resourceId, data.slotPartId);
        _equip(data);
    }

    /**
     * @notice Used to check whether the given token has a child token equipped.
     * @param tokenId ID of the parent token
     * @param childAddress Address of the child token's collection
     * @param childTokenId ID of the child token
     * @return bool Boolean value indicating whether the child is equipped into the given parent
    */
    function isChildEquipped(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) public view virtual returns (bool) {
        return
            _equipCountPerChild[tokenId][childAddress][childTokenId] !=
            uint8(0);
    }

    /**
     * @notice Used to get the address of resource's `Base`
     * @param resourceId ID of the resource we are retrieving the `Base` address from
     * @return address Address of the resource's `Base`
    */
    function getBaseAddressOfResource(uint64 resourceId)
        public
        view
        virtual
        returns (address)
    {
        return _baseAddresses[resourceId];
    }

    // --------------------- ADMIN VALIDATION ---------------------

    /**
     * @notice Internal function used to declare that the resources belonging to a given `equippableGroupId` are
     *  equippable into the `Slot` associated with the `partId` of the collection at the specified `parentAddress`
     * @param equippableGroupId ID of the equippable group
     * @param parentAddress Address of the parent into which the equippable group can be equipped into
     * @param slotPartId ID of the `Slot` that the items belonging to the equippable group can be equipped into
    */
    function _setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 slotPartId
    ) internal virtual {
        if (equippableGroupId == uint64(0) || slotPartId == uint64(0))
            revert RMRKIdZeroForbidden();
        _validParentSlots[equippableGroupId][parentAddress] = slotPartId;
        emit ValidParentEquippableGroupIdSet(
            equippableGroupId,
            slotPartId,
            parentAddress
        );
    }

    /**
     * @notice Used to verify whether a token can be equipped into a given parent's slot.
     * @param parent Address of the parent token's smart contract
     * @param tokenId ID of the token we want to equip
     * @param resourceId ID of the resource associated with the token we want to equip
     * @param slotId ID of the slot that we want to equip the token into
     * @return bool The boolean indicating whether the token with the given resource can be equipped into the desired
     *  slot
    */
    function canTokenBeEquippedWithResourceIntoSlot(
        address parent,
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotId
    ) public view virtual returns (bool) {
        uint64 equippableGroupId = _equippableGroupIds[resourceId];
        uint64 equippableSlot = _validParentSlots[equippableGroupId][parent];
        if (equippableSlot == slotId) {
            (, bool found) = getActiveResources(tokenId).indexOf(resourceId);
            return found;
        }
        return false;
    }

    // --------------------- Getting Extended Resources ---------------------

    /**
     * @notice Used to get the extended resource struct of the resource associated with given `resourceId`.
     * @dev The `ExtendedResource` struct contains the following data:
     *  [
     *      id,
     *      equippableGroupId,
     *      baseAddress,
     *      metadataURI
     *  ]
     * @param resourceId ID of the resource of which we are retrieving the extended resource struct
     * @return struct The `ExtendedResource` struct associated with the resource
    */
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

    /**
     * @notice Used to retrieve the slot part IDs associated with a given resource.
     * @param resourceId ID of the resource of which we are retrieving the array of slot part IDs
     * @return uint64[] An array of slot part IDs associated with the given resource
    */
    function getSlotPartIds(uint64 resourceId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _slotPartIds[resourceId];
    }

    /**
     * @notice Used to get IDs of the fixed parts present on a given resource.
     * @param resourceId ID of the resource of which to get the active fiixed parts
     * @return uint64[] An array of active fixed parts present on resource
    */
    function getFixedPartIds(uint64 resourceId)
        public
        view
        virtual
        returns (uint64[] memory)
    {
        return _fixedPartIds[resourceId];
    }

    /**
     * @notice Used to get the Equipment object equipped into the specified slot of the desired token.
     * @dev The `Equipment` struct consists of the following data:
     *  [
     *      resourceId,
     *      childResourceId,
     *      childTokenId,
     *      childEquippableAddress
     *  ]
     * @param tokenId ID of the token for which we are retrieving the equipped object
     * @param targetBaseAddress Address of the `Base` associated with the `Slot` part of the token
     * @param slotPartId ID of the `Slot` part that we are checking for equipped objects
     * @return struct The `Equipment` struct containing data about the equipped object
    */
    function getEquipment(
        uint256 tokenId,
        address targetBaseAddress,
        uint64 slotPartId
    ) public view virtual returns (Equipment memory) {
        return _equipments[tokenId][targetBaseAddress][slotPartId];
    }

    // HOOKS

    /**
     * @notice A hook to be called before a equipping a resource to the token.
     * @dev The `IntakeEquip` struct consist of the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      resourceId,
     *      slotPartId,
     *      childResourceId
     *  ]
     * @param data The `IntakeEquip` struct containing data of the resource that is being equipped
     */
    function _beforeEquip(IntakeEquip memory data) internal virtual {}

    /**
     * @notice A hook to be called after equipping a resource to the token.
     * @dev The `IntakeEquip` struct consist of the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      resourceId,
     *      slotPartId,
     *      childResourceId
     *  ]
     * @param data The `IntakeEquip` struct containing data of the resource that was equipped
     */
    function _afterEquip(IntakeEquip memory data) internal virtual {}

    /**
     * @notice A hook to be called before unequipping a resource from the token.
     * @param tokenId ID of the token from which the resource is being unequipped
     * @param resourceId ID of the resource being unequipped
     * @param slotPartId ID of the slot from which the resource is being unequipped
     */
    function _beforeUnequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) internal virtual {}

    /**
     * @notice A hook to be called after unequipping a resource from the token.
     * @param tokenId ID of the token from which the resource was unequipped
     * @param resourceId ID of the resource that was unequipped
     * @param slotPartId ID of the slot from which the resource was unequipped
     */
    function _afterUnequip(
        uint256 tokenId,
        uint64 resourceId,
        uint64 slotPartId
    ) internal virtual {}
}
