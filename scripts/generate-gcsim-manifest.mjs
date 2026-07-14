#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.join(__dirname, "..");
const GCSIM_CATALOG_FILES = [
  "artifacts-aliases.json",
  "artifacts.json",
  "capabilities.json",
  "characters-aliases.json",
  "characters.json",
  "weapons-aliases.json",
  "weapons.json",
];

const sha256File = async (file) => {
  const hash = createHash("sha256");
  hash.update(await fs.promises.readFile(file));
  return hash.digest("hex");
};

const hashNamedFiles = async (directory, fileNames) => {
  const files = [...fileNames].sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(await fs.promises.readFile(path.join(directory, file)));
    hash.update("\0");
  }

  return { count: files.length, files, sha256: hash.digest("hex") };
};

const hashScriptSnapshot = async (directory) => {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const files = entries.map((entry) => {
    if (!entry.isFile()) {
      throw new Error(`unexpected GCSIM snapshot entry "${entry.name}"`);
    }
    return entry.name;
  });
  return hashNamedFiles(directory, files);
};

const hashGCSimCatalogSnapshot = (directory) =>
  hashNamedFiles(directory, GCSIM_CATALOG_FILES);

const readCleanGitHead = (directory) => {
  const status = execFileSync(
    "git",
    ["-C", directory, "status", "--porcelain", "--untracked-files=all"],
    { encoding: "utf8" }
  ).trim();
  if (status) {
    throw new Error(`GCSIM source checkout is not clean:\n${status}`);
  }
  return execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
};

const generateGCSimManifest = async ({ root = projectDirectory } = {}) => {
  const publicDirectory = path.join(root, "public/gcsim");
  const gcsimDirectory = path.join(root, "gcsim");
  const snapshot = await hashScriptSnapshot(
    path.join(publicDirectory, "scripts")
  );
  const catalogs = await hashGCSimCatalogSnapshot(
    path.join(root, "src/data/gcsim")
  );
  const gcsimCommit = readCleanGitHead(gcsimDirectory);
  const goMod = await fs.promises.readFile(
    path.join(gcsimDirectory, "go.mod"),
    "utf8"
  );
  const goVersion = goMod.match(/^go\s+(\S+)/m)?.[1];
  if (!goVersion) {
    throw new Error("GCSIM go.mod has no Go version");
  }
  const manifest = {
    gcsimCommit,
    goToolchain: `go${goVersion}`,
    scriptCount: snapshot.count,
    scriptSnapshotSha256: snapshot.sha256,
    catalogFileCount: catalogs.count,
    catalogSnapshotSha256: catalogs.sha256,
    binarySha256: await sha256File(path.join(publicDirectory, "gcsim.bin")),
    wasmSha256: await sha256File(path.join(publicDirectory, "main.wasm")),
    wasmExecSha256: await sha256File(
      path.join(publicDirectory, "wasm_exec.js")
    ),
  };

  await fs.promises.writeFile(
    path.join(publicDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  return manifest;
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  generateGCSimManifest()
    .then((manifest) => {
      console.log(
        `GCSIM manifest generated for ${manifest.gcsimCommit.slice(0, 12)} ` +
          `with ${manifest.scriptCount} scripts.`
      );
    })
    .catch((error) => {
      console.error("GCSIM manifest generation failed:", error);
      process.exitCode = 1;
    });
}

export {
  generateGCSimManifest,
  hashGCSimCatalogSnapshot,
  hashScriptSnapshot,
  readCleanGitHead,
  sha256File,
};
