import { HardhatUserConfig, task } from 'hardhat/config';
import 'dotenv/config';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';
import '@primitivefi/hardhat-dodoc';

const accounts = process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];

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
      // viaIR: true,
      evmVersion: 'london',
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    modularium: {
      url: 'https://fraa-dancebox-3035-rpc.a.dancebox.tanssi.network',
      chainId: 776877,
      accounts: accounts,
      gasPrice: 1000000000,
    },
    moonbaseAlpha: {
      url: process.env.MOONBASE_URL || 'https://rpc.testnet.moonbeam.network',
      chainId: 1287,
      accounts: accounts,
      gasPrice: 1100000000,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || 'https://rpc.sepolia.dev',
      chainId: 11155111,
      accounts: accounts,
    },
    polygonMumbai: {
      url: process.env.MUMBAI_URL || 'https://rpc-mumbai.maticvigil.com',
      chainId: 80001,
      accounts: accounts,
      gasPrice: 2500000000,
    },
    baseGoerli: {
      chainId: 84531,
      url: process.env.BASE_GOERLI_URL || 'https://goerli.base.org',
      accounts: accounts,
      gasPrice: 2000000000,
    },
    baseSepolia: {
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_URL || 'https://sepolia.base.org',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 900000000,
    },
    shibuya: {
      chainId: 81,
      url: process.env.SHIBUYA_URL || 'https://evm.shibuya.astar.network',
      accounts: accounts,
    },
    moonriver: {
      url: process.env.MOONRIVER_URL || 'https://rpc.api.moonriver.moonbeam.network',
      chainId: 1285,
      accounts: accounts,
    },
    moonbeam: {
      url: process.env.MOONBEAM_URL || 'https://rpc.api.moonbeam.network',
      chainId: 1284,
      accounts: accounts,
    },
    mainnet: {
      url: process.env.ETHEREUM_URL || 'https://eth.drpc.org',
      chainId: 1,
      accounts: accounts,
      gasPrice: 12000000000,
    },
    polygon: {
      url: process.env.POLYGON_URL || 'https://polygon.drpc.org',
      chainId: 137,
      accounts: accounts,
      gasPrice: 120000000000,
    },
    base: {
      chainId: 8453,
      url: process.env.BASE_URL || 'https://developer-access-mainnet.base.org',
      accounts: accounts,
    },
    astar: {
      url: process.env.ASTAR_URL || 'https://evm.astar.network',
      chainId: 592,
      accounts: accounts,
    },
    astarZk: {
      url: process.env.ASTAR_ZK_URL || 'https://rpc.startale.com/astar-zkevm',
      chainId: 3776,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    zkyoto: {
      url: process.env.ZKYOTO_URL || 'https://rpc.startale.com/zkyoto	',
      chainId: 6038361,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bsc: {
      url: process.env.BSC_URL || 'https://bsc-dataseed.bnbchain.org',
      chainId: 56,
      accounts: accounts,
      gasPrice: 3000000000,
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
      baseSepolia: process.env.BASESCAN_API_KEY || '', // Base Goerli Etherscan API Key
      shibuya: process.env.SHIBUYA_BLOCKSCOUT_API_KEY || '', // Shibuya blockscout API KeyT
      moonriver: process.env.MOONSCAN_APIKEY || '', // Moonriver Moonscan API Key
      moonbeam: process.env.MOONSCAN_APIKEY || '', // Moonbeam Moonscan API Key
      mainnet: process.env.ETHERSCAN_API_KEY || '', // Ethereum Etherscan API Key
      polygon: process.env.POLYGONSCAN_API_KEY || '', // Polygon Etherscan API Key
      base: process.env.BASESCAN_API_KEY || '', // Base Etherscan API Key
      astar: process.env.ASTAR_BLOCKSCOUT_API_KEY || '', // Astar blockscout API Key
      astarZk: process.env.ASTAR_ZK_API_KEY || '', // Astar ZK API Key
      zkyoto: process.env.ZKYOTO_API_KEY || '', // ZKYOTO API Key
      bsc: process.env.BSCSCAN_API_KEY || '', // BSC Etherscan API Key
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
        network: 'baseSepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
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
          apiURL: 'https://shibuya.blockscout.com/api',
          browserURL: 'https://shibuya.blockscout.com/',
        },
      },
      {
        network: 'astar',
        chainId: 592,
        urls: {
          apiURL: 'https://astar.blockscout.com/api',
          browserURL: 'https://astar.blockscout.com/',
        },
      },
      {
        network: 'astarZk',
        chainId: 3776,
        urls: {
          apiURL: 'https://astar-zkevm.explorer.startale.com/api',
          browserURL: 'https://astar-zkevm.explorer.startale.com/',
        },
      },
      {
        network: 'zkyoto',
        chainId: 1261120,
        urls: {
          apiURL: 'https://zkyoto.explorer.startale.com/api',
          browserURL: 'https://zkyoto.explorer.startale.com/',
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
