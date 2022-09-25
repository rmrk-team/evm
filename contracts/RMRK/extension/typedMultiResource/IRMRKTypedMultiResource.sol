// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../multiresource/IRMRKMultiResource.sol";

interface IRMRKTypedMultiResource is IRMRKMultiResource {
    /**
     * @notice Returns type of the resource
     */
    function getResourceType(uint64 resourceId)
        external
        view
        returns (string memory);
}
