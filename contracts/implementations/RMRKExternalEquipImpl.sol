// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/equippable/RMRKExternalEquip.sol";
import "../RMRK/access/OwnableLock.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//Minimal public implementation of RMRKEquippableWithNesting for testing.
contract RMRKExternalEquipImpl is OwnableLock, RMRKExternalEquip {
    using Strings for uint256;

    //Mapping of uint64 resource ID to tokenEnumeratedResource for tokenURI
    mapping(uint64 => bool) internal _tokenEnumeratedResource;

    //fallback URI
    string internal _fallbackURI;

    constructor(address nestingAddress) RMRKExternalEquip(nestingAddress) {}

    function getFallbackURI() public view virtual returns (string memory) {
        return _fallbackURI;
    }

    function setFallbackURI(string memory fallbackURI) public onlyOwner {
        _fallbackURI = fallbackURI;
    }

    function isTokenEnumeratedResource(uint64 resourceId)
        public
        view
        virtual
        returns (bool)
    {
        return _tokenEnumeratedResource[resourceId];
    }

    function setTokenEnumeratedResource(uint64 resourceId, bool state)
        public
        onlyOwner
    {
        _tokenEnumeratedResource[resourceId] = state;
    }

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) public onlyOwner {
        // This reverts if token does not exist:
        ownerOf(tokenId);
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) public onlyOwner {
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function setValidParentRefId(
        uint64 refId,
        address parentAddress,
        uint64 partId
    ) public onlyOwner {
        _setValidParentRefId(refId, parentAddress, partId);
    }

    function _tokenURIAtIndex(uint256 tokenId, uint256 index)
        internal
        view
        override
        returns (string memory)
    {
        _requireMinted(tokenId);
        if (getActiveResources(tokenId).length > index) {
            uint64 activeResId = getActiveResources(tokenId)[index];
            Resource memory _activeRes = getResource(activeResId);
            string memory uri = string(
                abi.encodePacked(
                    _baseURI(),
                    _activeRes.metadataURI,
                    _tokenEnumeratedResource[activeResId]
                        ? tokenId.toString()
                        : ""
                )
            );

            return uri;
        } else {
            return _fallbackURI;
        }
    }
}
