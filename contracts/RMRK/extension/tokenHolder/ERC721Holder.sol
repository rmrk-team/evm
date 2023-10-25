// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import "./IERC721Holder.sol";
import "./HolderErrors.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract ERC721Holder is IERC721Holder {
    mapping(uint256 tokenHolderId => mapping(address erc721Address => mapping(uint256 tokenHeldId => uint256 balance)))
        private _balances;
    mapping(uint256 tokenHolderId => uint256 nonce)
        private _erc721TransferOutNonce;

    /**
     * @inheritdoc IERC721Holder
     */
    function balanceOfERC721(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenHeldId
    ) external view returns (uint256) {
        return _balances[tokenHolderId][erc721Contract][tokenHeldId];
    }

    /**
     * @notice Transfer ERC-721 tokens from a specific token
     * @dev The balance MUST be transferred from this smart contract.
     * @dev Implementers should validate that the `msg.sender` is either the token owner or approved to manage it before calling this.
     * @param erc721Contract The ERC-721 contract
     * @param tokenHolderId The token to transfer from
     * @param tokenToTransferId The ID of the held token being sent
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _transferHeldERC721FromToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        bytes memory data
    ) internal {
        if (to == address(0) || erc721Contract == address(0)) {
            revert InvalidAddress();
        }
        if (_balances[tokenHolderId][erc721Contract][tokenToTransferId] == 0) {
            revert TokenNotHeld();
        }
        _beforeTransferHeldERC721FromToken(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            data
        );
        _balances[tokenHolderId][erc721Contract][tokenToTransferId] = 0;
        _erc721TransferOutNonce[tokenHolderId]++;

        IERC721(erc721Contract).safeTransferFrom(
            address(this),
            to,
            tokenToTransferId,
            data
        );

        emit TransferredERC721(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            to
        );
        _afterTransferHeldERC721FromToken(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            to,
            data
        );
    }

    /**
     * @inheritdoc IERC721Holder
     */
    function transferERC721ToToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        bytes memory data
    ) external {
        if (erc721Contract == address(0)) {
            revert InvalidAddress();
        }
        _beforeTransferERC721ToToken(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            msg.sender,
            data
        );
        IERC721(erc721Contract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenToTransferId,
            data
        );
        _balances[tokenHolderId][erc721Contract][tokenToTransferId] = 1;

        emit ReceivedERC721(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            msg.sender
        );
        _afterTransferERC721ToToken(
            erc721Contract,
            tokenHolderId,
            tokenToTransferId,
            msg.sender,
            data
        );
    }

    /**
     * @inheritdoc IERC721Holder
     */
    function erc721TransferOutNonce(
        uint256 tokenId
    ) external view returns (uint256) {
        return _erc721TransferOutNonce[tokenId];
    }

    /**
     * @notice Hook that is called before any transfer of ERC-721 tokens from a token
     * @param tokenHolderId The token to transfer from
     * @param tokenToTransferId The ID of the held token being sent
     * @param to The address to send the ERC-721 tokens to
     * @param erc721Contract The ERC-721 contract
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferHeldERC721FromToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-721 tokens from a token
     * @param tokenHolderId The token to transfer from
     * @param tokenToTransferId The ID of the held token being sent
     * @param to The address to send the ERC-721 tokens to
     * @param erc721Contract The ERC-721 contract
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferHeldERC721FromToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address to,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called before any transfer of ERC-721 tokens to a token
     * @param tokenHolderId The token to transfer to
     * @param tokenToTransferId The ID of the held token being received
     * @param from The address to send the ERC-721 tokens from
     * @param erc721Contract The ERC-721 contract
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _beforeTransferERC721ToToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address from,
        bytes memory data
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of ERC-721 tokens to a token
     * @param tokenHolderId The token to transfer to
     * @param tokenToTransferId The ID of the held token being received
     * @param from The address to send the ERC-721 tokens from
     * @param erc721Contract The ERC-721 contract
     * @param data Additional data with no specified format, to allow for custom logic
     */
    function _afterTransferERC721ToToken(
        address erc721Contract,
        uint256 tokenHolderId,
        uint256 tokenToTransferId,
        address from,
        bytes memory data
    ) internal virtual {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return type(IERC721Holder).interfaceId == interfaceId;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
