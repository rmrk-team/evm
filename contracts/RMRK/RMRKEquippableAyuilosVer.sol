// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./RMRKNestingMultiResource.sol";
import "./interfaces/IRMRKEquippableAyuilosVer.sol";

error RMRKNotParent();
error RMRKIsNotEquipped();
error RMRKUnequipFirst();
error RMRKMismatchedEquipmentAndIDLength();

contract RMRKEquippableAyuilosVer is
    RMRKNestingMultiResource,
    IRMRKEquippableAyuilosVer
{
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
    /**
        @dev as a Child role
        tokenId => isEquipped specify if current token is equipped by its parent
     */
    mapping(uint256 => bool) private _equipStatus;

    mapping(uint64 => BaseRelatedResource) private _baseRelatedResources;

    uint64[] internal _allBaseRelatedResourceIds;

    mapping(uint256 => uint64[])
        internal _baseRelatedResourceIdsInvolvedInEquipment;

    /**
        @dev as a Parent role
        SEId => SE
        tokenId => SEId[]
        Have to do this because of Solidity limit
     */
    mapping(uint128 => SlotEquipment) internal _slotEquipments;
    mapping(uint256 => uint128[]) internal _slotEquipmentIds;

    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResource(name, symbol)
    {}

    function _equip(uint256 tokenId) internal virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        (, , bool isNft) = rmrkOwnerOf(tokenId);

        if (isNft) {
            _equipStatus[tokenId] = true;
            emit Equip(tokenId);
        } else {
            revert RMRKNotParent();
        }
    }

    function _unequip(uint256 tokenId) internal virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();
        if (!_equipStatus[tokenId]) {
            revert RMRKIsNotEquipped();
        }

        _equipStatus[tokenId] = false;
        emit Unequip(tokenId);
    }

    function equip(uint256 tokenId)
        public
        virtual
        onlyApprovedOrOwner(tokenId)
    {
        _equip(tokenId);
    }

    function unequip(uint256 tokenId)
        public
        virtual
        onlyApprovedOrOwner(tokenId)
    {
        _unequip(tokenId);
    }

    function getEquipStatus(uint256 tokenId) public view returns (bool status) {
        status = _equipStatus[tokenId];
    }

    function batchGetEquipStatus(uint256[] calldata tokenIds)
        public
        view
        returns (bool[] memory)
    {
        uint256 len = tokenIds.length;
        bool[] memory statusArr = new bool[](len);

        for (uint256 i; i < len; ) {
            uint256 tokenId = tokenIds[i];
            bool status = getEquipStatus(tokenId);
            statusArr[i] = status;
            unchecked {
                ++i;
            }
        }

        return statusArr;
    }

    function _addBaseRelatedResourceEntry(
        BaseRelatedResource calldata baseRelatedResource,
        string calldata metadataURI,
        uint128[] calldata custom
    ) internal {
        uint64 id = baseRelatedResource.id;

        _addResourceEntry(id, metadataURI, custom);

        _baseRelatedResources[id] = baseRelatedResource;
        _allBaseRelatedResourceIds.push(id);

        emit BaseRelatedResourceSet(id);
    }

    function getAllBaseRelatedResourceIds()
        public
        view
        returns (uint64[] memory allBaseRelatedResourceIds)
    {
        allBaseRelatedResourceIds = _allBaseRelatedResourceIds;
    }

    function getBaseRelatedResourceIdsInvolvedInEquipment(uint256 tokenId)
        public
        view
        returns (uint64[] memory baseRelatedResourceIds)
    {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        baseRelatedResourceIds = _baseRelatedResourceIdsInvolvedInEquipment[
            tokenId
        ];
    }

    function getSlotEquipments(uint256 tokenId)
        public
        view
        returns (SlotEquipment[] memory slotEquipments)
    {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        uint128[] memory SEIds = _slotEquipmentIds[tokenId];
        uint256 len = SEIds.length;

        for (uint256 i; i < len; ) {
            uint128 SEId = SEIds[i];
            slotEquipments[i] = _slotEquipments[SEId];
            unchecked {
                ++i;
            }
        }
    }

    function setBaseRelatedResourceIdsInvolvedInEquipment(
        uint256 tokenId,
        uint64[] calldata baseRelatedResourceIds
    ) public onlyApprovedForResourcesOrOwner(tokenId) {
        _setBaseRelatedResourceIdsInvolvedInEquipment(
            tokenId,
            baseRelatedResourceIds
        );
    }

    function addSlotEquipments(
        uint256 tokenId,
        uint128[] calldata slotEquipmentIds,
        SlotEquipment[] calldata slotEquipments
    ) public onlyApprovedForResourcesOrOwner(tokenId) {
        _addSlotEquipments(tokenId, slotEquipmentIds, slotEquipments);
    }

    function removeSlotEquipments(uint256 tokenId, uint128[] calldata indexes)
        public
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _removeSlotEquipments(tokenId, indexes);
    }

    function _setBaseRelatedResourceIdsInvolvedInEquipment(
        uint256 tokenId,
        uint64[] calldata baseRelatedResourceIds
    ) internal virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        _baseRelatedResourceIdsInvolvedInEquipment[
            tokenId
        ] = baseRelatedResourceIds;
        emit BaseRelatedResourceIdsInvolvedInEquipmentSet(
            tokenId,
            baseRelatedResourceIds
        );
    }

    function _addSlotEquipments(
        uint256 tokenId,
        uint128[] calldata slotEquipmentIds,
        SlotEquipment[] calldata slotEquipments
    ) internal virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        uint256 len = slotEquipmentIds.length;
        if (len != slotEquipments.length) {
            revert RMRKMismatchedEquipmentAndIDLength();
        }

        for (uint256 i; i < len; ) {
            uint128 slotEquipmentId = slotEquipmentIds[i];
            _slotEquipmentIds[tokenId].push(slotEquipmentId);
            _slotEquipments[slotEquipmentId] = slotEquipments[i];
            unchecked {
                ++i;
            }
        }

        emit SlotEquipmentsAdd(tokenId, slotEquipmentIds, slotEquipments);
    }

    function _removeSlotEquipments(uint256 tokenId, uint128[] calldata indexes)
        internal
    {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();

        uint256 len = indexes.length;
        uint128[] memory SEIds = new uint128[](len);

        for (uint256 i; i < len; ) {
            uint128 index = indexes[i];
            uint128 SEId = _slotEquipmentIds[tokenId][index];

            SEIds[i] = SEId;

            delete _slotEquipments[SEId];
            _slotEquipmentIds[tokenId].removeItemByIndex(index);
            unchecked {
                ++i;
            }
        }

        emit SlotEquipmentsRemove(tokenId, SEIds);
    }

    // *******************************************

    // RMRKNesting function override

    function _transfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal override {
        if (_equipStatus[tokenId]) {
            revert RMRKUnequipFirst();
        }

        super._transfer(from, to, tokenId, destinationId);
    }

    function _unnestSelf(uint256 tokenId, uint256 indexOnParent)
        internal
        virtual
        override
    {
        if (_equipStatus[tokenId]) {
            revert RMRKUnequipFirst();
        }

        super._unnestSelf(tokenId, indexOnParent);
    }

    function _burn(uint256 tokenId) internal override {
        _unequip(tokenId);

        super._burn(tokenId);
    }

    // *******************************************
}
