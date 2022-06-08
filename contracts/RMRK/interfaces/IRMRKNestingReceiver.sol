pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IRMRKNestingReceiver {

    function onRMRKNestingReceived(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4);

}
