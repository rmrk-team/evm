// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../RMRK/interfaces/IRMRKNestingReceiver.sol";
import "../../contracts/mocks/ERC721ReceiverMock.sol";

contract ERC721ReceiverMockWithRMRKNestingReceiver is IRMRKNestingReceiver, ERC721ReceiverMock {
    constructor(bytes4 retval, Error error) ERC721ReceiverMock(retval, error) {}

    function onRMRKNestingReceived(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IRMRKNestingReceiver.onRMRKNestingReceived.selector;
    }
}
