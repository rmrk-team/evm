// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.9;

import "./interfaces/IRMRKNestingInternal.sol";
import "./library/RMRKLib.sol";
import "./utils/Context.sol";
import "hardhat/console.sol";


contract RMRKNesting is Context {

  using RMRKLib for uint256;

  struct Child {
    uint256 tokenId;
    address contractAddress;
    uint16 slotEquipped;
    bytes8 partId;
  }

  struct RMRKOwner {
    uint256 tokenId;
    address ownerAddress;
    bool isNft;
  }

  enum ChildStatus {
      Unknown,
      Pending,
      Accepted
  }

  mapping(uint256 => RMRKOwner) internal _RMRKOwners;

  mapping(address => uint256) internal _balances;

  mapping(uint256 => Child[]) internal _children;

  mapping(uint256 => Child[]) internal _pendingChildren;

  //Nesting events
  event ChildProposed(uint parentTokenId);
  event ChildAccepted(uint tokenId);
  event PendingChildRemoved(uint tokenId, uint index);
  event AllPendingChildrenRemoved(uint tokenId);
  event ChildRemoved(uint tokenId, uint index);
  //Gas check this, can emit lots of events. Possibly offset by gas savings from deleted arrays.
  event ChildBurned(uint tokenId);

  ////////////////////////////////////////
  //             PROVENANCE
  ////////////////////////////////////////

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
      owner = IRMRKNestingInternal(owner).ownerOf(ownerTokenId);
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

  function _isChild(address sender, uint256 tokenId, uint256 childIndex, ChildStatus status) internal view returns (bool) {
    // What about also checking for tx origin to equal sender or approved?
    if (status == ChildStatus.Pending) {
      Child memory pendingChild = _pendingChildren[tokenId][childIndex];
      return pendingChild.contractAddress == sender;
    }
    else if (status == ChildStatus.Accepted) {
      Child memory child = _children[tokenId][childIndex];
      return child.contractAddress == sender;
    }
    revert("RMRKCore: Unexpected child status");
  }

  ////////////////////////////////////////
  //          CHILD MANAGEMENT
  ////////////////////////////////////////

  /**
   * @dev Function designed to be used by other instances of RMRK-Core contracts to update children.
   * param1 childAddress is the address of the child contract as an IRMRKCore instance
   * param2 parentTokenId is the tokenId of the parent token on (this).
   * param3 childTokenId is the tokenId of the child instance
   */

  //update for reentrancy
  function _addChild(uint parentTokenId, uint childTokenId, address childTokenAddress) internal virtual {
    IRMRKNestingInternal childTokenContract = IRMRKNestingInternal(childTokenAddress);
    (address parent, , ) = childTokenContract.rmrkOwnerOf(childTokenId);
    require(parent == address(this), "Parent-child mismatch");
    Child memory child = Child({
       contractAddress: childTokenAddress,
       tokenId: childTokenId,
       slotEquipped: 0,
       partId: 0
     });
    _addChildToPending(parentTokenId, child);
    emit ChildProposed(parentTokenId);
  }

  /**
  @dev Sends an instance of Child from the pending children array at index to children array for _tokenId.
  * Updates _emptyIndexes of tokenId to preserve ordering.
  */

  //CHECK: preload mappings into memory for gas savings
  function _acceptChild(uint256 _tokenId, uint256 index) internal {
    require(
      _pendingChildren[_tokenId].length > index,
      "RMRKcore: Pending child index out of range"
    );

    Child memory child_ = _pendingChildren[_tokenId][index];

    removeItemByIndex_C(_pendingChildren[_tokenId], index);

    _addChildToChildren(_tokenId, child_);
    emit ChildAccepted(_tokenId);
  }

  function _addChildAccepted(uint parentTokenId, uint childTokenId, address childTokenAddress) internal virtual {
    IRMRKNestingInternal childTokenContract = IRMRKNestingInternal(childTokenAddress);
    (address parent, , ) = childTokenContract.rmrkOwnerOf(childTokenId);
    require(parent == address(this), "Parent-child mismatch");
    Child memory child = Child({
       contractAddress: childTokenAddress,
       tokenId: childTokenId,
       slotEquipped: 0,
       partId: 0
     });
    _addChildToChildren(parentTokenId, child);
    // FIXME: Should it also emmit ChildProposed?
    emit ChildAccepted(parentTokenId);
  }

  /**
  @dev Deletes all pending children.
  */

  function _rejectAllChildren(uint256 _tokenId) internal {
    delete(_pendingChildren[_tokenId]);
    emit AllPendingChildrenRemoved(_tokenId);
  }

  /**
  @dev Deletes a single child from the pending array by index.
  */

  function _rejectChild(uint256 _tokenId, uint256 index) internal {
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

  function _removeChild(uint256 _tokenId, uint256 index) internal {
    require(
      _children[_tokenId].length > index,
      "RMRKcore: Child index out of range"
    );

    removeItemByIndex_C(_children[_tokenId], index);
    emit ChildRemoved(_tokenId, index);
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

      IRMRKNestingInternal(childContractAddress)._burnChildren(
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
