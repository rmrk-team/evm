// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../core/RMRKCore.sol";
import "./IRMRKSoulbound.sol";
import "../../library/RMRKErrors.sol";

/**
 * @title RMRKSoulbound
 * @author RMRK team
 * @notice Smart contract of the RMRK Soulbound module.
 */
abstract contract RMRKSoulbound is IRMRKSoulbound, RMRKCore {
    /**
     * @notice Used to validate that the token is not being transferred,
     * @dev This is a hook ensuring that all transfers of tokens are reverted.
     * @dev The only exception of transfers being allowed is when the tokens are minted or when they are being burned.
     * @param from Address from which the token is originating (current owner of the token)
     * @param to Address to which the token would be sent
     * @param tokenId ID of the token that would be transferred
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (
            from != address(0) && // Exclude minting
            to != address(0) && // Exclude Burning
            isSoulbound(tokenId)
        ) revert RMRKCannotTransferSoulbound();

        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @notice Used to verify that the token is soulbound.
     * @param tokenId ID of the token we are verifying
     * @return bool Boolean verifying whether the token is soulbound (`true`) or not (`false`)
     */
    function isSoulbound(uint256 tokenId) public view virtual returns (bool) {
        return true;
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return interfaceId == type(IRMRKSoulbound).interfaceId;
    }
}
