// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

/*
 * RMRK Equippables accessory contract, responsible for state storage and management of equippable items.
 */

pragma solidity ^0.8.16;

import "../base/IRMRKBaseStorage.sol";
import "../multiresource/AbstractMultiResource.sol";
import "../nesting/IRMRKNesting.sol";
import "../library/RMRKLib.sol";
import "../security/ReentrancyGuard.sol";
import "./IRMRKNestingExternalEquip.sol";
import "./IRMRKExternalEquip.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title RMRKExternalEquip
 * @author RMRK team
 * @notice Smart contract of the RMRK External Equippable module.
 * @dev This smart contract is expected to be paired with an instance of `RMRKNestingExternalEquip`.
 */
contract RMRKExternalEquip is
    ReentrancyGuard,
    AbstractMultiResource,
    IRMRKExternalEquip
{
    using RMRKLib for uint64[];

    // ------------------- RESOURCES --------------

    /**
     * @notice Mapping of a token ID to approver address to address approved for resources.
     * @dev It is important to track the address that has given the approval, so that the approvals are properly
     *  invalidated when nesting children.
     * @dev WARNING: If a child NFT returns to a previous root owner, old permissions are reinstated.
     */
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForResources;

    // ------------------- Equippable --------------

    address private _nestingAddress;

    /// Mapping of uint64 resource ID to corresponding base address.
    mapping(uint64 => address) private _baseAddresses;
    /// Mapping of uint64 ID to resource object.
    mapping(uint64 => uint64) private _equippableGroupIds;

    /// Mapping of resourceId to fixed base parts applicable to this resource.
    mapping(uint64 => uint64[]) private _fixedPartIds;
    /// Mapping of resourceId to slot base parts applicable to this resource.
    mapping(uint64 => uint64[]) private _slotPartIds;

    /// Mapping of token ID to base address to slot part Id to equipped information. Used to compose an NFT.
    mapping(uint256 => mapping(address => mapping(uint64 => Equipment)))
        private _equipments;

    /// Mapping of token ID to child (nesting) address to child Id to count of equips. Used to check if equipped.
    mapping(uint256 => mapping(address => mapping(uint256 => uint8)))
        private _equipCountPerChild;

    /// Mapping of equippableGroupId to parent contract address and valid slotId.
    mapping(uint64 => mapping(address => uint64)) private _validParentSlots;

    /**
     * @notice Used to verify that the caller is either approved to manage the given token or its owner.
     * @dev If the caller is not the owner of the token or approved to manage it, the execution will be reverted.
     * @param tokenId ID of the token that we are checking
     */
    function _onlyApprovedOrOwner(uint256 tokenId) internal view {
        if (
            !IRMRKNestingExternalEquip(_nestingAddress).isApprovedOrOwner(
                _msgSender(),
                tokenId
            )
        ) revert ERC721NotApprovedOrOwner();
    }

    /**
     * @notice Used to verify that the caller is either approved to manage the given token or its owner.
     * @param tokenId ID of the token that we are checking
     */
    modifier onlyApprovedOrOwner(uint256 tokenId) {
        _onlyApprovedOrOwner(tokenId);
        _;
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
     * @notice Used to verify that the caller is ether the owner of the token or approved to manage it.
     * @dev If the caller is not the owner of the token or approved to manage it, the execution is reverted.
     * @param tokenId ID of the token we are checking
     */
    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    /**
     * @notice Used to verify that the caller is ether the owner of the token or approved to manage it.
     * @param tokenId ID of the token we are checking
     */
    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    constructor(address nestingAddress) {
        _setNestingAddress(nestingAddress);
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return (interfaceId == type(IRMRKExternalEquip).interfaceId ||
            interfaceId == type(IRMRKEquippable).interfaceId ||
            interfaceId == type(IRMRKMultiResource).interfaceId ||
            interfaceId == type(IERC165).interfaceId);
    }

    /**
     * @notice Used to set the address of the `Nesting` smart contract
     * @param nestingAddress Address of the `Nesting` smart contract
     */
    function _setNestingAddress(address nestingAddress) internal {
        address oldAddress = _nestingAddress;
        _nestingAddress = nestingAddress;
        emit NestingAddressSet(oldAddress, nestingAddress);
    }

    /**
     * @notice Used to retrieve the address of the `Nesting` smart contract
     * @return address Address of the `Nesting` smart contract
     */
    function getNestingAddress() public view returns (address) {
        return _nestingAddress;
    }

    // ------------------------------- RESOURCES ------------------------------

    // --------------------------- HANDLING RESOURCES -------------------------

    /**
     * @notice Used to accept a pending resource of a given token.
     * @dev Accepting is done using the index of a pending resource. The array of pending resources is modified every
     *  time one is accepted and the last pending resource is moved into its place.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage the tokens's
     *  resources.
     * @param tokenId ID of the token for which we are accepting the resource
     * @param index Index of the resource to accept in token's pending arry
     */
    function acceptResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) public virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _acceptResource(tokenId, index, resourceId);
    }

    /**
     * @notice Used to reject a pending resource of a given token.
     * @dev Rejecting is done using the index of a pending resource. The array of pending resources is modified every
     *  time one is rejected and the last pending resource is moved into its place.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage the tokens's
     *  resources.
     * @param tokenId ID of the token for which we are rejecting the resource
     * @param index Index of the resource to reject in token's pending array
     */
    function rejectResource(
        uint256 tokenId,
        uint256 index,
        uint64 resourceId
    ) public virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectResource(tokenId, index, resourceId);
    }

    /**
     * @notice Used to reject all pending resources of a given token.
     * @dev When rejecting all resources, the pending array is indiscriminately cleared.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage the tokens's
     *  resources.
     * @param tokenId ID of the token for which we are clearing the pending array
     */
    function rejectAllResources(uint256 tokenId, uint256 maxRejections)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId, maxRejections);
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

    // ----------------------- APPROVALS FOR RESOURCES ------------------------

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

        // We want to bypass the check if the caller is the linked nesting contract and it's simply removing approvals
        bool isNestingCallToRemoveApprovals = (_msgSender() ==
            _nestingAddress &&
            to == address(0));

        if (
            !isNestingCallToRemoveApprovals &&
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

    // ------------------------------- EQUIPPING ------------------------------

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

        IRMRKNesting.Child memory child = IRMRKNesting(_nestingAddress).childOf(
            data.tokenId,
            data.childIndex
        );
        address childEquippable = IRMRKNestingExternalEquip(
            child.contractAddress
        ).getEquippableAddress();

        // Check from child perspective intention to be used in part
        if (
            !IRMRKEquippable(childEquippable)
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
                childEquippable
            )
        ) revert RMRKEquippableEquipNotAllowedByBase();

        Equipment memory newEquip = Equipment({
            resourceId: data.resourceId,
            childResourceId: data.childResourceId,
            childId: child.tokenId,
            childEquippableAddress: childEquippable
        });

        _beforeEquip(data);
        _equipments[data.tokenId][baseAddress][slotPartId] = newEquip;
        _equipCountPerChild[data.tokenId][child.contractAddress][
            child.tokenId
        ] += 1;

        emit ChildResourceEquipped(
            data.tokenId,
            data.resourceId,
            slotPartId,
            child.tokenId,
            childEquippable,
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

        _beforeUnequip(tokenId, resourceId, slotPartId);
        delete _equipments[tokenId][targetBaseAddress][slotPartId];
        address childNestingAddress = IRMRKExternalEquip(
            equipment.childEquippableAddress
        ).getNestingAddress();
        _equipCountPerChild[tokenId][childNestingAddress][
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
        _afterUnequip(tokenId, resourceId, slotPartId);
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
    ) public view returns (bool) {
        return _equipCountPerChild[tokenId][childAddress][childId] != uint8(0);
    }

    // --------------------- VALIDATION ---------------------

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
    ) internal {
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
    ) public view returns (bool) {
        uint64 equippableGroupId = _equippableGroupIds[resourceId];
        uint64 equippableSlot = _validParentSlots[equippableGroupId][parent];
        if (equippableSlot == slotId) {
            (, bool found) = getActiveResources(tokenId).indexOf(resourceId);
            return found;
        }
        return false;
    }

    ////////////////////////////////////////
    //       MANAGING EXTENDED RESOURCES
    ////////////////////////////////////////

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
    ) internal {
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
    ) public view returns (Equipment memory) {
        return _equipments[tokenId][targetBaseAddress][slotPartId];
    }

    /**
     * @notice Used to  verify that the given token has been minted.
     * @dev As this function utilizes the `_exists()` function, the token is marked as non-existent when it is owned by
     *  the `0x0` address.Reverts if the `tokenId` has not been minted yet.
     * @dev If the token with the specified ID doesn't "exist", the execution of the function is reverted.
     * @param tokenId ID of the token we are checking
     */
    function _requireMinted(uint256 tokenId) internal view virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();
    }

    /**
     * @notice Used to validate that the given token exists.
     * @dev As the check validates that the owner is not the `0x0` address, the token is marked as non-existent if it
     *  hasn't been minted yet, or if has already been burned.
     * @param tokenId ID of the token we are checking
     * @return bool A boolean value specifying whether the token exists
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @notice Used to retrieve the owner of the given token.
     * @dev This returns the root owner of the token. In case where the token is nested into a parent token, the owner
     *  is iteratively searched for, until non-smart contract owner is found.
     * @param tokenId ID of the token we are checking
     * @return address Address of the root owner of the token
     */
    function ownerOf(uint256 tokenId) internal view returns (address) {
        return IRMRKNesting(_nestingAddress).ownerOf(tokenId);
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
