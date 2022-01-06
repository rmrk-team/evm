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

//import "hardhat/console.sol";

contract RMRKNestable is Context, IRMRKCore, AccessControl {
  using Address for address;
  using Strings for uint256;

  struct Child {
    address contractAddress;
    uint256 tokenId;
    address baseAddr;
    bytes8 equipSlot;
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

  struct Resource {
      bool pending; // 1 byte
      bool exists; //1 byte
      uint32 slot; //4 bytes
      address baseAddress; //20 bytes
      bytes8[] basePartIds; // n bytes
      string src; //32+
      string thumb; //32+
      string metadataURI; //32+
  }


  string private _name;

  string private _symbol;

  string private _tokenURI;

  bytes32 private _nestFlag = keccak256(bytes("NEST"));

  RoyaltyData private _royalties;

  mapping(uint256 => address) private _owners;

  mapping(address => uint256) private _balances;

  mapping(uint256 => address) private _tokenApprovals;

  mapping(uint256 => address) private _nestApprovals;

  mapping(uint256 => NftOwner) private _nftOwners;

  mapping(uint256 => Child[]) private _children;

  //Resources

  mapping(uint256 => mapping(bytes8 => Resource)) private _resources;

  mapping(uint256 => bytes8[]) private _priority;

  // AccessControl roles

  bytes32 public constant issuer = keccak256("ISSUER");

  //Nesting events

  event ParentRemoved(address parentAddress, uint parentTokenId, uint childTokenId);
  event ChildRemoved(address childAddress, uint parentTokenId, uint childTokenId);

  //Resource events

  event ResAdd(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResAccept(uint256 indexed tokenId, bytes32 indexed uuid);
  event ResPrio(uint256 indexed tokenId);
  event ResEquipped();
  event ResUnequipped();

  constructor(string memory name_, string memory symbol_) {
    _name = name_;
    _symbol = symbol_;

    _grantRole(issuer, msg.sender);
    _setRoleAdmin(issuer, issuer);
  }

  function tokenURI(uint256 tokenId) public virtual view returns(string memory){
   return _tokenURI;
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
  // change to ERC 165 implementation of IRMRKCore
  function isRMRKCore() public pure returns (bool){
    return true;
  }

  /**
  @dev Returns all children, even pending
  */

  function childrenOf (uint256 parentTokenId) public view returns (Child[] memory) {
    Child[] memory children = _children[parentTokenId];
    return children;
  }

  /**
  @dev Removes an NFT from its parent, removing the nftOwnerOf entry.
  */

  function removeParent(uint256 tokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

    delete(_nftOwners[tokenId]);
    (address owner, uint parentTokenId) = nftOwnerOf(tokenId);

    IRMRKCore(owner).removeChild(parentTokenId, address(this), tokenId);

    emit ParentRemoved(owner, parentTokenId, tokenId);
  }

  /**
  @dev Removes a child NFT from children[].
  * Designed to be called by the removeParent function on an IRMRKCore contract to manage child[] array.
  * Iterates over an array. Innefficient, consider another pattern.
  * TODO: Restrict to contracts first called by approved owner. Must implement pattern for this.
  * Option: Find some way to identify child -- abi.encodePacked? Is more gas efficient than sloading the struct?
  */

  function removeChild(uint256 tokenId, address childAddress, uint256 childTokenId) public {
    Child[] memory children = childrenOf(tokenId);
    uint i;
    while (i<children.length) {
      if (children[i].contractAddress == childAddress && children[i].tokenId == childTokenId) {
        //Remove item from array, does not preserve order.
        //Double check this, hacky-feeling set to array storage from array memory.
        _children[tokenId][i] = children[children.length-1];
        _children[tokenId].pop();
      }
      i++;
  }

  emit ChildRemoved(childAddress, tokenId, childTokenId);

  }

  /**
  @dev Accepts a child, setting pending to false.
  * Storing children as an array seems inefficient, consider keccak256(abi.encodePacked(parentAddr, tokenId)) as key for mapping(childKey => childObj)))
  * This operation can make getChildren() operation wacky racers, test it
  * mappings rule, iterating through arrays drools
  * SSTORE and SLOAD are basically the same gas cost anyway
  */

  function acceptChild(uint256 tokenId, address childAddress, uint256 childTokenId) public {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "RMRKCore: Attempting to accept a child in non-owned NFT");
    Child[] memory children = childrenOf(tokenId);
    uint i = 0;
    while (i<children.length) {
      if (children[i].contractAddress == childAddress && children[i].tokenId == childTokenId) {
        _children[tokenId][i].pending = false;
      }
      i++;
    }
  }

  /**
  @dev Returns NFT owner for a nested NFT.
  * Returns a tuple of (address, uint), which is the address and token ID of the NFT owner.
  */

  function nftOwnerOf(uint256 tokenId) public view virtual returns (address, uint256) {
    NftOwner memory owner = _nftOwners[tokenId];
    require(owner.contractAddress != address(0), "ERC721: owner query for nonexistent token");
    return (owner.contractAddress, owner.tokenId);
  }

  /**
  @dev Returns root owner of token. Can be an ETH address with our without contract data.
  */

  function ownerOf(uint256 tokenId) public view virtual override returns (address) {
    address owner = _owners[tokenId];
    require(owner != address(0), "ERC721: owner query for nonexistent token");
    return owner;
  }

  /**
  @dev Returns balance of tokens owner by a given rootOwner.
  */

  function balanceOf(address owner) public view virtual returns (uint256) {
    require(owner != address(0), "ERC721: balance query for the zero address");
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

  /**
  @dev Mints an NFT.
  * Can mint to a root owner or another NFT.
  * If 'NEST' is passed via _data parameter, token is minted into another NFT if target contract implemnts RMRKCore (Latter not implemented)
  *
  */

  function mint(address to, uint256 tokenId, uint256 destId, string memory _data) public virtual {

    //Gas saving here from string > bytes?
    if (keccak256(bytes(_data)) == keccak256(bytes("NEST"))) {
      _mintNest(to, tokenId, destId);
    }
    else{
      _mint(to, tokenId);
    }
  }

  function _mintNest(address to, uint256 tokenId, uint256 destId) internal virtual {
    require(to != address(0), "ERC721: mint to the zero address");
    require(!_exists(tokenId), "ERC721: token already minted");
    require(to.isContract(), "Is not contract");
    IRMRKCore destContract = IRMRKCore(to);
    /* require(destContract.isRMRKCore(), "Not RMRK Core"); */ //Implement supportsInterface RMRKCore

    _beforeTokenTransfer(address(0), to, tokenId);
    address rootOwner = destContract.ownerOf(destId);
    _balances[rootOwner] += 1;
    _owners[tokenId] = rootOwner;

    _nftOwners[tokenId] = NftOwner({
      contractAddress: to,
      tokenId: destId
      });

    bool pending = !destContract.isApprovedOrOwner(msg.sender, destId);

    destContract.setChild(this, destId, tokenId, pending);

    emit Transfer(address(0), to, tokenId);

    _afterTokenTransfer(address(0), to, tokenId);
  }

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
    delete _nftOwners[tokenId];

    emit Transfer(owner, address(0), tokenId);

    _afterTokenTransfer(owner, address(0), tokenId);
  }

  /**
  * @dev See {IERC721-transferFrom}.
  */
  function transferFrom(
    address from,
    address to,
    uint256 tokenId,
    uint256 destId,
    string memory _data
  ) public virtual {
    //solhint-disable-next-line max-line-length
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
    _transfer(from, to, tokenId, destId, _data);
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
    uint256 destId,
    string memory _data
  ) internal virtual {
    require(this.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
    require(to != address(0), "ERC721: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    if (keccak256(bytes(_data)) == _nestFlag) {
      _nftOwners[tokenId] = NftOwner({
        contractAddress: to,
        tokenId: destId
        });

      IRMRKCore destContract = IRMRKCore(to);
      bool pending = !destContract.isApprovedOrOwner(msg.sender, destId);
      address rootOwner = destContract.ownerOf(destId);

      _balances[from] -= 1;
      _balances[rootOwner] += 1;
      _owners[tokenId] = rootOwner;

      destContract.setChild(this, destId, tokenId, pending);

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
        baseAddr: address(0),
        equipSlot: bytes8(0),
        pending: isPending
      });
    _children[parentTokenId].push(child);
  }

  function _exists(uint256 tokenId) internal view virtual returns (bool) {
    return _owners[tokenId] != address(0);
  }

  function approve(address to, uint256 tokenId) public virtual {
    address owner = this.ownerOf(tokenId);
    require(to != owner, "ERC721: approval to current owner");

    require(
        _msgSender() == owner,
        "ERC721: approve caller is not owner"
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

  function getApproved(uint256 tokenId) public view virtual returns (address) {
    require(_exists(tokenId), "ERC721: approved query for nonexistent token");

    return _tokenApprovals[tokenId];
  }

  //big dumb stupid hack, fix
  function supportsInterface() public returns (bool) {
    return true;
  }

  //==========RESOURCE FUNCTIONS==========

  function addResource(
      uint256 _tokenId,
      bytes8 _id, //Previously named _id, have seen it called id in RMRK examples / documentation, ask for clarification
      uint32 _slot,
      address _baseAddress,
      bytes8[] memory _basePartIds,
      string memory _src,
      string memory _thumb,
      string memory _metadataURI

  ) public onlyRole(issuer) {
      require(!_resources[_tokenId][_id].exists, "RMRK: resource already exists");
      bool _pending = false;
      if (!isApprovedOrOwner(_msgSender(), _tokenId)) {
          _pending = true;
      }
      Resource memory resource_ = Resource({
          pending: _pending,
          exists: true,
          slot: _slot,
          baseAddress: _baseAddress,
          basePartIds: _basePartIds,
          src: _src,
          thumb: _thumb,
          metadataURI: _metadataURI
      });
      _resources[_tokenId][_id] = resource_;
      _priority[_tokenId].push(_id);
      emit ResAdd(_tokenId, _id);
  }

  function acceptResource(uint256 _tokenId, bytes8 _id) public {
      Resource memory resource = _resources[_tokenId][_id];
      require(
        isApprovedOrOwner(_msgSender(), _tokenId),
          "RMRK: Attempting to accept a resource in non-owned NFT"
      );
      require(resource.exists, "RMRK: resource does not exist");
      require(resource.pending, "RMRK: resource is already accepted");
      _resources[_tokenId][_id].pending = false;
      emit ResAccept(_tokenId, _id);
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
              _resources[_tokenId][_ids[i]].exists,
              "RMRK: Trying to reprioritize a non-existant resource"
          );
      }
      _priority[_tokenId] = _ids;
      emit ResPrio(_tokenId);
  }

  function getRenderableResource(uint256 tokenId) public view returns(Resource memory) {
    bytes8 resourceId = _priority[tokenId][0];
    return getTokenResource(tokenId, resourceId);
  }

  function getTokenResource(uint256 tokenId, bytes8 resourceId) public view returns(Resource memory) {
    return _resources[tokenId][resourceId];
  }

  function getPriorities(uint256 tokenId) public view returns(bytes8[] memory) {
    return _priority[tokenId];
  }

  //==========ROYALTY FUNCTIONS==========

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
  
  function setRoyaltyData(address _royaltyAddress, uint32 _numerator, uint32 _denominator) public virtual onlyRole(issuer) {
    _royalties = RoyaltyData ({
       royaltyAddress: _royaltyAddress,
       numerator: _numerator,
       denominator: _denominator
     });
  }
}
