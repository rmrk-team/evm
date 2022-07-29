// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "./interfaces/IRMRKEquippable.sol";
import "./RMRKNestingMultiResource.sol";

error RMRKNotParent();
error RMRKNotEquippable();

interface IRMRKRMRKNestingEquippable {
    function markEquipped(uint tokenId, uint64 resourceId, bool equipped) external;
}

contract RMRKNestingEquippable is RMRKNestingMultiResource {

    address private _equippableAddress;

    constructor(address equippableAddress, string memory name, string memory symbol)
    RMRKNestingMultiResource(name, symbol)
    {
        _equippableAddress = equippableAddress;
    }

    //FIXME: Check to make sure this cannot be called from non_RMRK owner
    function _onlyParent(uint256 tokenId) private view {
        (address owner,,bool isNFT) = rmrkOwnerOf(tokenId);
        if(_msgSender() != owner || !isNFT)
            revert RMRKNotParent();
    }

    modifier onlyParent(uint256 tokenId) {
        _onlyParent(tokenId);
        _;
    }

    function _onlyEquippable() private view {
        if(_msgSender() != _equippableAddress)
            revert RMRKNotParent();
    }

    modifier onlyEquippable() {
        _onlyEquippable();
        _;
    }

    function markEquipped(uint tokenId, uint64 resourceId, bool equipped) external onlyParent(tokenId) {
        IRMRKEquippable(_equippableAddress).markEquipped(tokenId, resourceId, equipped);
    }

    function markChildEquipped(
        address childAddress, 
        uint tokenId, 
        uint64 resourceId, 
        bool equipped
    ) external onlyEquippable {
        IRMRKRMRKNestingEquippable(childAddress).markEquipped(tokenId, resourceId, equipped);
    }

}