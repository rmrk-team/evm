// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

interface IRMRKCore_vuln {
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function rmrkOwnerOf(uint256 tokenId)
        external
        view
        returns (
            address,
            uint256,
            bool
        );

    function setChild(
        IRMRKCore_vuln childAddress,
        uint256 tokenId,
        uint256 childTokenId
    ) external;

    function isApprovedOrOwner(address addr, uint256 id)
        external
        view
        returns (bool);

    function _burnChildren(uint256 tokenId, address oldOwner) external;

    function isRMRKCore(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4);

    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
}
