// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../equippable/RMRKEquippable.sol";
import "./RMRKTypedMultiResourceAbstract.sol";

contract RMRKTypedEquippable is RMRKTypedMultiResourceAbstract, RMRKEquippable {
    constructor(string memory name, string memory symbol)
        RMRKEquippable(name, symbol)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKEquippable)
        returns (bool)
    {
        return
            RMRKEquippable.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }
}
