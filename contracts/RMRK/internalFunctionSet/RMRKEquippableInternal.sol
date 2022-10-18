// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRMRKEquippableAyuilosVer.sol";
import "../library/ValidatorLib.sol";
import "./RMRKNestingMultiResourceInternal.sol";
import {EquippableStorage} from "./Storage.sol";

error RMRKBaseRelatedResourceDidNotExist();
error RMRKCurrentBaseInstanceAlreadyEquippedThisChild();
error RMRKIndexOverLength();
error RMRKMismatchedEquipmentAndIDLength();
error RMRKMustRemoveSlotEquipmentFirst();
error RMRKNotInActiveResources();
error RMRKNotValidBaseContract();
error RMRKSlotEquipmentNotExist();
error RMRKSlotIsOccupied();

abstract contract RMRKEquippableInternal is
    IRMRKEquippableEventsAndStruct,
    RMRKNestingMultiResourceInternal
{
    using RMRKLib for uint64[];

    function getEquippableState()
        internal
        pure
        returns (EquippableStorage.State storage)
    {
        return EquippableStorage.getState();
    }

    function _getBaseRelatedResource(uint64 baseRelatedResourceId)
        internal
        view
        returns (BaseRelatedResource memory baseRelatedResource)
    {
        BaseRelatedData memory baseRelatedData = getEquippableState()
            ._baseRelatedDatas[baseRelatedResourceId];

        _baseRelatedDataExist(baseRelatedData);

        string memory resourceMeta = _getResourceMeta(baseRelatedResourceId);

        baseRelatedResource = BaseRelatedResource({
            id: baseRelatedResourceId,
            baseAddress: baseRelatedData.baseAddress,
            targetBaseAddress: baseRelatedData.targetBaseAddress,
            targetSlotId: baseRelatedData.targetSlotId,
            partIds: baseRelatedData.partIds,
            metadataURI: resourceMeta
        });
    }

    function _getBaseRelatedResources(uint64[] calldata baseRelatedResourceIds)
        internal
        view
        returns (BaseRelatedResource[] memory)
    {
        uint256 len = baseRelatedResourceIds.length;
        BaseRelatedResource[]
            memory baseRelatedResources = new BaseRelatedResource[](len);

        for (uint256 i; i < len; i++) {
            uint64 baseRelatedResourceId = baseRelatedResourceIds[i];

            baseRelatedResources[i] = _getBaseRelatedResource(
                baseRelatedResourceId
            );
        }

        return baseRelatedResources;
    }

    function _getActiveBaseRelatedResources(uint256 tokenId)
        internal
        view
        returns (uint64[] memory)
    {
        uint64[] memory activeBaseRelatedResourceIds = getEquippableState()
            ._activeBaseResources[tokenId];

        return activeBaseRelatedResourceIds;
    }

    function _getAllBaseRelatedResourceIds()
        internal
        view
        returns (uint64[] memory allBaseRelatedResourceIds)
    {
        allBaseRelatedResourceIds = getEquippableState()
            ._allBaseRelatedResourceIds;
    }

    //
    // -------------- Equipment --------------
    //

    /**
     * @dev get slotEquipment by tokenId, baseRelatedResourceId and slotId (from parent's perspective)
     */
    function _getSlotEquipment(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64 slotId
    ) internal view returns (SlotEquipment memory slotEquipment) {
        _requireMinted(tokenId);

        EquipmentPointer storage pointer = getEquippableState()
            ._equipmentPointers[tokenId][baseRelatedResourceId][slotId];

        slotEquipment = _getSlotEquipmentByIndex(pointer.equipmentIndex);

        if (
            slotEquipment.tokenId != tokenId ||
            slotEquipment.baseRelatedResourceId != baseRelatedResourceId ||
            slotEquipment.slotId != slotId
        ) {
            revert RMRKSlotEquipmentNotExist();
        }
    }

    /**
     * @dev get slotEquipment by childContract, childTokenId and childBaseRelatedResourceId (from child's perspective)
     */
    function _getSlotEquipment(
        address childContract,
        uint256 childTokenId,
        uint64 childBaseRelatedResourceId
    ) internal view returns (SlotEquipment memory slotEquipment) {
        EquipmentPointer storage pointer = getEquippableState()
            ._childEquipmentPointers[childContract][childTokenId][
                childBaseRelatedResourceId
            ];

        slotEquipment = _getSlotEquipmentByIndex(pointer.equipmentIndex);

        if (
            slotEquipment.child.contractAddress != childContract ||
            slotEquipment.child.tokenId != childTokenId ||
            slotEquipment.childBaseRelatedResourceId !=
            childBaseRelatedResourceId
        ) {
            revert RMRKSlotEquipmentNotExist();
        }
    }

    /**
     * @dev get all about one base instance equipment status
     */
    function _getSlotEquipments(uint256 tokenId, uint64 baseRelatedResourceId)
        internal
        view
        returns (SlotEquipment[] memory)
    {
        _requireMinted(tokenId);

        uint64[] memory slotIds = getEquippableState()._equippedSlots[tokenId][
            baseRelatedResourceId
        ];
        uint256 len = slotIds.length;

        SlotEquipment[] memory slotEquipments = new SlotEquipment[](len);

        for (uint256 i; i < len; ++i) {
            slotEquipments[i] = _getSlotEquipment(
                tokenId,
                baseRelatedResourceId,
                slotIds[i]
            );
        }

        return slotEquipments;
    }

    /**
     * @dev get one token's all baseRelatedResources equipment status
     */
    function _getSlotEquipments(address childContract, uint256 childTokenId)
        internal
        view
        returns (SlotEquipment[] memory)
    {
        uint64[] memory childBaseRelatedResourceIds = getEquippableState()
            ._equippedChildBaseRelatedResources[childContract][childTokenId];
        uint256 len = childBaseRelatedResourceIds.length;

        SlotEquipment[] memory slotEquipments = new SlotEquipment[](len);

        for (uint256 i; i < len; ++i) {
            slotEquipments[i] = _getSlotEquipment(
                childContract,
                childTokenId,
                childBaseRelatedResourceIds[i]
            );
        }

        return slotEquipments;
    }

    function _getAllSlotEquipments()
        internal
        view
        returns (SlotEquipment[] memory slotEquipments)
    {
        slotEquipments = getEquippableState()._slotEquipments;
    }

    function _getSlotEquipmentByIndex(uint256 index)
        internal
        view
        returns (SlotEquipment memory slotEquipment)
    {
        if (index >= getEquippableState()._slotEquipments.length) {
            revert RMRKIndexOverLength();
        }

        slotEquipment = getEquippableState()._slotEquipments[index];
    }

    /**
        @param doMoreCheck this will cost more gas but make sure data store correctly,
        if you are sure you use the correct data you could set it to `false` to reduce
        gas cost.
     */
    function _addSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        SlotEquipment[] memory slotEquipments,
        bool doMoreCheck
    ) internal virtual {
        _requireMinted(tokenId);

        if (doMoreCheck) {
            uint64[] memory activeResourceIds = _getActiveResources(tokenId);
            (, bool exist) = activeResourceIds.indexOf(baseRelatedResourceId);
            if (!exist) revert RMRKNotInActiveResources();
        }

        uint256 len = slotEquipments.length;

        for (uint256 i; i < len; ++i) {
            SlotEquipment memory sE = slotEquipments[i];
            EquippableStorage.State storage es = getEquippableState();

            // 1. Make sure slotEquipment is valid
            // 2. Make sure slot is not occupied
            // 3. Make sure current child has no resource participating
            //    in the equipment action of current base instance before
            if (doMoreCheck) {
                {
                    address ownAddress = address(this);
                    (bool isValid, string memory reason) = LightmValidatorLib
                        .isSlotEquipmentValid(
                            ownAddress,
                            tokenId,
                            baseRelatedResourceId,
                            sE
                        );

                    if (!isValid) {
                        revert(reason);
                    }
                }

                {
                    EquipmentPointer memory pointer = es._equipmentPointers[
                        tokenId
                    ][baseRelatedResourceId][sE.slotId];
                    SlotEquipment memory existSE = es._slotEquipments[
                        pointer.equipmentIndex
                    ];

                    if (
                        existSE.slotId != uint64(0) ||
                        existSE.childBaseRelatedResourceId != uint64(0) ||
                        existSE.child.contractAddress != address(0)
                    ) {
                        revert RMRKSlotIsOccupied();
                    }
                }

                {
                    bool alreadyEquipped = es._baseAlreadyEquippedChild[
                        tokenId
                    ][baseRelatedResourceId][sE.child.contractAddress][
                            sE.child.tokenId
                        ];

                    if (alreadyEquipped) {
                        revert RMRKCurrentBaseInstanceAlreadyEquippedThisChild();
                    }
                }
            }

            address childContract = sE.child.contractAddress;
            uint256 childTokenId = sE.child.tokenId;

            uint256 sELen = es._slotEquipments.length;

            uint256 equippedSlotsLen = es
            ._equippedSlots[tokenId][baseRelatedResourceId].length;

            uint256 equippedChildBRRsLen = es
            ._equippedChildBaseRelatedResources[childContract][childTokenId]
                .length;

            // add the record to _equippedSlots
            es._equippedSlots[tokenId][baseRelatedResourceId].push(sE.slotId);

            // add the record to _baseAlreadyEquippedChild
            es._baseAlreadyEquippedChild[tokenId][baseRelatedResourceId][
                sE.child.contractAddress
            ][sE.child.tokenId] = true;

            // add the pointer which point at its position at
            // _equippedSlots(recordIndex) and _slotEquipments(equipmentIndex)
            es._equipmentPointers[tokenId][baseRelatedResourceId][
                    sE.slotId
                ] = EquipmentPointer({
                equipmentIndex: sELen,
                recordIndex: equippedSlotsLen
            });

            // add the record to _equippeeChildBaseRelatedResources
            es
            ._equippedChildBaseRelatedResources[childContract][childTokenId]
                .push(sE.childBaseRelatedResourceId);

            // add the pointer which point at its position at
            // _equippedChildBaseRelatedResources(recordIndex) and _slotEquipments(equipmentIndex)
            es._childEquipmentPointers[childContract][childTokenId][
                    sE.childBaseRelatedResourceId
                ] = IRMRKEquippableEventsAndStruct.EquipmentPointer({
                equipmentIndex: sELen,
                recordIndex: equippedChildBRRsLen
            });

            es._slotEquipments.push(sE);
        }

        emit SlotEquipmentsAdd(tokenId, baseRelatedResourceId, slotEquipments);
    }

    function _removeSlotEquipments(
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        uint64[] memory slotIds
    ) internal virtual {
        _requireMinted(tokenId);

        (, bool exist) = getEquippableState()
            ._activeBaseResources[tokenId]
            .indexOf(baseRelatedResourceId);
        if (!exist) revert RMRKNotInActiveResources();

        uint256 len = slotIds.length;

        for (uint256 i; i < len; ++i) {
            uint64 slotId = slotIds[i];

            EquippableStorage.State storage es = getEquippableState();

            EquipmentPointer memory ePointer = es._equipmentPointers[tokenId][
                baseRelatedResourceId
            ][slotId];

            SlotEquipment memory slotEquipment = es._slotEquipments[
                ePointer.equipmentIndex
            ];

            // delete corresponding _baseAlreadyEquippedChild record
            delete es._baseAlreadyEquippedChild[tokenId][baseRelatedResourceId][
                slotEquipment.child.contractAddress
            ][slotEquipment.child.tokenId];

            // delete corresponding _equippedChildBaseRelatedResources record
            {
                IRMRKNesting.Child memory child = slotEquipment.child;
                EquipmentPointer memory cEPointer = es._childEquipmentPointers[
                    child.contractAddress
                ][child.tokenId][slotEquipment.childBaseRelatedResourceId];

                uint64[] storage bRRIds = es._equippedChildBaseRelatedResources[
                    child.contractAddress
                ][child.tokenId];

                uint64 lastBRRId = bRRIds[bRRIds.length - 1];

                bRRIds.removeItemByIndex(cEPointer.recordIndex);

                // Due to the `removeItemByIndex` code detail, has to update the lastBRR's `recordIndex`
                es
                ._childEquipmentPointers[child.contractAddress][child.tokenId][
                    lastBRRId
                ].recordIndex = cEPointer.recordIndex;
            }

            // delete corresponding _equippedSlots record
            {
                uint64[] storage equippedSlotIds = es._equippedSlots[tokenId][
                    baseRelatedResourceId
                ];

                uint64 lastSlotId = slotIds[slotIds.length - 1];

                equippedSlotIds.removeItemByIndex(ePointer.recordIndex);

                // Due to the `removeItemByIndex` code detail, has to update the lastSlot's `recordIndex`
                es
                ._equipmentPointers[tokenId][baseRelatedResourceId][lastSlotId]
                    .recordIndex = ePointer.recordIndex;
            }

            // delete corresponding _equipmentPointers record
            delete es._equipmentPointers[tokenId][baseRelatedResourceId][
                slotId
            ];

            // delete corresponding _childEquipmentPointers record
            delete es._childEquipmentPointers[
                slotEquipment.child.contractAddress
            ][slotEquipment.child.tokenId][
                    slotEquipment.childBaseRelatedResourceId
                ];

            // remove slotEquipment from _slotEquipments
            {
                SlotEquipment[] storage slotEquipments = es._slotEquipments;

                uint256 lastIndex = slotEquipments.length;

                slotEquipment = slotEquipments[lastIndex];

                slotEquipments.pop();

                // Due to this remove style, the last slotEquipment's position has changed.
                // Has to update the last slotEquipment's `equipmentIndex` in corresponding pointers
                EquipmentPointer storage lastEPointer = es._equipmentPointers[
                    slotEquipment.tokenId
                ][slotEquipment.baseRelatedResourceId][slotEquipment.slotId];

                EquipmentPointer storage lastCEPointer = es
                    ._childEquipmentPointers[
                        slotEquipment.child.contractAddress
                    ][slotEquipment.child.tokenId][
                        slotEquipment.childBaseRelatedResourceId
                    ];

                uint256 equipmentIndex = ePointer.equipmentIndex;

                lastEPointer.equipmentIndex = equipmentIndex;
                lastCEPointer.equipmentIndex = equipmentIndex;
            }
        }

        emit SlotEquipmentsRemove(tokenId, baseRelatedResourceId, slotIds);
    }

    function _removeSlotEquipments(
        address childContract,
        uint256 childTokenId,
        uint64[] memory childBaseRelatedResourceIds
    ) internal virtual {
        uint256 parentTokenId;
        uint256 len = childBaseRelatedResourceIds.length;
        uint64[] memory baseRelatedResourceIds = new uint64[](len);
        uint256 pointerOfBRRIds = 0;
        uint64[][] memory slotIds = new uint64[][](len);
        uint256[] memory pointers = new uint256[](len);

        for (uint256 i; i < len; i++) {
            SlotEquipment memory sE = _getSlotEquipment(
                childContract,
                childTokenId,
                childBaseRelatedResourceIds[i]
            );

            // Child only has one parent so parentTokenId is fixed in this function
            parentTokenId = sE.tokenId;

            uint64 baseRelatedResourceId = sE.baseRelatedResourceId;
            uint64 slotId = sE.slotId;

            (uint256 index, bool isExist) = baseRelatedResourceIds.indexOf(
                baseRelatedResourceId
            );
            if (isExist) {
                uint256 pointer = pointers[index];
                slotIds[index][pointer] = slotId;
                pointers[index]++;
            } else {
                baseRelatedResourceIds[pointerOfBRRIds] = baseRelatedResourceId;
                slotIds[pointerOfBRRIds][0] = slotId;

                pointers[pointerOfBRRIds] = 1;
                pointerOfBRRIds++;
            }
        }

        for (uint256 i; i < pointerOfBRRIds; i++) {
            uint64 baseRelatedResourceId = baseRelatedResourceIds[i];
            uint64[] memory slotIdsOfBRR = slotIds[i];

            _removeSlotEquipments(
                parentTokenId,
                baseRelatedResourceId,
                slotIdsOfBRR
            );
        }
    }

    // ------------------------ Nesting internal and override ------------------------

    function _childEquipmentCheck(address childContract, uint256 childTokenId)
        internal
        view
    {
        IRMRKEquippable.SlotEquipment[]
            memory slotEquipments = _getSlotEquipments(
                childContract,
                childTokenId
            );

        if (slotEquipments.length > 0) {
            revert RMRKMustRemoveSlotEquipmentFirst();
        }
    }

    function _unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) internal virtual override {
        Child memory child = getNestingState()._children[tokenId][index];
        uint256 childTokenId = child.tokenId;

        _childEquipmentCheck(_msgSender(), childTokenId);

        RMRKNestingInternal._unnestChild(tokenId, index, to);
    }

    function _burnChild(uint256 tokenId, uint256 index)
        internal
        virtual
        override
    {
        Child memory child = getNestingState()._children[tokenId][index];
        address childContract = child.contractAddress;
        uint256 childTokenId = child.tokenId;

        uint64[] memory childBaseRelatedResourceIds = getEquippableState()
            ._equippedChildBaseRelatedResources[childContract][childTokenId];

        _removeSlotEquipments(
            childContract,
            childTokenId,
            childBaseRelatedResourceIds
        );

        RMRKNestingInternal._burnChild(tokenId, index);
    }

    // ------------------------ MultiResource internal and override ------------------------

    function _acceptResource(uint256 tokenId, uint256 index) internal override {
        if (index >= getMRState()._pendingResources[tokenId].length)
            revert RMRKIndexOutOfRange();
        uint64 resourceId = getMRState()._pendingResources[tokenId][index];
        getMRState()._pendingResources[tokenId].removeItemByIndex(index);

        uint64 overwrite = getMRState()._resourceOverwrites[tokenId][
            resourceId
        ];
        if (overwrite != uint64(0)) {
            // We could check here that the resource to overwrite actually exists but it is probably harmless.
            getMRState()._activeResources[tokenId].removeItemByValue(overwrite);
            getEquippableState()
                ._activeBaseResources[tokenId]
                .removeItemByValue(overwrite);
            emit ResourceOverwritten(tokenId, overwrite, resourceId);
            delete (getMRState()._resourceOverwrites[tokenId][resourceId]);
        }
        getMRState()._activeResources[tokenId].push(resourceId);
        getMRState()._activeResourcePriorities[tokenId].push(LOWEST_PRIORITY);

        // If baseRelatedDataExist, add resourceId to `activeBaseResources`
        if (
            _baseRelatedDataExist(
                getEquippableState()._baseRelatedDatas[resourceId]
            )
        ) {
            getEquippableState()._activeBaseResources[tokenId].push(resourceId);
        }
        emit ResourceAccepted(tokenId, resourceId);
    }

    function _addBaseRelatedResourceEntry(
        uint64 id,
        BaseRelatedData memory baseRelatedResourceData,
        string memory metadataURI
    ) internal {
        _addResourceEntry(id, metadataURI);

        getEquippableState()._baseRelatedDatas[id] = baseRelatedResourceData;
        getEquippableState()._allBaseRelatedResourceIds.push(id);

        emit BaseRelatedResourceAdd(id);
    }

    function _baseRelatedDataExist(BaseRelatedData memory baseRelatedData)
        internal
        pure
        returns (bool)
    {
        // The valid baseRelatedData at least has a valid baseAddress or a valid targetBaseAddress.
        // If both are address(0), then it does not exist.
        if (
            baseRelatedData.baseAddress != address(0) ||
            baseRelatedData.targetBaseAddress != address(0)
        ) {
            return true;
        }

        return false;
    }

    // ------------------------ Function conflicts resolve ------------------------

    function _burn(uint256 tokenId) internal virtual override {
        (address rmrkOwner, , ) = _rmrkOwnerOf(tokenId);
        address owner = _ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        ERC721Storage.State storage s = getState();
        NestingStorage.State storage ns = getNestingState();
        EquippableStorage.State storage es = getEquippableState();

        // remove all corresponding slotEquipments
        uint64[] memory baseRelatedResourceIds = es._activeBaseResources[
            tokenId
        ];
        for (uint256 i; i < baseRelatedResourceIds.length; i++) {
            uint64 baseRelatedResourceId = baseRelatedResourceIds[i];
            uint64[] memory slotIds = es._equippedSlots[tokenId][
                baseRelatedResourceId
            ];

            _removeSlotEquipments(tokenId, baseRelatedResourceId, slotIds);
        }

        _approve(address(0), tokenId);
        _approveForResources(address(0), tokenId);
        _cleanApprovals(address(0), tokenId);

        s._balances[rmrkOwner] -= 1;
        delete ns._RMRKOwners[tokenId];
        delete ns._pendingChildren[tokenId];
        delete ns._children[tokenId];
        delete s._tokenApprovals[tokenId];

        _afterTokenTransfer(owner, address(0), tokenId);
        emit Transfer(owner, address(0), tokenId);
    }
}
