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

    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
        return (user == owner || isApprovedForAllForResources(owner, user) || getApprovedForResources(tokenId) == user);
    }

    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if(!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

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
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _acceptResource(tokenId, index);
    }

    function rejectResource(
        uint256 tokenId,
        uint256 index
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(
        uint256 tokenId
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _setPriority(tokenId, priorities);
    }

    // Approvals

    function approveForResources(address to, uint256 tokenId) external virtual {
        address owner = ownerOf(tokenId);
        if(to == owner)
            revert RMRKApprovalForResourcesToCurrentOwner();

        if(_msgSender() != owner && !isApprovedForAllForResources(owner, _msgSender()))
            revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(owner, to, tokenId);
    }

    function setApprovalForAllForResources(address operator, bool approved) external virtual {
        address owner = _msgSender();
        if(owner == operator)
            revert RMRKApproveForResourcesToCaller();
        _setApprovalForAllForResources(owner, operator, approved);
    }

    // Other

    function _requireMinted(uint256 tokenId) internal view virtual override(ERC721, MultiResourceAbstract) {
        ERC721._requireMinted(tokenId);
    }

    function _exists(uint256 tokenId) internal view virtual override(ERC721, MultiResourceAbstract) returns (bool) {
        return ERC721._exists(tokenId);
    }

}
