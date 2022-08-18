// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.15;

import "../RMRK/access/OwnableLock.sol";
import "../RMRK/utils/RMRKMintingUtils.sol";
import "../RMRK/interfaces/IRMRKNestingReceiver.sol";
import "../RMRK/interfaces/IRMRKNestingWithEquippable.sol";
import "../RMRK/RMRKNestingWithEquippable.sol";

error RMRKMintUnderpriced();
error RMRKMintZero();

//Minimal public implementation of IRMRKNesting for testing.
contract RMRKNestingWithEquippableImpl is OwnableLock, RMRKMintingUtils, IRMRKNestingReceiver, RMRKNestingWithEquippable {

    address _equippableAddress;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 pricePerMint_,
        address equippableAddress_
    )
    RMRKNestingWithEquippable(name_, symbol_)
    RMRKMintingUtils(maxSupply_, pricePerMint_)
    {
        // Can't add an equippable deployment here due to contract size, for factory
        // pattern can use OZ clone
        _equippableAddress = equippableAddress_;
    }
    /*
    Template minting logic
    */
    function mint(address to, uint256 numToMint) external payable saleIsOpen notLocked {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        if (mintPriceRequired != msg.value) 
            revert RMRKMintUnderpriced();

        uint256 nextToken = _totalSupply+1;
        _totalSupply += numToMint;
        uint256 totalSupplyOffset = _totalSupply+1;

        for(uint i = nextToken; i < totalSupplyOffset;) {
            _safeMint(to, i);
            unchecked {++i;}
        }
    }

    /*
    Template minting logic
    */
    function mintNesting(address to, uint256 numToMint, uint256 destinationId) external payable saleIsOpen notLocked {
        if (numToMint == uint256(0)) revert RMRKMintZero();
        if (numToMint + _totalSupply > _maxSupply) revert RMRKMintOverMax();

        uint256 mintPriceRequired = numToMint * _pricePerMint;
        if (mintPriceRequired != msg.value)
            revert RMRKMintUnderpriced();

        uint256 nextToken = _totalSupply+1;
        _totalSupply += numToMint;
        uint256 totalSupplyOffset = _totalSupply+1;

        for(uint i = nextToken; i < totalSupplyOffset;) {
            _safeMintNesting(to, i, destinationId);
            unchecked {++i;}
        }
    }

    //update for reentrancy
    function burn(uint256 tokenId) public onlyApprovedOrDirectOwner(tokenId) {
        _burn(tokenId);
    }

    function setEquippableAddress(address equippable) external {
        _setEquippableAddress(equippable);
    }

    function onRMRKNestingReceived(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IRMRKNestingReceiver.onRMRKNestingReceived.selector;
    }

    function transfer(
        address to,
        uint256 tokenId
    ) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId);
    }
}
