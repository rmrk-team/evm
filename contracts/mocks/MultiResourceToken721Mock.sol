// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "../RMRK/MultiResourceToken721.sol";

contract MultiResourceToken721Mock is MultiResourceToken721 {

    address private _issuer;

    constructor(string memory name, string memory symbol)
        MultiResourceToken721(name, symbol)
    {
        _setIssuer(_msgSender());
    }

    modifier onlyIssuer() {
        require(_msgSender() == _issuer, "RMRK: Only issuer");
        _;
    }

    function setFallbackURI(string memory fallbackURI) external onlyIssuer {
        _setFallbackURI(fallbackURI);
    }

    function setTokenEnumeratedResource(
        bytes8 resourceId,
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

    function mint(address to, uint256 tokenId) external onlyIssuer {
        _mint(to, tokenId);
    }

    function addResourceToToken(
        uint256 tokenId,
        bytes8 resourceId,
        bytes8 overwrites
    ) external onlyIssuer {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        bytes8 id,
        string memory src,
        string memory thumb,
        string memory metadataURI,
        bytes16[] memory custom
    ) external onlyIssuer {
        _addResourceEntry(id, src, thumb, metadataURI, custom);
    }

    function setCustomResourceData(
        bytes8 resourceId,
        bytes16 customResourceId,
        bytes memory data
    ) external onlyIssuer {
        _setCustomResourceData(resourceId, customResourceId, data);
    }

    function addCustomDataToResource(
        bytes8 resourceId,
        bytes16 customResourceId
    ) external onlyIssuer {
        _addCustomDataToResource(resourceId, customResourceId);
    }

    function removeCustomDataFromResource(
        bytes8 resourceId,
        uint256 index
    ) external onlyIssuer {
        _removeCustomDataFromResource(resourceId, index);
    }

    function _setIssuer(address issuer) private {
        _issuer = issuer;
    }

}
