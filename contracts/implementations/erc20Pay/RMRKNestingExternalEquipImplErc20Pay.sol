// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/equippable/RMRKNestingExternalEquip.sol";
import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtilsErc20Pay.sol";

error RMRKMintZero();
error RMRKNotEnoughAllowance();

contract RMRKNestingExternalEquipImplErc20Pay is
    RMRKMintingUtilsErc20Pay,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKNestingExternalEquip
{
    struct InitData {
        address tokenAddress; // 20 bytes
        uint64 maxSupply; // 8 bytes
        uint16 royaltyPercentageBps; // 2 bytes
        // 30 bytes so far
        address royaltyRecipient; // 20 bytes
        uint96 pricePerMint; //  12 bytes
        // another 32 bytes
        address equippableAddress;
        // another 32 bytes
    }

    address _equippableAddress;
    string private _tokenURI;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory collectionMetadata_,
        string memory tokenURI_,
        InitData memory data
    )
        RMRKNestingExternalEquip(name_, symbol_)
        RMRKMintingUtilsErc20Pay(
            data.tokenAddress,
            data.maxSupply,
            data.pricePerMint
        )
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(data.royaltyRecipient, data.royaltyPercentageBps)
    {
        // Can't add an equippable deployment here due to contract size, for factory
        // pattern can use OZ clone
        _equippableAddress = data.equippableAddress;
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

        if (
            IERC20(_tokenAddress).allowance(msg.sender, address(this)) <
            mintPriceRequired
        ) revert RMRKNotEnoughAllowance();
        IERC20(_tokenAddress).transferFrom(
            msg.sender,
            address(this),
            mintPriceRequired
        );

        uint256 nextToken = _totalSupply + 1;
        unchecked {
            _totalSupply += numToMint;
        }
        uint256 totalSupplyOffset = _totalSupply + 1;

        return (nextToken, totalSupplyOffset);
    }

    function setEquippableAddress(address equippable)
        external
        onlyOwnerOrContributor
    {
        //TODO: should we add a check if passed address supports IRMRKNestingExternalEquip
        _setEquippableAddress(equippable);
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _tokenURI;
    }

    function updateRoyaltyRecipient(address newRoyaltyRecipient)
        external
        override
    {
        _setRoyaltyRecipient(newRoyaltyRecipient);
    }
}
