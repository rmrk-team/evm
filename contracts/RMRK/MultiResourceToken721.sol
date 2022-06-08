// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

import "./interfaces/IERC721.sol";
import "./interfaces/IERC721Receiver.sol";
import "./interfaces/IMultiResource.sol";
import "./library/MultiResourceLib.sol";
import "./utils/Address.sol";
import "./utils/Strings.sol";
import "./utils/Context.sol";
import "./MultiResourceTokenAbstract.sol";


contract MultiResourceToken721 is MultiResourceTokenAbstract, IERC721 {

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

    //mapping of bytes8 Ids to resource object
    mapping(bytes8 => Resource) private _resources;

    //mapping tokenId to current resource to replacing resource
    mapping(uint256 => mapping(bytes8 => bytes8)) private _resourceOverwrites;

    //mapping of tokenId to all resources
    mapping(uint256 => bytes8[]) private _activeResources;

    //mapping of tokenId to an array of resource priorities
    mapping(uint256 => uint16[]) private _activeResourcePriorities;

    //Double mapping of tokenId to active resources
    mapping(uint256 => mapping(bytes8 => bool)) private _tokenResources;

    //mapping of tokenId to all resources by priority
    mapping(uint256 => bytes8[]) private _pendingResources;

    //Mapping of bytes8 resource ID to tokenEnumeratedResource for tokenURI
    mapping(bytes8 => bool) private _tokenEnumeratedResource;

    //Mapping of bytes16 custom field to bytes data
    mapping(bytes8 => mapping (bytes16 => bytes)) private _customResourceData;

    //List of all resources
    bytes8[] private _allResources;

    //fallback URI
    string private _fallbackURI;

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
        require(
            owner != address(0),
            "ERC721: address zero is not a valid owner"
        );
        return _balances[owner];
    }


    function ownerOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        address owner = _owners[tokenId];
        require(
            owner != address(0),
            "ERC721: owner query for nonexistent token"
        );
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
        require(to != owner, "MultiResource: approval to current owner");
        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "MultiResource: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }


    function getApproved(
        uint256 tokenId
    ) public view virtual override returns (address) {
        require(
            _exists(tokenId),
            "MultiResource: approved query for nonexistent token"
        );

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
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "MultiResource: transfer caller is not owner nor approved"
        );

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
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "MultiResource: transfer caller is not owner nor approved"
        );
        _safeTransfer(from, to, tokenId, data);
    }

    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _transfer(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, data),
            "MultiResource: transfer to non MultiResource Receiver implementer"
        );
    }


    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }


    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        require(
            _exists(tokenId),
            "MultiResource: operator query for nonexistent token"
        );
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
        require(
            _checkOnERC721Received(address(0), to, tokenId, data),
            "MultiResource: transfer to non MultiResource Receiver implementer"
        );
    }


    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "MultiResource: mint to the zero address");
        require(!_exists(tokenId), "MultiResource: token already minted");

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
        require(
            ownerOf(tokenId) == from,
            "MultiResource: transfer from incorrect owner"
        );
        require(
            to != address(0),
            "MultiResource: transfer to the zero address"
        );

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
        require(owner != operator, "MultiResource: approve to caller");
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
                    revert("MultiResource: transfer to non MultiResource Receiver implementer");
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
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "MultiResource: not owner"
        );
        _acceptResource(tokenId, index);
    }

    function rejectResource(uint256 tokenId, uint256 index) external virtual {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "MultiResource: not owner"
        );
        _rejectResource(tokenId, index);
    }

    function rejectAllResources(uint256 tokenId) external virtual {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "MultiResource: not owner"
        );
        _rejectAllResources(tokenId);
    }

    function setPriority(
        uint256 tokenId,
        uint16[] memory priorities
    ) external virtual {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "MultiResource: not owner"
        );
        _setPriority(tokenId, priorities);
    }

}
