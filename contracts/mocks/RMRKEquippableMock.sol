// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/RMRKIssuable.sol";
import "../RMRK/RMRKEquippable.sol";


//Minimal public implementation of RMRKEquippable for testing.
contract RMRKEquippableMock is RMRKIssuable, RMRKEquippable {

    function setFallbackURI(string memory fallbackURI) external onlyIssuer {
        _setFallbackURI(fallbackURI);
    }

    function setNestingAddress(address nestingAddress) external onlyIssuer {
        _setNestingAddress(nestingAddress);
    }

    function setTokenEnumeratedResource(
        uint64 resourceId,
        bool state
    ) external onlyIssuer {
        _setTokenEnumeratedResource(resourceId, state);
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyIssuer {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        Resource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) external onlyIssuer {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function setCustomResourceData(
        uint64 resourceId,
        uint128 customResourceId,
        bytes memory data
    ) external onlyIssuer {
        _setCustomResourceData(resourceId, customResourceId, data);
    }

    function addCustomDataToResource(
        uint64 resourceId,
        uint128 customResourceId
    ) external onlyIssuer {
        _addCustomDataToResource(resourceId, customResourceId);
    }

    function removeCustomDataFromResource(
        uint64 resourceId,
        uint256 index
    ) external onlyIssuer {
        _removeCustomDataFromResource(resourceId, index);
    }

    function setValidParentRefId(
        uint64 refId,
        address parentAddress,
        uint64 partId
    ) external onlyIssuer {
        _setValidParentRefId(refId, parentAddress, partId);
    }

    function setValidParentsRefIds(
        uint64 refId,
        address[] memory parentAddresses,
        uint64[] memory partIds
    ) external onlyIssuer {
        uint256 len = partIds.length;
        if(len != parentAddresses.length)
            revert RMRKBadLength();

        for(uint i; i<len;) {
            _setValidParentRefId(refId, parentAddresses[i], partIds[i]);
            unchecked {++i;}
        }
    }
}
