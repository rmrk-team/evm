// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/RMRKEquippable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


//Minimal public implementation of RMRKEquippable for testing.
contract RMRKEquippableImpl is Ownable, RMRKEquippable {

    constructor(address nestingAddress)
    RMRKEquippable(nestingAddress)
    {}

    function setFallbackURI(string memory fallbackURI) external onlyOwner {
        _setFallbackURI(fallbackURI);
    }

    function setTokenEnumeratedResource(
        uint64 resourceId,
        bool state
    ) external onlyOwner {
        _setTokenEnumeratedResource(resourceId, state);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwner {
        // This reverts if token does not exist:
        _ownerOf(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) external onlyOwner {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function setValidParentRefId(
        uint64 refId,
        address parentAddress,
        uint64 partId
    ) external onlyOwner {
        _setValidParentRefId(refId, parentAddress, partId);
    }
}
