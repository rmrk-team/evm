// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

library RMRKLib {

    function removeItemByValue(uint64[] storage array, uint64 value) internal {
        uint64[] memory memArr = array; //Copy array to memory, check for gas savings here
        uint256 length = memArr.length; //gas savings
        for (uint i; i<length; i = u_inc(i)) {
            if (memArr[i] == value) {
                removeItemByIndex(array, i);
                break;
            }
        }
    }

    //For reasource storage array
    function removeItemByIndex(uint64[] storage array, uint256 index) internal {
        //Check to see if this is already gated by require in all calls
        require(index < array.length);
        array[index] = array[array.length-1];
        array.pop();
    }

    // Gas saving iterator
    function u_inc(uint i) internal pure returns (uint r) {
        unchecked {
            assembly {
                r := add(i, 1)
            }
        }
    }

    // indexOf, indexOfFromEnd, and contains adapted from Cryptofin-Solidity arrayUtils
    function indexOf(uint64[] memory A, uint64 a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = 0; i < length; i++) {
            if (A[i] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

    function indexOfFromEnd(uint64[] memory A, uint64 a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = length; i > 0; i--) {
            if (A[i - 1] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

    function contains(uint64[] memory A, uint64 a) internal pure returns (bool) {
        (, bool isIn) = indexOf(A, a);
        return isIn;
    }

    function containsFromEnd(uint64[] memory A, uint64 a) internal pure returns (bool) {
        (, bool isIn) = indexOfFromEnd(A, a);
        return isIn;
    }

  /* //Implement these if useful/time
  //Returns first zero found in array -- more efficient for a lot of things
  //Untested, could be busted, gotta test
  function getZero(uint256[] memory array_) public view returns(uint256) {

    assembly {
        let val := add(array_, 0x20)
        let len := mload(array_)
        for
            { let i := 0x0 }
            lt(i, len)
            {  }
        {
            if iszero(mload(val)) {
              return(i)
            }
        }
    }

  } */

}
