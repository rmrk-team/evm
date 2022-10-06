// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./RMRKNestingMultiResource.sol";
import "./interfaces/IRMRKEquippableAyuilosVer.sol";

error RMRKMismatchedEquipmentAndIDLength();
error RMRKNotInActiveResources();

contract RMRKEquippableAyuilosVer is
    RMRKNestingMultiResource,
    IRMRKEquippableAyuilosVer
{
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];

    mapping(uint64 => BaseRelatedResource) private _baseRelatedResources;

    uint64[] internal _allBaseRelatedResourceIds;

    // tokenId => baseRelatedResourceId => partId => SlotEquipment
    mapping(uint256 => mapping(uint64 => mapping(uint64 => SlotEquipment)))
        internal _slotEquipments;

    // records which slots are in the equipped state
    mapping(uint256 => mapping(uint64 => uint64[])) internal _equippedSlots;

    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResource(name, symbol)
    {}

    function _addBaseRelatedResourceEntry(
        BaseRelatedResource calldata baseRelatedResource,
        string calldata metadataURI,
        uint128[] calldata custom
    ) internal {
        uint64 id = baseRelatedResource.id;

        _addResourceEntry(id, metadataURI, custom);

        _baseRelatedResources[id] = baseRelatedResource;
        _allBaseRelatedResourceIds.push(id);

        emit BaseRelatedResourceAdd(id);
    }

    function getBaseRelatedResource(uint64 baseRelatedResourceId)
        public
        view
        returns (BaseRelatedResource memory baseRelatedResource)
    {
        baseRelatedResource = _baseRelatedResources[baseRelatedResourceId];
    }

    function getAllBaseRelatedResourceIds()
        public
        view
        returns (uint64[] memory allBaseRelatedResourceIds)
    {
        allBaseRelatedResourceIds = _allBaseRelatedResourceIds;
    }

    function getSlotEquipments(uint256 tokenId, uint64 baseRelatedResourceId)
        public
        view
        returns (SlotEquipment[] memory slotEquipments)
    {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        uint64[] memory eS = _equippedSlots[tokenId][baseRelatedResourceId];
        uint256 len = eS.length;

        for (uint256 i; i < len; ) {
            uint64 partId = eS[i];
            slotEquipments[i] = _slotEquipments[tokenId][baseRelatedResourceId][
                partId
            ];
            unchecked {
                ++i;
            }
        }
    }

    function setSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] calldata slotPartIds,
        SlotEquipment[] calldata slotEquipments
    ) public onlyApprovedForResourcesOrOwner(tokenId) {
        _setSlotEquipment(
            tokenId,
            baseRelatedResourceId,
            slotPartIds,
            slotEquipments
        );
    }

    function _setSlotEquipment(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] calldata slotPartIds,
        SlotEquipment[] calldata slotEquipments
    ) internal virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        uint256 len = slotPartIds.length;
        if (len != slotEquipments.length) {
            revert RMRKMismatchedEquipmentAndIDLength();
        }

        uint64[] memory activeResourceIds = getActiveResources(tokenId);
        (, bool exist) = activeResourceIds.indexOf(baseRelatedResourceId);
        if (!exist) revert RMRKNotInActiveResources();

        _equippedSlots[tokenId][baseRelatedResourceId] = slotPartIds;

        for (uint128 i; i < len; ++i) {
            _slotEquipments[tokenId][baseRelatedResourceId][
                slotPartIds[i]
            ] = slotEquipments[i];
        }

        emit SlotEquipmentsSet(
            tokenId,
            baseRelatedResourceId,
            slotPartIds,
            slotEquipments
        );
    }
}
