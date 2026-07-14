import { randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  mkdtemp,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const compareASCII = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

const pathExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const validateScript = (script) => {
  if (!script || typeof script !== "object") {
    throw new TypeError("gcsim script must be an object");
  }
  if (
    typeof script._id !== "string" ||
    script._id.length === 0 ||
    path.basename(script._id) !== script._id ||
    script._id === "." ||
    script._id === ".."
  ) {
    throw new TypeError("gcsim script must have a safe, non-empty _id");
  }
  if (typeof script.config !== "string" || script.config.trim().length === 0) {
    throw new TypeError(
      `gcsim script "${script._id}" must have a non-empty config`
    );
  }
};

const normalizeConfig = (config) => {
  const normalized = config
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/^[ \t]+/gm, (indent) => indent.replace(/\t/g, "  "));
  return `${normalized.replace(/\n*$/, "")}\n`;
};

const fetchSnapshot = async (fetchPage, pageSize) => {
  const scripts = new Map();
  let fetched = 0;

  for (let skip = 0; ; skip += pageSize) {
    const page = await fetchPage(skip, pageSize);
    if (!Array.isArray(page)) {
      throw new TypeError(`gcsim page at skip ${skip} must be an array`);
    }
    if (page.length > pageSize) {
      throw new RangeError(
        `gcsim page at skip ${skip} exceeded page size ${pageSize}`
      );
    }

    for (const script of page) {
      validateScript(script);
      fetched += 1;
      if (scripts.has(script._id)) {
        throw new Error(`duplicate script id "${script._id}"`);
      }
      scripts.set(script._id, normalizeConfig(script.config));
    }

    if (page.length < pageSize) {
      return { fetched, scripts };
    }
  }
};

/**
 * Replace a directory of gcsim scripts with a complete, validated snapshot.
 * Staging and backup directories are siblings of outputDir so every rename
 * stays on the same filesystem.
 */
export const syncGCSimScripts = async ({
  outputDir,
  fetchPage,
  pageSize = 100,
  minimumCount = 1,
}) => {
  if (typeof outputDir !== "string" || outputDir.length === 0) {
    throw new TypeError("outputDir must be a non-empty string");
  }
  if (typeof fetchPage !== "function") {
    throw new TypeError("fetchPage must be a function");
  }
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new RangeError("pageSize must be a positive integer");
  }
  if (!Number.isInteger(minimumCount) || minimumCount <= 0) {
    throw new RangeError("minimumCount must be a positive integer");
  }

  const { fetched, scripts } = await fetchSnapshot(fetchPage, pageSize);
  if (scripts.size < minimumCount) {
    throw new Error(
      `GCSIM snapshot has ${scripts.size} scripts; expected at least ${minimumCount}`
    );
  }
  const resolvedOutputDir = path.resolve(outputDir);
  const parentDir = path.dirname(resolvedOutputDir);
  const outputName = path.basename(resolvedOutputDir);

  await mkdir(parentDir, { recursive: true });
  let stagingDir = await mkdtemp(
    path.join(parentDir, `.${outputName}.staging-`)
  );
  let backupDir;
  let oldSnapshotMoved = false;
  let snapshotCommitted = false;

  try {
    for (const [id, config] of [...scripts.entries()].sort(([a], [b]) =>
      compareASCII(a, b)
    )) {
      await writeFile(path.join(stagingDir, id), config, "utf8");
    }

    if (await pathExists(resolvedOutputDir)) {
      backupDir = path.join(parentDir, `.${outputName}.backup-${randomUUID()}`);
      await rename(resolvedOutputDir, backupDir);
      oldSnapshotMoved = true;
    }

    try {
      await rename(stagingDir, resolvedOutputDir);
      stagingDir = undefined;
      snapshotCommitted = true;
      oldSnapshotMoved = false;
    } catch (error) {
      if (oldSnapshotMoved) {
        await rename(backupDir, resolvedOutputDir);
        oldSnapshotMoved = false;
      }
      throw error;
    }

    return { fetched, unique: scripts.size };
  } catch (error) {
    if (oldSnapshotMoved && !(await pathExists(resolvedOutputDir))) {
      await rename(backupDir, resolvedOutputDir);
      oldSnapshotMoved = false;
    }
    throw error;
  } finally {
    if (stagingDir) {
      await rm(stagingDir, { recursive: true, force: true });
    }
    if (backupDir && !oldSnapshotMoved) {
      try {
        await rm(backupDir, { recursive: true, force: true });
      } catch (error) {
        const state = snapshotCommitted ? "new" : "original";
        console.warn(
          `GCSIM snapshot uses the ${state} data, but backup cleanup failed:`,
          error
        );
      }
    }
  }
};
