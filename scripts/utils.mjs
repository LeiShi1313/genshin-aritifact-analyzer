import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import axios from "axios";
import sharp from "sharp";

export const lngToRegion = {
  CHS: "zh",
  CHT: "zh-Hant",
  Japanese: "ja",
  Korean: "ko",
  Spanish: "es",
  French: "fr",
  German: "de",
};

const imageFormat = (filePath) => {
  const descriptor = fs.openSync(filePath, "r");
  const header = Buffer.alloc(12);
  try {
    fs.readSync(descriptor, header, 0, header.length, 0);
  } finally {
    fs.closeSync(descriptor);
  }

  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (header.subarray(0, 8).equals(png)) return "png";
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff)
    return "jpeg";
  if (header.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
  if (
    header.subarray(0, 4).toString("ascii") === "RIFF" &&
    header.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "webp";
  return undefined;
};

export const isValidImage = (filePath) => {
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      return false;
    }
    return imageFormat(filePath) !== undefined;
  } catch (error) {
    console.error(`Failed to validate ${filePath}: ${error.message}`);
    return false;
  }
};

export const downloadImage = async (url, imagePath) => {
  const temporaryPath = `${imagePath}.${
    process.pid
  }.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  const convertedPath = `${temporaryPath}.converted`;

  try {
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 20_000,
    });
    await pipeline(
      response.data,
      fs.createWriteStream(temporaryPath, { flags: "wx" })
    );
    const downloadedFormat = imageFormat(temporaryPath);
    if (!downloadedFormat) {
      throw new Error("response was not a supported image");
    }

    let completedPath = temporaryPath;
    if (
      path.extname(imagePath).toLowerCase() === ".png" &&
      downloadedFormat !== "png"
    ) {
      await sharp(temporaryPath).png().toFile(convertedPath);
      if (imageFormat(convertedPath) !== "png") {
        throw new Error("response could not be converted to PNG");
      }
      completedPath = convertedPath;
    }

    fs.renameSync(completedPath, imagePath);
    fs.rmSync(temporaryPath, { force: true });
    return true;
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    fs.rmSync(convertedPath, { force: true });
    console.warn(`Failed to download ${url}: ${error.message}`);
    return false;
  }
};

const withPngExtension = (resourceName) =>
  resourceName.endsWith(".png") ? resourceName : `${resourceName}.png`;

const withWebpExtension = (resourceName) =>
  `${resourceName.replace(/\.(?:png|webp)$/i, "")}.webp`;

export const yattaImageUrl = (resourceName, type) => {
  const directory = type === "artifact" ? "UI/reliquary" : "UI";
  return `https://gi.yatta.top/assets/${directory}/${withPngExtension(
    resourceName
  )}`;
};

export const enkaImageUrl = (resourceName) =>
  `https://enka.network/ui/${withPngExtension(resourceName)}`;

export const nanokaImageUrl = (resourceName) =>
  `https://static.nanoka.cc/assets/gi/${withWebpExtension(resourceName)}`;

export const downloadFirstAvailable = async (urls, imagePath, label) => {
  for (const url of [...new Set(urls.filter(Boolean))]) {
    if (await downloadImage(url, imagePath)) return;
  }
  throw new Error(`No valid image source found for ${label}`);
};

export const readNamesFromFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  return content.split("\n").filter((line) => line.trim() !== "");
};

export const syncNamesFile = (
  filePath,
  remoteNames,
  normalize = (name) => name
) => {
  const localNames = readNamesFromFile(filePath);
  const knownNames = new Set(localNames);
  const additions = [];
  for (const remoteName of remoteNames) {
    const name = normalize(remoteName);
    if (!name || knownNames.has(name)) continue;
    knownNames.add(name);
    additions.push(name);
  }

  const mergedNames = [...localNames, ...additions];
  fs.writeFileSync(filePath, `${mergedNames.join("\n")}\n`, "utf8");
  console.log(`Updated ${filePath}: appended ${additions.length} names`);
  return mergedNames;
};
