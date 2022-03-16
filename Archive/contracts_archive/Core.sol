// // SPDX-License-Identifier: GNU GPL

// pragma solidity ^0.8.9;
// pragma abicoder v2;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// contract RMRKCore is ERC721 {
//     struct Child {
//         address contractAddress;
//         uint256 tokenId;
//         bool pending;
//     }

//     struct Owner {
//         address contractAddress;
//         uint256 tokenId;
//     }

//     struct Resource {
//         bytes32 uuid;
//         bytes32 src;
//         bytes32 metadataURI;
//         bytes32 license;
//         bytes32 thumb;
//         bool pending;
//     }

//     // Token name
//     string private _name;

//     // Token symbol
//     string private _symbol;

//     mapping(uint256 => Resource[]) public _resources;

//     // Mapping from token ID to address
//     mapping(uint256 => address) private _owners;

//     // Mapping from token ID to parent NFT
//     mapping(uint256 => Owner) private _nftowners;

//     // Mapping from this token to contained child tokens
//     mapping(uint256 => Child[]) private _children;

//     mapping(uint256 => bytes32[]) public priority;

//     event ResAdd(uint256 indexed tokenId, bytes32 indexed uuid);
//     event ResAccept(uint256 indexed tokenId, bytes32 indexed uuid);
//     event ResPrio(uint256 indexed tokenId);

//     constructor(string memory name_, string memory symbol_) {
//         _name = name_;
//         _symbol = symbol_;
//     }

//     /**
//     @dev Returns the EOA or contract owner of this NFT
//     @return address
//      */
//     function ownerOf(uint256 tokenId)
//         public
//         view
//         virtual
//         override
//         returns (address)
//     {
//         address owner = _owners[tokenId];
//         require(owner != address(0), "Owner query for non-existent token.");
//         return owner;
//     }

//     /**
//      @dev Overloaded function to find out which NFT owns this NFT.
//      @return (address, uint256) Tuple of contract, id.
//      */
//     function ownerOf(uint256 tokenId, bool nested)
//         public
//         view
//         virtual
//         override
//         returns (address, uint256)
//     {
//         address owner = _owners[tokenId];
//         Owner memory nftowner = _nftowners[tokenId];
//         require(owner != address(0), "Owner query for non-existent token.");
//         if (nested && nftowner) {
//             return (nftowner.contractAddress, nftowner.tokenId);
//         }
//         return this.ownerOf(tokenId);
//     }

//     /**
//     @dev Returns all children, even pending
//     */
//     function childrenOf(uint256 tokenId)
//         public
//         view
//         virtual
//         returns (Child[] memory)
//     {
//         Child[] memory children = _children[tokenId];
//         return children;
//     }

//     function transferFrom(
//         address from,
//         uint256 sourceTokenId,
//         address to,
//         uint256 destTokenId
//     ) public virtual override {
//         require(
//             _isApprovedOrOwner(_msgSender(), sourceTokenId),
//             "ERC721: transfer caller is not owner nor approved"
//         );

//         _transfer(from, to, sourceTokenId, destTokenId);
//     }

//     function _transfer(
//         address from,
//         address to,
//         uint256 sourceTokenId,
//         uint256 destTokenId
//     ) internal virtual override {
//         require(
//             RMRKCore.ownerOf(sourceTokenId) == from,
//             "RMRKCore: transfer of token that is not own"
//         );
//         require(to != address(0), "RMRKCore: transfer to the zero address");

//         // // Clear approvals from the previous owner
//         // _approve(address(0), sourceTokenId);

//         // // This is fucked
//         // _balances[from] -= 1;
//         // _balances[to] += 1;
//         // _owners[tokenId] = to;

//         // emit Transfer(from, to, tokenId);
//     }

//     function acceptChild(uint256 index, uint256 tokenId) public {
//         require(
//             RMRKCore.ownerOf(tokenId) == msg.sender,
//             "Attempting to accept a child in non-owned NFT"
//         );
//         require(
//             _children[index] && _children[index].pending,
//             "No pending child found at index"
//         );
//         _children[index].pending = false;
//     }

//     function addResource(
//         bytes32 _uuid,
//         bytes32 _src,
//         bytes32 _metadataURI,
//         bytes32 _license,
//         bytes32 _thumb,
//         uint256 _tokenId
//     ) public {
//         bool p = false;
//         if (RMRKCore.ownerOf(_tokenId) != msg.sender) {
//             p = true;
//         }
//         Resource memory _r = Resource({
//             uuid: _uuid,
//             src: _src,
//             metadataURI: _metadataURI,
//             license: _license,
//             thumb: _thumb,
//             pending: p
//         });
//         _resources[_tokenId].push(_r);
//         emit ResAdd(_tokenId, _uuid);
//     }

//     function acceptResource(uint256 _tokenId, bytes32 _uuid) public {
//         require(
//             RMRKCore.ownerOf(_tokenId) == msg.sender,
//             "Attempting to accept a resource in non-owned NFT"
//         );
//         for (uint256 i = 0; i < _resources[_tokenId].length; i++) {
//             if (_resources[_tokenId].uuid == _uuid) {
//                 _resources[_tokenId].uuid = false;
//                 emit ResAccept(_tokenId, _uuid);
//                 return;
//             }
//         }
//     }

//     function setPriority(uint256 _tokenId, bytes32[] memory _uuids) public {
//         require(
//             RMRKCore.ownerOf(_tokenId) == msg.sender,
//             "Attempting to set priority in non-owned NFT"
//         );
//         require(
//             _uuids.length <= _resources[_tokenId].length,
//             "More IDs than resources!"
//         );
//         priority[_tokenId] = _uuids;
//         emit ResPrio(_tokenId);
//     }

//     // @todo override send so it adds a child
//     // @todo override / delete resource
//     // @todo rewrite resources to not use loop, but have a reverse mapping from uuid to array index
//     // @todo consider limiting number of children or doing a reverse mapping of indexes
// }
