 // SPDX-License-Identifier: GNU GPL

pragma solidity ^0.8.9;

import "./IRMRKCore.sol";
import "./IERC721Receiver.sol";
import "./extensions/IERC721Metadata.sol";
import "./utils/Address.sol";
import "./utils/Context.sol";
import "./utils/Strings.sol";
import "./utils/introspection/ERC165.sol";

abstract contract RMRKNestable is Context, ERC165, IRMRKCore, IERC721Metadata {
  using Address for address;
  using Strings for uint256;

  struct Child {
    address contractAddress;
    uint256 tokenId;
    bool pending;
  }

  struct NftOwner {
    address contractAddress;
    uint256 tokenId;
  }

  struct RoyaltyData {
    address royaltyAddress;
    uint32 numerator;
    uint32 denominator;
  }

  string private _name;

  string private _symbol;

  string private _tokenURI; //TODO: dummy variable, remove after fully implementing resources.

  RoyaltyData private _royalties;

  mapping(uint256 => address) private _owners;

  mapping(address => uint256) private _balances;

  mapping(uint256 => address) private _tokenApprovals;

  mapping(address => mapping(address => bool)) private _operatorApprovals;

  mapping(uint256 => NftOwner) private _nftOwners;

  mapping(uint256 => Child[]) private _children;

  constructor(string memory name_, string memory symbol_) {
    _name = name_;
    _symbol = symbol_;
  }

   function tokenURI(uint256 tokenId) public virtual view returns(string memory){
     return _tokenURI;
   }

   //TODOS:
   //abstract "ERC721: transfer caller is not owner nor approved" to modifier
   //Update transfer events for root and nested
   //Isolate _transfer() branches in own functions
   //Add preapproval to setChild
   //Update functions that take address and use as interface to take interface instead
   //update _checkOnERC721Received to be RMRKCoreReceived
   //double check (this) in setChild() call functions appropriately
   //MINTS/BURNS

   //VULNERABILITY CHECK NOTES:
   //External calls:
   // ownerOf() during _transfer
   // setChild() during _transfer()
   //
   //Vulnerabilities to test:
   // Greif during _transfer via setChild reentry?

   /**
   @dev Returns all children, even pending
   */

   function isRMRKCore() public pure returns (bool){
     return true;
   }

   function findRootOwner(id) public view returns(address) {
   //sloads up the chain, each call is 2.1K gas, not great
     address root;
     address owner, uint id = nftOwnerOf(id);
     IRMRKCore nft = IRMRKCore(owner);

     try {
       require(nft.isRMRKCore(), "")
       nft.findRootOwner(id)
     }

     catch {
       root = owner;
     }
     return root;
   }

  function childrenOf (uint256 childIndex) public view returns (Child[] memory) {
    Child[] memory children = _children[childIndex];
    return children;
  }

  function unParent(uint256 tokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
    delete(_nftOwners[tokenId]);
    //TODO: Remove child entry on parent contract
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
    return
      interfaceId == type(IERC721).interfaceId ||
      interfaceId == type(IERC721Metadata).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  function nftOwnerOf(uint256 tokenId) public view virtual returns (address, uint256) {
    NftOwner memory owner = _nftOwners[tokenId];
    require(owner.contractAddress != address(0), "ERC721: owner query for nonexistent token");
    return (owner.contractAddress, owner.tokenId);
  }

  function ownerOf(uint256 tokenId) public view virtual override returns (address) {
    address owner = _owners[tokenId];
    require(owner != address(0), "ERC721: owner query for nonexistent token");
    return owner;
  }

  function balanceOf(address owner) public view virtual override returns (uint256) {
      require(owner != address(0), "ERC721: balance query for the zero address");
      return _balances[owner];
  }

  function name() public view virtual override returns (string memory) {
      return _name;
  }

  function symbol() public view virtual override returns (string memory) {
      return _symbol;
  }

  function approve(address to, uint256 tokenId) public virtual override {
      address owner = RMRKNestable.ownerOf(tokenId);
      require(to != owner, "ERC721: approval to current owner");

      require(
          _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
          "ERC721: approve caller is not owner nor approved for all"
      );

      _approve(to, tokenId);
  }

  function getApproved(uint256 tokenId) public view virtual override returns (address) {
      require(_exists(tokenId), "ERC721: approved query for nonexistent token");

      return _tokenApprovals[tokenId];
  }

  /**
   * @dev See {IERC721-setApprovalForAll}.
   */
  function setApprovalForAll(address operator, bool approved) public virtual override {
      _setApprovalForAll(_msgSender(), operator, approved);
  }

  /**
   * @dev See {IERC721-isApprovedForAll}.
   */
  function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
      return _operatorApprovals[owner][operator];
  }

  /**
   * @dev See {IERC721-transferFrom}.
   */
  function transferFrom(
      address from,
      address to,
      uint256 tokenId,
      uint256 destId,
      bytes memory _data
  ) public virtual {
      //solhint-disable-next-line max-line-length
      require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

      _transfer(from, to, tokenId, destId, _data);
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   */
  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId,
      uint256 destId,
      bytes memory _data
  ) public virtual {
      require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
      _safeTransfer(from, to, tokenId, destId, _data);
  }

  /**
   * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
   * are aware of the ERC721 protocol to prevent tokens from being forever locked.
   *
   * `_data` is additional data, it has no specified format and it is sent in call to `to`.
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
      uint256 destId,
      bytes memory _data
  ) internal virtual {
      _transfer(from, to, tokenId, destId, _data);
      require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
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
      return _owners[tokenId] != address(0);
  }

  /**
   * @dev Returns whether `spender` is allowed to manage `tokenId`.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
      require(_exists(tokenId), "ERC721: operator query for nonexistent token");
      address owner = this.ownerOf(tokenId);
      return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
  }

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
      bytes memory _data
  ) internal virtual {
      _mint(to, tokenId);
      require(
          _checkOnERC721Received(address(0), to, tokenId, _data),
          "ERC721: transfer to non ERC721Receiver implementer"
      );
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
      require(to != address(0), "ERC721: mint to the zero address");
      require(!_exists(tokenId), "ERC721: token already minted");

      _beforeTokenTransfer(address(0), to, tokenId);

      _balances[to] += 1;
      _owners[tokenId] = to;

      emit Transfer(address(0), to, tokenId);

      _afterTokenTransfer(address(0), to, tokenId);
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
  function _burn(uint256 tokenId) internal virtual {
      address owner = this.ownerOf(tokenId);

      _beforeTokenTransfer(owner, address(0), tokenId);

      // Clear approvals
      _approve(address(0), tokenId);

      _balances[owner] -= 1;
      delete _owners[tokenId];

      emit Transfer(owner, address(0), tokenId);

      _afterTokenTransfer(owner, address(0), tokenId);
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
      uint256 tokenId,
      uint256 destId,
      bytes memory _data
  ) internal virtual {
      require(this.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
      require(to != address(0), "ERC721: transfer to the zero address");

      _beforeTokenTransfer(from, to, tokenId);

      // Clear approvals from the previous owner
      _approve(address(0), tokenId);

      if (keccak256(_data) == keccak256(bytes("NEST"))) {
        _nftOwners[tokenId] = NftOwner({
          contractAddress: to,
          tokenId: destId
          });

        IRMRKCore destContract = IRMRKCore(to);

        address rootOwner = destContract.ownerOf(destId);

        _balances[from] -= 1;
        _balances[rootOwner] += 1;
        _owners[tokenId] = rootOwner;

        destContract.setChild(this, destId, tokenId);

      }

      else {
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
      }

      emit Transfer(from, to, tokenId);

      _afterTokenTransfer(from, to, tokenId);
  }

  /**
   * @dev Approve `to` to operate on `tokenId`
   *
   * Emits a {Approval} event.
   */
  function _approve(address to, uint256 tokenId) internal virtual {
      _tokenApprovals[tokenId] = to;
      emit Approval(this.ownerOf(tokenId), to, tokenId);
  }

  /**
   * @dev Approve `operator` to operate on all of `owner` tokens
   *
   * Emits a {ApprovalForAll} event.
   */
  function _setApprovalForAll(
      address owner,
      address operator,
      bool approved
  ) internal virtual {
      require(owner != operator, "ERC721: approve to caller");
      _operatorApprovals[owner][operator] = approved;
      emit ApprovalForAll(owner, operator, approved);
  }

  /**
   * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
   * The call is not executed if the target address is not a contract.
   *
   * @param from address representing the previous owner of the given token ID
   * @param to target address that will receive the tokens
   * @param tokenId uint256 ID of the token to be transferred
   * @param _data bytes optional data to send along with the call
   * @return bool whether the call correctly returned the expected magic value
   */
  function _checkOnERC721Received(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
  ) private returns (bool) {
      if (to.isContract()) {
          try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
              return retval == IERC721Receiver.onERC721Received.selector;
          } catch (bytes memory reason) {
              if (reason.length == 0) {
                  revert("ERC721: transfer to non ERC721Receiver implementer");
              } else {
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

    /**
     * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
     * Function can only be called when
     */
  function setChild(IRMRKCore childAddress, uint tokenId, uint childTokenId) public virtual {
    (address parent, ) = childAddress.nftOwnerOf(childTokenId);
    require(parent == address(this), "Parent-child mismatch");
    Child memory child = Child({
        contractAddress: address(childAddress),
        tokenId: childTokenId,
        pending: true
      });
    _children[tokenId].push(child);
  }

    /**
    * @dev Returns contract royalty data.
    * Returns a numerator and denominator for percentage calculations, as well as a desitnation address.
    */
  function getRoyaltyData() public view returns(address royaltyAddress, uint256 numerator, uint256 denominator) {
   RoyaltyData memory data = _royalties;
   return(data.royaltyAddress, uint256(data.numerator), uint256(data.denominator));
  }

   /**
   * @dev Setter for contract royalty data, percentage stored as a numerator and denominator.
   * Recommended values are in Parts Per Million, E.G:
   * A numerator of 1*10**5 and a denominator of 1*10**6 is equal to 10 percent, or 100,000 parts per 1,000,000.
   */
   //TODO: Decide on default visiblity
  function setRoyaltyData(address _royaltyAddress, uint32 _numerator, uint32 _denominator) external virtual {
   _royalties = RoyaltyData ({
       royaltyAddress: _royaltyAddress,
       numerator: _numerator,
       denominator: _denominator
     });
  }

}
