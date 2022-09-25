// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../equippable/RMRKExternalEquip.sol";
import "./RMRKTypedMultiResourceAbstract.sol";

contract RMRKTypedExternalEquippable is
    RMRKTypedMultiResourceAbstract,
    RMRKExternalEquip
{
    constructor(address nestingAddress) RMRKExternalEquip(nestingAddress) {}

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
