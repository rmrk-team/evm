import fs from 'fs';
import walkSync from 'walk-sync';

const getTheAbi = () => {
  try {
    const implementations = walkSync(`${process.cwd()}/artifacts/contracts/implementations`, {
      directories: false,
    });

    const dirExists = fs.existsSync(`${process.cwd()}/artifacts/abis/implementations`);
    if (!dirExists) {
      fs.mkdirSync(`${process.cwd()}/artifacts/abis`);
      fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations`);
      fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/abstracts`);
      fs.mkdirSync(`${process.cwd()}/artifacts/abis/implementations/erc20Pay`);
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
  } catch (e) {
    console.log(`e`, e);
  }
};

getTheAbi();
