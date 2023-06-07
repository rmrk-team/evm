// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IERC20Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidValue();
error InvalidAddress();
error InsufficientBalance();

abstract contract ERC20Holder is IERC20Holder {
    mapping(uint256 tokenId => mapping(address erc20Address => uint256 balance))
        private _balances;

    /**
     * @inheritdoc IERC20Holder
     */
    function balanceOfERC20(
        address erc20Contract,
        uint256 tokenId
    ) external view returns (uint256) {
        return _balances[tokenId][erc20Contract];
    }

    /**
     * @notice Transfer ERC-20 tokens to a specific token
     * @dev The ERC-20 contract must have approved this contract to transfer the ERC-20 tokens
     * @dev The balance MUST be transferred from the message sender
     * @dev Implementers should validate that the msg sender is either the token owner or approved before calling this.
     * @param erc20Contract The ERC-20 contract
     * @param tokenId The token to transfer to
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (value == 0) {
            revert InvalidValue();
        }
        if (to == address(0) || erc20Contract == address(0)) {
            revert InvalidAddress();
        }
        if (_balances[tokenId][erc20Contract] < value) {
            revert InsufficientBalance();
        }
        _beforeTransferERC20FromToken(erc20Contract, tokenId, to, value, data);
        _balances[tokenId][erc20Contract] -= value;

        IERC20(erc20Contract).transfer(to, value);

        emit TransferredERC20(erc20Contract, tokenId, to, value);
        _afterTransferERC20FromToken(erc20Contract, tokenId, to, value, data);
    }

    /**
     * @inheritdoc IERC20Holder
     */
    function transferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        uint256 value,
        bytes memory data
    ) external {
        if (value == 0) {
            revert InvalidValue();
        }
        if (erc20Contract == address(0)) {
            revert InvalidAddress();
        }
        _beforeTransferERC20ToToken(
            erc20Contract,
            tokenId,
            msg.sender,
            value,
            data
        );
        IERC20(erc20Contract).transferFrom(msg.sender, address(this), value);
        _balances[tokenId][erc20Contract] += value;

        emit ReceivedERC20(erc20Contract, tokenId, msg.sender, value);
        _afterTransferERC20ToToken(
            erc20Contract,
            tokenId,
            msg.sender,
            value,
            data
        );
    }

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens to a token
     * @param tokenId The token to transfer from
     * @param from The address to send the ERC-20 tokens from
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        address from,
        uint256 value,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-20 tokens to a token
     * @param tokenId The token to transfer from
     * @param from The address to send the ERC-20 tokens from
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        address from,
        uint256 value,
        bytes memory data
    ) internal virtual {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return type(ERC20Holder).interfaceId == interfaceId;
    }
}
