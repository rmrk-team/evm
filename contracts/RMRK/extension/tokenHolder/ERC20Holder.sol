// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IERC20Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidValueForERC20();
error InvalidAddressForERC20();
error InsufficientBalanceForERC20();

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
     * @notice Transfer ERC-20 tokens from a specific token
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.
     * @param erc20Contract The ERC-20 contract
     * @param tokenId The token to transfer from
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferHeldERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal {
        if (amount == 0) {
            revert InvalidValueForERC20();
        }
        if (to == address(0) || erc20Contract == address(0)) {
            revert InvalidAddressForERC20();
        }
        if (_balances[tokenId][erc20Contract] < amount) {
            revert InsufficientBalanceForERC20();
        }
        _beforeTransferHeldERC20FromToken(
            erc20Contract,
            tokenId,
            to,
            amount,
            data
        );
        _balances[tokenId][erc20Contract] -= amount;

        IERC20(erc20Contract).transfer(to, amount);

        emit TransferredERC20(erc20Contract, tokenId, to, amount);
        _afterTransferHeldERC20FromToken(
            erc20Contract,
            tokenId,
            to,
            amount,
            data
        );
    }

    /**
     * @inheritdoc IERC20Holder
     */
    function transferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external {
        if (amount == 0) {
            revert InvalidValueForERC20();
        }
        if (erc20Contract == address(0)) {
            revert InvalidAddressForERC20();
        }
        _beforeTransferERC20ToToken(
            erc20Contract,
            tokenId,
            msg.sender,
            amount,
            data
        );
        IERC20(erc20Contract).transferFrom(msg.sender, address(this), amount);
        _balances[tokenId][erc20Contract] += amount;

        emit ReceivedERC20(erc20Contract, tokenId, msg.sender, amount);
        _afterTransferERC20ToToken(
            erc20Contract,
            tokenId,
            msg.sender,
            amount,
            data
        );
    }

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferHeldERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferHeldERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens to a token
     * @param tokenId The token to transfer from
     * @param from The address to send the ERC-20 tokens from
     * @param erc20Contract The ERC-20 contract
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-20 tokens to a token
     * @param tokenId The token to transfer from
     * @param from The address to send the ERC-20 tokens from
     * @param erc20Contract The ERC-20 contract
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferERC20ToToken(
        address erc20Contract,
        uint256 tokenId,
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return type(IERC20Holder).interfaceId == interfaceId;
    }
}
