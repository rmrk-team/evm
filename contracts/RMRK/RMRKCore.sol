// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./IRMRKCore.sol";
import "./IERC721Receiver.sol";
import "./extensions/IERC721Metadata.sol";
import "./utils/Address.sol";
import "./utils/Context.sol";
import "./utils/Strings.sol";
import "./utils/introspection/ERC165.sol";
import "./access/AccessControl.sol";
import "./RMRKResource.sol";

//import "hardhat/console.sol";

contract RMRKCore is Context, IRMRKCore, AccessControl {
  using Address for address;
  using Strings for uint256;

  struct Child {
    uint256 tokenId;
    address contractAddress;
    uint16 slotEquipped;
    bytes8 partId;
  }

  struct NftOwner {
    address contractAddress;
    uint256 tokenId;
  }

  struct Resource {
    address resourceAddress;
    bytes8 resourceId;
    bool pending;
  }

  struct RoyaltyData {
    address royaltyAddress;
    uint32 numerator;
    uint32 denominator;
  }

  string private _name;

  string private _symbol;

  string private _tokenURI;

  RoyaltyData private _royalties;

  mapping(uint256 => address) private _owners;

  mapping(address => uint256) private _balances;

  mapping(uint256 => address) private _tokenApprovals;

  mapping(uint256 => NftOwner) private _nftOwners;

  mapping(uint256 => Child[]) private _children;

  mapping(uint256 => Child[]) private _pendingChildren;

  mapping(uint256 => uint8[]) private _emptyIndexes;

  //Resources

  //mapping of tokenId to resourceId to resource entry
  mapping(uint256 => mapping(bytes8 => Resource)) private _resources;

  //mapping of tokenId to all resources by priority
  mapping(uint256 => bytes8[]) private _priority;

  RMRKResource public resourceStorage;

  // AccessControl roles and nest flag constants

  bytes32 private constant issuer = keccak256("ISSUER");

  bytes32 private constant nestFlag = keccak256("NEST");

  //Resource events
  event ResourceAdded(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResourceAccepted(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResourcePrioritySet(uint256 indexed tokenId);
  event ResourceEquipped();
  event ResourceUnequipped();

  //Nesting events

  event ParentRemoved(address parentAddress, uint parentTokenId, uint childTokenId);
  event ChildRemoved(address childAddress, uint parentTokenId, uint childTokenId);

  constructor(string memory name_, string memory symbol_, string memory resourceName) {
    resourceStorage = new RMRKResource(resourceName);
    _name = name_;
    _symbol = symbol_;

    _grantRole(issuer, msg.sender);
    _setRoleAdmin(issuer, issuer);
  }

  /*
  TODOS:
  abstract "transfer caller is not owner nor approved" to modifier
  Isolate _transfer() branches in own functions
  Update functions that take address and use as interface to take interface instead
  double check (this) in setChild() call functions appropriately

  VULNERABILITY CHECK NOTES:
  External calls:
  ownerOf() during _transfer
  setChild() during _transfer()

  Vulnerabilities to test:
  Greif during _transfer via setChild reentry?

  EVENTUALLY:
  Create minimal contract that relies on on-chain libraries for gas savings
  */

  ////////////////////////////////////////
  //             PROVENANCE
  ////////////////////////////////////////

  /**
  @dev Returns NFT owner for a nested NFT.
  * Returns a tuple of (address, uint), which is the address and token ID of the NFT owner.
  */

  function nftOwnerOf(uint256 tokenId) public view virtual returns (address, uint256) {
    NftOwner memory owner = _nftOwners[tokenId];
    require(owner.contractAddress != address(0), "RMRKCore: owner query for nonexistent token");
    return (owner.contractAddress, owner.tokenId);
  }

  /**
  @dev Returns root owner of token. Can be an ETH address with our without contract data.
  */

  function ownerOf(uint256 tokenId) public view virtual override returns (address) {
    address owner = _owners[tokenId];
    require(owner != address(0), "RMRKCore: owner query for nonexistent token");
    return owner;
  }

  /**
  @dev Returns balance of tokens owner by a given rootOwner.
  */

  function balanceOf(address owner) public view virtual returns (uint256) {
    require(owner != address(0), "RMRKCore: balance query for the zero address");
    return _balances[owner];
  }

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

  // change to ERC 165 implementation of IRMRKCore
  function isRMRKCore() public pure returns (bool){
    return true;
  }

  function tokenURI(uint256 tokenId) public virtual view returns(string memory){
   return _tokenURI;
  }

  ////////////////////////////////////////
  //          CHILD MANAGEMENT
  ////////////////////////////////////////

  /**
  @dev Adds an instance of Child to the pending children array for _tokenId. In the event a space in the array is open, pulls from
  * and updates the _emptyindexes array, which is an intermediate array used to preserve ordering.
  */

  //CHECK: preload mappings into memory for gas savings
  function addChildToPending(Child memory _child, uint256 _tokenId) internal {
    if(_pendingChildren[_tokenId].length < 128) {
      _pendingChildren[_tokenId].push(_child);
    }
    else {
      require(_emptyIndexes[_tokenId].length > 0, "No available slots!");
      //wawawewa
      _pendingChildren[_tokenId][_emptyIndexes[_tokenId][(_emptyIndexes[_tokenId].length-1)]] = _child;
      _emptyIndexes[_tokenId].pop();
    }
  }

  /**
  @dev Sends an instance of Child from the pending children array at index to children array for _tokenId.
  * Updates _emptyIndexes of tokenId to preserve ordering.
  */

  //CHECK: preload mappings into memory for gas savings
  function acceptChildFromPending(uint256 index, uint256 _tokenId) public {
    require(
      _pendingChildren[_tokenId].length > index,
      "RMRKcore: Pending child index out of range"
    );
    require(
      ownerOf(_tokenId) == _msgSender(),
      "RMRKcore: Bad owner"
    );
    Child memory child_ = _pendingChildren[_tokenId][index];
    _pendingChildren[_tokenId][index] = Child({
      tokenId: 0,
      contractAddress: address(0),
      slotEquipped: 0,
      partId: bytes8(0)
      });
    _emptyIndexes[_tokenId].push(uint8(index));
    _children[_tokenId].push(child_);
  }

  /**
  @dev Sends an instance of Child from the pending children array at index to children array for _tokenId.
  * Updates _emptyIndexes of tokenId to preserve ordering.
  */

  function deletePending(uint256 _tokenId) public {
    require(_msgSender() == ownerOf(_tokenId), "RMRKCore: Bad owner");
    delete(_pendingChildren[_tokenId]);
}

  /**
  @dev Returns all confirmed children
  */

  function childrenOf (uint256 parentTokenId) public view returns (Child[] memory) {
    Child[] memory children = _children[parentTokenId];
    return children;
  }

  /**
  @dev Returns all pending children
  */

  function pendingChildrenOf (uint256 parentTokenId) public view returns (Child[] memory) {
    Child[] memory children = _pendingChildren[parentTokenId];
    return children;
  }

  /**
  * removeChild and removeParent can be called from either side
  */

  /**
  @dev Removes a child NFT from children[].
  * Designed to be called by the removeParent function on an IRMRKCore contract to manage child[] array.
  * Syncs parent-child relationship if used as a callback from its partner function.
  * TODO: Restrict to contracts first called by approved owner. Must implement pattern for this.
  * Option: Find some way to identify child -- abi.encodePacked? Is more gas efficient than sloading the struct?
  * Note: Information shared between these two items is sometimes loaded twice.
  * Find a way to pass information effectively in the event this is used as a callback.
  */

  function removeChild(uint256 tokenId, address childAddress, uint256 childTokenId) public {
    require(
      isApprovedOrOwner(msg.sender, tokenId) ||
      _msgSender() == childAddress);
    Child[] memory children = childrenOf(tokenId);
    uint i;
    while (i<children.length) {
      if (children[i].contractAddress == childAddress && children[i].tokenId == childTokenId) {
        //Double check this, hacky-feeling set to array storage from array memory.
        _children[tokenId][i] = children[children.length-1];
        _children[tokenId].pop();
      }
      i++;
    }
    //Sync parent
    IRMRKCore RMRKChild = IRMRKCore(childAddress);
    (address ownerAddress, ) = RMRKChild.nftOwnerOf(childTokenId);
    if (ownerAddress != address(0)) {
      RMRKChild.removeParentCallback(childTokenId, this.removeParentCallback.selector);
    }
  emit ChildRemoved(childAddress, tokenId, childTokenId);
  }

  /**
  @dev Removes an NFT from its parent, removing the nftOwnerOf entry.
  */

  function removeParent(uint256 tokenId) public {
    _removeParent(tokenId, "");
  }

  function removeParentCallback(uint256 tokenId, bytes4 callback) public {
    require(_msgSender().isContract(), "RMRKCORE: Caller is not a contract");
    _removeParent(tokenId, callback);
  }

  //Currently passed into _burn function, will fail upon burning children. Must update require statement to
  //accommodate this.
  function _removeParent(uint256 tokenId, bytes4 callback) internal {
    require(isApprovedOwnerOrNftOwner(_msgSender(), tokenId),
      "RMRKCore: transfer caller is not owner nor approved"
    );
    (address owner, uint parentTokenId) = nftOwnerOf(tokenId);
    require(owner != address(0), "Attempt to remove uninitialized parent");
    delete(_nftOwners[tokenId]);

    if (callback != this.removeParentCallback.selector){
        IRMRKCore(owner).removeChild(parentTokenId, address(this), tokenId);
    }

    emit ParentRemoved(owner, parentTokenId, tokenId);
  }

  /* *
  @dev Accepts a child, setting pending to false.
  * Storing children as an array seems inefficient, consider keccak256(abi.encodePacked(parentAddr, tokenId)) as key for mapping(childKey => childObj)))
  * This operation can make getChildren() operation wacky racers, test it
  * mappings rule, iterating through arrays drools
  * SSTORE and SLOAD are basically the same gas cost anyway
  */

  /* function acceptChild(uint256 tokenId, address childAddress, uint256 childTokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "RMRKCore: Attempting to accept a child in non-owned NFT");
    Child[] memory children = childrenOf(tokenId);
    uint i = 0;
    while (i<children.length) {
      if (children[i].contractAddress == childAddress && children[i].tokenId == childTokenId) {
        _children[tokenId][i].pending = false;
      }
      i++;
    }
  } */

  ////////////////////////////////////////
  //              MINTING
  ////////////////////////////////////////

  /**
  @dev Mints an NFT.
  * Can mint to a root owner or another NFT.
  * If 'NEST' is passed via _data parameter, token is minted into another NFT if target contract implemnts RMRKCore (Latter not implemented)
  *
  */

  function _mint(address to, uint256 tokenId) internal virtual {
    _mint(to, tokenId, 0, "");
  }

  function _mint(address to, uint256 tokenId, uint256 destinationId, string memory _data) internal virtual {

    //Gas saving here from string > bytes?
    if (keccak256(bytes(_data)) == nestFlag) {
      _mintToNft(to, tokenId, destinationId);
    }
    else{
      _mintToRootOwner(to, tokenId);
    }
  }

  function _mintToNft(address to, uint256 tokenId, uint256 destinationId) internal virtual {
    require(to != address(0), "RMRKCore: mint to the zero address");
    require(!_exists(tokenId), "RMRKCore: token already minted");
    require(to.isContract(), "RMRKCore: Is not contract");
    IRMRKCore destContract = IRMRKCore(to);
    /* require(destContract.isRMRKCore(), "Not RMRK Core"); */ //Implement supportsInterface RMRKCore

    _beforeTokenTransfer(address(0), to, tokenId);
    address rootOwner = destContract.ownerOf(destinationId);
    _balances[rootOwner] += 1;
    _owners[tokenId] = rootOwner;

    _nftOwners[tokenId] = NftOwner({
      contractAddress: to,
      tokenId: destinationId
      });

    bool pending = !destContract.isApprovedOrOwner(msg.sender, destinationId);
    destContract.setChild(this, destinationId, tokenId, pending);

    emit Transfer(address(0), to, tokenId);

    _afterTokenTransfer(address(0), to, tokenId);
  }

  function _mintToRootOwner(address to, uint256 tokenId) internal virtual {
    require(to != address(0), "RMRKCore: mint to the zero address");
    require(!_exists(tokenId), "RMRKCore: token already minted");

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
    delete _nftOwners[tokenId];

    emit Transfer(owner, address(0), tokenId);

    Child[] memory children = childrenOf(tokenId);

    for (uint i; i<children.length; i++){
      IRMRKCore(children[i].contractAddress)._burnChildren(
        children[i].tokenId,
        owner
        );
    }
    removeParent(tokenId);

    _afterTokenTransfer(owner, address(0), tokenId);
  }

  //Make sure to check permissions for this function and perms of removeParent function.
  //how could devs allow something like this, smh
  function _burnChildren(uint256 tokenId, address oldOwner) public {
    (address nftOwner, )= nftOwnerOf(tokenId);
    require(nftOwner == msg.sender, "Caller is not nftOwner contract");
    _balances[oldOwner] -= 1;
    delete _owners[tokenId];
    delete _nftOwners[tokenId];

    Child[] memory children = childrenOf(tokenId);

    for (uint i; i<children.length; i++){
      IRMRKCore(children[i].contractAddress)._burnChildren(
        children[i].tokenId,
        oldOwner
        );
    }
    removeParent(tokenId);
  }

  ////////////////////////////////////////
  //             TRANSFERS
  ////////////////////////////////////////


  /**
  * @dev See {IERC721-transferFrom}.
  */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId,
    uint256 destinationId,
    string memory _data
  ) public virtual {
    //solhint-disable-next-line max-line-length
    require(_isApprovedOrOwner(_msgSender(), tokenId), "RMRKCore: transfer caller is not owner nor approved");
    _transfer(from, to, tokenId, destinationId, _data);
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
    uint256 destinationId,
    string memory _data
  ) internal virtual {
    require(this.ownerOf(tokenId) == from, "RMRKCore: transfer from incorrect owner");
    require(to != address(0), "RMRKCore: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    if (keccak256(bytes(_data)) == nestFlag) {
      _nftOwners[tokenId] = NftOwner({
        contractAddress: to,
        tokenId: destinationId
      });

      IRMRKCore destContract = IRMRKCore(to);
      bool pending = !destContract.isApprovedOrOwner(msg.sender, destinationId);
      address rootOwner = destContract.ownerOf(destinationId);

      _balances[from] -= 1;
      _balances[rootOwner] += 1;
      _owners[tokenId] = rootOwner;

      destContract.setChild(this, destinationId, tokenId, pending);

      //get children and initiate downstream rootOwner update
      //WOWEE this is gettin' complicated

      Child[] memory children = childrenOf(tokenId);

      //Does this need an if statement if array is empty? Probably not
      //Consider try {} catch
      for (uint i; i<children.length; i++){
        IRMRKCore(children[i].contractAddress)._updateRootOwner(
          children[i].tokenId,
          from,
          rootOwner
        );
      }
    }

    else {
      _balances[from] -= 1;
      _balances[to] += 1;
      _owners[tokenId] = to;
    }

    // Clear approvals from the previous owner
    _approve(address(0), tokenId);

    emit Transfer(from, to, tokenId);

    _afterTokenTransfer(from, to, tokenId);
  }

  //Only callable from the contract that owns the token.
  //Pay extra attention to this function, as it DOES NOT QUERY THE OWNING NFT ITSELF
  function _updateRootOwner(uint tokenId, address oldOwner, address newOwner) public {
    //update self
    (address nftOwner, )= nftOwnerOf(tokenId);
    require(nftOwner == msg.sender, "Caller is not nftOwner contract");
    _balances[oldOwner] -= 1;
    _balances[newOwner] += 1;
    _owners[tokenId] = newOwner;
    //get any children and call self on children
    Child[] memory children = childrenOf(tokenId);

    for (uint i; i<children.length; i++){
      IRMRKCore(children[i].contractAddress)._updateRootOwner(
        children[i].tokenId,
        oldOwner,
        newOwner
      );
    }
  }

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
   * param1 childAddress is the address of the child contract as an IRMRKCore instance
   * param2 parentTokenId is the tokenId of the parent token on (this).
   * param3 childTokenId is the tokenId of the child instance
   */
  function setChild(IRMRKCore childAddress, uint parentTokenId, uint childTokenId, bool isPending) public virtual {
    (address parent, ) = childAddress.nftOwnerOf(childTokenId);
    require(parent == address(this), "Parent-child mismatch");

    //if parent token Id is same root owner as child
    Child memory child = Child({
        contractAddress: address(childAddress),
        tokenId: childTokenId,
        slotEquipped: 0,
        partId: 0
      });
    if (isPending) {
      _pendingChildren[parentTokenId].push(child);
    } else {
    _children[parentTokenId].push(child);
    }
  }

  ////////////////////////////////////////
  //      APPROVALS / PRE-CHECKING
  ////////////////////////////////////////

  function _exists(uint256 tokenId) internal view virtual returns (bool) {
    return _owners[tokenId] != address(0);
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

  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
    address owner = this.ownerOf(tokenId);
    return (spender == owner || getApproved(tokenId) == spender);
  }

  //re-implement isApprovedForAll
  function isApprovedOrOwner(address spender, uint256 tokenId) public view virtual returns (bool) {
    bool res = _isApprovedOrOwner(spender, tokenId);
    return res;
  }

  function isApprovedOwnerOrNftOwner(address spender, uint256 tokenId) public view virtual returns (bool) {
    (address nftOwner, ) = nftOwnerOf(tokenId);
    bool res = (nftOwner == _msgSender() || _isApprovedOrOwner(spender, tokenId));
    return res;
  }

  function getApproved(uint256 tokenId) public view virtual returns (address) {
    require(_exists(tokenId), "RMRKCore: approved query for nonexistent token");

    return _tokenApprovals[tokenId];
  }

  //big dumb stupid hack, fix
  function supportsInterface() public returns (bool) {
    return true;
  }

  ////////////////////////////////////////
  //              RESOURCES
  ////////////////////////////////////////

  function addResourceEntry(
      bytes8 _id,
      uint16 _slot,
      address _baseAddress,
      bytes8[] memory _basePartIds,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI
  ) public onlyRole(issuer) {
    resourceStorage.addResourceEntry(
      _id,
      _slot,
      _baseAddress,
      _basePartIds,
      _src,
      _thumb,
      _metadataURI
      );
  }

  function addResourceToToken(
      uint256 _tokenId,
      address _resourceAddress,
      bytes8 _resourceId
  ) public onlyRole(issuer) {
      require(
        _resources[_tokenId][_resourceId].resourceId == bytes8(0),
        "RMRKCore: Resource already exists on token"
      );
      //This error code will never be triggered because of the interior call of
      //resourceStorage.getResource. Left in for posterity.
      require(
        resourceStorage.getResource(_resourceId).id != bytes8(0),
        "RMRKCore: Resource not found in storage"
      );


      bool _pending;
      if (!isApprovedOrOwner(_msgSender(), _tokenId)) {
          _pending = true;
      }

      //Construct Resource object with pending
      Resource memory resource_ = Resource({
        resourceAddress: _resourceAddress,
        resourceId: _resourceId,
        pending: _pending
      });
      //Add resource entry to mapping and ID to priority
      _resources[_tokenId][_resourceId] = resource_;
      _priority[_tokenId].push(_resourceId);
      emit ResourceAdded(_tokenId, _resourceId);
  }

  function acceptResource(uint256 _tokenId, bytes8 _id) public {
      require(
        isApprovedOrOwner(_msgSender(), _tokenId),
          "RMRK: Attempting to accept a resource in non-owned NFT"
      );
      Resource memory resource = _resources[_tokenId][_id];
      require(
        resource.resourceId != bytes8(0),
          "RMRK: resource does not exist"
      );
      require(
        resource.pending,
          "RMRK: resource is already accepted"
      );
      _resources[_tokenId][_id].pending = false;
      emit ResourceAccepted(_tokenId, _id);
  }

  function setPriority(uint256 _tokenId, bytes8[] memory _ids) public {
      require(
        _ids.length == _priority[_tokenId].length,
          "RMRK: Bad priority list length"
      );
      require(
        isApprovedOrOwner(_msgSender(), _tokenId),
          "RMRK: Attempting to set priority in non-owned NFT"
      );
      for (uint256 i = 0; i < _ids.length; i++) {
          require(
            (_resources[_tokenId][_ids[i]].resourceId !=bytes8(0)),
              "RMRK: Trying to reprioritize a non-existant resource"
          );
      }
      _priority[_tokenId] = _ids;
      emit ResourcePrioritySet(_tokenId);
  }

  function getRenderableResource(uint256 tokenId) public virtual view returns(Resource memory) {
    bytes8 resourceId = _priority[tokenId][0];
    return getTokenResource(tokenId, resourceId);
  }

  function getTokenResource(uint256 tokenId, bytes8 resourceId) public virtual view returns(Resource memory) {
    return _resources[tokenId][resourceId];
  }

  //Design decision note -- Mention differences between child and resource 'pending' handling

  function getPriorities(uint256 tokenId) public virtual view returns(bytes8[] memory) {
    return _priority[tokenId];
  }

  ////////////////////////////////////////
  //              ROYALTIES
  ////////////////////////////////////////

  /**
  * @dev Returns contract royalty data.
  * Returns a numerator and denominator for percentage calculations, as well as a desitnation address.
  */
  function getRoyaltyData() public virtual view returns(address royaltyAddress, uint256 numerator, uint256 denominator) {
    RoyaltyData memory data = _royalties;
    return(data.royaltyAddress, uint256(data.numerator), uint256(data.denominator));
  }

  /**
  * @dev Setter for contract royalty data, percentage stored as a numerator and denominator.
  * Recommended values are in Parts Per Million, E.G:
  * A numerator of 1*10**5 and a denominator of 1*10**6 is equal to 10 percent, or 100,000 parts per 1,000,000.
  */

  function setRoyaltyData(address _royaltyAddress, uint32 _numerator, uint32 _denominator) internal virtual onlyRole(issuer) {
    _royalties = RoyaltyData ({
       royaltyAddress: _royaltyAddress,
       numerator: _numerator,
       denominator: _denominator
     });
  }
}
