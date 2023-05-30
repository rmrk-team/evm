// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/access/OwnableUpgradeable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundAfterBlockNumberUpgradeable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundAfterTransactionsUpgradeable.sol";
import "../../../RMRK/extension/soulbound/RMRKSoulboundPerTokenUpgradeable.sol";
import "../../RMRKMultiAssetMockUpgradeable.sol";

import "../../../RMRK/extension/soulbound/IERC6454betaUpgradeable.sol";

contract RMRKSoulboundAfterBlockNumberMockUpgradeable is
    RMRKMultiAssetMockUpgradeable,
    IERC6454betaUpgradeable
{
    uint256 private _lastBlockToTransfer;

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 lastBlockToTransfer
    ) public initializer {
        _lastBlockToTransfer = lastBlockToTransfer;
        super.initialize(_name, _symbol);
    }

    function name()
        public
        view
        override(RMRKCoreUpgradeable)
        returns (string memory)
    {
        super.name();
    }

    function symbol()
        public
        view
        override(RMRKCoreUpgradeable)
        returns (string memory)
    {
        super.symbol();
    }

    /**
     * @notice Gets the last block number where transfers are allowed
     * @return The block number after which tokens are soulbound
     */
    function getLastBlockToTransfer() public view returns (uint256) {
        return _lastBlockToTransfer;
    }

    /**
     * @inheritdoc IERC6454betaUpgradeable
     */
    function isTransferable(
        uint256,
        address,
        address
    ) public view virtual override returns (bool) {
        return _lastBlockToTransfer > block.number;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165Upgradeable, RMRKMultiAssetUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC6454betaUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (!isTransferable(tokenId, from, to))
            revert RMRKCannotTransferSoulbound();

        super._beforeTokenTransfer(from, to, tokenId);
    }
}

contract RMRKSoulboundAfterTransactionsMockUpgradeable is
    RMRKMultiAssetMockUpgradeable,
    IERC6454betaUpgradeable
{
    /**
     * @notice Emitted when a token becomes soulbound.
     * @param tokenId ID of the token
     */
    event Soulbound(uint256 indexed tokenId);

    // Max number of transfers before a token becomes soulbound
    uint256 private _maxNumberOfTransfers;
    // Mapping of token ID to number of transfers
    mapping(uint256 => uint256) private _transfersPerToken;

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 numberOfTransfers
    ) public initializer {
        _maxNumberOfTransfers = numberOfTransfers;
        super.initialize(_name, _symbol);
    }

    function name()
        public
        view
        override(RMRKCoreUpgradeable)
        returns (string memory)
    {
        super.name();
    }

    function symbol()
        public
        view
        override(RMRKCoreUpgradeable)
        returns (string memory)
    {
        super.symbol();
    }

    /**
     * @notice Gets the maximum number of transfers before a token becomes soulbound.
     * @return Maximum number of transfers before a token becomes soulbound
     */
    function getMaxNumberOfTransfers() public view returns (uint256) {
        return _maxNumberOfTransfers;
    }

    /**
     * @notice Gets the current number of transfer the specified token.
     * @param tokenId ID of the token
     * @return Number of the token's transfers to date
     */
    function getTransfersPerToken(
        uint256 tokenId
    ) public view returns (uint256) {
        return _transfersPerToken[tokenId];
    }

    /**
     * @inheritdoc IERC6454betaUpgradeable
     */
    function isTransferable(
        uint256 tokenId,
        address,
        address
    ) public view virtual override returns (bool) {
        return _transfersPerToken[tokenId] < _maxNumberOfTransfers;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165Upgradeable, RMRKMultiAssetUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC6454betaUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (!isTransferable(tokenId, from, to)) {
            revert RMRKCannotTransferSoulbound();
        }
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._afterTokenTransfer(from, to, tokenId);
        // We won't count minting:
        if (from != address(0)) {
            _transfersPerToken[tokenId]++;
            emit Soulbound(tokenId);
        }
    }
}

contract RMRKSoulboundPerTokenMockUpgradeable is
    RMRKMultiAssetMockUpgradeable,
    OwnableUpgradeable,
    IERC6454betaUpgradeable
{
    /**
     * @notice Emitted when a token's soulbound state changes.
     * @param tokenId ID of the token
     * @param state A boolean value signifying whether the token became soulbound (`true`) or transferrable (`false`)
     */
    event Soulbound(uint256 indexed tokenId, bool state);

    // Mapping of token ID to soulbound state
    mapping(uint256 => bool) private _isSoulbound;

    function initialize(
        string memory _name,
        string memory _symbol
    ) public override initializer {
        super.initialize(_name, _symbol);
        __OwnableUpgradeable_init();
    }

    function name()
        public
        view
        override(RMRKCoreUpgradeable)
        returns (string memory)
    {
        super.name();
    }

    function symbol()
        public
        view
        override(RMRKCoreUpgradeable)
        returns (string memory)
    {
        super.symbol();
    }

    /**
     * @inheritdoc IERC6454betaUpgradeable
     */
    function isTransferable(
        uint256 tokenId,
        address from,
        address to
    ) public view virtual override returns (bool) {
        return (from == address(0) || // Exclude minting
            to == address(0) || // Exclude Burning
            !_isSoulbound[tokenId]);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(IERC165Upgradeable, RMRKMultiAssetUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC6454betaUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (!isTransferable(tokenId, from, to)) {
            revert RMRKCannotTransferSoulbound();
        }
    }

    function setSoulbound(uint256 tokenId, bool state) public onlyOwner {
        _setSoulbound(tokenId, state);
    }

    /**
     * @notice Sets the soulbound state of a token.
     * @dev Custom access control has to be implemented when exposing this method in a smart contract that utillizes it.
     * @param tokenId ID of the token
     * @param state New soulbound state
     */
    function _setSoulbound(uint256 tokenId, bool state) internal virtual {
        _isSoulbound[tokenId] = state;
        emit Soulbound(tokenId, state);
    }
}
