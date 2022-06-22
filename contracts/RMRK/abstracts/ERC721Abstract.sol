// SPDX-License-Identifier: Apache-2.0

//Generally all interactions should propagate downstream

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
// import "hardhat/console.sol";

error ERC721AddressZeroIsNotaValidOwner();
error ERC721ApprovalToCurrentOwner();
error ERC721ApproveCallerIsNotOwnerNorApprovedForAll();
error ERC721ApprovedQueryForNonexistentToken();
error ERC721ApproveToCaller();
error ERC721MintToTheZeroAddress();
error ERC721NotApprovedOrOwner();
error ERC721OwnerQueryForNonexistentToken();
error ERC721TokenAlreadyMinted();
error ERC721TransferFromIncorrectOwner();
error ERC721TransferToNonReceiverImplementer();

contract ERC721Abstract is Context, IERC721 {

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

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
        _;
    }

    ////////////////////////////////////////
    //        ERC-721 COMPLIANCE
    ////////////////////////////////////////


    function supportsInterface(bytes4 interfaceId) public virtual view returns (bool) {
        return (
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId
        );
    }


    function balanceOf(
        address owner
    ) public view virtual override returns (uint256) {
        if(owner == address(0))
            revert ERC721AddressZeroIsNotaValidOwner();
        return _balances[owner];
    }


    function ownerOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        address owner = _owners[tokenId];
        if(owner == address(0) )
            revert ERC721OwnerQueryForNonexistentToken();
        return owner;
    }


    function name() public view virtual returns (string memory) {
        return _name;
    }


    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }


    function approve(address to, uint256 tokenId) public virtual {
        address owner = ownerOf(tokenId);
        if(to == owner)
            revert ERC721ApprovalToCurrentOwner();
        if(_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert ERC721ApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }


    function getApproved(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if(!_exists(tokenId))
            revert ERC721ApprovedQueryForNonexistentToken();
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

    /**
    * @dev See {IERC721-transferFrom}.
    */
    function transfer(
        address to,
        uint256 tokenId
    ) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }


    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
        // FIXME: clean approvals and test

        _transfer(from, to, tokenId);
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
            revert ERC721NotApprovedOrOwner();
        // FIXME: clean approvals and test
        _safeTransfer(from, to, tokenId, data);
    }

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


    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }


    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        if(!_exists(tokenId))
            revert ERC721OwnerQueryForNonexistentToken();

        address owner = ownerOf(tokenId);
        return (
            spender == owner
            || isApprovedForAll(owner, spender)
            || getApproved(tokenId) == spender
        );
    }


    function _safeMint(address to, uint256 tokenId) internal virtual {
        _safeMint(to, tokenId, "");
    }


    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _mint(to, tokenId);
        if(!_checkOnERC721Received(address(0), to, tokenId, data))
            revert ERC721TransferToNonReceiverImplementer();
    }


    function _mint(address to, uint256 tokenId) internal virtual {
        if(to == address(0))
            revert ERC721MintToTheZeroAddress();
        if(_exists(tokenId))
            revert ERC721TokenAlreadyMinted();
        _beforeTokenTransfer(address(0), to, tokenId);

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }


    function _burn(uint256 tokenId) internal virtual {
        address owner = ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        _balances[owner] -= 1;
        delete _owners[tokenId];

        emit Transfer(owner, address(0), tokenId);

        _afterTokenTransfer(owner, address(0), tokenId);
    }


    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        if(ownerOf(tokenId) != from)
            revert ERC721TransferFromIncorrectOwner();
        if(to == address(0))
            revert ERC721MintToTheZeroAddress();

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
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
        if(owner == operator)
            revert ERC721ApproveToCaller();
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }


    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal returns (bool) {
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
                    revert ERC721TransferToNonReceiverImplementer();
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


    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}


    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

}
