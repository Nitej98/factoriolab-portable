const zlib = require("zlib");
const { URL, fileURLToPath } = require("url");
const dataObject = require("./dataObject");
const hashObject = require("./hashObject");

// constants
const ZBASE64ABC =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.";
const ZMAX = ZBASE64ABC.length;

// Map of character to its 0-63 value
const ZMAP = ZBASE64ABC.split("").reduce((e, c, i) => {
  e[c] = i;
  return e;
}, {});

const CUSTOM_ZERO_CHAR = "_";

const base64codes = new Uint8Array(256).fill(255);
for (let i = 0; i < ZBASE64ABC.length; i++) {
  base64codes[ZBASE64ABC.charCodeAt(i)] = i;
}
base64codes[CUSTOM_ZERO_CHAR.charCodeAt(0)] = 0;

//Decoding Functions

function getBase64Code(charCode) {
  if (charCode >= base64codes.length) {
    throw new Error("Unable to parse base64 string.");
  }
  const code = base64codes[charCode];
  if (code === 255) {
    throw new Error("Unable to parse base64 string.");
  }
  return code;
}

function base64ToBytes(str) {
  if (str.length % 4 !== 0) {
    throw new Error(
      "Unable to parse base64 string: Length is not multiple of 4."
    );
  }

  const index = str.indexOf(CUSTOM_ZERO_CHAR);
  if (index !== -1 && index < str.length - 2) {
    throw new Error("Unable to parse base64 string: Invalid padding position.");
  }

  const missingOctets = str.endsWith(CUSTOM_ZERO_CHAR + CUSTOM_ZERO_CHAR)
    ? 2
    : str.endsWith(CUSTOM_ZERO_CHAR)
    ? 1
    : 0;

  const n = str.length;
  const result = new Uint8Array(3 * (n / 4));
  let buffer;

  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    buffer =
      (getBase64Code(str.charCodeAt(i)) << 18) |
      (getBase64Code(str.charCodeAt(i + 1)) << 12) |
      (getBase64Code(str.charCodeAt(i + 2)) << 6) |
      getBase64Code(str.charCodeAt(i + 3));

    result[j] = buffer >> 16;
    result[j + 1] = (buffer >> 8) & 0xff;
    result[j + 2] = buffer & 0xff;
  }
  return result.subarray(0, result.length - missingOctets);
}

function decompress(byteArray) {
  return new Promise((resolve, reject) => {
    zlib.inflate(Buffer.from(byteArray), (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString("utf8"));
    });
  });
}

async function inflate(str) {
  try {
    const bytes = base64ToBytes(str);
    return await decompress(bytes);
  } catch (e) {}
}

function idToIndex(id) {
  const n = ZMAP[id[0]];
  if (id.length > 1) {
    id = id.substring(1);
    return n * Math.pow(ZMAX, id.length) + idToIndex(id);
  }
  return n;
}

function processItemName(itemName) {
  const splitItemName = itemName.split("-");
  const nameEnd = splitItemName.at(-1);
  const hasNumber = Number.isInteger(parseInt(nameEnd));
  if (hasNumber) {
    return splitItemName.slice(0, -1).join("-");
  } else {
    return itemName;
  }
}

async function getSpriteDetails(fullUrl) {
  const urlObj = new URL(fullUrl);
  const urlHash = urlObj.hash;

  let folderName;
  let oParam;
  let zParam;

  if (urlHash) {
    const urlHashSplit = urlHash.split("?");
    folderName = urlHashSplit[0].split("/")[1];
    const params = Object.fromEntries(new URLSearchParams(urlHashSplit[1]));
    oParam = params.o;
    zParam = params.z;
  } else {
    oParam = urlObj.searchParams.get("o");
    zParam = urlObj.searchParams.get("z");
    if (urlObj.protocol === "file:") {
      const filePath = fileURLToPath(urlObj);
      const pathSegments = filePath.split("\\");
      folderName = pathSegments[1];
    } else {
      const fullPath = urlObj.pathname;
      const pathSegments = fullPath.split("/");
      folderName = pathSegments[1];
    }
  }

  // defaulting the foldername to spa
  if (folderName === null) {
    folderName = "spm";
  }

  let fullItemName;
  let itemName;
  let itemQuality;
  try {
    if (oParam) {
      fullItemName = oParam;
    } else if (zParam) {
      const decompressed = await inflate(zParam);
      const goalMatch = decompressed.match(/o=([A-Za-z0-9\-.]+)/);
      if (goalMatch) {
        const goalId = goalMatch[1];
        const numericValue = idToIndex(goalId);
        fullItemName = hashObject.items[numericValue];
      }
    } else {
      return;
    }
    const matchResult = fullItemName.split("*")[0].match(/(.*)(\(\d+\))/);
    if (matchResult) {
      itemName = matchResult[1];
      itemQuality = matchResult[2];
    } else {
      itemName = fullItemName.split("*")[0];
      itemQuality = "0";
    }
    let spritePosition = dataObject[folderName][itemName];
    if (!spritePosition) {
      const formattedName = processItemName(itemName);
      spritePosition = dataObject[folderName][formattedName];
      if (!spritePosition) {
        spritePosition = dataObject[folderName][`${formattedName}-1`];
      }
    }
    return {
      itemName: itemName
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()), //remove hypens and capitalize
      spritePosition: spritePosition,
      itemQuality: itemQuality.replace(/[()]/g, ""), //regular expression to removes the parentheses
      spritePath: `./factoriolab/browser/data/${folderName}/icons.webp`,
      urlHash: urlHash,
    };
  } catch (e) {
    console.error("\nAn error occurred during decoding:", e.message);
  }
}

module.exports = {
  getSpriteDetails,
};
