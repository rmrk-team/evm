// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.9;

import "./interfaces/IRMRKCore.sol";
import "./access/RMRKIssuable.sol";
import "./RMRKMultiResource.sol";
import "./RMRKNesting.sol";
import "./RMRKRoyalties.sol";
import "./utils/Address.sol";
import "./utils/Context.sol";
import "./utils/Strings.sol";

import "hardhat/console.sol";

contract RMRKCore is Context, IRMRKCore, RMRKMultiResource, RMRKNesting, RMRKRoyalties, RMRKIssuable {
  using Address for address;
  using Strings for uint256;

  string private _name;

  string private _symbol;

  mapping(uint256 => address) private _tokenApprovals;

  constructor(string memory name_, string memory symbol_, string memory resourceName)
  RMRKMultiResource(resourceName)
  {
    _name = name_;
    _symbol = symbol_;
  }

  //Anything gated by this modifier should probably also clear approvals on end of execution
  modifier onlyApprovedOrOwner(uint256 tokenId) {
    require(_isApprovedOrOwner(_msgSender(), tokenId),
      "RMRKCore: Not approved or owner"
    );
    _;
  }

  //Anything gated by this modifier should probably also clear approvals on end of execution
  modifier onlyApprovedOrOwnerOrTransferable(uint256 tokenId, ChildStatus status, uint256 index, uint256 childId) {
    require(_isApprovedOrOwner(_msgSender(), tokenId) || _approvedForTransfer(tokenId, status, index, childId, _msgSender()),
      "RMRKCore: Not approved or owner"
    );
    _;
  }
  /*
  TODOS:
  Isolate _transfer() branches in own functions
  Update functions that take address and use as interface to take interface instead
  double check (this) in addChild() call functions appropriately

  VULNERABILITY CHECK NOTES:
  External calls:
  ownerOf() during _transfer
  addChild() during _transfer()

  Vulnerabilities to test:
  Greif during _transfer via addChild reentry?

  EVENTUALLY:
  Create minimal contract that relies on on-chain libraries for gas savings
  */

  /**
  @dev Returns name of NFT collection.
  */

  function name() public view virtual returns (string memory) {
    return _name;
  }

  /**
  @dev Returns symbol of NFT collection.
  */

  function symbol() public view virtual returns (string memory) {
    return _symbol;
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
    require(_checkRMRKCoreImplementer(_msgSender(), to, tokenId, ""),
      "RMRKCore: Mint to non-RMRKCore implementer"
    );

    IRMRKNestingInternal destContract = IRMRKNestingInternal(to);

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
    for (uint i; i<length; i = u_inc(i)){
      IRMRKNestingInternal(children[i].contractAddress)._burnChildren(
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

  /**
  * @dev See {IERC721-transferFrom}.
  */
  function transfer(
    address to,
    uint256 tokenId
  ) public virtual {
    transferFrom(msg.sender, to, tokenId, 0, new bytes(0));
  }

  /**
  * @dev
  */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId,
    uint256 destinationId,
    bytes memory data
  ) public virtual onlyApprovedOrOwner(tokenId) {
    //solhint-disable-next-line max-line-length
    _transfer(from, to, tokenId, destinationId, ChildStatus.Unknown, 0, data);
  }

  function transferFromRmrk(
    address from,
    address to,
    uint256 tokenId,
    uint256 toTokenId,
    ChildStatus childStatus,
    uint256 childIndex,
    bytes memory data
  ) public virtual onlyApprovedOrOwner(tokenId){
    _transfer(from, to, tokenId, toTokenId, childStatus, childIndex, data);
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
    ChildStatus childStatus,
    uint256 childIndex,
    bytes memory data
  ) internal virtual {
    require(ownerOf(tokenId) == from, "RMRKCore: transfer from incorrect owner");
    require(to != address(0), "RMRKCore: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    // FIXME: balances are not tested and probably broken
    _balances[from] -= 1;
    RMRKOwner memory rmrkOwner = _RMRKOwners[tokenId];
    bool destinationIsNft = isRMRKCore(from, to, tokenId, data);

    _RMRKOwners[tokenId] = RMRKOwner({
      ownerAddress: to,
      tokenId: toTokenId,
      isNft: destinationIsNft
    });

    // If the current owner is an NFT, we need to remove the child from it
    if (rmrkOwner.isNft && rmrkOwner.ownerAddress != address(0)) {
      IRMRKNestingInternal parentContract = IRMRKNestingInternal(rmrkOwner.ownerAddress);

      if (childStatus == ChildStatus.Pending){
        parentContract.rejectChild(rmrkOwner.tokenId, childIndex);
      }
      else if (childStatus == ChildStatus.Accepted){
        parentContract.removeChild(rmrkOwner.tokenId, childIndex);
      }
      else if (childStatus == ChildStatus.Unknown){
        parentContract.removeOrRejectChild(rmrkOwner.tokenId, tokenId);
      }
      else {
        revert("RMRKCore: Invalid child status");
      }
    }
    // Clear approvals from the previous owner
    _approve(address(0), tokenId);

    if(!destinationIsNft) {
      _balances[to] += 1;
    } else {
      // If destination is an NFT, we need to add the child to it
      IRMRKNestingInternal destContract = IRMRKNestingInternal(to);
      address nextOwner = destContract.ownerOf(toTokenId);
      _balances[nextOwner] += 1;

      if (from == nextOwner && childStatus == ChildStatus.Accepted) {
        destContract.addChildAccepted(toTokenId, tokenId, address(this));
      }
      else {
        destContract.addChild(toTokenId, tokenId, address(this));
      }
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

  ////////////////////////////////////////
  //              RESOURCES
  ////////////////////////////////////////

  //TODO: Permissioning
  function addResourceEntry (
      bytes8 _id,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI
  ) external onlyIssuer {
    _addResourceEntry(
      _id,
      _src,
      _thumb,
      _metadataURI
      );
  }

  function addResource(
      uint256 _tokenId,
      IRMRKResourceCore _resourceAddress,
      bytes8 _resourceId,
      bytes16 _overwrites
  ) external onlyIssuer {
    _addResource(
      _tokenId,
      _resourceAddress,
      _resourceId,
      _overwrites
      );
  }

  function acceptResource(uint256 _tokenId, uint256 index) external onlyApprovedOrOwner(_tokenId) {
    _acceptResource(_tokenId, index);
  }

  function rejectResource(uint256 _tokenId, uint256 index) external onlyApprovedOrOwner(_tokenId) {
    _rejectResource(_tokenId, index);
  }

  function rejectAllResources(uint256 _tokenId) external onlyApprovedOrOwner(_tokenId) {
    _rejectAllResources(_tokenId);
  }

  function setPriority(uint256 _tokenId, uint16[] memory _ids) external onlyApprovedOrOwner(_tokenId) {
    _setPriority(_tokenId, _ids);
  }

  ////////////////////////////////////////
  //          CHILD MANAGEMENT
  ////////////////////////////////////////

  //TODO: Permissioning

  //Ensure this is also callable within the context of this contract
  function addChild(uint _parentTokenId, uint _childTokenId, address childTokenAddress) public {
    _addChild(_parentTokenId, _childTokenId, childTokenAddress);
  }

  // FIXME: this requires a modifier to restrict access, onlyApprovedOrOwnerOrChild cannot be used since there's no child yet
  function addChildAccepted(uint _parentTokenId, uint _childTokenId, address childTokenAddress) public {
    _addChildAccepted(_parentTokenId, _childTokenId, childTokenAddress);
  }

  function acceptChild(uint256 _tokenId, uint256 index) external onlyApprovedOrOwner(_tokenId) {
    _acceptChild(_tokenId, index);
  }

  function approveTransfer(uint256 _tokenId, uint256 childIndex, ChildStatus status) external onlyApprovedOrOwner(_tokenId) {
    _approveTransfer(_tokenId, childIndex, status);
  }

  function rejectChild(uint256 _tokenId, uint256 index) external onlyApprovedOrOwnerOrTransferable(_tokenId, ChildStatus.Pending, index, 0) {
    _rejectChild(_tokenId, index);
  }

  function rejectAllChildren(uint256 _tokenId) external onlyApprovedOrOwner(_tokenId) {
    _rejectAllChildren(_tokenId);
  }

  function removeChild(uint256 _tokenId, uint256 index) external onlyApprovedOrOwnerOrTransferable(_tokenId, ChildStatus.Accepted, index, 0) {
    _removeChild(_tokenId, index);
  }

  function removeOrRejectChild(uint256 _tokenId, uint256 _childId) external onlyApprovedOrOwnerOrTransferable(_tokenId, ChildStatus.Unknown, 0, _childId) {
    _removeOrRejectChild(_tokenId, _childId);
  }

  ////////////////////////////////////////
  //           SELF-AWARENESS
  ////////////////////////////////////////
  // I'm afraid I can't do that, Dave.

  function _checkRMRKCoreImplementer(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
  ) private returns (bool) {
      if (to.isContract()) {
          try IRMRKCore(to).rmrkCoreCheck(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
              return retval == IRMRKCore.rmrkCoreCheck.selector;
          } catch (bytes memory reason) {
              if (reason.length == 0) {
                  revert("RMRKCore: transfer to non RMRKCore implementer");
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

  //This is not 100% secure -- a bytes4 function signature is replicable via brute force attacks.
  function rmrkCoreCheck(
      address,
      address,
      uint256,
      bytes memory
  ) public virtual returns (bytes4) {
      return IRMRKCore.rmrkCoreCheck.selector;
  }

  function isRMRKCore(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
  ) internal virtual returns (bool) {
    if (to.isContract()) {
      try IRMRKCore(to).rmrkCoreCheck(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
        return retval == IRMRKCore.rmrkCoreCheck.selector;
      } catch {
        return false;
      }
    }
    else {
      return false;
    }
  }

  ////////////////////////////////////////
  //              ROYALTIES
  ////////////////////////////////////////

  function setRoyaltyData(address _royaltyAddress, uint32 _numerator, uint32 _denominator) external onlyIssuer {
      _setRoyaltyData(_royaltyAddress, _numerator, _denominator);
  }

  function getRoyaltyData() external view returns(address royaltyAddress, uint256 numerator, uint256 denominator) {
      (royaltyAddress, numerator, denominator) = _getRoyaltyData();
  }


  ////////////////////////////////////////
  //              HELPERS
  ////////////////////////////////////////

  function _removeItemByValue(bytes16 value, bytes16[] storage array) internal {
    bytes16[] memory memArr = array; //Copy array to memory, check for gas savings here
    uint256 length = memArr.length; //gas savings
    for (uint i; i<length; i = u_inc(i)) {
      if (memArr[i] == value) {
        _removeItemByIndex(i, array);
        break;
      }
    }
  }

  // For child storage array
  function _removeItemByIndex(uint256 index, Child[] storage array) internal {
    //Check to see if this is already gated by require in all calls
    require(index < array.length);
    array[index] = array[array.length-1];
    array.pop();
  }

  //For reasource storage array
  function _removeItemByIndex(uint256 index, bytes16[] storage array) internal {
    //Check to see if this is already gated by require in all calls
    require(index < array.length);
    array[index] = array[array.length-1];
    array.pop();
  }

  function _removeItemByIndexMulti(uint256[] memory indexes, Child[] storage array) internal {
    uint256 length = indexes.length; //gas savings
    for (uint i; i<length; i = u_inc(i)) {
      _removeItemByIndex(indexes[i], array);
    }
  }

  // Gas saving iterator
  function u_inc(uint i) private pure returns (uint r) {
    unchecked {
      assembly {
        r := add(i, 1)
      }
    }
  }
}
