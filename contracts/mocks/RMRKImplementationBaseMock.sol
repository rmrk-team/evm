// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKImplementationBase
} from "../implementations/utils/RMRKImplementationBase.sol";

contract RMRKImplementationBaseMock is RMRKImplementationBase {
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply
    )
        RMRKImplementationBase(
            name,
            symbol,
            collectionMetadata,
            maxSupply,
            address(0),
            0
        )
    {}

    function mockMint(uint256 total) external {
        _prepareMint(total);
    }
}
