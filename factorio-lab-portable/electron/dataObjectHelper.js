const fs = require("fs");
const path = require("path");

try {
  const folderPath = `${__dirname}/../public/factoriolab/browser/data/`;
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found at ${folderPath}`);
  }
  const contents = fs.readdirSync(folderPath);
  const folderlist = contents.filter((item) => {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);
    return stat.isDirectory();
  });

  const finalData = {};
  const finalHash = {};

  folderlist.forEach(function (folderName, index, array) {
    const folderdata = {};

    const jsonData = require(
      `${__dirname}/../public/factoriolab/browser/data/${folderName}/data.json`,
    );
    const jsonHash = require(
      `${__dirname}/../public/factoriolab/browser/data/${folderName}/hash.json`,
    );

    // jsonData.icons.forEach(function (itemData, index, array) {
    //   folderdata[itemData.id] = itemData.position;
    // });
    jsonData.icons.forEach(function (itemData, index, array) {
      folderdata[itemData.id] = `-${itemData.x}px -${itemData.y}px`;
    });
    // jsonHash.forEach(function (itemData, index, array) {});
    const folderHash = jsonHash.items;

    finalData[folderName] = folderdata;
    finalHash[folderName] = folderHash;
  });

  const jsonDataString = JSON.stringify(finalData, null, 2);
  const jsonHashString = JSON.stringify(finalHash, null, 2);

  const dataObjectName = "dataObject";
  const hashObjectName = "hashObject";

  const jsDataContent = `const ${dataObjectName} = ${jsonDataString};\n\nmodule.exports = ${dataObjectName};\nexport default ${dataObjectName};`;
  const jsHashContent = `const ${hashObjectName} = ${jsonHashString};\n\nmodule.exports = ${hashObjectName};\nexport default ${hashObjectName};`;

  const dataOutputFileName = `${__dirname}/${dataObjectName}.js`;
  const hashOutputFileName = `${__dirname}/${hashObjectName}.js`;

  fs.writeFileSync(dataOutputFileName, jsDataContent);
  fs.writeFileSync(hashOutputFileName, jsHashContent);
  console.log("data files generated");
} catch (error) {
  console.error(`Error: ${error.message}`);
}
