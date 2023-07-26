// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "../abstract/RMRKAbstractMultiAsset.sol";
import "../utils/RMRKTokenURIEnumerated.sol";
import "./InitDataNativePay.sol";

error RMRKWrongValueSent();

contract RMRKMultiAssetLazyMintNative is
    InitDataNativePay,
    RMRKTokenURIEnumerated,
    RMRKAbstractMultiAsset
{
    uint256 private _pricePerMint;

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        string memory baseTokenURI,
        InitData memory data
    )
        RMRKRoyalties(data.royaltyRecipient, data.royaltyPercentageBps)
        RMRKTokenURIEnumerated(baseTokenURI)
        RMRKImplementationBase(name, symbol, collectionMetadata, data.maxSupply)
    {
        _pricePerMint = data.pricePerMint;
    }

    /**
     * @notice Used to mint the desired number of tokens to the specified address.
     * @dev The `data` value of the `_safeMint` method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address to which to mint the token
     * @param numToMint Number of tokens to mint
     * @return The ID of the first token to be minted in the current minting cycle
     */
    function mint(
        address to,
        uint256 numToMint
    ) public payable virtual returns (uint256) {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(
            numToMint
        );
        _chargeMints(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i, "");
            unchecked {
                ++i;
            }
        }

        return nextToken;
    }

    function _chargeMints(uint256 numToMint) internal {
        uint256 price = numToMint * _pricePerMint;
        if (price != msg.value) revert RMRKWrongValueSent();
    }

    /**
     * @notice Used to retrieve the price per mint.
     * @return The price per mint of a single token expressed in the lowest denomination of a native currency
     */
    function pricePerMint() public view returns (uint256) {
        return _pricePerMint;
    }

    /**
     * @notice Used to withdraw the minting proceedings to a specified address.
     * @dev This function can only be called by the owner.
     * @param to Address to receive the given amount of minting proceedings
     * @param amount The amount to withdraw
     */
    function withdrawRaised(address to, uint256 amount) external onlyOwner {
        _withdraw(to, amount);
    }

    /**
     * @notice Used to withdraw the minting proceedings to a specified address.
     * @param _address Address to receive the given amount of minting proceedings
     * @param _amount The amount to withdraw
     */
    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Transfer failed.");
    }
}
