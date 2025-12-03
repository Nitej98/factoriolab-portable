const fs = require("fs");
const path = require("path");

const factoriolabRoot = path.join(__dirname, "../public/factoriolab/browser");

if (!fs.existsSync(factoriolabRoot)) {
  console.error("Factoriolab build folder not found:", factoriolabRoot);
  process.exit(1);
}

const FactoriolabExactMap = {};
const FactoriolabBasenameMap = {};

function walk(dir, relBase = "") {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const abs = path.join(dir, item);
    const rel = path.join(relBase, item).replace(/\\/g, "/");
    const stat = fs.statSync(abs);

    if (stat.isDirectory()) {
      walk(abs, rel);
    } else if (stat.isFile()) {
      FactoriolabExactMap[rel] = rel;
      const base = path.basename(item);
      if (!FactoriolabBasenameMap[base]) {
        FactoriolabBasenameMap[base] = [];
      }
      FactoriolabBasenameMap[base].push(rel);
    }
  }
}

walk(factoriolabRoot);

const outputFile = path.join(__dirname, "FactoriolabFileMap.js");

const content = `const FactoriolabExactMap = ${JSON.stringify(
  FactoriolabExactMap,
  null,
  2
)};

const FactoriolabBasenameMap = ${JSON.stringify(
  FactoriolabBasenameMap,
  null,
  2
)};

module.exports = { FactoriolabExactMap, FactoriolabBasenameMap };

export { FactoriolabExactMap, FactoriolabBasenameMap };

const maps = { FactoriolabExactMap, FactoriolabBasenameMap };
export default maps;
`;

fs.writeFileSync(outputFile, content, "utf8");
console.log("path files generated");
