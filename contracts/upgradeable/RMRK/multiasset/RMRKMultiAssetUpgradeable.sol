// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "./AbstractMultiAssetUpgradeable.sol";
import "../core/RMRKCoreUpgradeable.sol";
import "../../../RMRK/library/RMRKErrors.sol";

/**
 * @title RMRKMultiAssetUpgradeable
 * @author RMRK team
 * @notice Smart contract of the upgradeable RMRK Multi asset module.
 */
contract RMRKMultiAssetUpgradeable is
    IERC165Upgradeable,
    IERC721Upgradeable,
    AbstractMultiAssetUpgradeable,
    RMRKCoreUpgradeable
{
    using AddressUpgradeable for address;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // ------------------- ASSETS --------------

    // Mapping from token ID to approved address for assets
    mapping(uint256 => address) private _tokenApprovalsForAssets;

    // -------------------------- ERC721 MODIFIERS ----------------------------

    /**
     * @notice Used to verify that the caller is the owner of the given token or approved by its owner to manage it.
     * @dev If the caller is not the owner or approved by the owner, the execution is reverted.
     * @param tokenId ID of the token being checked
     */
    function _onlyApprovedOrOwner(uint256 tokenId) private view {
        if (!_isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
    }

    /**
     * @notice Used to verify that the caller is the owner of the given token or approved by its owner to manage it.
     * @param tokenId ID of the token being checked
     */
    modifier onlyApprovedOrOwner(uint256 tokenId) {
        _onlyApprovedOrOwner(tokenId);
        _;
    }

    // ----------------------- MODIFIERS FOR ASSETS ------------------------

    /**
     * @notice Internal function to check whether the queried user is either:
     *   1. The root owner of the token associated with `tokenId`.
     *   2. Is approved for all assets of the current owner via the `setApprovalForAllForAssets` function.
     *   3. Is granted approval for the specific tokenId for asset management via the `approveForAssets` function.
     * @param user Address of the user we are checking for permission
     * @param tokenId ID of the token to query for permission for a given `user`
     * @return A boolean value indicating whether the user is approved to manage the token or not
     */
    function _isApprovedForAssetsOrOwner(
        address user,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
        return (user == owner ||
            isApprovedForAllForAssets(owner, user) ||
            getApprovedForAssets(tokenId) == user);
    }

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the assets on the given token.
     * @dev If the caller is not the owner of the given token or approved by its owner to manage the assets on the
     *  given token, the execution will be reverted.
     * @param tokenId ID of the token being checked
     */
    function _onlyApprovedForAssetsOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForAssetsOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForAssetsOrOwner();
    }

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the assets on the given token.
     * @param tokenId ID of the token being checked
     */
    modifier onlyApprovedForAssetsOrOwner(uint256 tokenId) {
        _onlyApprovedForAssetsOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @notice Initializes the contract and the inherited contracts.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    function __RMRKMultiAssetUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __RMRKMultiAssetUpgradeable_init_unchained();
        __AbstractMultiAssetUpgradeable_init();
        __RMRKCoreUpgradeable_init(name_, symbol_);
    }

    /**
     * @notice Initializes the contract without the inherited contracts.
     */
    function __RMRKMultiAssetUpgradeable_init_unchained()
        internal
        onlyInitializing
    {}

    // ------------------------------- ERC721 ---------------------------------
    /**
     * @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, IERC165Upgradeable) returns (bool) {
        return
            interfaceId == type(IERC165Upgradeable).interfaceId ||
            interfaceId == type(IERC721Upgradeable).interfaceId ||
            interfaceId == type(IERC721MetadataUpgradeable).interfaceId ||
            interfaceId == type(IERC5773).interfaceId;
    }

    /**
     * @notice Used to retrieve the number of tokens in ``owner``'s account.
     * @param owner Address of the account being checked
     * @return The balance of the given account
     */
    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) revert ERC721AddressZeroIsNotaValidOwner();
        return _balances[owner];
    }

    /**
     * @notice Used to retrieve the owner of the given token.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @param tokenId ID of the token for which to retrieve the token for
     * @return Address of the account owning the token
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert ERC721InvalidTokenId();
        return owner;
    }

    /**
     * @notice Used to grant a one-time approval to manage one's token.
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * @dev The approval is cleared when the token is transferred.
     * @dev Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     * @dev Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     * @dev Emits an {Approval} event.
     * @param to Address receiving the approval
     * @param tokenId ID of the token for which the approval is being granted
     */
    function approve(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert ERC721ApprovalToCurrentOwner();

        if (_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert ERC721ApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }

    /**
     * @notice Used to retrieve the account approved to manage given token.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @param tokenId ID of the token to check for approval
     * @return Address of the account approved to manage the token
     */
    function getApproved(
        uint256 tokenId
    ) public view virtual returns (address) {
        _requireMinted(tokenId);

        return _tokenApprovals[tokenId];
    }

    /**
     * @notice Used to approve or remove `operator` as an operator for the caller.
     * @dev Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     * @dev Requirements:
     *
     * - The `operator` cannot be the caller.
     * @dev Emits an {ApprovalForAll} event.
     * @param operator Address of the operator being managed
     * @param approved A boolean value signifying whether the approval is being granted (`true`) or (`revoked`)
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @notice Used to check if the given address is allowed to manage the tokens of the specified address.
     * @param owner Address of the owner of the tokens
     * @param operator Address being checked for approval
     * @return A boolean value signifying whether the *operator* is allowed to manage the tokens of the *owner* (`true`)
     *  or not (`false`)
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) public view virtual returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @notice Transfers a given token from `from` to `to`.
     * @dev Requirements:
     *
     *  - `from` cannot be the zero address.
     *  - `to` cannot be the zero address.
     *  - `tokenId` token must be owned by `from`.
     *  - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * @dev Emits a {Transfer} event.
     * @param from Address from which to transfer the token from
     * @param to Address to which to transfer the token to
     * @param tokenId ID of the token to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _transfer(from, to, tokenId);
    }

    /**
     * @notice Used to safely transfer a given token token from `from` to `to`.
     * @dev Requirements:
     *
     *  - `from` cannot be the zero address.
     *  - `to` cannot be the zero address.
     *  - `tokenId` token must exist and be owned by `from`.
     *  - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *  - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     * @dev Emits a {Transfer} event.
     * @param from Address to transfer the tokens from
     * @param to Address to transfer the tokens to
     * @param tokenId ID of the token to transfer
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @notice Used to safely transfer a given token token from `from` to `to`.
     * @dev Requirements:
     *
     *  - `from` cannot be the zero address.
     *  - `to` cannot be the zero address.
     *  - `tokenId` token must exist and be owned by `from`.
     *  - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *  - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     * @dev Emits a {Transfer} event.
     * @param from Address to transfer the tokens from
     * @param to Address to transfer the tokens to
     * @param tokenId ID of the token to transfer
     * @param data Additional data without a specified format to be sent along with the token transaction
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _safeTransfer(from, to, tokenId, data);
    }

    /**
     * @notice Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients are aware
     *  of the ERC721 protocol to prevent tokens from being forever locked.
     * @dev `data` is additional data, it has no specified format and it is sent in call to `to`.
     * @dev This internal function is equivalent to {safeTransferFrom}, and can be used to e.g. implement alternative
     *  mechanisms to perform token transfer, such as signature-based.
     * @dev Requirements:
     *
     *  - `from` cannot be the zero address.
     *  - `to` cannot be the zero address.
     *  - `tokenId` token must exist and be owned by `from`.
     *  - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     * @dev Emits a {Transfer} event.
     * @param from Address from which to send the token from
     * @param to Address to which to send the token to
     * @param tokenId ID of the token to be sent
     * @param data Additional data to send with the tokens
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _transfer(from, to, tokenId);
        if (!_checkOnERC721Received(from, to, tokenId, data))
            revert ERC721TransferToNonReceiverImplementer();
    }

    /**
     * @notice Used to check whether the given token exists.
     * @dev Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     * @dev Tokens start existing when they are minted (`_mint`) and stop existing when they are burned (`_burn`).
     * @param tokenId ID of the token being checked
     * @return A boolean value signifying whether the token exists
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }

    /**
     * @notice Used to check whether the given account is allowed to manage the given token.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @param spender Address that is being checked for approval
     * @param tokenId ID of the token being checked
     * @return A boolean value indicating whether the `spender` is approved to manage the given token
     */
    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender);
    }

    /**
     * @notice Used to safely mint the token to the specified address while passing the additional data to contract
     *  recipients.
     * @param to Address to which to mint the token.
     * @param tokenId ID of the token to mint
     * @param data Additional data to send with the tokens
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _mint(to, tokenId);
        if (!_checkOnERC721Received(address(0), to, tokenId, data))
            revert ERC721TransferToNonReceiverImplementer();
    }

    /**
     * @notice Used to mint a specified token to a given address.
     * @dev WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible.
     * @dev Requirements:
     *
     *  - `tokenId` must not exist.
     *  - `to` cannot be the zero address.
     * @dev Emits a {Transfer} event.
     * @param to Address to mint the token to
     * @param tokenId ID of the token to mint
     */
    function _mint(address to, uint256 tokenId) internal virtual {
        if (to == address(0)) revert ERC721MintToTheZeroAddress();
        if (_exists(tokenId)) revert ERC721TokenAlreadyMinted();
        if (tokenId == uint256(0)) revert RMRKIdZeroForbidden();

        _beforeTokenTransfer(address(0), to, tokenId);

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }

    /**
     * @notice Used to destroy the specified token.
     * @dev The approval is cleared when the token is burned.
     * @dev Requirements:
     *
     *  - `tokenId` must exist.
     * @dev Emits a {Transfer} event.
     * @param tokenId ID of the token to burn
     */
    function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);
        _approveForAssets(address(0), tokenId);

        _balances[owner] -= 1;
        delete _owners[tokenId];

        emit Transfer(owner, address(0), tokenId);

        _afterTokenTransfer(owner, address(0), tokenId);
    }

    /**
     * @notice Used to transfer the specified token from one user to another.
     * @dev As opposed to {transferFrom}, this imposes no restrictions on `msg.sender`.
     * @dev Requirements:
     *
     *  - `to` cannot be the zero address.
     *  - `tokenId` token must be owned by `from`.
     * @dev Emits a {Transfer} event.
     * @param from Address from which to transfer the token
     * @param to Address to which to transfer the token
     * @param tokenId ID of the token to transfer
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        if (ownerOf(tokenId) != from) revert ERC721TransferFromIncorrectOwner();
        if (to == address(0)) revert ERC721TransferToTheZeroAddress();

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        delete _tokenApprovals[tokenId];
        delete _tokenApprovalsForAssets[tokenId];

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
    }

    /**
     * @notice Used to grant an approval to an address to manage the given token.
     * @dev Emits an {Approval} event.
     * @param to Address receiveing the approval
     * @param tokenId ID of the token that the approval is being granted for
     */
    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    /**
     * @notice Used to manage an approval to an address to manage all of the tokens of the user.
     * @dev If the user attempts to grant the approval to themselves, the execution is reverted.
     * @dev Emits an {ApprovalForAll} event.
     * @param owner Address of the account for which the approval is being granted
     * @param operator Address receiving approval to manage all of the tokens of the `owner`
     * @param approved Boolean value signifying whether
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        if (owner == operator) revert ERC721ApproveToCaller();
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @notice Used to verify thet the token has been minted.
     * @dev The token is considered minted if its owner is not the `0x0` address.
     * @dev This function doesn't output any feedback about the token existing, but it reverts if the token doesn't
     *  exist.
     * @param tokenId ID of the token being checked
     */
    function _requireMinted(uint256 tokenId) internal view virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();
    }

    /**
     * @notice Used to invoke {IERC721Receiver-onERC721Received} on a target address.
     * @dev The call is not executed if the target address is not a contract.
     * @param from Address representing the previous owner of the given token
     * @param to Yarget address that will receive the tokens
     * @param tokenId ID of the token to be transferred
     * @param data Optional data to send along with the call
     * @return Boolean value signifying whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721ReceiverUpgradeable(to).onERC721Received(
                    _msgSender(),
                    from,
                    tokenId,
                    data
                )
            returns (bytes4 retval) {
                return
                    retval ==
                    IERC721ReceiverUpgradeable.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == uint256(0)) {
                    revert ERC721TransferToNonReceiverImplementer();
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    // ------------------------------- ASSETS ------------------------------

    /**
     * @inheritdoc IERC5773
     */
    function acceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _acceptAsset(tokenId, index, assetId);
    }

    /**
     * @inheritdoc IERC5773
     */
    function rejectAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _rejectAsset(tokenId, index, assetId);
    }

    /**
     * @inheritdoc IERC5773
     */
    function rejectAllAssets(
        uint256 tokenId,
        uint256 maxRejections
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _rejectAllAssets(tokenId, maxRejections);
    }

    /**
     * @inheritdoc IERC5773
     */
    function setPriority(
        uint256 tokenId,
        uint64[] calldata priorities
    ) public virtual onlyApprovedForAssetsOrOwner(tokenId) {
        _setPriority(tokenId, priorities);
    }

    // ----------------------- APPROVALS FOR ASSETS ------------------------

    /**
     * @inheritdoc IERC5773
     */
    function approveForAssets(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForAssetsToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForAssets(owner, _msgSender())
        ) revert RMRKApproveForAssetsCallerIsNotOwnerNorApprovedForAll();
        _approveForAssets(to, tokenId);
    }

    /**
     * @notice Used to grant an approval to an address to manage assets of a given token.
     * @dev Emits ***ApprovalForAssets*** event.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval is being given
     */
    function _approveForAssets(address to, uint256 tokenId) internal virtual {
        _tokenApprovalsForAssets[tokenId] = to;
        emit ApprovalForAssets(ownerOf(tokenId), to, tokenId);
    }

    /**
     * @inheritdoc IERC5773
     */
    function getApprovedForAssets(
        uint256 tokenId
    ) public view virtual returns (address) {
        _requireMinted(tokenId);
        return _tokenApprovalsForAssets[tokenId];
    }

    uint256[50] private __gap;
}
