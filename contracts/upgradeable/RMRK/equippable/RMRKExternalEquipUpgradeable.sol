// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

/*
 * RMRK Equippables accessory contract, responsible for state storage and management of equippable items.
 */

pragma solidity ^0.8.18;

import "../catalog/IRMRKCatalogUpgradeable.sol";
import "../multiasset/AbstractMultiAssetUpgradeable.sol";
import "../nestable/IERC6059Upgradeable.sol";
import "../../../RMRK/library/RMRKLib.sol";
import "../security/ReentrancyGuardUpgradeable.sol";
import "./IRMRKNestableExternalEquipUpgradeable.sol";
import "./IRMRKExternalEquipUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

/**
 * @title RMRKExternalEquipUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK External Equippable module.
 * @dev This smart contract is expected to be paired with an instance of `RMRKNestableExternalEquipUpgradeable`.
 */
contract RMRKExternalEquipUpgradeable is
    ReentrancyGuardUpgradeable,
    AbstractMultiAssetUpgradeable,
    IRMRKExternalEquipUpgradeable
{
    using RMRKLib for uint64[];

    // ------------------- ASSETS --------------

    /**
     * @notice Mapping of a token ID to approver address to address approved for assets.
     * @dev It is important to track the address that has given the approval, so that the approvals are properly
     *  invalidated when nesting children.
     * @dev WARNING: If a child NFT returns to a previous root owner, old permissions are reinstated.
     */
    mapping(uint256 => mapping(address => address))
        private _tokenApprovalsForAssets;

    // ------------------- Equippable --------------

    address private _nestableAddress;

    /// Mapping of uint64 asset ID to corresponding catalog address.
    mapping(uint64 => address) private _catalogAddresses;
    /// Mapping of uint64 ID to asset object.
    mapping(uint64 => uint64) private _equippableGroupIds;

    /// Mapping of assetId to catalog parts applicable to this asset, both fixed and slot
    mapping(uint64 => uint64[]) private _partIds;

    /// Mapping of token ID to catalog address to slot part Id to equipped information. Used to compose an NFT.
    mapping(uint256 => mapping(address => mapping(uint64 => Equipment)))
        private _equipments;

    /// Mapping of token ID to child (nestable) address to child Id to count of equips. Used to check if equipped.
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
            !IRMRKNestableExternalEquipUpgradeable(_nestableAddress)
                .isApprovedOrOwner(_msgSender(), tokenId)
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
     *   2. Is approved for all assets of the current owner via the `setApprovalForAllForAssets` function.
     *   3. Is granted approval for the specific tokenId for asset management via the `approveForAssets` function.
     * @param user Address of the user we are checking for permission
     * @param tokenId ID of the token to query for permission for a given `user`
     * @return A boolean value indicating whether the user is approved to manage the token or not
     */
    function _isApprovedForAssetsOrOwner(
        address user,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
        return (user == owner ||
            isApprovedForAllForAssets(owner, user) ||
            getApprovedForAssets(tokenId) == user);
    }

    /**
     * @notice Used to verify that the caller is ether the owner of the token or approved to manage it.
     * @dev If the caller is not the owner of the token or approved to manage it, the execution is reverted.
     * @param tokenId ID of the token we are checking
     */
    function _onlyApprovedForAssetsOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForAssetsOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForAssetsOrOwner();
    }

    /**
     * @notice Used to verify that the caller is ether the owner of the token or approved to manage it.
     * @param tokenId ID of the token we are checking
     */
    modifier onlyApprovedForAssetsOrOwner(uint256 tokenId) {
        _onlyApprovedForAssetsOrOwner(tokenId);
        _;
    }

    function __RMRKExternalEquipUpgradeable_init(
        address nestableAddress
    ) internal onlyInitializing {
        __RMRKExternalEquipUpgradeable_init_unchained(nestableAddress);
        __AbstractMultiAssetUpgradeable_init();
    }

    /**
     * @notice Used to initialize the smart contract.
     * @param nestableAddress Address of the Nestable module of external equip composite
     */
    function __RMRKExternalEquipUpgradeable_init_unchained(
        address nestableAddress
    ) internal onlyInitializing {
        _setNestableAddress(nestableAddress);
    }

    /**
     * @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return (interfaceId ==
            type(IRMRKExternalEquipUpgradeable).interfaceId ||
            interfaceId == type(IERC6220Upgradeable).interfaceId ||
            interfaceId == type(IERC5773Upgradeable).interfaceId ||
            interfaceId == type(IERC165Upgradeable).interfaceId);
    }

    /**
     * @notice Used to set the address of the `Nestable` smart contract
     * @param nestableAddress Address of the `Nestable` smart contract
     */
    function _setNestableAddress(address nestableAddress) internal {
        address oldAddress = _nestableAddress;
        _nestableAddress = nestableAddress;
        emit NestableAddressSet(oldAddress, nestableAddress);
    }

    /**
     * @inheritdoc IRMRKExternalEquipUpgradeable
     */
    function getNestableAddress() public view returns (address) {
        return _nestableAddress;
    }

    // ------------------------------- ASSETS ------------------------------

    // --------------------------- HANDLING ASSETS -------------------------

    /**
     * @notice Used to accept a pending asset of a given token.
     * @dev Accepting is done using the index of a pending asset. The array of pending assets is modified every
     *  time one is accepted and the last pending asset is moved into its place.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage the tokens's
     *  assets.
     * @param tokenId ID of the token for which we are accepting the asset
     * @param index Index of the asset to accept in token's pending array
     * @param assetId ID of the asset expected to be located at the specified index
     */
    function acceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _acceptAsset(tokenId, index, assetId);
    }

    /**
     * @notice Used to reject a pending asset of a given token.
     * @dev Rejecting is done using the index of a pending asset. The array of pending assets is modified every
     *  time one is rejected and the last pending asset is moved into its place.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage the tokens's
     *  assets.
     * @param tokenId ID of the token for which we are rejecting the asset
     * @param index Index of the asset to reject in token's pending array
     * @param assetId ID of the asset expected to be located at the specified index
     */
    function rejectAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _rejectAsset(tokenId, index, assetId);
    }

    /**
     * @notice Used to reject all pending assets of a given token.
     * @dev When rejecting all assets, the pending array is indiscriminately cleared.
     * @dev Can only be called by the owner of the token or a user that has been approved to manage the tokens's
     *  assets.
     * @dev If the number of pending assets is greater than the value of `maxRejections`, the exectuion will be
     *  reverted.
     * @param tokenId ID of the token for which we are clearing the pending array.
     * @param maxRejections Maximum number of expected assets to reject, used to prevent from rejecting assets which
     *  arrive just before this operation.
     */
    function rejectAllAssets(
        uint256 tokenId,
        uint256 maxRejections
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _rejectAllAssets(tokenId, maxRejections);
    }

    /**
     * @notice Used to set priorities of active assets of a token.
     * @dev Priorities define which asset we would rather have shown when displaying the token.
     * @dev The pending assets array length has to match the number of active assets, otherwise setting priorities
     *  will be reverted.
     * @param tokenId ID of the token we are managing the priorities of
     * @param priorities An array of priorities of active assets. The succesion of items in the priorities array
     *  matches that of the succesion of items in the active array
     */
    function setPriority(
        uint256 tokenId,
        uint64[] calldata priorities
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _setPriority(tokenId, priorities);
    }

    // ----------------------- APPROVALS FOR ASSETS ------------------------

    /**
     * @notice Used to grant approvals for specific tokens to a specified address.
     * @dev This can only be called by the owner of the token or by an account that has been granted permission to
     *  manage all of the owner's assets.
     * @param to Address of the account to receive the approval to the specified token
     * @param tokenId ID of the token for which we are granting the permission
     */
    function approveForAssets(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForAssetsToCurrentOwner();

        // We want to bypass the check if the caller is the linked nestable contract and it's simply removing approvals
        bool isNestableCallToRemoveApprovals = (_msgSender() ==
            _nestableAddress &&
            to == address(0));

        if (
            !isNestableCallToRemoveApprovals &&
            _msgSender() != owner &&
            !isApprovedForAllForAssets(owner, _msgSender())
        ) revert RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll();
        _approveForAssets(to, tokenId);
    }

    /**
     * @notice Used to get the address of the user that is approved to manage the specified token from the current
     *  owner.
     * @param tokenId ID of the token we are checking
     * @return Address of the account that is approved to manage the token
     */
    function getApprovedForAssets(
        uint256 tokenId
    ) public view virtual returns (address) {
        _requireMinted(tokenId);
        return _tokenApprovalsForAssets[tokenId][ownerOf(tokenId)];
    }

    /**
     * @notice Internal function for granting approvals for a specific token.
     * @dev Emits ***ApprovalForAssets*** event.
     * @param to Address of the account we are granting an approval to
     * @param tokenId ID of the token we are granting the approval for
     */
    function _approveForAssets(address to, uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        _tokenApprovalsForAssets[tokenId][owner] = to;
        emit ApprovalForAssets(owner, to, tokenId);
    }

    // ------------------------------- EQUIPPING ------------------------------

    /**
     * @inheritdoc IERC6220Upgradeable
     */
    function equip(
        IntakeEquip memory data
    ) public virtual onlyApprovedOrOwner(data.tokenId) nonReentrant {
        _equip(data);
    }

    /**
     * @notice Private function used to equip a child into a token.
     * @dev If the `Slot` already has an item equipped, the execution will be reverted.
     * @dev If the child can't be used in the given `Slot`, the execution will be reverted.
     * @dev If the catalog doesn't allow this equip to happen, the execution will be reverted.
     * @dev The `IntakeEquip` stuct contains the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      assetId,
     *      slotPartId,
     *      childAssetId
     *  ]
     * @dev Emits ***ChildAssetEquipped*** event.
     * @param data An `IntakeEquip` struct specifying the equip data
     */
    function _equip(IntakeEquip memory data) internal virtual {
        address catalogAddress = _catalogAddresses[data.assetId];
        uint64 slotPartId = data.slotPartId;
        if (
            _equipments[data.tokenId][catalogAddress][slotPartId]
                .childEquippableAddress != address(0)
        ) revert RMRKSlotAlreadyUsed();

        // Check from parent's asset perspective:
        _checkAssetAcceptsSlot(data.assetId, slotPartId);

        IERC6059Upgradeable.Child memory child = IERC6059Upgradeable(
            _nestableAddress
        ).childOf(data.tokenId, data.childIndex);
        address childEquippable = IRMRKNestableExternalEquipUpgradeable(
            child.contractAddress
        ).getEquippableAddress();

        // Check from child perspective intention to be used in part
        if (
            !IERC6220Upgradeable(childEquippable)
                .canTokenBeEquippedWithAssetIntoSlot(
                    address(this),
                    child.tokenId,
                    data.childAssetId,
                    slotPartId
                )
        ) revert RMRKTokenCannotBeEquippedWithAssetIntoSlot();

        // Check from catalog perspective
        if (
            !IRMRKCatalogUpgradeable(catalogAddress).checkIsEquippable(
                slotPartId,
                childEquippable
            )
        ) revert RMRKEquippableEquipNotAllowedByCatalog();

        Equipment memory newEquip = Equipment({
            assetId: data.assetId,
            childAssetId: data.childAssetId,
            childId: child.tokenId,
            childEquippableAddress: childEquippable
        });

        _beforeEquip(data);
        _equipments[data.tokenId][catalogAddress][slotPartId] = newEquip;
        _equipCountPerChild[data.tokenId][child.contractAddress][
            child.tokenId
        ] += 1;

        emit ChildAssetEquipped(
            data.tokenId,
            data.assetId,
            slotPartId,
            child.tokenId,
            childEquippable,
            data.childAssetId
        );
        _afterEquip(data);
    }

    /**
     * @notice Private function to check if a given asset accepts a given slot or not.
     * @dev Execution will be reverted if the `Slot` does not apply for the asset.
     * @param assetId ID of the asset
     * @param slotPartId ID of the `Slot`
     */
    function _checkAssetAcceptsSlot(
        uint64 assetId,
        uint64 slotPartId
    ) private view {
        (, bool found) = _partIds[assetId].indexOf(slotPartId);
        if (!found) revert RMRKTargetAssetCannotReceiveSlot();
    }

    /**
     * @inheritdoc IERC6220Upgradeable
     */
    function unequip(
        uint256 tokenId,
        uint64 assetId,
        uint64 slotPartId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _unequip(tokenId, assetId, slotPartId);
    }

    /**
     * @notice Private function used to unequip child from parent token.
     * @dev Emits ***ChildAssetUnequipped*** event.
     * @param tokenId ID of the parent from which the child is being unequipped
     * @param assetId ID of the parent's asset that contains the `Slot` into which the child is equipped
     * @param slotPartId ID of the `Slot` from which to unequip the child
     */
    function _unequip(
        uint256 tokenId,
        uint64 assetId,
        uint64 slotPartId
    ) internal virtual {
        address targetCatalogAddress = _catalogAddresses[assetId];
        Equipment memory equipment = _equipments[tokenId][targetCatalogAddress][
            slotPartId
        ];
        if (equipment.childEquippableAddress == address(0))
            revert RMRKNotEquipped();

        _beforeUnequip(tokenId, assetId, slotPartId);
        delete _equipments[tokenId][targetCatalogAddress][slotPartId];
        address childNestableAddress = IRMRKExternalEquipUpgradeable(
            equipment.childEquippableAddress
        ).getNestableAddress();
        _equipCountPerChild[tokenId][childNestableAddress][
            equipment.childId
        ] -= 1;

        emit ChildAssetUnequipped(
            tokenId,
            assetId,
            slotPartId,
            equipment.childId,
            equipment.childEquippableAddress,
            equipment.childAssetId
        );
        _afterUnequip(tokenId, assetId, slotPartId);
    }

    /**
     * @notice Used to check whether the token has a given child equipped.
     * @dev This is used to prevent from transferring a child that is equipped.
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
     * @notice Internal function used to declare that the assets belonging to a given `equippableGroupId` are
     *  equippable into the `Slot` associated with the `partId` of the collection at the specified `parentAddress`.
     * @dev Emit ***ValidParentEquippableGroupIdSet*** event.
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
     * @inheritdoc IERC6220Upgradeable
     */
    function canTokenBeEquippedWithAssetIntoSlot(
        address parent,
        uint256 tokenId,
        uint64 assetId,
        uint64 slotId
    ) public view returns (bool) {
        uint64 equippableGroupId = _equippableGroupIds[assetId];
        uint64 equippableSlot = _validParentSlots[equippableGroupId][parent];
        if (equippableSlot == slotId) {
            (, bool found) = getActiveAssets(tokenId).indexOf(assetId);
            return found;
        }
        return false;
    }

    ////////////////////////////////////////
    //       MANAGING EXTENDED ASSETS
    ////////////////////////////////////////

    /**
     * @notice Used to add a asset entry.
     * @dev This internal function warrants custom access control to be implemented when used.
     * @param id ID to be assigned to asset
     * @param equippableGroupId ID of the equippable group this asset belongs to
     * @param catalogAddress Address of the Catalog this asset should be associated with
     * @param metadataURI Metadata URI of the asset
     * @param partIds An array of IDs of fixed and slot parts to be included in the asset
     */
    function _addAssetEntry(
        uint64 id,
        uint64 equippableGroupId,
        address catalogAddress,
        string memory metadataURI,
        uint64[] memory partIds
    ) internal {
        _addAssetEntry(id, metadataURI);

        if (catalogAddress == address(0) && partIds.length != 0)
            revert RMRKCatalogRequiredForParts();

        _catalogAddresses[id] = catalogAddress;
        _equippableGroupIds[id] = equippableGroupId;
        _partIds[id] = partIds;
    }

    /**
     * @inheritdoc IERC6220Upgradeable
     */
    function getAssetAndEquippableData(
        uint256 tokenId,
        uint64 assetId
    )
        public
        view
        virtual
        returns (string memory, uint64, address, uint64[] memory)
    {
        return (
            getAssetMetadata(tokenId, assetId),
            _equippableGroupIds[assetId],
            _catalogAddresses[assetId],
            _partIds[assetId]
        );
    }

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    /**
     * @inheritdoc IERC6220Upgradeable
     */
    function getEquipment(
        uint256 tokenId,
        address targetCatalogAddress,
        uint64 slotPartId
    ) public view returns (Equipment memory) {
        return _equipments[tokenId][targetCatalogAddress][slotPartId];
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
     * @return A boolean value specifying whether the token exists
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @notice Used to retrieve the owner of the given token.
     * @dev This returns the root owner of the token. In case where the token is nested into a parent token, the owner
     *  is iteratively searched for, until non-smart contract owner is found.
     * @param tokenId ID of the token we are checking
     * @return Address of the root owner of the token
     */
    function ownerOf(uint256 tokenId) internal view returns (address) {
        return IERC6059Upgradeable(_nestableAddress).ownerOf(tokenId);
    }

    // HOOKS

    /**
     * @notice A hook to be called before a equipping a asset to the token.
     * @dev The `IntakeEquip` struct consist of the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      assetId,
     *      slotPartId,
     *      childAssetId
     *  ]
     * @param data The `IntakeEquip` struct containing data of the asset that is being equipped
     */
    function _beforeEquip(IntakeEquip memory data) internal virtual {}

    /**
     * @notice A hook to be called after equipping a asset to the token.
     * @dev The `IntakeEquip` struct consist of the following data:
     *  [
     *      tokenId,
     *      childIndex,
     *      assetId,
     *      slotPartId,
     *      childAssetId
     *  ]
     * @param data The `IntakeEquip` struct containing data of the asset that was equipped
     */
    function _afterEquip(IntakeEquip memory data) internal virtual {}

    /**
     * @notice A hook to be called before unequipping a asset from the token.
     * @param tokenId ID of the token from which the asset is being unequipped
     * @param assetId ID of the asset being unequipped
     * @param slotPartId ID of the slot from which the asset is being unequipped
     */
    function _beforeUnequip(
        uint256 tokenId,
        uint64 assetId,
        uint64 slotPartId
    ) internal virtual {}

    /**
     * @notice A hook to be called after unequipping a asset from the token.
     * @param tokenId ID of the token from which the asset was unequipped
     * @param assetId ID of the asset that was unequipped
     * @param slotPartId ID of the slot from which the asset was unequipped
     */
    function _afterUnequip(
        uint256 tokenId,
        uint64 assetId,
        uint64 slotPartId
    ) internal virtual {}

    uint256[50] private __gap;
}
