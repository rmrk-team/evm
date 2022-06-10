// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.9;

import "./interfaces/IRMRKNesting.sol";
import "./interfaces/IRMRKNestingReceiver.sol";
import "./interfaces/IERC721Receiver.sol";
import "./library/RMRKLib.sol";
import "./utils/Address.sol";
import "./utils/Strings.sol";
import "./utils/Context.sol";
import "hardhat/console.sol";

contract RMRKNesting is Context, IRMRKNesting {

  using RMRKLib for uint256;
  using Address for address;
  using Strings for uint256;

  // Token name
  string private _name;

  // Token symbol
  string private _symbol;

  // Mapping from token ID to RMRKOwner struct
  mapping(uint256 => RMRKOwner) internal _RMRKOwners;

  // Mapping owner address to token count
  mapping(address => uint256) private _balances;

  // Mapping from token ID to approved address
  mapping(uint256 => address) private _tokenApprovals;

  // Mapping from owner to operator approvals
  mapping(address => mapping(address => bool)) private _operatorApprovals;

  // Mapping of tokenId to array of active children structs
  mapping(uint256 => Child[]) internal _children;

  // Mapping of tokenId to array of pending children structs
  mapping(uint256 => Child[]) internal _pendingChildren;

  event ChildTransferApproved(uint tokenId);  // FIXME: untested

  modifier onlyApprovedOrOwner(uint256 tokenId) {
    require(_isApprovedOrOwner(_msgSender(), tokenId),
      "RMRKCore: Not approved or owner"
    );
    _;
  }

  constructor(string memory name_, string memory symbol_) {
    _name = name_;
    _symbol = symbol_;
  }

  ////////////////////////////////////////
  //             PROVENANCE
  ////////////////////////////////////////

  function name() public view virtual returns (string memory) {
      return _name;
  }


  function symbol() public view virtual returns (string memory) {
      return _symbol;
  }

  /**
  @dev Returns balance of tokens owner by a given rootOwner.
  */

  function balanceOf(address owner) public view virtual returns (uint256) {
    require(owner != address(0), "RMRKCore: balance query for the zero address");
    return _balances[owner];
  }

  /**
  @dev Returns the root owner of a RMRKCore NFT.
  */
  function ownerOf(uint256 tokenId) public view virtual returns(address) {
    (address owner, uint256 ownerTokenId, bool isNft) = rmrkOwnerOf(tokenId);
    if (isNft) {
      owner = IRMRKNesting(owner).ownerOf(ownerTokenId);
    }
    require(owner != address(0), "RMRKCore: owner query for nonexistent token");
    return owner;
  }

  /**
  @dev Returns the immediate provenance data of the current RMRK NFT. In the event the NFT is owned
  * by a wallet, tokenId will be zero and isNft will be false. Otherwise, the returned data is the
  * contract address and tokenID of the owner NFT, as well as its isNft flag.
  */
  function rmrkOwnerOf(uint256 tokenId) public view virtual returns (address, uint256, bool) {
    RMRKOwner memory owner = _RMRKOwners[tokenId];
    require(owner.ownerAddress != address(0), "RMRKCore: owner query for nonexistent token");
    return (owner.ownerAddress, owner.tokenId, owner.isNft);
  }

  function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
    //TODO: Discuss removing this check
    _requireMinted(tokenId);

    string memory baseURI = _baseURI();
    return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
}

/**
 * @dev Reverts if the `tokenId` has not been minted yet.
 */
