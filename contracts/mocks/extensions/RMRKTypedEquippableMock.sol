// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../RMRK/extension/typedMultiResource/RMRKTypedEquippable.sol";
import "hardhat/console.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKTypedEquippableMock is RMRKTypedEquippable {
    constructor(string memory name, string memory symbol)
        RMRKTypedEquippable(name, symbol)
    {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external {
        _requireMinted(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addTypedResourceEntry(
        ExtendedResource memory resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds,
        string memory type_
    ) external {
        _addTypedResourceEntry(resource, fixedPartIds, slotPartIds, type_);
    }
}
