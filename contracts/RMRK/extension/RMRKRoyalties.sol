// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

abstract contract RMRKRoyalties is IERC2981 {
    //@notice Royalty details
    address private _royaltyRecipient;
    uint256 private _royaltyPercentageBps;

    struct RoyaltyDetails {
        address royaltyRecipient;
        uint256 royaltyPercentageBps;
    }

    constructor(RoyaltyDetails memory _royaltyDetails) {
        _royaltyRecipient = _royaltyDetails.royaltyRecipient;
        _royaltyPercentageBps = _royaltyDetails.royaltyPercentageBps;
    }

    //@notice Requires access control on the implementation contract like implementing Ownable and setting onlyOwner modifier
    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        virtual;

    function _setRoyaltyRecipient(address newRoyaltyRecipient) internal {
        _royaltyRecipient = newRoyaltyRecipient;
    }

    //@param tokenId - the token id to get the royalty info for
    //@param salePrice - the sale price of the NFT
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        virtual
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * _royaltyPercentageBps) / 10000;
    }

    function getRoyaltyRecipient() external view virtual returns (address) {
        return _royaltyRecipient;
    }

    function getRoyaltyBps() external view virtual returns (uint256) {
        return _royaltyPercentageBps;
    }
}