function _requireMinted(uint256 tokenId) internal view virtual {
    require(_exists(tokenId), "ERC721: invalid token ID");
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
  //              MINTING
  ////////////////////////////////////////

  /**
  @dev Mints an NFT.
  * Can mint to a root owner or another NFT.
  * Overloaded function _mint() can be used either to minto into a root owner or another NFT.
  * If isNft contains any non-empty data, _mintToNft will be called and pass the extra data
  * package to the function.
  */

  function _mint(address to, uint256 tokenId) internal virtual {
    _mint(to, tokenId, 0, "");
  }

  function _mint(address to, uint256 tokenId, uint256 destinationId, bytes memory data) internal virtual {
    // FIXME: We could use the isRMRKCore function here to decide instead
    if (data.length > 0) {
      _mintToNft(to, tokenId, destinationId, data);
    }
    else{
      _mintToRootOwner(to, tokenId);
    }
  }

  function _mintToNft(address to, uint256 tokenId, uint256 destinationId, bytes memory data) internal virtual {
    require(to != address(0), "RMRKCore: mint to the zero address");
    require(!_exists(tokenId), "RMRKCore: token already minted");
    require(to.isContract(), "RMRKCore: Is not contract");
    require(_checkRMRKNestingImplementer(_msgSender(), to, tokenId, ""),
      "RMRKCore: Mint to non-RMRKCore implementer"
    );

    IRMRKNesting destContract = IRMRKNesting(to);

    _beforeTokenTransfer(address(0), to, tokenId);

    address rootOwner = destContract.ownerOf(destinationId);
    _balances[rootOwner] += 1;

    _RMRKOwners[tokenId] = RMRKOwner({
      ownerAddress: to,
      tokenId: destinationId,
      isNft: true
    });

    destContract.addChild(destinationId, tokenId, address(this));

    /* emit Transfer(address(0), to, tokenId);

    _afterTokenTransfer(address(0), to, tokenId); */
  }

  function _mintToRootOwner(address to, uint256 tokenId) internal virtual {
    require(to != address(0), "RMRKCore: mint to the zero address");
    require(!_exists(tokenId), "RMRKCore: token already minted");

    _beforeTokenTransfer(address(0), to, tokenId);

    _balances[to] += 1;
    _RMRKOwners[tokenId] = RMRKOwner({
      ownerAddress: to,
      tokenId: 0,
      isNft: false
    });

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

  //update for reentrancy
  function _burn(uint256 tokenId) internal virtual {
    address owner = ownerOf(tokenId);
    require(_isApprovedOrOwner(_msgSender(), tokenId), "RMRKCore: burn caller is not owner nor approved");
    _beforeTokenTransfer(owner, address(0), tokenId);

    // Clear approvals
    _approve(address(0), tokenId);

    _balances[owner] -= 1;

    Child[] memory children = childrenOf(tokenId);

    uint length = children.length; //gas savings
    //Check to see if i.u_inc() assembly method or { unchecked ++1 } saves more gas
    for (uint i; i<length; i.u_inc()){
      IRMRKNesting(children[i].contractAddress)._burnChildren(
        children[i].tokenId,
        owner
      );
    }

    delete _RMRKOwners[tokenId];
    emit Transfer(owner, address(0), tokenId);

    _afterTokenTransfer(owner, address(0), tokenId);
  }

  ////////////////////////////////////////
  //             TRANSFERS
  ////////////////////////////////////////

  //TODO: Safe Transfers

  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId
  ) public virtual override {
      safeTransferFrom(from, to, tokenId, 0, "");
  }


  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId,
      bytes memory data
  ) public virtual override {
      require(
          _isApprovedOrOwner(_msgSender(), tokenId),
          "MultiResource: transfer caller is not owner nor approved"
      );
      _safeTransfer(from, to, tokenId, 0, data);
  }

  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId,
      uint256 destinationId,
      bytes memory data
  ) public virtual {
      require(
          _isApprovedOrOwner(_msgSender(), tokenId),
          "MultiResource: transfer caller is not owner nor approved"
      );
      _safeTransfer(from, to, tokenId, destinationId, data);
  }

  function _safeTransfer(
      address from,
      address to,
      uint256 tokenId,
      uint256 destinationId,
      bytes memory data
  ) internal virtual {
      _transfer(from, to, tokenId, destinationId, data);
      require(
          _checkRMRKNestingImplementer(from, to, tokenId, data) ||
          _checkOnERC721Received(from, to, tokenId, data)
          ,
          "MultiResource: transfer to non MultiResource Receiver implementer"
      );
  }

  /**
  * @dev See {IERC721-transferFrom}.
  */
  function transfer(
    address to,
    uint256 tokenId
  ) public virtual {
    transferFrom(msg.sender, to, tokenId, 0, "");
  }

  /**
  * @dev
  */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public virtual onlyApprovedOrOwner(tokenId) {
    //solhint-disable-next-line max-line-length
    _transfer(from, to, tokenId, 0, "");
  }

  function transferFrom(
    address from,
    address to,
    uint256 tokenId,
    uint256 destinationId,
    bytes memory data
  ) public virtual onlyApprovedOrOwner(tokenId) {
    //solhint-disable-next-line max-line-length
    _transfer(from, to, tokenId, destinationId, data);
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
  //Convert string to bytes in calldata for gas saving
  //Double check to make sure nested transfers update balanceOf correctly. Maybe add condition if rootOwner does not change for gas savings.
  //All children of transferred NFT should also have owner updated.
  function _transfer(
    address from,
    address to,
    uint256 tokenId,
    uint256 toTokenId,
    bytes memory data
  ) internal virtual {
    require(ownerOf(tokenId) == from, "RMRKCore: transfer from incorrect owner");
    require(to != address(0), "RMRKCore: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    // FIXME: balances are not tested and probably broken
    _balances[from] -= 1;
    RMRKOwner memory rmrkOwner = _RMRKOwners[tokenId];
    require(!rmrkOwner.isNft, "RMRKCore: Must unnest first");

    bool destinationIsNft = _checkRMRKNestingImplementer(from, to, tokenId, data);

    _RMRKOwners[tokenId] = RMRKOwner({
      ownerAddress: to,
      tokenId: toTokenId,
      isNft: destinationIsNft
    });

    // Clear approvals from the previous owner
    _approve(address(0), tokenId);

    if(!destinationIsNft) {
      _balances[to] += 1;
    } else {
      // If destination is an NFT, we need to add the child to it
      IRMRKNesting destContract = IRMRKNesting(to);
      address nextOwner = destContract.ownerOf(toTokenId);
      _balances[nextOwner] += 1;

      destContract.addChild(toTokenId, tokenId, address(this));
    }

    emit Transfer(from, to, tokenId);
    _afterTokenTransfer(from, to, tokenId);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual {}

  /**
  * @dev Hook that is called after any transfer of tokens. This includes
  * minting and burning.    address owner = this.ownerOf(tokenId);
    return (spender == owner || getApproved(tokenId) == spender);
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
  //      APPROVALS / PRE-CHECKING
  ////////////////////////////////////////

  function _exists(uint256 tokenId) internal view virtual returns (bool) {
    return _RMRKOwners[tokenId].ownerAddress != address(0);
  }

  function approve(address to, uint256 tokenId) public virtual {
    address owner = this.ownerOf(tokenId);
    require(to != owner, "RMRKCore: approval to current owner");

    require(
        _msgSender() == owner,
        "RMRKCore: approve caller is not owner"
    );

    _approve(to, tokenId);
  }

  function _approve(address to, uint256 tokenId) internal virtual {
    _tokenApprovals[tokenId] = to;
    emit Approval(ownerOf(tokenId), to, tokenId);
  }

  function _setApprovalForAll(
      address owner,
      address operator,
      bool approved
  ) internal virtual {
      require(owner != operator, "MultiResource: approve to caller");
      _operatorApprovals[owner][operator] = approved;
      emit ApprovalForAll(owner, operator, approved);
  }

  function isApprovedOrOwner(address spender, uint256 tokenId) external view virtual returns (bool) {
    return _isApprovedOrOwner(spender, tokenId);
  }

  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
    address owner = this.ownerOf(tokenId);
    return (spender == owner || getApproved(tokenId) == spender);
  }

  function getApproved(uint256 tokenId) public view virtual returns (address) {
    require(_exists(tokenId), "RMRKCore: approved query for nonexistent token");

    return _tokenApprovals[tokenId];
  }

  function setApprovalForAll(
      address operator,
      bool approved
  ) public virtual override {
      _setApprovalForAll(_msgSender(), operator, approved);
  }

  function isApprovedForAll(
      address owner,
      address operator
  ) public view virtual override returns (bool) {
      return _operatorApprovals[owner][operator];
  }


  ////////////////////////////////////////
  //          CHILD MANAGEMENT
  ////////////////////////////////////////

  /**
   * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
   * param1 parentTokenId is the tokenId of the parent token on (this).
   * param2 childTokenId is the tokenId of the child instance
   * param3 childAddress is the address of the child contract as an IRMRKCore instance
   */

  //update for reentrancy
  function addChild(
    uint256 parentTokenId,
    uint256 childTokenId,
    address childTokenAddress
  ) public virtual {
    IRMRKNesting childTokenContract = IRMRKNesting(childTokenAddress);
    (address parent, , ) = childTokenContract.rmrkOwnerOf(childTokenId);
    require(parent == address(this), "Parent-child mismatch");
    Child memory child = Child({
      contractAddress: childTokenAddress,
      tokenId: childTokenId
    });
    _addChildToPending(parentTokenId, child);
    emit ChildProposed(parentTokenId);
  }

  /**
  @dev Sends an instance of Child from the pending children array at index to children array for _tokenId.
  * Updates _emptyIndexes of tokenId to preserve ordering.
  */

  //CHECK: preload mappings into memory for gas savings
  function acceptChild(uint256 _tokenId, uint256 index) public virtual onlyApprovedOrOwner(_tokenId) {
    require(
      _pendingChildren[_tokenId].length > index,
      "RMRKcore: Pending child index out of range"
    );
    // FIXME: if it approved for transfer it should either update/remove the approvedTransfers or stop this accept.

    Child memory child_ = _pendingChildren[_tokenId][index];

    removeItemByIndex_C(_pendingChildren[_tokenId], index);

    _addChildToChildren(_tokenId, child_);
    emit ChildAccepted(_tokenId);
  }

  /**
  @dev Deletes all pending children.
  */
  function rejectAllChildren(uint256 _tokenId) public virtual onlyApprovedOrOwner(_tokenId) {
    delete(_pendingChildren[_tokenId]);
    emit AllPendingChildrenRemoved(_tokenId);
  }

  /**
  @dev Deletes a single child from the pending array by index.
  */

  function rejectChild(uint256 _tokenId, uint256 index) public virtual onlyApprovedOrOwner(_tokenId) {
    require(
      _pendingChildren[_tokenId].length > index,
      "RMRKcore: Pending child index out of range"
    );
    removeItemByIndex_C(_pendingChildren[_tokenId], index);
    emit PendingChildRemoved(_tokenId, index);
  }

  /**
  @dev Deletes a single child from the child array by index.
  */

  function removeChild(uint256 _tokenId, uint256 index) public virtual onlyApprovedOrOwner(_tokenId) {
    require(
      _children[_tokenId].length > index,
      "RMRKcore: Child index out of range"
    );

    removeItemByIndex_C(_children[_tokenId], index);
    emit ChildRemoved(_tokenId, index);
  }

  function unnestChild(uint256 tokenId, uint256 index) public virtual onlyApprovedOrOwner(tokenId) {
    require(
      _children[tokenId].length > index,
      "RMRKcore: Child index out of range"
    );
    Child memory child = _children[tokenId][index];
    removeItemByIndex_C(_children[tokenId], index);
    IRMRKNesting(child.contractAddress).unnestToken(child.tokenId, tokenId, _RMRKOwners[tokenId].ownerAddress);
    emit ChildUnnested(tokenId, child.tokenId);
  }

  //TODO Gotta ask steven about this one
  function unnestToken(uint256 tokenId, uint256 parentId, address newOwner) public virtual {
    // A malicious contract which is parent to this token, could unnest any children and transfer to new owner
    RMRKOwner memory owner = _RMRKOwners[tokenId];
    require(
      owner.ownerAddress != address(0),
      "RMRKCore: unnest for nonexistent token"
    );
    require(
      owner.isNft,
      "RMRKCore: unnest for non-NFT parent"
    );
    require(
      owner.tokenId == parentId,
      "RMRKCore: unnest from wrong parent"
    );
    require(
      owner.ownerAddress == msg.sender,
      "RMRKCore: unnest from wrong owner"
    );
    _RMRKOwners[tokenId] = RMRKOwner({
      ownerAddress: newOwner,
      tokenId: 0,
      isNft: false
    });

  }


  /**
  @dev Adds an instance of Child to the pending children array for _tokenId. This is hardcoded to be 128 by default.
  */

  function _addChildToPending(uint256 _tokenId, Child memory _child) internal {
    if(_pendingChildren[_tokenId].length < 128) {
      _pendingChildren[_tokenId].push(_child);
    } else {
      revert("RMRKCore: Max pending children reached");
    }
  }

  /**
  @dev Adds an instance of Child to the children array for _tokenId.
  */

  function _addChildToChildren(uint256 _tokenId, Child memory _child) internal {
    _children[_tokenId].push(_child);
  }

  //how could devs allow something like this, smh
  //Checks that caller is current RMRKOwnerOf contract
  //Updates rootOwner balance
  //recursively calls _burnChildren on all children
  //update for reentrancy
  function _burnChildren(uint256 tokenId, address oldOwner) public virtual {
    (address _RMRKOwner, , ) = rmrkOwnerOf(tokenId);
    require(_RMRKOwner == _msgSender(), "Caller is not RMRKOwner contract");
    _balances[oldOwner] -= 1;

    Child[] memory children = childrenOf(tokenId);

    uint256 length = children.length; //gas savings
    for (uint i; i<length; i = i.u_inc()){
      address childContractAddress = children[i].contractAddress;
      uint256 childTokenId = children[i].tokenId;

      IRMRKNesting(childContractAddress)._burnChildren(
        childTokenId,
        oldOwner
      );
    }
    emit ChildBurned(tokenId);
    delete _RMRKOwners[tokenId];

    //Also delete pending arrays for gas refund?
    //This can emit a lot of events.
  }

  /**
  @dev Returns all confirmed children
  */

  function childrenOf(uint256 parentTokenId) public view returns (Child[] memory) {
    Child[] memory children = _children[parentTokenId];
    return children;
  }

  /**
  @dev Returns all pending children
  */

  function pendingChildrenOf(uint256 parentTokenId) public view returns (Child[] memory) {
    Child[] memory pendingChildren = _pendingChildren[parentTokenId];
    return pendingChildren;
  }

  ////////////////////////////////////////
  //           SELF-AWARENESS
  ////////////////////////////////////////
  // I'm afraid I can't do that, Dave.

  function _checkRMRKNestingImplementer(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
  ) private returns (bool) {
      if (to.isContract()) {
          try IRMRKNestingReceiver(to).onRMRKNestingReceived(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
              return retval == IRMRKNestingReceiver.onRMRKNestingReceived.selector;
          } catch (bytes memory reason) {
              if (reason.length == 0) {
                  revert("RMRKNesting: transfer to non RMRKNesting implementer");
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

  function _checkOnERC721Received(
      address from,
      address to,
      uint256 tokenId,
      bytes memory data
  ) private returns (bool) {
      if (to.isContract()) {
          try IERC721Receiver(to).onERC721Received(
              _msgSender(),
              from,
              tokenId,
              data
          ) returns (bytes4 retval) {
              return retval == IERC721Receiver.onERC721Received.selector;
          } catch (bytes memory reason) {
              if (reason.length == 0) {
                  revert("ERC721: transfer to non ERC721 Receiver implementer");
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

  //Make also return true for ERC721?
  function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
      return interfaceId == type(IRMRKNesting).interfaceId;
  }

  //HELPERS

  // For child storage array
  function removeItemByIndex_C(Child[] storage array, uint256 index) internal {
    //Check to see if this is already gated by require in all calls
    require(index < array.length);
    array[index] = array[array.length-1];
    array.pop();
  }

  function removeItemByIndexMulti_C(Child[] storage array, uint256[] memory indexes) internal {
    uint256 length = indexes.length; //gas savings
    for (uint i; i<length; i = i.u_inc()) {
      removeItemByIndex_C(array, indexes[i]);
    }
  }

}
