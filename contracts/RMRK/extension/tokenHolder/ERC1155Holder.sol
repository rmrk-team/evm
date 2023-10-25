// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "./IERC1155Holder.sol";
import "./HolderErrors.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

abstract contract ERC1155Holder is IERC1155Holder {
    mapping(uint256 tokenHolderId => mapping(address erc1155Address => mapping(uint256 tokenHeldId => uint256 balance)))
        private _balances;
    mapping(uint256 tokenHolderId => uint256 nonce)
        private _erc1155TransferOutNonce;

    /**
     * @inheritdoc IERC1155Holder
     */
    function balanceOfERC1155(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenHeldId
    ) external view returns (uint256) {
        return _balances[tokenHolderId][erc1155Contract][tokenHeldId];
    }

    /**
     * @notice Transfer ERC-1155 tokens from a specific token
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.
     * @param erc1155Contract The ERC-1155 contract
     * @param tokenHolderId The token to transfer from
     * @param tokenToTransferId The ID of the held token being sent
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferHeldERC1155FromToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal {
        if (amount == 0) {
            revert InvalidValue();
        }
        if (to == address(0) || erc1155Contract == address(0)) {
            revert InvalidAddress();
        }
        if (
            _balances[tokenHolderId][erc1155Contract][tokenToTransferId] <
            amount
        ) {
            revert InsufficientBalance();
        }
        _beforeTransferHeldERC1155FromToken(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            amount,
            data
        );
        _balances[tokenHolderId][erc1155Contract][tokenToTransferId] -= amount;

        IERC1155(erc1155Contract).safeTransferFrom(
            address(this),
            to,
            tokenToTransferId,
            amount,
            data
        );

        emit TransferredERC1155(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            amount
        );
        _afterTransferHeldERC1155FromToken(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            amount,
            data
        );
    }

    /**
     * @inheritdoc IERC1155Holder
     */
    function transferERC1155ToToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        uint256 amount,
        bytes memory data
    ) external {
        if (amount == 0) {
            revert InvalidValue();
        }
        if (erc1155Contract == address(0)) {
            revert InvalidAddress();
        }
        _beforeTransferERC1155ToToken(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            msg.sender,
            amount,
            data
        );
        IERC1155(erc1155Contract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenToTransferId,
            amount,
            data
        );
        _balances[tokenHolderId][erc1155Contract][tokenToTransferId] += amount;

        emit ReceivedERC1155(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            msg.sender,
            amount
        );
        _afterTransferERC1155ToToken(
            erc1155Contract,
            tokenHolderId,
            tokenToTransferId,
            msg.sender,
            amount,
            data
        );
    }

    /**
     * @inheritdoc IERC1155Holder
     */
    function erc1155TransferOutNonce(
        uint256 tokenId
    ) external view returns (uint256) {
        return _erc1155TransferOutNonce[tokenId];
    }

    /**
     * @notice Hook that is called before any transfer of ERC-1155 tokens from a token
     * @param tokenHolderId The token to transfer from
     * @param tokenToTransferId The ID of the held token being sent
     * @param to The address to send the ERC-1155 tokens to
     * @param erc1155Contract The ERC-1155 contract
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferHeldERC1155FromToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-1155 tokens from a token
     * @param tokenHolderId The token to transfer from
     * @param tokenToTransferId The ID of the held token being sent
     * @param to The address to send the ERC-1155 tokens to
     * @param erc1155Contract The ERC-1155 contract
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferHeldERC1155FromToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called before any transfer of ERC-1155 tokens to a token
     * @param tokenHolderId The token to transfer to
     * @param tokenToTransferId The ID of the held token being received
     * @param from The address to send the ERC-1155 tokens from
     * @param erc1155Contract The ERC-1155 contract
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferERC1155ToToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-1155 tokens to a token
     * @param tokenHolderId The token to transfer to
     * @param tokenToTransferId The ID of the held token being received
     * @param from The address to send the ERC-1155 tokens from
     * @param erc1155Contract The ERC-1155 contract
     * @param amount The number of ERC-1155 tokens to transfer
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferERC1155ToToken(
        address erc1155Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return type(IERC1155Holder).interfaceId == interfaceId;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }
}
