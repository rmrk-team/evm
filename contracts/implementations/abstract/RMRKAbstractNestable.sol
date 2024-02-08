// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {
    IERC721Metadata
} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {RMRKNestable} from "../../RMRK/nestable/RMRKNestable.sol";
import {RMRKImplementationBase} from "../utils/RMRKImplementationBase.sol";

/**
 * @title RMRKAbstractNestable
 * @author RMRK team
 * @notice Abstract implementation of RMRK nestable module.
 */
abstract contract RMRKAbstractNestable is RMRKImplementationBase, RMRKNestable {
    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == RMRK_INTERFACE();
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
}
