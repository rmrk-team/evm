// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./AbstractMultiResource.sol";
import "../core/RMRKCore.sol";
import "../library/RMRKErrors.sol";

// import "hardhat/console.sol";

/**
 * @title RMRKMultiResource
 * @author RMRK team
 * @notice Smart contract of the RMRK Multi resource module.
 */
contract RMRKMultiResource is
    IERC165,
    IERC721,
    AbstractMultiResource,
    RMRKCore
{
    using Address for address;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // ------------------- RESOURCES --------------

    // Mapping from token ID to approved address for resources
    mapping(uint256 => address) private _tokenApprovalsForResources;

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

    // ----------------------- MODIFIERS FOR RESOURCES ------------------------

    /**
     * @notice Used to check if the specified address is the owner of the given token or approved by its owner to
     *  manage it.
     * @param user Address of the user being checked
     * @param tokenId ID of the token being checked
     */
    function _isApprovedForResourcesOrOwner(address user, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = ownerOf(tokenId);
        return (user == owner ||
            isApprovedForAllForResources(owner, user) ||
            getApprovedForResources(tokenId) == user);
    }

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the resources on the given token.
     * @dev If the caller is not the owner of the given token or approved by its owner to manage the resources on the
     *  given token, the execution will be reverted.
     * @param tokenId ID of the token being checked
     */
    function _onlyApprovedForResourcesOrOwner(uint256 tokenId) private view {
        if (!_isApprovedForResourcesOrOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedForResourcesOrOwner();
    }

    /**
     * @notice Used to verify that the caller is either the owner of the given token or approved by its owner to manage
     *  the resources on the given token.
     * @param tokenId ID of the token being checked
     */
    modifier onlyApprovedForResourcesOrOwner(uint256 tokenId) {
        _onlyApprovedForResourcesOrOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @notice Initializes the contract by setting a name and a symbol to the token collection.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    constructor(string memory name_, string memory symbol_)
        RMRKCore(name_, symbol_)
    {}

    // ------------------------------- ERC721 ---------------------------------
    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IRMRKMultiResource).interfaceId;
    }

    /**
     * @inheritdoc IERC721
     */
    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) revert ERC721AddressZeroIsNotaValidOwner();
        return _balances[owner];
    }

    /**
     * @inheritdoc IERC721
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert ERC721InvalidTokenId();
        return owner;
    }

    /**
     * @inheritdoc IERC721
     */
    function approve(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert ERC721ApprovalToCurrentOwner();

        if (_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert ERC721ApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }

    /**
     * @inheritdoc IERC721
     */
    function getApproved(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);

        return _tokenApprovals[tokenId];
    }

    /**
     * @inheritdoc IERC721
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @inheritdoc IERC721
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @inheritdoc IERC721
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _transfer(from, to, tokenId);
    }

    /**
     * @inheritdoc IERC721
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @inheritdoc IERC721
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
     * @return bool The boolean value signifying whether the token exists (`true`) or not (`false`)
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
     * @return bool The boolean value indicating whether the `spender` is approved to manage the given token (`true`) or
     *  not (`false`)
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender);
    }

    /**
     * @notice Used to safely mint a token to the specified address.
     * @dev Requirements:
     *
     *  - `tokenId` must not exist.
     *  - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     * @dev Emits a {Transfer} event.
     * @param to Address to which to mint the token
     * @param tokenId ID of the token to mint
     */
    function _safeMint(address to, uint256 tokenId) internal virtual {
        _safeMint(to, tokenId, "");
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
        if (tokenId == 0) revert RMRKIdZeroForbidden();

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
        _approveForResources(address(0), tokenId);

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
        delete _tokenApprovalsForResources[tokenId];

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
     * @return bool Boolean value signifying whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721Received(
                    _msgSender(),
                    from,
                    tokenId,
                    data
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
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

    // ------------------------------- RESOURCES ------------------------------

    /**
     * @notice Used to accept a resource from the pending array of a given token.
     * @dev When the resource is accepted, the last resource in the pending array is moved to its place.
     * @param tokenId ID of the token for which the resource is being accepted
     * @param index Index of the resource in the given token's penoding resources array to accept
     */
    function acceptResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _acceptResource(tokenId, index);
    }

    /**
     * @notice Used to reject a resource from the pending array of a given token.
     * @dev When the resource is rejected, the last resource in the pending array is moved to its place.
     * @param tokenId ID of the token for which the resource is being rejected
     * @param index Index of the resource in the given token's pending resources array to reject
     */
    function rejectResource(uint256 tokenId, uint256 index)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectResource(tokenId, index);
    }

    /**
     * @notice Used to reject all resources from the pending array of a given token.
     * @param tokenId ID of the token for which the pending resources array is being cleared
     */
    function rejectAllResources(uint256 tokenId)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _rejectAllResources(tokenId);
    }

    /**
     * @notice Used to set the priorities of resources in the given token's active resources array.
     * @dev If the array of priorities in not the same length as the active resources array, the execution will be
     *  reverted.
     * @param tokenId ID of the token for which the prioritied are being set
     * @param priorities Array of priorities to apply to the token's resources
     */
    function setPriority(uint256 tokenId, uint16[] calldata priorities)
        public
        virtual
        onlyApprovedForResourcesOrOwner(tokenId)
    {
        _setPriority(tokenId, priorities);
    }

    // ----------------------- APPROVALS FOR RESOURCES ------------------------

    /**
     * @notice Used to grant an approval to an address to manage resources of a given token.
     * @dev If the current owner of the token attempts to grant the approval to self, the execution will be reverted.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval is being given
     */
    function approveForResources(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert RMRKApprovalForResourcesToCurrentOwner();

        if (
            _msgSender() != owner &&
            !isApprovedForAllForResources(owner, _msgSender())
        ) revert RMRKApproveForResourcesCallerIsNotOwnerNorApprovedForAll();
        _approveForResources(to, tokenId);
    }

    /**
     * @notice Used to grant an approval to an address to manage resources of a given token.
     * @param to Address of the account to grant the approval to
     * @param tokenId ID of the token for which the approval is being given
     */
    function _approveForResources(address to, uint256 tokenId)
        internal
        virtual
    {
        _tokenApprovalsForResources[tokenId] = to;
        emit ApprovalForResources(ownerOf(tokenId), to, tokenId);
    }

    /**
     * @notice Used to retrieve the address approved to manage the given token's resources.
     * @dev If the specified token isn't minted, the execution will be reverted.
     * @param tokenId ID of the token for which the approved address is being retrieved
     * @return address Address of the account approved to manage the resources of a given token
     */
    function getApprovedForResources(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);
        return _tokenApprovalsForResources[tokenId];
    }
}
