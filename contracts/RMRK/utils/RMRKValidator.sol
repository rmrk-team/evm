// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.15;

import "../RMRKEquippableAyuilosVer.sol";
import "../RMRKBaseStorage.sol";

contract RMRKEquippableValidator {
    using Address for address;
    using RMRKLib for uint64[];

    function _pickUint64(uint64[] memory source, uint64[] memory target)
        internal
        pure
        returns (uint64[] memory)
    {
        uint256 lenOfSource = source.length;
        uint64[] memory _result = new uint64[](lenOfSource);
        uint256 j;

        for (uint256 i; i < lenOfSource; ) {
            uint64 res = source[i];
            (, bool result) = target.indexOf(res);
            if (result) {
                _result[j] = res;
                ++j;
            }
            unchecked {
                ++i;
            }
        }

        uint64[] memory validRes = new uint64[](j);
        validRes = _result;

        return validRes;
    }

    function _existsInUint64Arr(uint64 id, uint64[] memory idArr)
        internal
        pure
        returns (bool result)
    {
        (, result) = idArr.indexOf(id);
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

            for (uint256 i; i < len; ++i) {
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
            }
        } else {
            revert(reason);
        }
    }

    function isAValidNestingContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV: Not a valid contract");
        }

        if (
            !(
                IERC165(targetContract).supportsInterface(
                    type(IRMRKNesting).interfaceId
                )
            )
        ) {
            return (false, "RV: Not a Nesting");
        }

        return (true, "");
    }

    function isAValidBaseStorageContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV: Not a valid contract");
        }

        if (
            !(
                IERC165(targetContract).supportsInterface(
                    type(IRMRKBaseStorage).interfaceId
                )
            )
        ) {
            return (false, "RV: Not a BaseStorage");
        }

        return (true, "");
    }

    function isAValidEquippableContract(address targetContract)
        public
        view
        returns (bool, string memory)
    {
        if (!targetContract.isContract()) {
            return (false, "RV: Not a valid contract");
        }

        if (
            !(IERC165(targetContract).supportsInterface(
                type(IRMRKEquippableAyuilosVer).interfaceId
            ) &&
                IERC165(targetContract).supportsInterface(
                    type(IRMRKNesting).interfaceId
                ) &&
                IERC165(targetContract).supportsInterface(
                    type(IRMRKMultiResource).interfaceId
                ))
        ) {
            return (false, "RV: Not a Equippable");
        }

        return (true, "");
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

    function getValidSlotEquipments(
        address targetContract,
        uint256 tokenId,
        uint64 baseRelatedResourceId
    )
        public
        view
        validContract(targetContract)
        returns (IRMRKEquippableAyuilosVer.SlotEquipment[] memory)
    {
        RMRKEquippableAyuilosVer tContract = RMRKEquippableAyuilosVer(
            targetContract
        );

        // To avoid "stack too deep" problem
        {
            uint64[] memory activeResourceIds = tContract.getActiveResources(
                tokenId
            );

            // `baseRelatedResourceId` has to be in `activeResourceIds`
            if (!_existsInUint64Arr(baseRelatedResourceId, activeResourceIds)) {
                return new IRMRKEquippableAyuilosVer.SlotEquipment[](0);
            }
        }

        {
            IRMRKEquippableAyuilosVer.BaseRelatedResource
                memory baseRelatedResource = tContract.getBaseRelatedResource(
                    baseRelatedResourceId
                );

            address baseStorageContract = baseRelatedResource.baseAddress;
            (bool isBaseStorage, ) = isAValidBaseStorageContract(
                baseStorageContract
            );

            // `baseRelatedResource` has to be a Base instance
            if (!isBaseStorage) {
                return new IRMRKEquippableAyuilosVer.SlotEquipment[](0);
            }
        }

        IRMRKEquippableAyuilosVer.SlotEquipment[]
            memory slotEquipments = tContract.getSlotEquipments(
                tokenId,
                baseRelatedResourceId
            );

        IRMRKEquippableAyuilosVer.SlotEquipment[]
            memory _validSlotEquipments = new IRMRKEquippableAyuilosVer.SlotEquipment[](
                slotEquipments.length
            );

        uint256 j;

        for (uint256 i; i < slotEquipments.length; i++) {
            IRMRKEquippableAyuilosVer.SlotEquipment memory sE = slotEquipments[
                i
            ];

            IRMRKNesting.Child memory child = sE.child;

            // The child token has to be a valid eqippable contract
            (bool childContractIsValid, ) = isAValidEquippableContract(
                child.contractAddress
            );
            if (childContractIsValid) {
                {
                    (
                        address ownerAddr,
                        uint256 ownerTokenId,
                        bool isNft
                    ) = IRMRKNesting(child.contractAddress).rmrkOwnerOf(
                            child.tokenId
                        );

                    // The child token's owner has to be this token
                    if (
                        ownerAddr != targetContract ||
                        ownerTokenId != tokenId ||
                        !isNft
                    ) {
                        continue;
                    }
                }

                {
                    uint64 childBaseRelatedResourceId = sE
                        .childBaseRelatedResourceId;

                    uint64[] memory childActiveResourceIds = IRMRKMultiResource(
                        child.contractAddress
                    ).getActiveResources(child.tokenId);

                    // The child token's `baseRelatedResourceId` has to be in child token's activeResourceIds
                    if (
                        !_existsInUint64Arr(
                            childBaseRelatedResourceId,
                            childActiveResourceIds
                        )
                    ) {
                        continue;
                    }
                }

                {
                    uint64 childBaseRelatedResourceId = sE
                        .childBaseRelatedResourceId;

                    IRMRKEquippableAyuilosVer.BaseRelatedResource
                        memory baseRelatedResource = tContract
                            .getBaseRelatedResource(baseRelatedResourceId);

                    IRMRKEquippableAyuilosVer.BaseRelatedResource
                        memory childBaseRelatedResource = IRMRKEquippableAyuilosVer(
                            child.contractAddress
                        ).getBaseRelatedResource(childBaseRelatedResourceId);

                    address baseStorageContract = baseRelatedResource
                        .baseAddress;

                    // 1. The child's `targetBaseAddress` has to be `baseRelatedResource.baseAddress`
                    // 2. The child's `targetSlotId` has to be in `baseRelatedResource.partIds`,
                    // 3. Finally, this child collection should be allowed to be equipped on the `targetSlotId` by `baseStorageContract`
                    if (
                        childBaseRelatedResource.targetBaseAddress !=
                        baseStorageContract ||
                        !_existsInUint64Arr(
                            childBaseRelatedResource.targetSlotId,
                            baseRelatedResource.partIds
                        ) ||
                        !IRMRKBaseStorage(baseStorageContract)
                            .checkIsEquippable(
                                childBaseRelatedResource.targetSlotId,
                                child.contractAddress
                            )
                    ) {
                        continue;
                    }
                }

                // The validation is over, this is a valid slotEquipment.
                _validSlotEquipments[j] = sE;
                ++j;
            }
        }

        IRMRKEquippableAyuilosVer.SlotEquipment[]
            memory validSlotEquipments = new IRMRKEquippableAyuilosVer.SlotEquipment[](
                j
            );
        validSlotEquipments = _validSlotEquipments;

        return _validSlotEquipments;
    }
}
