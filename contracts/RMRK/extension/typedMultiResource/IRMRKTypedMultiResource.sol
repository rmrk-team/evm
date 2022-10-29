// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

// import "../../multiresource/IRMRKMultiResource.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IRMRKTypedMultiResource
 * @author RMRK team
 * @notice Interface smart contract of the RMRK typed multi resource module.
 */
interface IRMRKTypedMultiResource is IERC165 {
    /**
     * @notice Used to get the type of the resource.
     * @param resourceId ID of the resource to check
     * @return string The type of the resource
     */
    function getResourceType(uint64 resourceId)
        external
        view
        returns (string memory);
}
