// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../RMRK/interfaces/IRMRKNestingReceiver.sol";

contract RMRKNestingReceiverMock is IRMRKNestingReceiver {
    enum Error {
        None,
        RevertWithMessage,
        RevertWithoutMessage,
        Panic
    }

    bytes4 internal immutable _retval;
    Error internal immutable _error;

    event Received(address operator, address from, uint256 tokenId, bytes data);

    constructor(bytes4 retval, Error error) {
        _retval = retval;
        _error = error;
    }

    function onRMRKNestingReceived(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        if (_error == Error.RevertWithMessage) {
            revert("ERC721ReceiverMock: reverting");
        } else if (_error == Error.RevertWithoutMessage) {
            revert();
        } else if (_error == Error.Panic) {
            uint256 a = uint256(0) / uint256(0);
            a;
        }
        emit Received(operator, from, tokenId, data);
        return _retval;
    }
}