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

    /// Mapping of resourceId to fixed base parts applicable to this resource.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    /// Mapping of resourceId to slot base parts applicable to this resource.
    mapping(uint64 => uint64[]) private _slotPartIds;

    /// Mapping of token ID to base address to slot part ID to equipment information. Used to compose an NFT.
    mapping(uint256 => mapping(address => mapping(uint64 => Equipment)))
        private _equipments;

    /// Mapping of token ID to child (nesting) address to child ID to count of equipped items. Used to check if equipped.
    mapping(uint256 => mapping(address => mapping(uint256 => uint8)))
        private _equipCountPerChild;

    /// Mapping of `equippableGroupId` to parent contract address and valid `slotId`.
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved to manage the token's resources
     *  of the owner.
     * @param tokenId ID of the token that we are checking
     */
    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    /**
     * @notice Used to ensure that the caller is either the owner of the given token or approved to manage the token's resources
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
     * @notice Accepts a resource at from the pending array of given token.
     * @dev Migrates the resource from the token's pending resource array to the token's active resource array.
     * @dev Active resources cannot be removed by anyone, but can be replaced by a new resource.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending resource array.
     * @dev Emits an {ResourceAccepted} event.
     * @param tokenId ID of the token for which to accept the pending resource
     * @param index Index of the resource in the pending array to accept
     */
    function acceptResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) public virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _acceptResource(tokenId, index, resourceId);
    }

    /**
     * @notice Rejects a resource from the pending array of given token.
     * @dev Removes the resource from the token's pending resource array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - `index` must be in range of the length of the pending resource array.
     * @dev Emits a {ResourceRejected} event.
     * @param tokenId ID of the token that the resource is being rejected from
     * @param index Index of the resource in the pending array to be rejected
     */
    function rejectResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) public virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectResource(tokenId, index, resourceId);
    }

    /**
     * @notice Rejects all resources from the pending array of a given token.
     * @dev Effecitvely deletes the pending array.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     * @dev Emits a {ResourceRejected} event with resourceId = 0.
     * @param tokenId ID of the token of which to clear the pending array
     */
    function rejectAllResources(uint256 tokenId, uint256 maxRejections)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId, maxRejections);
    }

    /**
     * @notice Sets a new priority array for a given token.
     * @dev The priority array is a non-sequential list of `uint16`s, where the lowest value is considered highest
     *  priority.
     * @dev Value `0` of a priority is a special case equivalent to unitialized.
     * @dev Requirements:
     *
     *  - The caller must own the token or be approved to manage the token's resources
     *  - `tokenId` must exist.
     *  - The length of `priorities` must be equal the length of the active resources array.
     * @dev Emits a {ResourcePrioritySet} event.
     * @param tokenId ID of the token to set the priorities for
     * @param priorities An array of priority values
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
     * @param fixedPartIds An array of IDs of fixed parts to be included in the resource
     * @param slotPartIds An array of IDs of slot parts to be included in the resource
     */
    function _addResourceEntry(
        uint64 id,
        uint64 equippableGroupId,
        address baseAddress,
        string memory metadataURI,
        uint64[] memory fixedPartIds,
        uint64[] memory slotPartIds
    ) internal virtual {
        _addResourceEntry(id, metadataURI);

        if (
            baseAddress == address(0) &&
            (fixedPartIds.length != 0 || slotPartIds.length != 0)
        ) revert RMRKBaseRequiredForParts();

        _baseAddresses[id] = baseAddress;
        _equippableGroupIds[id] = equippableGroupId;
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
     *   3. Is granted approval for the specific tokenId for resource management via the `approveForResources` function.
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
     * @notice Internal function for granting approvals for a specific token.
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
     * @param tokenId ID of the token we are clearing the approvals of
     */
    function _cleanApprovals(uint256 tokenId) internal virtual override {
        _approveForResources(address(0), tokenId);
    }

    // ------------------------------- EQUIPPING ------------------------------

    /**
     * @notice Used to unnest a given child.
     * @dev The function doesn't contain a check validating that `to` is not a contract. To ensure that a token is not
     *  transferred to an incompatible smart contract, custom validation has to be added when using this function.
     * @param tokenId ID of the parent token from which the child token is being unnested
     * @param to Externally owned address to which to transfer the unnested token to
     * @param childIndex Index of a token we are unnesting, in the array it belongs to (can be either active array or
     *  pending array)
     * @param childAddress Address of the child token's collection smart contract
     * @param childId ID of the child token being unnested in its own collection smart contract
     * @param isPending A boolean value indicating whether the child token being unnested is in the pending array of the
     *  parent token (`true`) or in the active array (`false`)
     */
    function _unnestChild(
        uint256 tokenId,
        address to,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual override {
        if (!isPending) {
            if (isChildEquipped(tokenId, childAddress, childId))
                revert RMRKMustUnequipFirst();
        }
        super._unnestChild(
            tokenId,
            to,
            childIndex,
            childAddress,
            childId,
            isPending
        );
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
     * @dev If the `Slot` already has an item equipped, the execution will be reverted.
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
        address baseAddress = _baseAddresses[data.resourceId];
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
            childId: child.tokenId,
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
     * @notice Private function to check if a given resource accepts a given slot or not.
     * @dev Execution will be reverted if the `Slot` does not apply for the resource.
     * @param resourceId ID of the resource
     * @param slotPartId ID of the `Slot`
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
            equipment.childId
        ] -= 1;

        emit ChildResourceUnequipped(
            tokenId,
            resourceId,
            slotPartId,
            equipment.childId,
            equipment.childEquippableAddress,
            equipment.childResourceId
        );
    }

    /**
     * @notice Used unequip the current child from a slot and equip a new one child into the same slot.
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
     * @notice Used to check whether the token has a given child equipped.
     * @dev This is used to prevent from unnesting a child that is equipped.
     * @param tokenId ID of the parent token for which we are querying for
     * @param childAddress Address of the child token's smart contract
     * @param childId ID of the child token
     * @return bool The boolean value indicating whether the child token is equipped into the given token or not
     */
    function isChildEquipped(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) public view virtual returns (bool) {
        return _equipCountPerChild[tokenId][childAddress][childId] != uint8(0);
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
     * @param resourceId ID of the resource of which we are retrieving
     */
    function getExtendedResource(uint256 tokenId, uint64 resourceId)
        public
        view
        virtual
        returns (
            string memory metadataURI,
            uint64 equippableGroupId,
            address baseAddress,
            uint64[] memory fixedPartIds,
            uint64[] memory slotPartIds
        )
    {
        metadataURI = getResourceMetadata(tokenId, resourceId);
        equippableGroupId = _equippableGroupIds[resourceId];
        baseAddress = _baseAddresses[resourceId];
        fixedPartIds = _fixedPartIds[resourceId];
        slotPartIds = _slotPartIds[resourceId];
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    /**
     * @notice Used to get the Equipment object equipped into the specified slot of the desired token.
     * @dev The `Equipment` struct consists of the following data:
     *  [
     *      resourceId,
     *      childResourceId,
     *      childId,
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
