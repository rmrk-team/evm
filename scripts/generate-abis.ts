import fs from 'fs';
import path from 'path';
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

      const abisRoot = `${process.cwd()}/artifacts/abis`;
      fs.mkdirSync(abisRoot, { recursive: true });

      implementations.forEach((implementation) => {
        const filename = implementation.slice(0, implementation.indexOf('.sol'));
        const file = fs.readFileSync(
          `${process.cwd()}/artifacts/contracts/implementations/${implementation}`,
          'utf8',
        );
        const json = JSON.parse(file);

        if (json.abi) {
          const targetPath = path.join(abisRoot, 'implementations', `${filename}.json`);
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.writeFileSync(targetPath, JSON.stringify(json.abi));
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
          const targetPath = path.join(abisRoot, 'RMRK', 'utils', `${filename}.json`);
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.writeFileSync(targetPath, JSON.stringify(json.abi));
        }
      });
    });
  } catch (e) {
    console.log(`e`, e);
  }
};

getTheAbi();
