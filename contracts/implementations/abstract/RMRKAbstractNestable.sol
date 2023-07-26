// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

// For some reason, adding it to Core produces "Linearization of inheritance graph impossible"
import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/nestable/RMRKNestable.sol";
import "../utils/RMRKImplementationBase.sol";

abstract contract RMRKAbstractNestable is
    RMRKRoyalties,
    RMRKImplementationBase,
    RMRKNestable
{
    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, RMRKNestable) returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == RMRK_INTERFACE;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        if (to == address(0)) {
            unchecked {
                _totalSupply -= 1;
            }
        }
    }

    /**
     * @inheritdoc RMRKRoyalties
     */
    function updateRoyaltyRecipient(
        address newRoyaltyRecipient
    ) public virtual override onlyOwner {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }
}
