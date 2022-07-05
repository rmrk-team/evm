// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./abstracts/MultiResourceAbstract.sol";
import "./interfaces/IRMRKMultiResource.sol";
import "./library/RMRKLib.sol";
import "./standard/ERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract RMRKMultiResource is ERC721, MultiResourceAbstract {

    using RMRKLib for uint256;
    using RMRKLib for uint64[];
    using RMRKLib for uint128[];
    using Address for address;
    using Strings for uint256;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    ////////////////////////////////////////
    //        ERC-721 COMPLIANCE
    ////////////////////////////////////////


    function supportsInterface(bytes4 interfaceId) public override virtual view returns (bool) {
        return (
            interfaceId == type(IRMRKMultiResource).interfaceId ||
            super.supportsInterface(interfaceId)
        );
    }



    function tokenURI(uint256 tokenId) public view virtual override(ERC721, MultiResourceAbstract) returns (string memory) {
        return MultiResourceAbstract.tokenURI(tokenId);
    }


    ////////////////////////////////////////
    //                RESOURCES
    ////////////////////////////////////////


    function acceptResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyApprovedOrOwner(tokenId) {
        // FIXME: clean approvals and test
        _acceptResource(tokenId, index);
    }

    function rejectResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyApprovedOrOwner(tokenId) {
        // FIXME: clean approvals and test
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(
        uint256 tokenId
    ) external virtual onlyApprovedOrOwner(tokenId) {
        // FIXME: clean approvals and test
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual onlyApprovedOrOwner(tokenId) {
        // FIXME: clean approvals and test
        _setPriority(tokenId, priorities);
    }

}
