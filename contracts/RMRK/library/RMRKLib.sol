// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

library RMRKLib {

    //For reasource storage array
    function removeItemByIndex(uint128[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    function removeItemByValue(uint64[] storage array, uint64 value) internal {
        uint64[] memory memArr = array; //Copy array to memory, check for gas savings here
        uint256 length = memArr.length; //gas savings
        for (uint i; i<length;) {
            if (memArr[i] == value) {
                removeItemByIndex(array, i);
                break;
            }
            unchecked {++i;}
        }
    }

    //For resource storage array
    function removeItemByIndex(uint64[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    function removeItemByIndex(uint16[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    // indexOf adapted from Cryptofin-Solidity arrayUtils
    function indexOf(uint64[] memory A, uint64 a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = 0; i < length;) {
            if (A[i] == a) {
                return (i, true);
            }
            unchecked {++i;}
        }
        return (0, false);
    }

    function pickFrom(uint64[] memory source, uint64[] memory target)
        internal
        pure
        returns (uint64[] memory)
    {
        uint256 lenOfSource = source.length;
        uint64[] memory _result = new uint64[](lenOfSource);
        uint256 j;

        for (uint256 i; i < lenOfSource; ) {
            uint64 res = source[i];
            (, bool result) = indexOf(target, res);
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
}
