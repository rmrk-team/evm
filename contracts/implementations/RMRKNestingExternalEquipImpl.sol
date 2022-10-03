// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/equippable/RMRKNestingExternalEquip.sol";
import "../RMRK/utils/RMRKCollectionMetadata.sol";
import "../RMRK/utils/RMRKMintingUtils.sol";

error RMRKMintUnderpriced();
error RMRKMintZero();

//Minimal public implementation of IRMRKNesting for testing.
contract RMRKNestingExternalEquipImpl is
    RMRKMintingUtils,
    RMRKCollectionMetadata,
    RMRKNestingExternalEquip
{
    address _equippableAddress;
    string private _tokenURI;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 pricePerMint_,
        address equippableAddress_,
        string memory collectionMetadata_,
        string memory tokenURI_
    )
        RMRKNestingExternalEquip(name_, symbol_)
        RMRKMintingUtils(maxSupply_, pricePerMint_)
        RMRKCollectionMetadata(collectionMetadata_)
    {
        // Can't add an equippable deployment here due to contract size, for factory
        // pattern can use OZ clone
        _equippableAddress = equippableAddress_;
        _tokenURI = tokenURI_;
    }

    /*
    Template minting logic
    */
    function mint(address to, uint256 numToMint) external payable saleIsOpen {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i);
            unchecked {
                ++i;
            }
        }
    }

    /*
    Template minting logic
    */
    function mintNesting(
        address to,
        uint256 numToMint,
        uint256 destinationId
    ) external payable saleIsOpen {
        (uint256 nextToken, uint256 totalSupplyOffset) = _preMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _nestMint(to, i, destinationId);
            unchecked {
                ++i;
            }
        }
    }

    function _preMint(uint256 numToMint) private returns (uint256, uint256) {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        if (mintPriceRequired != msg.value) revert RMRKMintUnderpriced();

        uint256 nextToken = _totalSupply + 1;
        unchecked {
            _totalSupply += numToMint;
        }
        uint256 totalSupplyOffset = _totalSupply + 1;

        return (nextToken, totalSupplyOffset);
    }

    function setEquippableAddress(address equippable) external onlyOwnerOrContributor {
        _setEquippableAddress(equippable);
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _tokenURI;
    }
}
