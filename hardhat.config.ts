import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import '@primitivefi/hardhat-dodoc';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.21',
    settings: {
      evmVersion: 'london',
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    moonbaseAlpha: {
      url: process.env.MOONBASE_URL || 'https://rpc.testnet.moonbeam.network',
      chainId: 1287,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1100000000,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || 'https://rpc.sepolia.dev',
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    polygonMumbai: {
      url: process.env.MUMBAI_URL || 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2500000000,
    },
    baseGoerli: {
      chainId: 84531,
      url: process.env.BASE_GOERLI_URL || 'https://goerli.base.org',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2000000000,
    },
    shibuya: {
      chainId: 81,
      url: process.env.SHIBUYA_URL || 'https://evm.shibuya.astar.network',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      // gasPrice: 2000000000,
    },
    moonriver: {
      url: process.env.MOONRIVER_URL || 'https://rpc.api.moonriver.moonbeam.network',
      chainId: 1285,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    moonbeam: {
      url: process.env.MOONBEAM_URL || 'https://rpc.api.moonbeam.network',
      chainId: 1284,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.ETHEREUM_URL || 'https://eth.drpc.org',
      chainId: 1,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 12000000000,
    },
    polygon: {
      url: process.env.POLYGON_URL || 'https://polygon.drpc.org',
      chainId: 137,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 120000000000,
    },
    base: {
      chainId: 8453,
      url: process.env.BASE_URL || 'https://developer-access-mainnet.base.org',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    astar: {
      url: process.env.ASTAR_URL || 'https://evm.astar.network',
      chainId: 592,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    coinmarketcap: process.env.COIN_MARKET_CAP_KEY || '',
    gasPrice: 50,
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: process.env.MOONSCAN_APIKEY || '', // Moonbeam Moonscan API Key
      sepolia: process.env.ETHERSCAN_API_KEY || '', // Sepolia Etherscan API Key
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || '', // Polygon Mumbai Etherscan API Key
      baseGoerli: process.env.BASESCAN_API_KEY || '', // Base Goerli Etherscan API Key
      shibuya: process.env.SHIBUYA_BLOCKSCOUT_API_KEY || '', // Shibuya blockscout API Key
      moonriver: process.env.MOONSCAN_APIKEY || '', // Moonriver Moonscan API Key
      moonbeam: process.env.MOONSCAN_APIKEY || '', // Moonbeam Moonscan API Key
      mainnet: process.env.ETHERSCAN_API_KEY || '', // Ethereum Etherscan API Key
      polygon: process.env.POLYGONSCAN_API_KEY || '', // Polygon Etherscan API Key
      base: process.env.BASESCAN_API_KEY || '', // Base Etherscan API Key
      astar: process.env.ASTAR_BLOCKSCOUT_API_KEY || '', // Astar blockscout API Key
    },
    customChains: [
      {
        network: 'baseGoerli',
        chainId: 84531,
        urls: {
          apiURL: 'https://api-goerli.basescan.org/api',
          browserURL: 'https://goerli.basescan.org',
        },
      },
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
      {
        network: 'shibuya',
        chainId: 81,
        urls: {
          apiURL: 'https://blockscout.com/shibuya/api',
          browserURL: 'https://blockscout.com/shibuya',
        },
      },
      {
        network: 'astar',
        chainId: 592,
        urls: {
          apiURL: 'https://blockscout.com/astar/api',
          browserURL: 'https://blockscout.com/astar/',
        },
      },
    ],
  },
  dodoc: {
    runOnCompile: false,
    exclude: ['mocks', 'security_mocks', 'elin'],
  },
};

export default config;
