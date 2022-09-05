pragma solidity ^0.8.15;

contract errorTest {
    string public constant error1 = "1";

    function emitError() external {
        revert(error1);
    }
}
