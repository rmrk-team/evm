contract Checks {

  function doStuff(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
      assembly {
        switch lt(tokenA, tokenB)
        case 1 {
          token0 :=tokenA
          token1 :=tokenB
        }
        case 0 {
          token0 :=tokenB
          token1 :=tokenA
        }
      }
  }
}

contract test1 {
  bytes4(Keccak256(abi.encodePacked(_method, "(bytes,bytes,uint256)")))
}
