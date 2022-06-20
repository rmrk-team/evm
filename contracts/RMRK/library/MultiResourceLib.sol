// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

library MultiResourceLib {

    function removeItemByValue(uint32[] storage array, uint32 value) internal {
        uint32[] memory memArr = array; //Copy array to memory, check for gas savings here
        uint256 length = memArr.length; //gas savings
        for (uint i; i<length; i = u_inc(i)) {
            if (memArr[i] == value) {
                removeItemByIndex(array, i);
                break;
            }
        }
    }

    //For resource storage array
    function removeItemByIndex(uint32[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    //For resource storage array
    function removeItemByIndex(uint64[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    // indexOf, indexOfFromEnd, and contains adapted from Cryptofin-Solidity arrayUtils
    function indexOf(uint32[] memory A, uint32 a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = 0; i < length; u_inc(i)) {
            if (A[i] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

    function indexOfFromEnd(uint32[] memory A, uint32 a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = length; i > 0; i--) {
            if (A[i - 1] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

    function contains(uint32[] memory A, uint32 a) internal pure returns (bool) {
        (, bool isIn) = indexOf(A, a);
        return isIn;
    }

    function containsFromEnd(uint32[] memory A, uint32 a) internal pure returns (bool) {
        (, bool isIn) = indexOfFromEnd(A, a);
        return isIn;
    }

    // Gas saving iterator
    function u_inc(uint i) internal pure returns (uint r) {
        unchecked {
            assembly {
                r := add(i, 1)
            }
        }
    }

}
