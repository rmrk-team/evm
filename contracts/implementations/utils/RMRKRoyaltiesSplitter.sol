// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidInput();
error FailedToSend();

/**
 * @title RMRKRoyaltiesSplitter
 * @author RMRK team
 * @notice Smart contract of the RMRK Royalties Spliter module.
 * @dev This smart contract provides a simple way to share royalties from either native or erc20 payments.
 */
contract RMRKRoyaltiesSplitter {
    event NativePaymentDistributed(address indexed sender, uint256 amount);
    event ERCPaymentDistributed(
        address indexed sender,
        address indexed currency,
        uint256 amount
    );

    uint256 constant MAX_BPS = 10000;
    address[] private _beneficiaries;
    mapping(address => uint256) private _sharesBps;

    constructor(address[] memory beneficiaries, uint256[] memory sharesBps) {
        uint256 length = beneficiaries.length;
        if (length != sharesBps.length) revert InvalidInput();
        uint256 totalShares = 0;

        for (uint256 i; i < length; ) {
            _beneficiaries.push(beneficiaries[i]);
            _sharesBps[beneficiaries[i]] = sharesBps[i];
            totalShares += sharesBps[i];
            unchecked {
                ++i;
            }
        }
        if (totalShares != MAX_BPS) revert InvalidInput();
    }

    receive() external payable {
        uint256 length = _beneficiaries.length;
        uint256 totalDistribution;

        for (uint256 i; i < length; ) {
            uint256 share;
            if (i == length - 1) {
                share = msg.value - totalDistribution; // leftover to last beneficiary
            } else {
                share = (msg.value * _sharesBps[_beneficiaries[i]]) / MAX_BPS;
            }
            (bool success, ) = _beneficiaries[i].call{value: share}("");
            if (!success) revert FailedToSend();
            unchecked {
                totalDistribution += share;
                ++i;
            }
        }

        emit NativePaymentDistributed(msg.sender, msg.value);
    }

    function distributeERC20(address currency, uint256 amount) external {
        uint256 length = _beneficiaries.length;
        uint256 totalDistribution;

        for (uint256 i; i < length; ) {
            uint256 share;
            if (i == length - 1) {
                share = amount - totalDistribution; // leftover to last beneficiary
            } else {
                share = (amount * _sharesBps[_beneficiaries[i]]) / MAX_BPS;
            }
            IERC20(currency).transfer(_beneficiaries[i], share);

            unchecked {
                totalDistribution += share;
                ++i;
            }
        }

        emit ERCPaymentDistributed(msg.sender, currency, amount);
    }
}
