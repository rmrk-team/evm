// SPDX-License-Identifier: GNU GPL

pragma solidity ^0.8.9;
pragma abicoder v2;

/**
This is a new attempt at writing RMRK contracts 
without consideration of erc721 compatibility.

TODO: approvals and safe transfers etc.
*/

contract Core {
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Mapping from token ID to owner address
    mapping(uint256 => Owner) private _owners;

    mapping(uint256 => address) private _rootOwners;

    // Mapping owner to tuple of token ID and token count, where token ID is 0 if checking balance of non-NFT owner
    mapping(address => mapping(uint256 => uint256)) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    mapping(uint256 => mapping(bytes32 => Resource)) public _resources;

    event ResAdd(uint256 indexed tokenId, bytes32 indexed uuid);
    event ResAccept(uint256 indexed tokenId, bytes32 indexed uuid);
    event ResPrio(uint256 indexed tokenId);

    mapping(uint256 => bytes32[]) public priority;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    // Owner can be a token or an address (EOA or contract)
    struct Owner {
        address addr;
        uint256 tokenId; // null when EOA or contract
    }

    struct Child {
        address contractAddress;
        uint256 tokenId;
        bool pending;
    }

    struct Resource {
        bytes32 uuid;
        bytes32 src;
        bytes32 metadataURI;
        bytes32 license;
        bytes32 thumb;
        bool pending;
        bool exists;
    }

    function balanceOf(address _owner, uint256 _tokenId)
        public
        view
        virtual
        returns (uint256)
    {
        require(
            _owner != address(0),
            "RMRK: balance query for the zero address"
        );
        return _balances[_owner][_tokenId];
    }

    function ownerOf(uint256 _tokenId)
        public
        view
        virtual
        returns (Owner memory)
    {
        Owner memory owner = _owners[_tokenId];
        require(
            owner.addr != address(0),
            "RMRK: owner query for nonexistent token"
        );
        return owner;
    }

    function rootOwnerOf(uint256 _tokenId)
        public
        view
        virtual
        returns (address)
    {
        address owner = _rootOwners[_tokenId];
        require(owner != address(0), "RMRK: owner query for nonexistent token");
        return owner;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function addResource(
        bytes32 _uuid,
        bytes32 _src,
        bytes32 _metadataURI,
        bytes32 _license,
        bytes32 _thumb,
        uint256 _tokenId
    ) public {
        bool p = false;
        if (rootOwnerOf(_tokenId) != msg.sender) {
            p = true;
        }
        Resource memory _r = Resource({
            uuid: _uuid,
            src: _src,
            metadataURI: _metadataURI,
            license: _license,
            thumb: _thumb,
            pending: p,
            exists: true
        });
        _resources[_tokenId][_uuid] = _r;
        emit ResAdd(_tokenId, _uuid);
    }

    function acceptResource(uint256 _tokenId, bytes32 _uuid) public {
        require(
            rootOwnerOf(_tokenId) == msg.sender,
            "RMRK: Attempting to accept a resource in non-owned NFT"
        );
        if (_resources[_tokenId][_uuid].exists) {
            _resources[_tokenId][_uuid].pending = false;
            emit ResAccept(_tokenId, _uuid);
            return;
        }
    }

    function setPriority(uint256 _tokenId, bytes32[] memory _uuids) public {
        require(
            rootOwnerOf(_tokenId) == msg.sender,
            "RMRK: Attempting to set priority in non-owned NFT"
        );
        for (uint256 i = 0; i < _uuids.length; i++) {
            require(
                _resources[_tokenId][_uuids[i]].exists,
                "RMRK: Trying to reprioritize a non-existant resource"
            );
        }
        // @todo loop through _uuids and make sure all exist
        priority[_tokenId] = _uuids;
        emit ResPrio(_tokenId);
    }
}
