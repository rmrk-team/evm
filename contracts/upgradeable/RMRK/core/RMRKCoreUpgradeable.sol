// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.18;

import "../../../RMRK/core/IRMRKCore.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title RMRKCoreUpgradeable
 * @author RMRK team
 * @notice Upgradeable smart contract of the RMRK core module.
 * @dev This is currently just a passthrough contract which allows for granular editing of base-level ERC721 functions.
 */
contract RMRKCoreUpgradeable is IRMRKCore, Initializable {
    /**
     * @notice Version of the @rmrk-team/evm-contracts package
     * @return Version identifier of the smart contract
     */
    string public constant VERSION = "1.1.0";
    bytes4 public constant RMRK_INTERFACE = 0x524D524B; // "RMRK" in ASCII hex

    /**
     * @notice Initializes the contract and the inherited contracts.
     */
    function __RMRKCoreUpgradeable_init(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        __RMRKCoreUpgradeable_init_unchained(name_, symbol_);
    }

    /**
     * @notice Initializes the contract without the inherited contracts.
     * @param name_ Name of the token collection
     * @param symbol_ Symbol of the token collection
     */
    function __RMRKCoreUpgradeable_init_unchained(
        string memory name_,
        string memory symbol_
    ) internal onlyInitializing {
        _name = name_;
        _symbol = symbol_;
    }

    /// Token name
    string private _name;

    /// Token symbol
    string private _symbol;

    /**
     * @notice Used to retrieve the collection name.
     * @return Name of the collection
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @notice Used to retrieve the collection symbol.
     * @return Symbol of the collection
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Hook that is called before any token transfer. This includes minting and burning.
     * @dev Calling conditions:
     *
     *  - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be transferred to `to`.
     *  - When `from` is zero, `tokenId` will be minted to `to`.
     *  - When `to` is zero, ``from``'s `tokenId` will be burned.
     *  - `from` and `to` are never zero at the same time.
     *
     *  To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     * @param from Address from which the token is being transferred
     * @param to Address to which the token is being transferred
     * @param tokenId ID of the token being transferred
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    /**
     * @notice Hook that is called after any transfer of tokens. This includes minting and burning.
     * @dev Calling conditions:
     *
     *  - When `from` and `to` are both non-zero.
     *  - `from` and `to` are never zero at the same time.
     *
     *  To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     * @param from Address from which the token has been transferred
     * @param to Address to which the token has been transferred
     * @param tokenId ID of the token that has been transferred
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    uint256[50] private __gap;
}
