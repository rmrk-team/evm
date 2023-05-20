// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/access/OwnableUpgradeable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundAfterBlockNumberUpgradeable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundAfterTransactionsUpgradeable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundPerTokenUpgradeable.sol";
// import "../../ERC721Upgradeable.sol";
import "../../../RMRK/security/InitializationGuard.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract RMRKSoulboundAfterBlockNumberMockUpgradeable is
    InitializationGuard,
    RMRKSoulboundAfterBlockNumberUpgradeable,
    ERC721Upgradeable
{
    mapping(uint256 => bool) soulboundExempt;

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 lastBlockToTransfer
    ) public virtual initializable
    {
        __ERC721_init(_name, _symbol);
        __RMRKSoulboundAfterBlockNumberUpgradeable_init(lastBlockToTransfer);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function name() public view override(ERC721Upgradeable, RMRKCoreUpgradeable) returns (string memory) {
        super.name();
    }

    function symbol() public view override(ERC721Upgradeable, RMRKCoreUpgradeable) returns (string memory) {
        super.symbol();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulboundUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return
            RMRKSoulboundUpgradeable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulboundUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundAfterTransactionsMockUpgradeable is
    InitializationGuard,
    RMRKSoulboundAfterTransactionsUpgradeable,
    ERC721Upgradeable
{
    mapping(uint256 => bool) soulboundExempt;

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 numberOfTransfers
    ) public virtual initializable
    {
        __ERC721_init(_name, _symbol);
        __RMRKSoulboundAfterTransactionsUpgradeable_init(numberOfTransfers);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function name() public view override(ERC721Upgradeable, RMRKCoreUpgradeable) returns (string memory) {
        super.name();
    }

    function symbol() public view override(ERC721Upgradeable, RMRKCoreUpgradeable) returns (string memory) {
        super.symbol();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulboundUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return
            RMRKSoulboundUpgradeable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulboundUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulboundAfterTransactionsUpgradeable) {
        super._afterTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundPerTokenMockUpgradeable is
    InitializationGuard,
    RMRKSoulboundPerTokenUpgradeable,
    ERC721Upgradeable
{
    mapping(uint256 => bool) soulboundExempt;

    function initialize(
        string memory _name,
        string memory _symbol
    ) public initializable {
        __ERC721_init(_name, _symbol);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function name() public view override(ERC721Upgradeable, RMRKCoreUpgradeable) returns (string memory) {
        super.name();
    }

    function symbol() public view override(ERC721Upgradeable, RMRKCoreUpgradeable) returns (string memory) {
        super.symbol();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulboundUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return
            RMRKSoulboundUpgradeable.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKSoulboundUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function setSoulbound(uint256 tokenId, bool state) public {
        _setSoulbound(tokenId, state);
    }
}
