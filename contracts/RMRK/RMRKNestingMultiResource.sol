// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./RMRKNesting.sol";
import "./abstracts/MultiResourceAbstract.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";

contract RMRKNestingMultiResource is MultiResourceAbstract, RMRKNesting {
    using RMRKLib for uint256;
    using Address for address;
    using Strings for uint256;

    constructor(string memory name_, string memory symbol_)
        RMRKNesting(name_, symbol_){}

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
    
    function supportsInterface(bytes4 interfaceId) public override virtual view returns (bool) {
        return (
            RMRKNesting.supportsInterface(interfaceId) ||
            interfaceId == type(IRMRKMultiResource).interfaceId
        );
    }

    function acceptResource(uint256 tokenId, uint256 index) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _rejectAllResources(tokenId);
    }

    function setPriority(uint256 tokenId, uint16[] memory priorities) external virtual onlyApprovedForResourcesOrOwner(tokenId) {
        _setPriority(tokenId, priorities);
    }

    function tokenURI(uint256 tokenId) public view override(
            RMRKNesting,
            MultiResourceAbstract
        ) returns (string memory) {
        return _tokenURIAtIndex(tokenId, 0);
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

    function _cleanApprovals(address owner, uint256 tokenId) internal override virtual {
        _approveForResources(owner, address(0), tokenId);
    }

    // Other

    function _requireMinted(uint256 tokenId) internal view virtual override(RMRKNesting, MultiResourceAbstract) {
        RMRKNesting._requireMinted(tokenId);
    }

    function _exists(uint256 tokenId) internal view virtual override(RMRKNesting, MultiResourceAbstract) returns (bool) {
        return RMRKNesting._exists(tokenId);
    }

    function _baseURI() internal view override(RMRKNesting, MultiResourceAbstract) virtual returns (string memory) {
        return "";
    }
}