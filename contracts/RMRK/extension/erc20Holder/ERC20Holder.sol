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
     * @notice Transfer ERC-20 tokens from a specific token
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.
     * @param erc20Contract The ERC-20 contract
     * @param tokenId The token to transfer from
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferERC20FromToken(
        address erc20Contract,
        uint256 tokenId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal {
        if (amount == 0) {
            revert InvalidValue();
        }
        if (to == address(0) || erc20Contract == address(0)) {
            revert InvalidAddress();
        }
        if (_balances[tokenId][erc20Contract] < amount) {
            revert InsufficientBalance();
        }
        _beforeTransferERC20FromToken(erc20Contract, tokenId, to, amount, data);
        _balances[tokenId][erc20Contract] -= amount;

        IERC20(erc20Contract).transfer(to, amount);

        emit TransferredERC20(erc20Contract, tokenId, to, amount);
        _afterTransferERC20FromToken(erc20Contract, tokenId, to, amount, data);
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
            revert InvalidValue();
        }
        if (erc20Contract == address(0)) {
            revert InvalidAddress();
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
     * @notice Transfer ERC-20 tokens from one token to another
     * @dev ERC-20 tokens are only transferred internally, they never leave this contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage the `fromTokenId` before calling this.
     * @param erc20Contract The ERC-20 contract
     * @param toTokenId The token to transfer from
     * @param toTokenId The token to transfer to
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferERC20BetweenTokens(
        address erc20Contract,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 amount,
        bytes memory data
    ) internal {
        if (amount == 0) {
            revert InvalidValue();
        }
        if (erc20Contract == address(0)) {
            revert InvalidAddress();
        }
        if (_balances[fromTokenId][erc20Contract] < amount) {
            revert InsufficientBalance();
        }
        _beforeTransferERC20FromToken(
            erc20Contract,
            fromTokenId,
            address(this),
            amount,
            data
        );
        _balances[fromTokenId][erc20Contract] -= amount;
        emit TransferredERC20(
            erc20Contract,
            fromTokenId,
            address(this),
            amount
        );

        _afterTransferERC20FromToken(
            erc20Contract,
            fromTokenId,
            address(this),
            amount,
            data
        );

        _beforeTransferERC20ToToken(
            erc20Contract,
            toTokenId,
            address(this),
            amount,
            data
        );
        _balances[toTokenId][erc20Contract] += amount;
        _afterTransferERC20ToToken(
            erc20Contract,
            toTokenId,
            address(this),
            amount,
            data
        );

        emit ReceivedERC20(erc20Contract, toTokenId, address(this), amount);
    }

    /**
     * @notice Hook that is called before any transfer of ERC-20 tokens from a token
     * @param tokenId The token to transfer from
     * @param to The address to send the ERC-20 tokens to
     * @param erc20Contract The ERC-20 contract
     * @param amount The number of ERC-20 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferERC20FromToken(
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
    function _afterTransferERC20FromToken(
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
        return type(ERC20Holder).interfaceId == interfaceId;
    }
}
