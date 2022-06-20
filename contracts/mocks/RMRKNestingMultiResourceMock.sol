// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.14;

import "../RMRK/RMRKNestingMultiResource.sol";
// import "hardhat/console.sol";

//Minimal public implementation of RMRKCore for testing.

error RMRKOnlyIssuer();
error RMRKCoreTransferCallerNotOwnerOrApproved();

contract RMRKNestingMultiResourceMock is RMRKNestingMultiResource {

    address private _issuer;

    constructor(string memory name, string memory symbol)
        RMRKNestingMultiResource(name, symbol)
    {
        _setIssuer(_msgSender());
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 destId,
        bytes calldata data
    ) external {
        _mint(to, tokenId, destId, data);
    }

    //update for reentrancy
    function burn(uint256 tokenId) public {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
            revert RMRKCoreTransferCallerNotOwnerOrApproved();
        _burn(tokenId);
    }

    function onRMRKNestingReceived(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IRMRKNestingReceiver.onRMRKNestingReceived.selector;
    }

    modifier onlyIssuer() {
        if(_msgSender() != _issuer) revert RMRKOnlyIssuer();
        _;
    }

    function setFallbackURI(string memory fallbackURI) external onlyIssuer {
        _setFallbackURI(fallbackURI);
    }

    function setTokenEnumeratedResource(
        uint32 resourceId,
        bool state
    ) external onlyIssuer {
        _setTokenEnumeratedResource(resourceId, state);
    }

    function setIssuer(address issuer) external onlyIssuer {
        _setIssuer(issuer);
    }

    function getIssuer() external view returns (address) {
        return _issuer;
    }

    function addResourceToToken(
        uint256 tokenId,
        uint32 resourceId,
        uint32 overwrites
    ) external onlyIssuer {
        if(ownerOf(tokenId) == address(0))
            revert ERC721OwnerQueryForNonexistentToken();
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        uint32 id,
        string memory metadataURI,
        uint64[] memory custom
    ) external onlyIssuer {
        _addResourceEntry(id, metadataURI, custom);
    }

    function setCustomResourceData(
        uint32 resourceId,
        uint64 customResourceId,
        bytes memory data
    ) external onlyIssuer {
        _setCustomResourceData(resourceId, customResourceId, data);
    }

    function addCustomDataToResource(
        uint32 resourceId,
        uint64 customResourceId
    ) external onlyIssuer {
        _addCustomDataToResource(resourceId, customResourceId);
    }

    function removeCustomDataFromResource(
        uint32 resourceId,
        uint256 index
    ) external onlyIssuer {
        _removeCustomDataFromResource(resourceId, index);
    }

    function _setIssuer(address issuer) private {
        _issuer = issuer;
    }
}
