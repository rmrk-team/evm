// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

// Struct used to pack data to avoid stack too deep error for too many arguments.

interface IRMRKInitData {
    struct InitData {
        address erc20TokenAddress; // 20 bytes
        uint80 maxSupply; // 10 bytes (1.2e24)
        uint16 royaltyPercentageBps; // 2 bytes
        // --- new slot ---
        address royaltyRecipient; // 20 bytes
        // --- new slot ---
        uint256 pricePerMint;
        // another 32 bytes
    }
}
