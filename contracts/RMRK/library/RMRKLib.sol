// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

library RMRKLib {

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
}
