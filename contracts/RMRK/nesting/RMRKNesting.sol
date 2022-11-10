// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.16;

import "./IRMRKNesting.sol";
import "../core/RMRKCore.sol";
import "../library/RMRKLib.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../library/RMRKErrors.sol";

// import "hardhat/console.sol";

/**
 * @dev RMRK nesting implementation. This contract is hierarchy agnostic, and can
 * support an arbitrary number of nested levels up and down, as long as gas limits
 * allow
 *
 */

contract RMRKNesting is Context, IERC165, IERC721, IRMRKNesting, RMRKCore {
    using RMRKLib for uint256;
    using Address for address;
    using Strings for uint256;

    uint256 private constant _MAX_LEVELS_TO_CHECK_FOR_INHERITANCE_LOOP = 100;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approver address to approved address
    // The approver is necessary so approvals are invalidated for nested children on transfer
    // WARNING: If a child NFT returns the original root owner, old permissions would be active again
    mapping(uint256 => mapping(address => address)) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // ------------------- NESTING --------------

    // Mapping from token ID to RMRKOwner struct
    mapping(uint256 => RMRKOwner) private _RMRKOwners;

    // Mapping of tokenId to array of active children structs
    mapping(uint256 => Child[]) internal _activeChildren;

    // Mapping of tokenId to array of pending children structs
    mapping(uint256 => Child[]) internal _pendingChildren;

    // Mapping of child token address to child token Id to whether they are pending or active on any token
    // We might have a first extra mapping from token Id, but since the same child cannot be
    // nested into multiple tokens we can strip it for size/gas savings.
    mapping(address => mapping(uint256 => uint256)) private _childIsInActive;

    // Mapping of tokenId to childAddress to childId to index on the _pendingChildren array
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _pendingChildrenIndex;

    // Mapping of tokenId to childAddress to childId to index on the _activeChildren array
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _activeChildrenIndex;

    // -------------------------- MODIFIERS ----------------------------

    function _onlyApprovedOrOwner(uint256 tokenId) private view {
        if (!_isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        _onlyApprovedOrOwner(tokenId);
        _;
    }

    /**
     * @notice Private function for checking token ownership relative to immediate parent.
     * @dev This does not delegate to ownerOf, which returns the root owner.
     * Reverts if caller is not immediate owner.
     * Used for parent-scoped transfers.
     * @param tokenId tokenId to check owner against.
     */
    function _onlyApprovedOrDirectOwner(uint256 tokenId) private view {
        if (!_isApprovedOrDirectOwner(_msgSender(), tokenId))
            revert RMRKNotApprovedOrDirectOwner();
    }

    modifier onlyApprovedOrDirectOwner(uint256 tokenId) {
        _onlyApprovedOrDirectOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_)
        RMRKCore(name_, symbol_)
    {}

    // ------------------------------- ERC721 ---------------------------------
    /**
     * @dev See {IERC165-supportsInterface}.
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
            interfaceId == type(IRMRKNesting).interfaceId;
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) revert ERC721AddressZeroIsNotaValidOwner();
        return _balances[owner];
    }

    ////////////////////////////////////////
    //              TRANSFERS
    ////////////////////////////////////////

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual onlyApprovedOrDirectOwner(tokenId) {
        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual onlyApprovedOrDirectOwner(tokenId) {
        _safeTransfer(from, to, tokenId, data);
    }

    function nestTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual onlyApprovedOrDirectOwner(tokenId) {
        _nestTransfer(from, to, tokenId, destinationId);
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
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
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        (address immediateOwner, uint256 parentId, ) = rmrkOwnerOf(tokenId);
        if (immediateOwner != from) revert ERC721TransferFromIncorrectOwner();
        if (to == address(0)) revert ERC721TransferToTheZeroAddress();

        _beforeTokenTransfer(from, to, tokenId);
        _beforeNestedTokenTransfer(immediateOwner, to, parentId, 0, tokenId);

        _balances[from] -= 1;
        _updateOwnerAndClearApprovals(tokenId, 0, to, false);
        _balances[to] += 1;

        emit Transfer(from, to, tokenId);
        emit NestTransfer(immediateOwner, to, parentId, 0, tokenId);

        _afterTokenTransfer(from, to, tokenId);
        _afterNestedTokenTransfer(immediateOwner, to, parentId, 0, tokenId);
    }

    function _nestTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal virtual {
        (address immediateOwner, uint256 parentId, ) = rmrkOwnerOf(tokenId);
        if (immediateOwner != from) revert ERC721TransferFromIncorrectOwner();
        if (to == address(0)) revert ERC721TransferToTheZeroAddress();
        if (to == address(this) && tokenId == destinationId)
            revert RMRKNestingTransferToSelf();

        // Destination contract checks:
        // It seems redundant, but otherwise it would revert with no error
        if (!to.isContract()) revert RMRKIsNotContract();
        if (!IERC165(to).supportsInterface(type(IRMRKNesting).interfaceId))
            revert RMRKNestingTransferToNonRMRKNestingImplementer();
        _checkForInheritanceLoop(tokenId, to, destinationId);

        _beforeTokenTransfer(from, to, tokenId);
        _beforeNestedTokenTransfer(
            immediateOwner,
            to,
            parentId,
            destinationId,
            tokenId
        );
        _balances[from] -= 1;
        _updateOwnerAndClearApprovals(tokenId, destinationId, to, true);
        _balances[to] += 1;

        // Sending to NFT:
        _sendToNFT(immediateOwner, to, parentId, destinationId, tokenId);
    }

    function _sendToNFT(
        address from,
        address to,
        uint256 parentId,
        uint256 destinationId,
        uint256 tokenId
    ) private {
        IRMRKNesting destContract = IRMRKNesting(to);
        destContract.addChild(destinationId, tokenId);
        _afterTokenTransfer(from, to, tokenId);
        _afterNestedTokenTransfer(from, to, parentId, destinationId, tokenId);

        emit Transfer(from, to, tokenId);
        emit NestTransfer(from, to, parentId, destinationId, tokenId);
    }

    function _checkForInheritanceLoop(
        uint256 currentId,
        address targetContract,
        uint256 targetId
    ) private view {
        for (uint256 i; i < _MAX_LEVELS_TO_CHECK_FOR_INHERITANCE_LOOP; ) {
            (
                address nextOwner,
                uint256 nextOwnerTokenId,
                bool isNft
            ) = IRMRKNesting(targetContract).rmrkOwnerOf(targetId);
            // If there's a final address, we're good. There's no loop.
            if (!isNft) {
                return;
            }
            // Ff the current nft is an ancestor at some point, there is an inheritance loop
            if (nextOwner == address(this) && nextOwnerTokenId == currentId) {
                revert RMRKNestingTransferToDescendant();
            }
            // We reuse the parameters to save some contract size
            targetContract = nextOwner;
            targetId = nextOwnerTokenId;
            unchecked {
                ++i;
            }
        }
        revert RMRKNestingTooDeep();
    }

    ////////////////////////////////////////
    //              MINTING
    ////////////////////////////////////////

    /**
     * @dev Safely mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal virtual {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
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
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal virtual {
        _innerMint(to, tokenId, 0);

        emit Transfer(address(0), to, tokenId);
        emit NestTransfer(address(0), to, 0, 0, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
        _afterNestedTokenTransfer(address(0), to, 0, 0, tokenId);
    }

    function _nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal virtual {
        // It seems redundant, but otherwise it would revert with no error
        if (!to.isContract()) revert RMRKIsNotContract();
        if (!IERC165(to).supportsInterface(type(IRMRKNesting).interfaceId))
            revert RMRKMintToNonRMRKImplementer();

        _innerMint(to, tokenId, destinationId);
        _sendToNFT(address(0), to, 0, destinationId, tokenId);
    }

    function _innerMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) private {
        if (to == address(0)) revert ERC721MintToTheZeroAddress();
        if (_exists(tokenId)) revert ERC721TokenAlreadyMinted();
        if (tokenId == 0) revert RMRKIdZeroForbidden();

        _beforeTokenTransfer(address(0), to, tokenId);
        _beforeNestedTokenTransfer(address(0), to, 0, destinationId, tokenId);

        _balances[to] += 1;
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: destinationId != 0
        });
    }

    ////////////////////////////////////////
    //              Ownership
    ////////////////////////////////////////

    /**
     * @notice Returns the root owner of the current RMRK NFT.
     * @dev In the event the NFT is owned by another NFT, it will recursively ask the parent.
     */
    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override(IRMRKNesting, IERC721)
        returns (address)
    {
        (address owner, uint256 ownerTokenId, bool isNft) = rmrkOwnerOf(
            tokenId
        );
        if (isNft) {
            owner = IRMRKNesting(owner).ownerOf(ownerTokenId);
        }
        return owner;
    }

    /**
     * @notice Returns the immediate provenance data of the current RMRK NFT.
     * @dev In the event the NFT is owned by a wallet, tokenId will be zero and isNft will be false. Otherwise,
     * the returned data is the contract address and tokenID of the owner NFT, as well as its isNft flag.
     */
    function rmrkOwnerOf(uint256 tokenId)
        public
        view
        virtual
        returns (
            address,
            uint256,
            bool
        )
    {
        RMRKOwner memory owner = _RMRKOwners[tokenId];
        if (owner.ownerAddress == address(0)) revert ERC721InvalidTokenId();

        return (owner.ownerAddress, owner.tokenId, owner.isNft);
    }

    ////////////////////////////////////////
    //              BURNING
    ////////////////////////////////////////

    function burn(uint256 tokenId) public virtual {
        burn(tokenId, 0);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */

    function burn(uint256 tokenId, uint256 maxChildrenBurns)
        public
        virtual
        onlyApprovedOrDirectOwner(tokenId)
        returns (uint256)
    {
        return _burn(tokenId, maxChildrenBurns);
    }

    function _burn(uint256 tokenId, uint256 maxChildrenBurns)
        internal
        virtual
        onlyApprovedOrDirectOwner(tokenId)
        returns (uint256)
    {
        (address immediateOwner, uint256 parentId, ) = rmrkOwnerOf(tokenId);
        address owner = ownerOf(tokenId);
        _balances[immediateOwner] -= 1;

        _beforeTokenTransfer(owner, address(0), tokenId);
        _beforeNestedTokenTransfer(
            immediateOwner,
            address(0),
            parentId,
            0,
            tokenId
        );

        _approve(address(0), tokenId);
        _cleanApprovals(tokenId);

        Child[] memory children = childrenOf(tokenId);

        delete _activeChildren[tokenId];
        delete _pendingChildren[tokenId];
        delete _tokenApprovals[tokenId][owner];

        uint256 pendingRecursiveBurns;
        uint256 totalChildBurns;

        uint256 length = children.length; //gas savings
        for (uint256 i; i < length; ) {
            if (totalChildBurns >= maxChildrenBurns)
                revert RMRKMaxRecursiveBurnsReached(
                    children[i].contractAddress,
                    children[i].tokenId
                );
            delete _childIsInActive[children[i].contractAddress][
                children[i].tokenId
            ];
            unchecked {
                // At this point we know pendingRecursiveBurns must be at least 1
                pendingRecursiveBurns = maxChildrenBurns - totalChildBurns;
            }
            // We substract one to the next level to count for the token being burned, then add it again on returns
            // This is to allow the behavior of 0 recursive burns meaning only the current token is deleted.
            totalChildBurns +=
                IRMRKNesting(children[i].contractAddress).burn(
                    children[i].tokenId,
                    pendingRecursiveBurns - 1
                ) +
                1;
            unchecked {
                ++i;
            }
        }
        // Can't remove before burning child since child will call back to get root owner
        delete _RMRKOwners[tokenId];

        _afterTokenTransfer(owner, address(0), tokenId);
        _afterNestedTokenTransfer(
            immediateOwner,
            address(0),
            parentId,
            0,
            tokenId
        );
        emit Transfer(owner, address(0), tokenId);
        emit NestTransfer(immediateOwner, address(0), parentId, 0, tokenId);

        return totalChildBurns;
    }

    ////////////////////////////////////////
    //              APPROVALS
    ////////////////////////////////////////

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if (to == owner) revert ERC721ApprovalToCurrentOwner();

        if (_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert ERC721ApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        _requireMinted(tokenId);

        return _tokenApprovals[tokenId][ownerOf(tokenId)];
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        if (_msgSender() == operator) revert ERC721ApproveToCaller();
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
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
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits an {Approval} event.
     */
    function _approve(address to, uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        _tokenApprovals[tokenId][owner] = to;
        emit Approval(owner, to, tokenId);
    }

    function _updateOwnerAndClearApprovals(
        uint256 tokenId,
        uint256 destinationId,
        address to,
        bool isNft
    ) internal {
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: isNft
        });

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);
        _cleanApprovals(tokenId);
    }

    function _cleanApprovals(uint256 tokenId) internal virtual {}

    ////////////////////////////////////////
    //              UTILS
    ////////////////////////////////////////

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
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

    function _isApprovedOrDirectOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        (address owner, uint256 parentId, ) = rmrkOwnerOf(tokenId);
        // When the parent is an NFT, only it can do operations
        if (parentId != 0) {
            return (spender == owner);
        }
        // Otherwise, the owner or approved address can
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender);
    }

    /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */

    function _requireMinted(uint256 tokenId) internal view virtual {
        if (!_exists(tokenId)) revert ERC721InvalidTokenId();
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _RMRKOwners[tokenId].ownerAddress != address(0);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
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

    ////////////////////////////////////////
    //      CHILD MANAGEMENT PUBLIC
    ////////////////////////////////////////

    /**
     * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
     * param1 parentId is the tokenId of the parent token on (this).
     * param2 childId is the tokenId of the child instance
     */

    function addChild(uint256 parentId, uint256 childId) public virtual {
        _requireMinted(parentId);

        address childAddress = _msgSender();
        if (!childAddress.isContract()) revert RMRKIsNotContract();

        Child memory child = Child({
            contractAddress: childAddress,
            tokenId: childId
        });

        _beforeAddChild(parentId, childAddress, childId);

        uint256 length = pendingChildrenOf(parentId).length;

        if (length < 128) {
            _pendingChildrenIndex[parentId][childAddress][
                childId
            ] = _pendingChildren[parentId].length;
            _pendingChildren[parentId].push(child);
        } else {
            revert RMRKMaxPendingChildrenReached();
        }

        // Previous length matches the index for the new child
        emit ChildProposed(parentId, length, childAddress, childId);

        _afterAddChild(parentId, childAddress, childId);
    }

    /**
     * @notice Sends an instance of Child from the pending children array at index to children array for tokenId.
     * @param parentId tokenId of parent token to accept a child on
     * @param childAddress address of the child contract
     * @param childId token Id of the child
     */
    function acceptChild(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) public virtual onlyApprovedOrOwner(parentId) {
        _acceptChild(parentId, childAddress, childId);
    }

    function _acceptChild(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) internal virtual {
        uint256 childIndex = _getPendingChildIndexAndValidate(
            parentId,
            childAddress,
            childId
        );

        if (_childIsInActive[childAddress][childId] != 0)
            revert RMRKChildAlreadyExists();

        _beforeAcceptChild(parentId, childIndex, childAddress, childId);

        // Remove from pending:
        _removePendingChild(parentId, childIndex);

        // Add to active:
        Child memory child = Child({
            contractAddress: childAddress,
            tokenId: childId
        });
        _activeChildrenIndex[parentId][childAddress][childId] = _activeChildren[
            parentId
        ].length;
        _activeChildren[parentId].push(child);
        _childIsInActive[childAddress][childId] = 1; // We use 1 as true

        emit ChildAccepted(parentId, childIndex, childAddress, childId);

        _afterAcceptChild(parentId, childIndex, childAddress, childId);
    }

    function _getPendingChildIndexAndValidate(
        uint256 parentId,
        address childAddress,
        uint256 childId
    ) private view returns (uint256) {
        uint256 childIndex = _pendingChildrenIndex[parentId][childAddress][childId];
        if (
            childIndex >= _pendingChildren[parentId].length ||
            childAddress !=
            _pendingChildren[parentId][childIndex].contractAddress ||
            childId != _pendingChildren[parentId][childIndex].tokenId
        ) revert RMRKChildNotFoundOnToken();
        return childIndex;
    }

    function _removePendingChild(uint256 parentId, uint256 childIndex) private {
        // We need to update the childIndex for the last resource since it will be swapped when removing this
        Child memory lastChild = _pendingChildren[parentId][
            _pendingChildren[parentId].length - 1
        ];
        _pendingChildrenIndex[parentId][lastChild.contractAddress][
            lastChild.tokenId
        ] = childIndex;
        _removeChildByIndex(_pendingChildren[parentId], childIndex);
    }

    /**
     * @notice Deletes all pending children.
     * @dev This does not update the ownership storage data on children. If necessary, ownership
     * can be reclaimed by the rootOwner of the previous parent (this).
     */
    function rejectAllChildren(uint256 tokenId)
        public
        virtual
        onlyApprovedOrOwner(tokenId)
    {
        _rejectAllChildren(tokenId);
    }

    function _rejectAllChildren(uint256 tokenId) internal virtual {
        _beforeRejectAllChildren(tokenId);
        delete _pendingChildren[tokenId];
        emit AllChildrenRejected(tokenId);
        _afterRejectAllChildren(tokenId);
    }

    /**
     * @notice Function to unnest a child from the active token array.
     * @param tokenId is the tokenId of the parent token to unnest from.
     * @param to is the address to transfer this
     * @param childAddress address of the child expected to be in the index.
     * @param childId token Id of the child expected to be in the index
     * @param isPending Boolean value indicating whether the token is in the pending array of the parent (`true`) or in
     *  the active array (`false`)
     */
    function unnestChild(
        uint256 tokenId,
        address to,
        address childAddress,
        uint256 childId,
        bool isPending
    ) public virtual onlyApprovedOrOwner(tokenId) {
        _unnestChild(tokenId, to, childAddress, childId, isPending);
    }

    function _unnestChild(
        uint256 parentId,
        address to,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual {
        uint256 childIndex;
        if (isPending) {
            childIndex = _getPendingChildIndexAndValidate(
                parentId,
                childAddress,
                childId
            );
        }
        else {
            childIndex = _activeChildrenIndex[parentId][childAddress][childId];
            if (
                childIndex >= _activeChildren[parentId].length ||
                childAddress !=
                _activeChildren[parentId][childIndex].contractAddress ||
                childId != _activeChildren[parentId][childIndex].tokenId
            ) revert RMRKChildNotFoundOnToken();
        }

        _beforeUnnestChild(
            parentId,
            childIndex,
            childAddress,
            childId,
            isPending
        );

        if (isPending) {
            _removePendingChild(parentId, childIndex);
        } else {
            Child memory lastChild = _activeChildren[parentId][
                _activeChildren[parentId].length - 1
            ];
            _activeChildrenIndex[parentId][lastChild.contractAddress][
                lastChild.tokenId
            ] = childIndex;
            delete _childIsInActive[childAddress][childId];
            _removeChildByIndex(_activeChildren[parentId], childIndex);
        }

        if (to != address(0)) {
            IERC721(childAddress).safeTransferFrom(address(this), to, childId);
        }

        emit ChildUnnested(
            parentId,
            childIndex,
            childAddress,
            childId,
            isPending
        );
        _afterUnnestChild(
            parentId,
            childIndex,
            childAddress,
            childId,
            isPending
        );
    }

    ////////////////////////////////////////
    //      CHILD MANAGEMENT GETTERS
    ////////////////////////////////////////

    /**
     * @notice Returns all confirmed children
     */

    function childrenOf(uint256 parentId)
        public
        view
        virtual
        returns (Child[] memory)
    {
        Child[] memory children = _activeChildren[parentId];
        return children;
    }

    /**
     * @notice Returns all pending children
     */

    function pendingChildrenOf(uint256 parentId)
        public
        view
        virtual
        returns (Child[] memory)
    {
        Child[] memory pendingChildren = _pendingChildren[parentId];
        return pendingChildren;
    }

    function childIsInActive(address childAddress, uint256 childId)
        public
        view
        virtual
        returns (bool)
    {
        return _childIsInActive[childAddress][childId] != 0;
    }

    // HOOKS

    function _beforeNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId
    ) internal virtual {}

    function _afterNestedTokenTransfer(
        address from,
        address to,
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 tokenId
    ) internal virtual {}

    function _beforeAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) internal virtual {}

    function _afterAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId
    ) internal virtual {}

    function _beforeAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual {}

    function _afterAcceptChild(
        uint256 parentId,
        uint256 childIndex,
        address childAddress,
        uint256 childId
    ) internal virtual {}

    function _beforeUnnestChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual {}

    function _afterUnnestChild(
        uint256 tokenId,
        uint256 childIndex,
        address childAddress,
        uint256 childId,
        bool isPending
    ) internal virtual {}

    function _beforeRejectAllChildren(uint256 tokenId) internal virtual {}

    function _afterRejectAllChildren(uint256 tokenId) internal virtual {}

    //HELPERS

    // For child storage array, callers must check valid length
    function _removeChildByIndex(Child[] storage array, uint256 index) private {
        array[index] = array[array.length - 1];
        array.pop();
    }
}
