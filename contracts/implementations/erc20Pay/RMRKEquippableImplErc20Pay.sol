// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "../../RMRK/equippable/RMRKEquippable.sol";
import "../../RMRK/extension/RMRKRoyalties.sol";
import "../../RMRK/utils/RMRKCollectionMetadata.sol";
import "../../RMRK/utils/RMRKMintingUtilsErc20Pay.sol";

error RMRKMintZero();
error RMRKNotEnoughAllowance();

contract RMRKEquippableImplErc20Pay is
    RMRKMintingUtilsErc20Pay,
    RMRKCollectionMetadata,
    RMRKRoyalties,
    RMRKEquippable
{
    struct InitData {
        address tokenAddress; // 20 bytes
        uint64 maxSupply; // 8 bytes
        uint16 royaltyPercentageBps; // 2 bytes
        // 30 bytes so far
        address royaltyRecipient; // 20 bytes
        uint96 pricePerMint; //  12 bytes
        // another 32 bytes
    }

    uint256 private _totalResources;
    string private _tokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata_,
        string memory tokenURI_,
        InitData memory data
    )
        RMRKEquippable(name, symbol)
        RMRKMintingUtilsErc20Pay(
            data.tokenAddress,
            data.maxSupply,
            data.pricePerMint
        )
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKRoyalties(data.royaltyRecipient, data.royaltyPercentageBps)
    {
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

    function addResourceToToken(
        uint256 tokenId,
        uint64 resourceId,
        uint64 overwrites
    ) external onlyOwnerOrContributor {
        _addResourceToToken(tokenId, resourceId, overwrites);
    }

    function addResourceEntry(
        ExtendedResource calldata resource,
        uint64[] calldata fixedPartIds,
        uint64[] calldata slotPartIds
    ) external onlyOwnerOrContributor {
        unchecked {
            _totalResources += 1;
        }
        _addResourceEntry(resource, fixedPartIds, slotPartIds);
    }

    function setValidParentForEquippableGroup(
        uint64 equippableGroupId,
        address parentAddress,
        uint64 partId
    ) external onlyOwnerOrContributor {
        _setValidParentForEquippableGroup(
            equippableGroupId,
            parentAddress,
            partId
        );
    }

    function totalResources() external view returns (uint256) {
        return _totalResources;
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
