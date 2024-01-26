import fs from 'fs';
import walkSync from 'walk-sync';
import { rimraf } from 'rimraf';

const getTheAbi = () => {
  try {
    rimraf(`${process.cwd()}/artifacts/abis`).then(() => {
      const implementations = walkSync(`${process.cwd()}/artifacts/contracts/implementations`, {
        directories: false,
      });

      const utils = walkSync(`${process.cwd()}/artifacts/contracts/RMRK/utils`, {
        directories: false,
      });

      const dirExists = fs.existsSync(`${process.cwd()}/artifacts/abis/implementations`);
      if (!dirExists) {
        fs.mkdirSync(`${process.cwd()}/artifacts/abis`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/abstract`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/lazyMintErc20`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/lazyMintNative`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/nativeTokenPay`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/erc20Pay`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/premint`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/utils`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/RMRK`);
        fs.mkdirSync(`${process.cwd()}/artifacts/abis/RMRK/utils`);
      }

      implementations.forEach((implementation) => {
        const filename = implementation.slice(0, implementation.indexOf('.sol'));
        const file = fs.readFileSync(
          `${process.cwd()}/artifacts/contracts/implementations/${implementation}`,
          'utf8',
        );
        const json = JSON.parse(file);

        if (json.abi) {
          fs.writeFileSync(
            `${process.cwd()}/artifacts/abis/implementations/${filename}.json`,
            JSON.stringify(json.abi),
          );
        }
      });

      utils.forEach((util) => {
        const filename = util.slice(0, util.indexOf('.sol'));
        const file = fs.readFileSync(
          `${process.cwd()}/artifacts/contracts/RMRK/utils/${util}`,
          'utf8',
        );
        const json = JSON.parse(file);

        if (json.abi) {
          fs.writeFileSync(
            `${process.cwd()}/artifacts/abis/RMRK/utils/${filename}.json`,
            JSON.stringify(json.abi),
          );
        }
      });
    });
  } catch (e) {
    console.log(`e`, e);
  }
};

getTheAbi();
