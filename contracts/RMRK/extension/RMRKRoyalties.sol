// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

abstract contract RMRKRoyalties is IERC2981 {
    //@notice Royalty details
    address private _royaltyRecipient;
    uint256 private _royaltyPercentageBps;

    constructor(
        address royaltyRecipient,
        uint256 royaltyPercentageBps //in basis points
    ) {
        _setRoyaltyRecipient(royaltyRecipient);
        _royaltyPercentageBps = royaltyPercentageBps;
    }

    //@notice Requires access control on the implementation contract like implementing Ownable and setting onlyOwner modifier
    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        virtual;

    function _setRoyaltyRecipient(address newRoyaltyRecipient) internal {
        _royaltyRecipient = newRoyaltyRecipient;
    }

    function getRoyaltyRecipient() external view virtual returns (address) {
        return _royaltyRecipient;
    }

    function getRoyaltyPercentage() external view virtual returns (uint256) {
        return _royaltyPercentageBps;
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
}
