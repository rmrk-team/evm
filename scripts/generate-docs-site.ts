import fs from "fs";
import path from "path";

const docsDir = path.join(process.cwd(), "docs");
const pagesDir = path.join(process.cwd(), "pages", "evm-package");

const mappings: Record<string, string> = {
  implementations: "readyToUse",
  "RMRK/multiasset": "core/modular/multiasset",
  "RMRK/equippable": "core/modular/equippable",
  "RMRK/nestable": "core/modular/nestable",
  "RMRK/emotable": "core/modular/emotable",
  "RMRK/extension/tokenAttributes": "core/modular/tokenAttributes",
  "RMRK/access": "core/other/access",
  "RMRK/catalog": "core/other/catalog",
  "RMRK/core": "core/other/core",
  "RMRK/extension": "core/other/extension",
  "RMRK/library": "core/other/library",
  "RMRK/security": "core/other/security",
  "RMRK/utils": "core/other/utils",
};

const removePaths = ["core/other/extension/tokenAttributes"];

const rootMeta = {
  core: "Core",
  readyToUse: "Ready To Use",
};

const copyDir = (source: string, destination: string) => {
  if (!fs.existsSync(source)) {
    return;
  }
  fs.mkdirSync(destination, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const splitCamelCase = (camelCase: string) => {
  if (camelCase.startsWith("RMRK")) {
    camelCase = camelCase.slice(4);
  } else if (camelCase.startsWith("IRMRK")) {
    camelCase = camelCase.slice(5);
  } else if (camelCase.startsWith("IERC")) {
    return camelCase;
  }

  const words = [camelCase[0]?.toUpperCase() ?? ""];
  for (const char of camelCase.slice(1)) {
    if (char.toUpperCase() === char) {
      words.push(char);
    } else {
      words[words.length - 1] += char;
    }
  }

  return words
    .join(" ")
    .replace(/E R C/g, "ERC")
    .replace(/Erc/g, "ERC")
    .replace(/U R I/g, "URI");
};

const updateMarkdownHeadings = (dir: string) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      updateMarkdownHeadings(entryPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const content = fs.readFileSync(entryPath, "utf8");
    const updated = content
      .replace(/#### Returns/g, "**Returns**")
      .replace(/#### Parameters/g, "**Parameters**");
    if (updated !== content) {
      fs.writeFileSync(entryPath, updated);
    }
  }
};

const writeMetaFiles = (dir: string) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const meta: Record<string, string> = {};

  const sortedEntries = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of sortedEntries) {
    if (entry.name === "_meta.json") {
      continue;
    }
    if (entry.isDirectory()) {
      meta[entry.name] = splitCamelCase(entry.name);
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const baseName = entry.name.replace(/\.md$/, "");
      meta[baseName] = splitCamelCase(baseName);
    }
  }

  const metaPath = path.join(dir, "_meta.json");
  const shouldWriteRootMeta = path.resolve(dir) !== path.resolve(pagesDir);
  if (shouldWriteRootMeta || !fs.existsSync(metaPath)) {
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  }

  for (const entry of sortedEntries) {
    if (entry.isDirectory()) {
      writeMetaFiles(path.join(dir, entry.name));
    }
  }
};

const main = () => {
  if (fs.existsSync(pagesDir)) {
    fs.rmSync(pagesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(pagesDir, { recursive: true });
  fs.writeFileSync(path.join(pagesDir, "_meta.json"), JSON.stringify(rootMeta, null, 2));

  for (const [from, to] of Object.entries(mappings)) {
    const sourcePath = path.join(docsDir, from);
    const destinationPath = path.join(pagesDir, to);
    copyDir(sourcePath, destinationPath);
  }

  for (const removePath of removePaths) {
    const fullPath = path.join(pagesDir, removePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }

  updateMarkdownHeadings(pagesDir);
  writeMetaFiles(pagesDir);
};

main();
