// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "../RMRK/RMRKCore.sol";

//Minimal public implementation of RMRKCore for testing.

contract RMRKCoreMock is RMRKCore {

  constructor(
    string memory name_,
    string memory symbol_,
    string memory resourceName
  ) RMRKCore (
    name_,
    symbol_,
    resourceName
  ) {}

  //The preferred method here is to overload the function, but hardhat tests prevent this.
  function doMint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }

  function doMintNest(address to, uint256 tokenId, uint256 destId, bool isNft) external {
    _mint(to, tokenId, destId, isNft);
  }

  function burn(uint256 tokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "RMRKCore: transfer caller is not owner nor approved");
    _burn(tokenId);
  }

}
