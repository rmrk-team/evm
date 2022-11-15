// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRMRKNesting.sol";
import "../interfaces/IRMRKBaseStorage.sol";
import "../interfaces/IRMRKMultiResource.sol";
import "../interfaces/ILightmEquippable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./RMRKLib.sol";

library LightmValidatorLib {
    using RMRKLib for uint64[];
    using Address for address;

    function _existsInUint64Arr(uint64 id, uint64[] memory idArr)
        internal
        pure
        returns (bool result)
    {
        (, result) = idArr.indexOf(id);
    }

    function _childIsIn(
        IRMRKNesting.Child memory child,
        IRMRKNesting.Child[] memory children
    ) internal pure returns (bool) {
        uint256 len = children.length;
        for (uint256 i; i < len; ) {
            if (
                child.contractAddress == children[i].contractAddress &&
                child.tokenId == children[i].tokenId
            ) {
                return true;
            }

            unchecked {
                ++i;
            }
        }

        return false;
    }

    function _validateContract(address targetContract) internal view {
        (bool result, string memory reason) = isAValidEquippableContract(
            targetContract
        );

        if (!result) {
            revert(reason);
        }
    }

    // Make sure `targetContract` is valid Equippable contract
    modifier validContract(address targetContract) {
        _validateContract(targetContract);
        _;
    }

    function version() public pure returns (string memory) {
        return "0.1.0";
    }

    function getValidChildrenOf(address targetContract, uint256 tokenId)
        public
        view
        returns (IRMRKNesting.Child[] memory validChildren)
    {
        (bool isValid, string memory reason) = isAValidNestingContract(
            targetContract
        );

        if (isValid) {
            IRMRKNesting.Child[] memory children = IRMRKNesting(targetContract)
                .childrenOf(tokenId);
            uint256 len = children.length;
            uint256 j;

            for (uint256 i; i < len; ) {
                IRMRKNesting.Child memory child = children[i];
                (bool childIsValid, ) = isAValidNestingContract(
                    child.contractAddress
                );

                if (childIsValid) {
                    (
                        address ownerAddr,
                        uint256 ownerTokenId,
                        bool isNft
                    ) = IRMRKNesting(child.contractAddress).rmrkOwnerOf(
                            child.tokenId
                        );

                    if (
                        ownerAddr == targetContract &&
                        ownerTokenId == tokenId &&
                        isNft
                    ) {
                        validChildren[j] = child;
                        ++j;
                    }
                }

                unchecked {
                    ++i;
                }
            }
        } else {
            revert(reason);
        }
    }

    /** 
        @dev This function can not avoid the completely same SlotEquipment struct
        because the cost will be higher.
        Try to do rechecking on client side or just rewrite this function in your
        implementation.
     */
    function getValidSlotEquipments(
        address targetContract,
        uint256 tokenId,
        uint64 baseRelatedResourceId
    )
        public
        view
        validContract(targetContract)
        returns (ILightmEquippable.SlotEquipment[] memory)
    {
        ILightmEquippable tContract = ILightmEquippable(targetContract);

        // avoid `stack too deep` problem
        {
            (bool isValid, ) = isAValidBaseInstance(
                targetContract,
                tokenId,
                baseRelatedResourceId
            );

            if (!isValid) {
                return new ILightmEquippable.SlotEquipment[](0);
            }
        }

        ILightmEquippable.SlotEquipment[] memory slotEquipments = tContract
            .getSlotEquipments(tokenId, baseRelatedResourceId);

        ILightmEquippable.SlotEquipment[]
            memory _validSlotEquipments = new ILightmEquippable.SlotEquipment[](
                slotEquipments.length
            );

        uint256 j;

        for (uint256 i; i < slotEquipments.length; ) {
            ILightmEquippable.SlotEquipment memory sE = slotEquipments[i];

            (bool isValid, ) = isSlotEquipmentValid(
                targetContract,
                tokenId,
                baseRelatedResourceId,
                sE
            );

            if (isValid) {
                _validSlotEquipments[j] = sE;
                unchecked {
                    ++j;
                }
            }

            unchecked {
                ++i;
            }
        }

        ILightmEquippable.SlotEquipment[]
            memory validSlotEquipments = new ILightmEquippable.SlotEquipment[](j);
        validSlotEquipments = _validSlotEquipments;

        return _validSlotEquipments;
    }

    function isAValidNestingContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV:NotAValidContract");
        }

        if (
            !(
                IERC165(targetContract).supportsInterface(
                    type(IRMRKNesting).interfaceId
                )
            )
        ) {
            return (false, "RV:NotANesting");
        }

        return (true, "");
    }

    function isAValidMultiResourceContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV:NotAValidContract");
        }

        if (
            !(
                IERC165(targetContract).supportsInterface(
                    type(IRMRKMultiResource).interfaceId
                )
            )
        ) {
            return (false, "RV:NotAMultiResource");
        }

        return (true, "");
    }

    function isAValidBaseStorageContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV:NotAValidContract");
        }

        if (
            !(
                IERC165(targetContract).supportsInterface(
                    type(IRMRKBaseStorage).interfaceId
                )
            )
        ) {
            return (false, "RV:NotABaseStorage");
        }

        return (true, "");
    }

    function isAValidEquippableContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV:NotAValidContract");
        }

        if (
            !(IERC165(targetContract).supportsInterface(
                type(ILightmEquippable).interfaceId
            ) &&
                IERC165(targetContract).supportsInterface(
                    type(IRMRKNesting).interfaceId
                ) &&
                IERC165(targetContract).supportsInterface(
                    type(IRMRKMultiResource).interfaceId
                ))
        ) {
            return (false, "RV:NotAEquippable");
        }

        return (true, "");
    }

    // Make sure the `baseRelatedResource` is a Base instance
    // !!!
    // NOTE: This function assumed that `targetContract` was a valid Equippable contract
    // !!!
    function isAValidBaseInstance(
        address targetContract,
        uint256 tokenId,
        uint64 baseRelatedResourceId
    ) public view returns (bool, string memory) {
        uint64[] memory activeResourceIds = IRMRKMultiResource(targetContract)
            .getActiveResources(tokenId);

        // `baseRelatedResourceId` has to be in `activeResourceIds`
        if (!_existsInUint64Arr(baseRelatedResourceId, activeResourceIds)) {
            return (false, "RV:NotInActiveResources");
        }

        ILightmEquippable.BaseRelatedResource
            memory baseRelatedResource = ILightmEquippable(targetContract)
                .getBaseRelatedResource(baseRelatedResourceId);

        address baseStorageContract = baseRelatedResource.baseAddress;
        (bool isBaseStorage, ) = isAValidBaseStorageContract(
            baseStorageContract
        );

        // `baseRelatedResource` has to be a Base instance
        if (!isBaseStorage) {
            return (false, "RV:NotValidBaseContract");
        }

        return (true, "");
    }

    // NOTE: This function has assumed that there are no problems
    // with parent token and its `baseRelatedResource`
    function isSlotEquipmentValid(
        address targetContract,
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        ILightmEquippable.SlotEquipment memory slotEquipment,
        bool checkExistingData
    ) public view returns (bool, string memory) {
        (
            bool childContractIsValid,
            string memory reason
        ) = isAValidEquippableContract(slotEquipment.child.contractAddress);
        if (childContractIsValid) {
            // The tokenId in `slotEquipment` has to equal `tokenId`
            if (slotEquipment.tokenId != tokenId) {
                return (false, "RV:TokenIdMisMatch");
            }

            // The baseRelatedResourceId in `slotEquipment` has to equal `baseRelatedResourceId`
            if (slotEquipment.baseRelatedResourceId != baseRelatedResourceId) {
                return (false, "RV:BaseRelatedResourceIdMisMatch");
            }

            {
                (
                    address ownerAddr,
                    uint256 ownerTokenId,
                    bool isNft
                ) = IRMRKNesting(slotEquipment.child.contractAddress)
                        .rmrkOwnerOf(slotEquipment.child.tokenId);

                // The child token's owner has to be this token
                if (
                    ownerAddr != targetContract ||
                    ownerTokenId != tokenId ||
                    !isNft
                ) {
                    return (false, "RV:WrongOwner");
                }
            }

            {
                // The child token has to be this token's accepted child
                IRMRKNesting.Child[] memory children = IRMRKNesting(
                    targetContract
                ).childrenOf(tokenId);

                if (!_childIsIn(slotEquipment.child, children)) {
                    return (false, "RV:NotInActiveChilds");
                }
            }

            {
                uint64 childBaseRelatedResourceId = slotEquipment
                    .childBaseRelatedResourceId;

                uint64[]
                    memory childActiveBaseRelatedResourceIds = ILightmEquippable(
                        slotEquipment.child.contractAddress
                    ).getActiveBaseRelatedResources(
                            slotEquipment.child.tokenId
                        );

                // The child token's `baseRelatedResourceId` has to be in child token's activeBaseRelatedResourceIds
                if (
                    !_existsInUint64Arr(
                        childBaseRelatedResourceId,
                        childActiveBaseRelatedResourceIds
                    )
                ) {
                    return (false, "RV:NotInActiveResources");
                }
            }

            {
                ILightmEquippable.BaseRelatedResource
                    memory baseRelatedResource = ILightmEquippable(targetContract)
                        .getBaseRelatedResource(baseRelatedResourceId);

                ILightmEquippable.BaseRelatedResource
                    memory childBaseRelatedResource = ILightmEquippable(
                        slotEquipment.child.contractAddress
                    ).getBaseRelatedResource(
                            slotEquipment.childBaseRelatedResourceId
                        );

                ILightmEquippable.SlotEquipment
                    memory realSlotEquipment = ILightmEquippable(targetContract)
                        .getSlotEquipment(
                            tokenId,
                            baseRelatedResourceId,
                            childBaseRelatedResource.targetSlotId
                        );

                // 1. The child's `targetBaseAddress` has to be `baseRelatedResource.baseAddress`
                // 2. The child's `targetSlotId` has to be in `baseRelatedResource.partIds`,
                // 3. This child collection should be allowed to be equipped on the `targetSlotId` by checking `baseStorageContract`
                // 4?. The slot can only equip one resource -- NOTE:
                //     This check is controlled by `checkExistingData`, only be set to `true` when validate
                //     the data which was already stored
                if (
                    childBaseRelatedResource.targetBaseAddress !=
                    baseRelatedResource.baseAddress
                ) {
                    return (false, "RV:WrongTargetBaseAddress");
                }
                if (
                    !_existsInUint64Arr(
                        childBaseRelatedResource.targetSlotId,
                        baseRelatedResource.partIds
                    )
                ) {
                    return (false, "RV:TargetSlotDidNotExist");
                }
                if (
                    !IRMRKBaseStorage(baseRelatedResource.baseAddress)
                        .checkIsEquippable(
                            childBaseRelatedResource.targetSlotId,
                            slotEquipment.child.contractAddress
                        )
                ) {
                    return (false, "RV:TargetSlotRejected");
                }

                if (
                    checkExistingData &&
                    (realSlotEquipment.slotId != slotEquipment.slotId ||
                        realSlotEquipment.childBaseRelatedResourceId !=
                        slotEquipment.childBaseRelatedResourceId ||
                        realSlotEquipment.child.contractAddress !=
                        slotEquipment.child.contractAddress ||
                        realSlotEquipment.child.tokenId !=
                        slotEquipment.child.tokenId)
                ) {
                    return (false, "RV:SlotIsOccupiedMoreThanOne");
                }
            }

            // The validation is over, this is a valid slotEquipment
            return (true, "");
        }

        return (false, reason);
    }

    function isSlotEquipmentValid(
        address targetContract,
        uint256 tokenId,
        uint64 baseRelatedResourceId,
        ILightmEquippable.SlotEquipment memory slotEquipment
    ) public view returns (bool, string memory) {
        return
            isSlotEquipmentValid(
                targetContract,
                tokenId,
                baseRelatedResourceId,
                slotEquipment,
                false
            );
    }
}
