// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title RMRKRoyalties
 * @author RMRK team
 * @notice Smart contract of the RMRK Royalties module.
 */
abstract contract RMRKRoyalties is IERC2981 {
    address private _royaltyRecipient;
    uint256 private _royaltyPercentageBps;

    /**
     * @notice Used to initiate the smart contract.
     * @dev `royaltyPercentageBps` is expressed in basis points, so 1 basis point equals 0.01% and 500 basis points
     *  equal 5%.
     * @param royaltyRecipient Address to which to send the royalties to
     * @param royaltyPercentageBps The royalty percentage expressed in basis points
     */
    constructor(
        address royaltyRecipient,
        uint256 royaltyPercentageBps //in basis points
    ) {
        _setRoyaltyRecipient(royaltyRecipient);
        _royaltyPercentageBps = royaltyPercentageBps;
    }

    //@notice Requires access control on the implementation contract like implementing Ownable and setting onlyOwner modifier
    /**
     * @notice Used to update recipient of royalties.
     * @dev Custom access control has to be implemented to ensure that only the intedned actors can update the
     *  beneficiary.
     * @param newRoyaltyRecipient Address of the new recipient of royalties
     */
    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        virtual;

    /**
     * @notice Used to update the royalty recipient.
     * @param newRoyaltyRecipient Address of the new recipient of royalties
     */
    function _setRoyaltyRecipient(address newRoyaltyRecipient) internal {
        _royaltyRecipient = newRoyaltyRecipient;
    }

    /**
     * @notice Used to retrieve the recipient of royalties.
     * @return address Address of the recipient of royalties
     */
    function getRoyaltyRecipient() external view virtual returns (address) {
        return _royaltyRecipient;
    }

    /**
     * @notice Used to retrieve the information about who shall receive royalties of a sale of the specified token and
     *  how much they will be.
     * @param tokenId ID of the token for which the royalty info is being retrieved
     * @param salePrice Price of the token sale
     * @return receiver The beneficiary receiving royalties of the sale
     * @return royaltyAmount The value of the royalties recieved by the `receiver` from the sale
     */
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
