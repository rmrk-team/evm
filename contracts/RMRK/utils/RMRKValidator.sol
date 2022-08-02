// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.15;

import "../RMRKEquippableAyuilosVer.sol";

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

    function _validateContract(address targetContract) internal view {
        if (!targetContract.isContract()) {
            revert("RV: Not a valid contract");
        }

        if (
            !IERC165(targetContract).supportsInterface(
                type(IRMRKEquippableAyuilosVer).interfaceId
            )
        ) {
            revert("RV: Not Equippable");
        }
    }

    modifier validContract(address targetContract) {
        _validateContract(targetContract);
        _;
    }

    function getValidBaseRelatedResourceIdsInvolvedInEquipment(
        address targetContract,
        uint256 tokenId
    )
        public
        view
        validContract(targetContract)
        returns (uint64[] memory validBaseRelatedResourceIds)
    {
        RMRKEquippableAyuilosVer tContract = RMRKEquippableAyuilosVer(
            targetContract
        );
        uint64[] memory activeResIds = tContract.getActiveResources(tokenId);
        uint64[] memory baseRelatedResIdsInvolvedInEquipment = tContract
            .getBaseRelatedResourceIdsInvolvedInEquipment(tokenId);

        return _pickUint64(activeResIds, baseRelatedResIdsInvolvedInEquipment);
    }

    function getValidSlotEquipments(address targetContract, uint256 tokenId)
        public
        view
        validContract(targetContract)
        returns (IRMRKEquippableAyuilosVer.SlotEquipment[] memory)
    {
        RMRKEquippableAyuilosVer tContract = RMRKEquippableAyuilosVer(
            targetContract
        );

        IRMRKEquippableAyuilosVer.SlotEquipment[]
            memory slotEquipments = tContract.getSlotEquipments(tokenId);
        uint64[]
            memory validBRRIIIE = getValidBaseRelatedResourceIdsInvolvedInEquipment(
                targetContract,
                tokenId
            );
        uint256 len = slotEquipments.length;
        IRMRKEquippableAyuilosVer.SlotEquipment[]
            memory _validSlotEquipments = new IRMRKEquippableAyuilosVer.SlotEquipment[](
                len
            );
        uint256 j;

        for (uint256 i; i < len; ) {
            IRMRKEquippableAyuilosVer.SlotEquipment memory sE = slotEquipments[
                i
            ];

            if (!_existsInUint64Arr(sE.baseRelatedResourceId, validBRRIIIE)) {
                unchecked {
                    ++i;
                }
                continue;
            }

            uint64 childBaseRelatedReousourceId = sE.childBaseRelatedResourceId;

            IRMRKNesting.Child memory child = sE.child;
            address childContract = child.contractAddress;
            uint256 childTokenId = child.tokenId;

            try
                this.getValidBaseRelatedResourceIdsInvolvedInEquipment(
                    childContract,
                    childTokenId
                )
            returns (uint64[] memory childValidBRRIIIE) {
                if (
                    _existsInUint64Arr(
                        childBaseRelatedReousourceId,
                        childValidBRRIIIE
                    )
                ) {
                    _validSlotEquipments[j] = sE;
                    unchecked {
                        ++j;
                        ++i;
                    }
                }
            } catch {
                unchecked {
                    ++i;
                }
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
