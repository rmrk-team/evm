// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidInput();
error FailedToSend();
error OnlyBeneficiary();

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

    /**
     * @notice Creates a new royalties splitter contract.
     * @param beneficiaries The list of beneficiaries.
     * @param sharesBps The list of shares in basis points (1/10000).
     */
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

    /**
     * @notice Distributes a native payment to the beneficiaries.
     * @dev The payment is distributed according to the shares specified in the constructor.
     */
    receive() external payable {
        uint256 length = _beneficiaries.length;
        uint256 totalDistribution;

        for (uint256 i; i < length; ) {
            uint256 share;
            address beneficiary = _beneficiaries[i];
            if (i == length - 1) {
                share = msg.value - totalDistribution; // leftover to last beneficiary
            } else {
                share = (msg.value * _sharesBps[beneficiary]) / MAX_BPS;
            }
            (bool success, ) = beneficiary.call{value: share}("");
            if (!success) revert FailedToSend();
            unchecked {
                totalDistribution += share;
                ++i;
            }
        }

        emit NativePaymentDistributed(msg.sender, msg.value);
    }

    /**
     * @notice Distributes an ERC20 payment to the beneficiaries.
     * @dev The payment is distributed according to the shares specified in the constructor.
     * @param currency The address of the ERC20 token.
     * @param amount The amount of tokens to distribute.
     */
    function distributeERC20(address currency, uint256 amount) external {
        uint256 length = _beneficiaries.length;
        uint256 totalDistribution;

        bool callerIsBeneficiary;
        for (uint256 i; i < length; ) {
            if (_beneficiaries[i] == msg.sender) {
                callerIsBeneficiary = true;
                break;
            }
            unchecked {
                ++i;
            }
        }
        if (!callerIsBeneficiary) revert OnlyBeneficiary();

        for (uint256 i; i < length; ) {
            uint256 share;
            address beneficiary = _beneficiaries[i];
            if (i == length - 1) {
                share = amount - totalDistribution; // leftover to last beneficiary
            } else {
                share = (amount * _sharesBps[beneficiary]) / MAX_BPS;
            }
            IERC20(currency).transfer(beneficiary, share);

            unchecked {
                totalDistribution += share;
                ++i;
            }
        }

        emit ERCPaymentDistributed(msg.sender, currency, amount);
    }

    /**
     * @notice Returns the list of beneficiaries and their shares.
     * @return beneficiaries The list of beneficiaries.
     * @return shares The list of shares.
     */
    function getBenefiariesAndShares()
        external
        view
        returns (address[] memory beneficiaries, uint256[] memory shares)
    {
        uint256 length = _beneficiaries.length;
        beneficiaries = _beneficiaries;
        shares = new uint256[](length);

        for (uint256 i; i < length; ) {
            shares[i] = _sharesBps[_beneficiaries[i]];
            unchecked {
                ++i;
            }
        }
    }
}
