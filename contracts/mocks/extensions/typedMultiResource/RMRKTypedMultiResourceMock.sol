// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../../../RMRK/extension/typedMultiResource/RMRKTypedMultiResource.sol";
import "../../RMRKMultiResourceMock.sol";

error RMRKTokenHasNoResourcesWithType();

contract RMRKTypedMultiResourceMock is
    RMRKMultiResourceMock,
    RMRKTypedMultiResource
{
    uint16 private constant _LOWEST_POSSIBLE_PRIORITY = 2**16 - 1;

    constructor(string memory name, string memory symbol)
        RMRKMultiResourceMock(name, symbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(RMRKMultiResource, RMRKTypedMultiResource)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function addTypedResourceEntry(
        uint64 resourceId,
        string memory metadataURI,
        string memory type_
    ) external {
        _addResourceEntry(resourceId, metadataURI);
        _setResourceType(resourceId, type_);
    }

    function getTopResourceMetaForTokenWithType(
        uint256 tokenId,
        string memory type_
    ) external view returns (string memory) {
        uint16[] memory priorities = getActiveResourcePriorities(tokenId);
        uint64[] memory resources = getActiveResources(tokenId);
        uint256 len = priorities.length;

        uint16 maxPriority = _LOWEST_POSSIBLE_PRIORITY;
        uint64 maxPriorityIndex = 0;
        bytes32 targetTypeEncoded = keccak256(bytes(type_));
        for (uint64 i; i < len; ) {
            uint16 currentPrio = priorities[i];
            bytes32 resourceTypeEncoded = keccak256(
                bytes(getResourceType(resources[i]))
            );
            if (
                resourceTypeEncoded == targetTypeEncoded &&
                currentPrio < maxPriority
            ) {
                maxPriority = currentPrio;
                maxPriorityIndex = i;
            }
            unchecked {
                ++i;
            }
        }
        if (maxPriority == _LOWEST_POSSIBLE_PRIORITY)
            revert RMRKTokenHasNoResourcesWithType();
        return getResourceMetaForToken(tokenId, maxPriorityIndex);
    }
}
