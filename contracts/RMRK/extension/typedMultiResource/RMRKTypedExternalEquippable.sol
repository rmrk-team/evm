// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../equippable/RMRKExternalEquip.sol";
import "./RMRKTypedMultiResourceAbstract.sol";

abstract contract RMRKTypedExternalEquippable is
    RMRKTypedMultiResourceAbstract,
    RMRKExternalEquip
{
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKExternalEquip)
        returns (bool)
    {
        return
            RMRKExternalEquip.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }
}
