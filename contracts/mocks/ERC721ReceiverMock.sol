// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {
    IERC721Receiver
} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract ERC721ReceiverMock is IERC721Receiver {
    enum Error {
        None,
        RevertWithMessage,
        RevertWithoutMessage,
        Panic
    }

    bytes4 internal immutable _RET_VAL;
    Error internal immutable _ERROR;

    event Received(
        address indexed operator,
        address indexed from,
        uint256 indexed tokenId,
        bytes data
    );

    constructor(bytes4 retval, Error error) {
        _RET_VAL = retval;
        _ERROR = error;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        if (_ERROR == Error.RevertWithMessage) {
            revert("ERC721ReceiverMock: reverting");
        } else if (_ERROR == Error.RevertWithoutMessage) {
            revert();
        } else if (_ERROR == Error.Panic) {
            uint256 a = uint256(0) / uint256(0);
            a;
        }
        emit Received(operator, from, tokenId, data);
        return _RET_VAL;
    }
}
