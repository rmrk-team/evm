// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IERC20Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidValue();
error InvalidAddress();
error InsufficientBalance();

abstract contract ERC20Holder is IERC20Holder {
    mapping(uint256 tokenId => mapping(address erc20address => uint256 balance)) private balances;

    /**
     * @inheritdoc IERC20Holder
     */
    function balanceOfERC20(
        address erc20Contract,
        uint256 tokenId
    ) external view returns (uint256) {
        return balances[tokenId][erc20Contract];
    }

    /**
     * @inheritdoc IERC20Holder
     */
    function transferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value
    ) external {
        if (value == 0) {
            revert InvalidValue();
        }
        if (to == address(0) || erc20Contract == address(0)) {
            revert InvalidAddress();
        }
        if (balances[tokenId][erc20Contract] < value) {
            revert InsufficientBalance();
        }
        _beforeTransferERC20FromToken(erc20Contract, tokenId, to, value);
        balances[tokenId][erc20Contract] -= value;

        emit TransferredERC20(erc20Contract, tokenId, to, value);
        _afterTransferERC20FromToken(erc20Contract, tokenId, to, value);
    }

    /**
     * @inheritdoc IERC20Holder
     */
    function transferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        uint256 value
    ) external {
        if (value == 0) {
            revert InvalidValue();
        }
        if (erc20Contract == address(0)) {
            revert InvalidAddress();
        }
        _beforeTransferERC20ToToken(erc20Contract, tokenId, msg.sender, value);
        IERC20(erc20Contract).transferFrom(msg.sender, address(this), value);
        balances[tokenId][erc20Contract] += value;

        emit ReceivedERC20(erc20Contract, tokenId, msg.sender, value);
        _afterTransferERC20ToToken(erc20Contract, tokenId, msg.sender, value);
    }

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     */
    function _beforeTransferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     */
    function _afterTransferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 value
    ) internal virtual {}

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens to a token
     * @param tokenId The token to transfer from
     * @param from The address to send the ERC-20 tokens from
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     */
    function _beforeTransferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        address from,
        uint256 value
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-20 tokens to a token
     * @param tokenId The token to transfer from
     * @param from The address to send the ERC-20 tokens from
     * @param erc20Contract The ERC-20 contract
     * @param value The number of ERC-20 tokens to transfer
     */
    function _afterTransferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        address from,
        uint256 value
    ) internal virtual {}
}
