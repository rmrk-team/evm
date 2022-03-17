pragma solidity ^0.8.0;

library RMRKLib {

  function removeItemByValue(bytes16[] storage array, bytes16 value) internal {
    bytes16[] memory memArr = array; //Copy array to memory, check for gas savings here
    uint256 length = memArr.length; //gas savings
    for (uint i; i<length; i = u_inc(i)) {
      if (memArr[i] == value) {
        removeItemByIndex(array, i);
        break;
      }
    }
  }

  //For reasource storage array
  function removeItemByIndex(bytes16[] storage array, uint256 index) internal {
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
}
