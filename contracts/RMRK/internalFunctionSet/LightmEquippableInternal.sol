// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ILightmEquippable.sol";
import "../library/ValidatorLib.sol";
import "./RMRKNestingMultiResourceInternal.sol";
import {EquippableStorage} from "./Storage.sol";

error LightmBaseRelatedResourceDidNotExist();
error LightmCurrentBaseInstanceAlreadyEquippedThisChild();
error LightmIndexOverLength();
error LightmMismatchedEquipmentAndIDLength();
error LightmMustRemoveSlotEquipmentFirst();
error LightmNotInActiveResources();
error LightmNotValidBaseContract();
error LightmSlotEquipmentNotExist();
error LightmSlotIsOccupied();

abstract contract LightmEquippableInternal is
    ILightmEquippableEventsAndStruct,
    RMRKNestingMultiResourceInternal
{
    using RMRKLib for uint64[];
    using Address for address;

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

        string memory resourceMeta = _getResourceMetadata(baseRelatedResourceId);

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

        for (uint256 i; i < len; ) {
            uint64 baseRelatedResourceId = baseRelatedResourceIds[i];

            baseRelatedResources[i] = _getBaseRelatedResource(
                baseRelatedResourceId
            );

            unchecked {
                ++i;
            }
        }

        return baseRelatedResources;
    }

    function _getActiveBaseRelatedResources(uint256 tokenId)
        internal
        view
        returns (uint64[] memory)
    {
        uint64[] memory activeBaseRelatedResourceIds = getEquippableState()
            ._activeBaseRelatedResources[tokenId];

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
            revert LightmSlotEquipmentNotExist();
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
            revert LightmSlotEquipmentNotExist();
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

        for (uint256 i; i < len; ) {
            slotEquipments[i] = _getSlotEquipment(
                tokenId,
                baseRelatedResourceId,
                slotIds[i]
            );

            unchecked {
                ++i;
            }
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

        for (uint256 i; i < len; ) {
            slotEquipments[i] = _getSlotEquipment(
                childContract,
                childTokenId,
                childBaseRelatedResourceIds[i]
            );

            unchecked {
                ++i;
            }
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
            revert LightmIndexOverLength();
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
            if (!exist) revert LightmNotInActiveResources();
        }

        uint256 len = slotEquipments.length;

        for (uint256 i; i < len; ) {
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
                        revert LightmSlotIsOccupied();
                    }
                }

                {
                    bool alreadyEquipped = es._baseAlreadyEquippedChild[
                        tokenId
                    ][baseRelatedResourceId][sE.child.contractAddress][
                            sE.child.tokenId
                        ];

                    if (alreadyEquipped) {
                        revert LightmCurrentBaseInstanceAlreadyEquippedThisChild();
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
                ] = ILightmEquippableEventsAndStruct.EquipmentPointer({
                equipmentIndex: sELen,
                recordIndex: equippedChildBRRsLen
            });

            es._slotEquipments.push(sE);

            unchecked {
                i++;
            }
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
            ._activeBaseRelatedResources[tokenId]
            .indexOf(baseRelatedResourceId);
        if (!exist) revert LightmNotInActiveResources();

        uint256 len = slotIds.length;

        for (uint256 i; i < len; ) {
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

            unchecked {
                ++i;
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

        for (uint256 i; i < len; ) {
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

            unchecked {
                ++i;
            }
        }

        for (uint256 i; i < pointerOfBRRIds; ) {
            uint64 baseRelatedResourceId = baseRelatedResourceIds[i];
            uint64[] memory slotIdsOfBRR = slotIds[i];

            _removeSlotEquipments(
                parentTokenId,
                baseRelatedResourceId,
                slotIdsOfBRR
            );

            unchecked {
                ++i;
            }
        }
    }

    // ------------------------ Nesting internal and override ------------------------

    function _childEquipmentCheck(address childContract, uint256 childTokenId)
        internal
        view
    {
        ILightmEquippable.SlotEquipment[]
            memory slotEquipments = _getSlotEquipments(
                childContract,
                childTokenId
            );

        if (slotEquipments.length > 0) {
            revert LightmMustRemoveSlotEquipmentFirst();
        }
    }

    function _unnestChild(
        uint256 tokenId,
        address to,
        address childContractAddress,
        uint256 childTokenId,
        bool isPending
    ) internal virtual override {
        _childEquipmentCheck(_msgSender(), childTokenId);

        RMRKNestingInternal._unnestChild(
            tokenId,
            to,
            childContractAddress,
            childTokenId,
            isPending
        );
    }

    // ------------------------ MultiResource internal and override ------------------------

    function _baseRelatedResourceAccept(uint256 tokenId, uint64 resourceId)
        internal
        virtual
    {
        EquippableStorage.State storage es = getEquippableState();
        // If baseRelatedDataExist, add resourceId to `activeBaseResources`
        if (_baseRelatedDataExist(es._baseRelatedDatas[resourceId])) {
            MultiResourceStorage.State storage mrs = getMRState();

            uint64[] storage activeBaseRelatedResources = es
                ._activeBaseRelatedResources[tokenId];

            uint64 overwrites = mrs._resourceOverwrites[tokenId][resourceId];

            if (overwrites != uint64(0)) {
                uint256 position = es._activeBaseRelatedResourcesPosition[
                    tokenId
                ][overwrites];
                uint64 overwritesId = activeBaseRelatedResources[position];

                if (overwritesId == overwrites) {
                    // Check if overwrites resource is participating equipment
                    // If yes, should exit equipment first.
                    (address directOwner, , ) = _rmrkOwnerOf(tokenId);
                    if (
                        directOwner.isContract() &&
                        IERC165(directOwner).supportsInterface(
                            type(ILightmEquippable).interfaceId
                        )
                    ) {
                        try
                            ILightmEquippable(directOwner).getSlotEquipment(
                                address(this),
                                tokenId,
                                overwritesId
                            )
                        returns (ILightmEquippable.SlotEquipment memory) {
                            revert LightmMustRemoveSlotEquipmentFirst();
                        } catch {}
                    }

                    activeBaseRelatedResources[position] = resourceId;
                    es._activeBaseRelatedResourcesPosition[tokenId][
                        resourceId
                    ] = position;
                } else {
                    overwrites = uint64(0);
                }
            }

            if (overwrites == uint64(0)) {
                activeBaseRelatedResources.push(resourceId);
                es._activeBaseRelatedResourcesPosition[tokenId][resourceId] =
                    activeBaseRelatedResources.length -
                    1;
            }
        }
    }

    function _acceptResourceByIndex(uint256 tokenId, uint256 index)
        internal
        virtual
        override
    {
        uint64 resourceId = getMRState()._pendingResources[tokenId][index];
        _baseRelatedResourceAccept(tokenId, resourceId);

        RMRKMultiResourceInternal._acceptResourceByIndex(tokenId, index);
    }

    function _acceptResource(uint256 tokenId, uint64 resourceId)
        internal
        virtual
        override
    {
        _baseRelatedResourceAccept(tokenId, resourceId);

        RMRKMultiResourceInternal._acceptResource(tokenId, resourceId);
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

    function _burn(uint256 tokenId, uint256 maxChildrenBurns)
        internal
        virtual
        override
        returns (uint256)
    {
        (address immediateOwner, uint256 parentId, ) = _rmrkOwnerOf(tokenId);
        address owner = _ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);
        _beforeNestedTokenTransfer(
            immediateOwner,
            address(0),
            parentId,
            0,
            tokenId
        );


        {
            EquippableStorage.State storage es = getEquippableState();
            // remove all corresponding slotEquipments
            uint64[] memory baseRelatedResourceIds = es
                ._activeBaseRelatedResources[tokenId];
            for (uint256 i; i < baseRelatedResourceIds.length; ) {
                uint64 baseRelatedResourceId = baseRelatedResourceIds[i];
                uint64[] memory slotIds = es._equippedSlots[tokenId][
                    baseRelatedResourceId
                ];

                _removeSlotEquipments(tokenId, baseRelatedResourceId, slotIds);

                unchecked {
                    ++i;
                }
            }
        }

        {
            ERC721Storage.State storage s = getState();
            s._balances[immediateOwner] -= 1;
            delete s._tokenApprovals[tokenId];
        }

        _approve(address(0), tokenId);
        _approveForResources(address(0), tokenId);
        _cleanApprovals(tokenId);

        NestingStorage.State storage ns = getNestingState();
        Child[] memory children = ns._activeChildren[tokenId];

        delete ns._activeChildren[tokenId];
        delete ns._pendingChildren[tokenId];

        uint256 totalChildBurns;
        {
            uint256 pendingRecursiveBurns;
            uint256 length = children.length; //gas savings
            for (uint256 i; i < length; ) {
                if (totalChildBurns >= maxChildrenBurns) {
                    revert RMRKMaxRecursiveBurnsReached(
                        children[i].contractAddress,
                        children[i].tokenId
                    );
                }

                delete ns._posInChildArray[children[i].contractAddress][
                    children[i].tokenId
                ];

                unchecked {
                    // At this point we know pendingRecursiveBurns must be at least 1
                    pendingRecursiveBurns = maxChildrenBurns - totalChildBurns;
                }
                // We substract one to the next level to count for the token being burned, then add it again on returns
                // This is to allow the behavior of 0 recursive burns meaning only the current token is deleted.
                totalChildBurns +=
                    IRMRKNesting(children[i].contractAddress).burn(
                        children[i].tokenId,
                        pendingRecursiveBurns - 1
                    ) +
                    1;
                unchecked {
                    ++i;
                }
            }
        }
        // Can't remove before burning child since child will call back to get root owner
        delete ns._RMRKOwners[tokenId];

        _afterTokenTransfer(owner, address(0), tokenId);
        _afterNestedTokenTransfer(
            immediateOwner,
            address(0),
            parentId,
            0,
            tokenId
        );
        emit Transfer(owner, address(0), tokenId);
        emit NestTransfer(immediateOwner, address(0), parentId, 0, tokenId);

        return totalChildBurns;
    }
}
