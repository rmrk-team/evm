pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

abstract contract RMRKRoyalties is IERC2981 {
    //@notice Royalty details
    address _royaltyRecipient;
    uint256 _royaltyPercentageBps;

    constructor(
        address royaltyRecipient,
        uint256 royaltyPercentageBps //in basis points
    ) {
        _royaltyRecipient = royaltyRecipient;
        _royaltyPercentageBps = royaltyPercentageBps;
    }

    //@notice Requires access control on the implementation contract like implementing Ownable and setting onlyOwner modifier
    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        virtual;

    //@param tokenId - the token id to get the royalty info for
    //@param salePrice - the sale price of the NFT
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * _royaltyPercentageBps) / 10000;
    }
}
