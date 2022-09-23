// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../nesting/RMRKNestingMultiResource.sol";
import "./RMRKTypedMultiResourceAbstract.sol";

contract RMRKNestingTypedMultiResource is
    RMRKTypedMultiResourceAbstract,
    RMRKNestingMultiResource
{
    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResource(name, symbol)
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, RMRKNestingMultiResource)
        returns (bool)
    {
        return
            RMRKNestingMultiResource.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKTypedMultiResource).interfaceId;
    }
}
