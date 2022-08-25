// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "./interfaces/IRMRKNesting.sol";
import "./library/RMRKLib.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";

error ERC721AddressZeroIsNotaValidOwner();
error ERC721ApprovalToCurrentOwner();
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll();
error ERC721ApprovedQueryForNonexistentToken();
error ERC721ApproveToCaller();
error ERC721InvalidTokenId();
error ERC721MintToTheZeroAddress();
error ERC721NotApprovedOrOwner();
error ERC721TokenAlreadyMinted();
error ERC721TransferFromIncorrectOwner();
error ERC721TransferToNonReceiverImplementer();
error ERC721TransferToTheZeroAddress();
error RMRKCallerIsNotOwnerContract();
error RMRKChildIndexOutOfRange();
error RMRKIsNotContract();
error RMRKMaxPendingChildrenReached();
error RMRKMintToNonRMRKImplementer();
error RMRKNestingTransferToNonRMRKNestingImplementer();
error RMRKNotApprovedOrDirectOwner();
error RMRKParentChildMismatch();
error RMRKPendingChildIndexOutOfRange();
error RMRKInvalidChildReclaim();

contract RMRKNesting is Context, IERC165, IERC721, IERC721Metadata, IRMRKNesting {

    using RMRKLib for uint256;
    using Address for address;
    using Strings for uint256;


    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) internal _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) internal _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // ------------------- NESTING --------------

    struct RMRKOwner {
        uint256 tokenId;
        address ownerAddress;
        bool isNft;
    }

    // Mapping from token ID to RMRKOwner struct
    mapping(uint256 => RMRKOwner) internal _RMRKOwners;

    // Mapping of tokenId to array of active children structs
    mapping(uint256 => Child[]) internal _children;

    // Mapping of tokenId to array of pending children structs
    mapping(uint256 => Child[]) internal _pendingChildren;

    // -------------------------- MODIFIERS ----------------------------

    function _onlyApprovedOrOwner(uint256 tokenId) private view {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        _onlyApprovedOrOwner(tokenId);
        _;
    }

    /**
    * @notice Internal function for checking token ownership relative to immediate parent.
    * @dev This does not delegate to ownerOf, which returns the root owner.
    * Reverts if caller is not immediate owner.
    * Used for parent-scoped transfers.
    * @param tokenId tokenId to check owner against.
    */
    function _onlyApprovedOrDirectOwner(uint256 tokenId) private view {
        if(!_isApprovedOrDirectOwner(_msgSender(), tokenId)) revert RMRKNotApprovedOrDirectOwner();
    }

    modifier onlyApprovedOrDirectOwner(uint256 tokenId) {
        _onlyApprovedOrDirectOwner(tokenId);
        _;
    }

    // ----------------------------- CONSTRUCTOR ------------------------------

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    // ------------------------------- ERC721 ---------------------------------
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
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
        if(owner == address(0))
            revert ERC721AddressZeroIsNotaValidOwner();
        return _balances[owner];
    }

    ////////////////////////////////////////
    //              METADATA
    ////////////////////////////////////////

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
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
        if(!_checkOnERC721Received(from, to, tokenId, data))
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
        (address immediateOwner,,) = rmrkOwnerOf(tokenId);
        if (immediateOwner != from) revert ERC721TransferFromIncorrectOwner();
        if (to == address(0)) revert ERC721TransferToTheZeroAddress();

        _beforeTokenTransfer(from, to, tokenId);


        _balances[from] -= 1;
        _updateOwnerAndClearApprovals(tokenId, 0, to, false);
        _balances[to] += 1;

        emit Transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
    }

    function _nestTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) internal virtual {
        (address immediateOwner,,) = rmrkOwnerOf(tokenId);
        if (immediateOwner != from) revert ERC721TransferFromIncorrectOwner();
        if(to == address(0)) revert ERC721TransferToTheZeroAddress();

        // Destination contract checks:
        // It seems redundant, but otherwise it would revert with no error
        if(!to.isContract()) revert RMRKIsNotContract();
        if(!IERC165(to).supportsInterface(type(IRMRKNesting).interfaceId))
            revert RMRKNestingTransferToNonRMRKNestingImplementer();

        _beforeTokenTransfer(from, to, tokenId);
        _balances[from] -= 1;
        _updateOwnerAndClearApprovals(tokenId, destinationId, to, true);
        _balances[to] += 1;

        // Sending to NFT:
        _sendToNFT(tokenId, destinationId, from, to);
    }

    function _sendToNFT(uint tokenId, uint destinationId, address from, address to) private {
        IRMRKNesting destContract = IRMRKNesting(to);
        destContract.addChild(destinationId, tokenId, address(this));

        emit Transfer(from, to, tokenId);
        _afterTokenTransfer(from, to, tokenId);
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
        if(!_checkOnERC721Received(address(0), to, tokenId, data))
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
        _afterTokenTransfer(address(0), to, tokenId);
    }

    function _nestMint(address to, uint256 tokenId, uint256 destinationId) internal virtual {
        if(!to.isContract()) revert RMRKIsNotContract();
        // It seems redundant, but otherwise it would revert with no error
        if(!IERC165(to).supportsInterface(type(IRMRKNesting).interfaceId))
            revert RMRKMintToNonRMRKImplementer();

        _innerMint(to, tokenId, destinationId);
        _sendToNFT(tokenId, destinationId, address(0), to);
    }

    function _innerMint(address to, uint256 tokenId, uint256 destinationId) private {
        if(to == address(0)) revert ERC721MintToTheZeroAddress();
        if(_exists(tokenId)) revert ERC721TokenAlreadyMinted();

        _beforeTokenTransfer(address(0), to, tokenId);

        _balances[to] += 1;
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: destinationId > 0
        });
    }

    ////////////////////////////////////////
    //              Ownership
    ////////////////////////////////////////

    /**
     * @notice Returns the root owner of the current RMRK NFT.
     * @dev In the event the NFT is owned by another NFT, it will recursively ask the parent.
     */
    function ownerOf(uint tokenId) public override(IRMRKNesting, IERC721) virtual view returns (address) {
        (address owner, uint256 ownerTokenId, bool isNft) = rmrkOwnerOf(tokenId);
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
    function rmrkOwnerOf(uint256 tokenId) public view virtual returns (address, uint256, bool) {
        RMRKOwner memory owner = _RMRKOwners[tokenId];
        if(owner.ownerAddress == address(0)) revert ERC721InvalidTokenId();

        return (owner.ownerAddress, owner.tokenId, owner.isNft);
    }

    ////////////////////////////////////////
    //              BURNING
    ////////////////////////////////////////

    //update for reentrancy
    //Suggest delegate to _burn method, as both run same code
    function burnFromParent(uint256 tokenId) external {
        (address _RMRKOwner, , ) = rmrkOwnerOf(tokenId);
        if(_RMRKOwner != _msgSender())
            revert RMRKCallerIsNotOwnerContract();
        address owner = ownerOf(tokenId);
        _burnForOwner(tokenId, owner);
        _balances[_RMRKOwner] -= 1;
    }

    function burnChild(uint256 tokenId, uint256 index) external onlyApprovedOrDirectOwner(tokenId) {
        if (_children[tokenId].length <= index) revert RMRKChildIndexOutOfRange();

        Child memory child = _children[tokenId][index];
        IRMRKNesting(child.contractAddress).burnFromParent(child.tokenId);
        removeChildByIndex(_children[tokenId], index);
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

    //update for reentrancy
    function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        (address rmrkOwner,,) = rmrkOwnerOf(tokenId);
        _balances[rmrkOwner] -= 1;
        _burnForOwner(tokenId, owner);
    }

    function _burnForOwner(uint256 tokenId, address rootOwner) private {
        _beforeTokenTransfer(rootOwner, address(0), tokenId);
        _approve(address(0), tokenId);
        _cleanApprovals(address(0), tokenId);

        Child[] memory children = childrenOf(tokenId);

        uint256 length = children.length; //gas savings
        for (uint i; i<length;){
            address childContractAddress = children[i].contractAddress;
            uint256 childTokenId = children[i].tokenId;
            IRMRKNesting(childContractAddress).burnFromParent(childTokenId);
            unchecked {++i;}
        }
        delete _RMRKOwners[tokenId];
        delete _pendingChildren[tokenId];
        delete _children[tokenId];
        delete _tokenApprovals[tokenId];

        _afterTokenTransfer(rootOwner, address(0), tokenId);
        emit Transfer(rootOwner, address(0), tokenId);
    }

    ////////////////////////////////////////
    //              APPROVALS
    ////////////////////////////////////////

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if(to == owner)
            revert ERC721ApprovalToCurrentOwner();

        if(_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert ERC721ApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual returns (address) {
        _requireMinted(tokenId);

        return _tokenApprovals[tokenId];
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        if(_msgSender() == operator)
            revert ERC721ApproveToCaller();
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits an {Approval} event.
     */
    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _updateOwnerAndClearApprovals(uint tokenId, uint destinationId, address to, bool isNft) internal {
        _RMRKOwners[tokenId] = RMRKOwner({
            ownerAddress: to,
            tokenId: destinationId,
            isNft: isNft
        });

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);
        _cleanApprovals(address(0), tokenId);
    }

    function _cleanApprovals(address owner, uint256 tokenId) internal virtual {}

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
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    //TODO: Code review here -- Accepting perms that aren't always used
    function _isApprovedOrDirectOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        (address owner, uint parentTokenId,) = rmrkOwnerOf(tokenId);
        if (parentTokenId != 0) {
            return (spender == owner);
        }
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */

    function _requireMinted(uint256 tokenId) internal view virtual {
        if(!_exists(tokenId))
            revert ERC721InvalidTokenId();
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
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
    ) internal returns (bool) {
        if (to.isContract()) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, data) returns (bytes4 retval) {
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

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    ////////////////////////////////////////
    //      CHILD MANAGEMENT PUBLIC
    ////////////////////////////////////////

    /**
     * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
     * param1 parentTokenId is the tokenId of the parent token on (this).
     * param2 childTokenId is the tokenId of the child instance
     * param3 childAddress is the address of the child contract as an IRMRK instance
     */

    //update for reentrancy
    function addChild(
        uint256 parentTokenId,
        uint256 childTokenId,
        address childTokenAddress
    ) public virtual {
        if(!_exists(parentTokenId)) revert ERC721InvalidTokenId();

        IRMRKNesting childTokenContract = IRMRKNesting(childTokenAddress);
        (address parent, , ) = childTokenContract.rmrkOwnerOf(childTokenId);
        if (parent != address(this)) revert RMRKParentChildMismatch();

        Child memory child = Child({
            contractAddress: childTokenAddress,
            tokenId: childTokenId
        });

        uint length = _pendingChildren[parentTokenId].length;

        if(length < 128) {
            _pendingChildren[parentTokenId].push(child);
        } else {
            revert RMRKMaxPendingChildrenReached();
        }

        // Previous lenght matches the index for the new child
        emit ChildProposed(parentTokenId, childTokenAddress, childTokenId, length);
    }

    /**
    * @notice Sends an instance of Child from the pending children array at index to children array for tokenId.
    * Updates _emptyIndexes of tokenId to preserve ordering.
    */

    function acceptChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
        if(_pendingChildren[tokenId].length <= index) revert RMRKPendingChildIndexOutOfRange();

        Child memory child = _pendingChildren[tokenId][index];

        removeChildByIndex(_pendingChildren[tokenId], index);

        _children[tokenId].push(child);
        emit ChildAccepted(tokenId, child.contractAddress, child.tokenId, index);
    }

    /**
    * @notice Deletes all pending children.
    * @dev This does not update the ownership storage data on children. If necessary, ownership
    * can be reclaimed by the rootOwner of the previous parent (this).
    */
    function rejectAllChildren(uint256 tokenId) public virtual onlyApprovedOrOwner(tokenId) {
        delete(_pendingChildren[tokenId]);
        emit AllChildrenRejected(tokenId);
    }

    /**
    * @notice Deletes a single child from the pending array by index.
    * @param tokenId tokenId whose pending child is to be rejected
    * @param index index on tokenId pending child array to reject
    * @param to if an address which is not the zero address is passed, this will attempt to transfer
    * the child to `to` via a call-in to the child address.
    * @dev If `to` is the zero address, the child's ownership structures will not be updated, resulting in an
    * 'orphaned' child. If a call with a populated `to` field fails, call this function with `to` set to the
    * zero address to orphan the child. Orphaned children can be reclaimed by a call to reclaimChild on this
    * contract by the root owner.
    */

    function rejectChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) public virtual onlyApprovedOrOwner(tokenId) {
        if(_pendingChildren[tokenId].length <= index) revert RMRKPendingChildIndexOutOfRange();

        Child memory pendingChild = _pendingChildren[tokenId][index];

        removeChildByIndex(_pendingChildren[tokenId], index);

        if (to != address(0)) {
            IERC721(pendingChild.contractAddress).safeTransferFrom(address(this), to, pendingChild.tokenId);
        }

        emit ChildRejected(tokenId, pendingChild.contractAddress, pendingChild.tokenId, index);
    }

    /**
    * @notice Function to unnest a child from the active token array.
    * @param tokenId is the tokenId of the parent token to unnest from.
    * @param index is the index of the child token ID.
    * @param to is the address to transfer this
    */
    function unnestChild(
        uint256 tokenId,
        uint256 index,
        address to
    ) public virtual onlyApprovedOrOwner(tokenId) {
        if (_children[tokenId].length <= index) revert RMRKChildIndexOutOfRange();

        Child memory child = _children[tokenId][index];

        removeChildByIndex(_children[tokenId], index);

        if (to != address(0)) {
            IERC721(child.contractAddress).safeTransferFrom(address(this), to, child.tokenId);
        }

        emit ChildUnnested(tokenId, child.contractAddress, child.tokenId, index);
    }

    function reclaimChild(
        uint256 tokenId,
        address childAddress,
        uint256 childTokenId
    ) public onlyApprovedOrOwner(tokenId)  {
        (
            address owner, uint256 ownerTokenId, bool isNft
        ) = IRMRKNesting(childAddress).rmrkOwnerOf(childTokenId);
        if (owner != address(this) || ownerTokenId != tokenId || !isNft)
            revert RMRKInvalidChildReclaim();
        IERC721(childAddress).safeTransferFrom(address(this), _msgSender(), childTokenId);
    }


    ////////////////////////////////////////
    //      CHILD MANAGEMENT GETTERS
    ////////////////////////////////////////

    /**
    * @notice Returns all confirmed children
    */

    function childrenOf(uint256 parentTokenId) public view returns (Child[] memory) {
        Child[] memory children = _children[parentTokenId];
        return children;
    }

    /**
    * @notice Returns all pending children
    */

    function pendingChildrenOf(uint256 parentTokenId) public view returns (Child[] memory) {
        Child[] memory pendingChildren = _pendingChildren[parentTokenId];
        return pendingChildren;
    }

    function childOf(
        uint256 parentTokenId,
        uint256 index
    ) public view returns (Child memory) {
        if(_children[parentTokenId].length <= index)
            revert RMRKChildIndexOutOfRange();
        Child memory child = _children[parentTokenId][index];
        return child;
    }

    function pendingChildOf(
        uint256 parentTokenId,
        uint256 index
    ) public view returns (Child memory) {
        if(_pendingChildren[parentTokenId].length <= index)
            revert RMRKPendingChildIndexOutOfRange();
        Child memory child = _pendingChildren[parentTokenId][index];
        return child;
    }

    //HELPERS

    // For child storage array, callers must check valid length
    function removeChildByIndex(Child[] storage array, uint256 index) internal {
        array[index] = array[array.length-1];
        array.pop();
    }
}
