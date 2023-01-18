// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../library/RMRKLib.sol";
import "../library/RMRKErrors.sol";

/**
 * @title RMRKRenderUtils
 * @author RMRK team
 * @notice Smart contract of the RMRK render utils module.
 * @dev Extra utility functions for RMRK contracts.
 */
contract RMRKRenderUtils {
    /**
     * @notice Used to get a list of existing token IDs in the range between `pageStart` and `pageSize`.
     * @dev It is not optimized to avoid checking IDs out of max supply nor total supply, since this is not meant to be used during transaction execution; it is only meant to be used as a getter.
     * @dev The resulting array might be smaller than the given `pageSize` since no-existent IDs are not included.
     * @param target Address of the collection smart contract of the given token
     * @param pageStart The first ID to check
     * @param pageSize The number of IDs to check
     * @return page An array of IDs of the existing tokens
     */
    function getPaginatedMintedIds(
        address target,
        uint256 pageStart,
        uint256 pageSize
    ) public view returns (uint256[] memory page) {
        uint256[] memory tmpIds = new uint[](pageSize);
        uint256 found;
        for (uint256 i = 0; i < pageSize; ) {
            try IERC721(target).ownerOf(pageStart + i) returns (address) {
                tmpIds[i] = pageStart + i;
                unchecked {
                    found += 1;
                }
            } catch {
                // do nothing
            }
            unchecked {
                ++i;
            }
        }
        page = new uint256[](found);
        uint256 actualIndex;
        for (uint256 i = 0; i < pageSize; ) {
            if (tmpIds[i] != 0) {
                page[actualIndex] = tmpIds[i];
                unchecked {
                    ++actualIndex;
                }
            }
            unchecked {
                ++i;
            }
        }
    }
}
