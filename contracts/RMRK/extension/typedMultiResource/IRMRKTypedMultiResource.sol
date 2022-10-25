// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

// import "../../multiresource/IRMRKMultiResource.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRMRKTypedMultiResource is IERC165 {
    /**
     * @notice Returns type of the resource
     */
    function getResourceType(uint64 resourceId)
        external
        view
        returns (string memory);
}
