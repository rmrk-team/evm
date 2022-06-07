// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

contract RMRKRoyalties {

  struct RoyaltyData {
    address royaltyAddress;
    uint32 numerator;
    uint32 denominator;
  }

  RoyaltyData private _royalties;

  event RoyaltyDataSet(address royaltyAddress, uint256 numerator, uint256 denominator);

  ////////////////////////////////////////
  //              ROYALTIES
  ////////////////////////////////////////

  /**
  * @dev Returns contract royalty data.
  * Returns a numerator and denominator for percentage calculations, as well as a desitnation address.
  */
  function _getRoyaltyData() internal virtual view returns(address royaltyAddress, uint256 numerator, uint256 denominator) {
    RoyaltyData memory data = _royalties;
    return(data.royaltyAddress, uint256(data.numerator), uint256(data.denominator));
  }

  /**
  * @dev Setter for contract royalty data, percentage stored as a numerator and denominator.
  * Recommended values are in Parts Per Million, E.G:
  * A numerator of 1*10**5 and a denominator of 1*10**6 is equal to 10 percent, or 100,000 parts per 1,000,000.
  */

  function _setRoyaltyData(address _royaltyAddress, uint32 _numerator, uint32 _denominator) internal virtual {
    _royalties = RoyaltyData ({
       royaltyAddress: _royaltyAddress,
       numerator: _numerator,
       denominator: _denominator
     });
   emit RoyaltyDataSet(_royaltyAddress, _numerator, _denominator);
  }
}
