// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./interfaces/IERC721.sol";
import "./interfaces/IERC721Receiver.sol";
import "./interfaces/IMultiResource.sol";
import "./library/MultiResourceLib.sol";
import "./utils/Address.sol";
import "./utils/Strings.sol";
import "./utils/Context.sol";
import "./abstracts/MultiResourceAbstract.sol";

error RMRKCoreOwnerQueryForNonexistentToken();
error MultiResourceTransferToNonMultiResourceReceiverImplementer();
error MultiResourceTransferCallerIsNotOwnerNorApproved();
error MultiResourceApproveToCaller();
error MultiResourceApprovalToCurrentOwner();
error MultiResourceApproveCallerIsNotOwnerNorApprovedForAll();
error MultiResourceMintToTheZeroAddress();
error MultiResourceApprovedQueryForNonexistentToken();
error MultiResourceTransferFromIncorrectOwner();
error MultiResourceTokenAlreadyMinted();
error ERC721AddressZeroIsNotaValidOwner();

contract RMRKMultiResource is MultiResourceAbstract, IERC721 {

    using MultiResourceLib for uint256;
    using MultiResourceLib for bytes8[];
    using MultiResourceLib for bytes16[];
    using Address for address;
    using Strings for uint256;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    ////////////////////////////////////////
    //        ERC-721 COMPLIANCE
    ////////////////////////////////////////


    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == type(IMultiResource).interfaceId;
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
        if(owner == address(0))
            revert RMRKCoreOwnerQueryForNonexistentToken();
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
            revert MultiResourceApprovalToCurrentOwner();
        if(_msgSender() != owner && !isApprovedForAll(owner, _msgSender()))
            revert MultiResourceApproveCallerIsNotOwnerNorApprovedForAll();

        _approve(to, tokenId);
    }


    function getApproved(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if(!_exists(tokenId))
            revert MultiResourceApprovedQueryForNonexistentToken();
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


    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
            revert MultiResourceTransferCallerIsNotOwnerNorApproved();

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
            revert MultiResourceTransferCallerIsNotOwnerNorApproved();

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
            revert MultiResourceTransferToNonMultiResourceReceiverImplementer();
        }


    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }


    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        if(!_exists(tokenId))
            revert RMRKCoreOwnerQueryForNonexistentToken();
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
            revert MultiResourceTransferToNonMultiResourceReceiverImplementer();
        }


    function _mint(address to, uint256 tokenId) internal virtual {
        if(to == address(0))
            revert MultiResourceMintToTheZeroAddress();
        if(_exists(tokenId))
            revert MultiResourceTokenAlreadyMinted();

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
            revert MultiResourceTransferFromIncorrectOwner();
        if(to == address(0))
            revert MultiResourceMintToTheZeroAddress();

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
            revert MultiResourceApproveToCaller();
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
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
                    revert MultiResourceTransferToNonMultiResourceReceiverImplementer();
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

    ////////////////////////////////////////
    //                RESOURCES
    ////////////////////////////////////////


    function acceptResource(uint256 tokenId, uint256 index) external virtual {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
                revert MultiResourceNotOwner();

        // FIXME: clean approvals and test
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
                revert MultiResourceNotOwner();

        // FIXME: clean approvals and test
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
                revert MultiResourceNotOwner();

        // FIXME: clean approvals and test
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual {
        if(!_isApprovedOrOwner(_msgSender(), tokenId))
                revert MultiResourceNotOwner();

        // FIXME: clean approvals and test
        _setPriority(tokenId, priorities);
    }

}
