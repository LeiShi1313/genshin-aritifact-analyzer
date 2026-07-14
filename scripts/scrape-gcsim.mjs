#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import axios from "axios";

import { syncGCSimScripts } from "./gcsim-snapshot.mjs";

const API_URL = "https://simpact.app/api/db";
const PAGE_SIZE = 100;
const MINIMUM_SCRIPT_COUNT = 5_000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../public/gcsim/scripts");

const createDatabaseQuery = (skip, limit) => ({
  query: {},
  project: { _id: 1, config: 1 },
  sort: { _id: 1 },
  limit,
  skip,
});

const fetchPage = async (skip, limit) => {
  const query = createDatabaseQuery(skip, limit);
  const queryString = encodeURIComponent(JSON.stringify(query));
  const response = await axios.get(`${API_URL}?q=${queryString}`, {
    timeout: 30_000,
    headers: {
      "User-Agent": "genshin-artifact-builds-gcsim-sync/1.0",
    },
  });
  return response.data?.data ?? response.data;
};

const scrapeAll = async ({ outputDir = OUTPUT_DIR } = {}) => {
  console.log("Fetching complete GCSIM script snapshot...");
  const result = await syncGCSimScripts({
    outputDir,
    pageSize: PAGE_SIZE,
    minimumCount: MINIMUM_SCRIPT_COUNT,
    fetchPage,
  });
  console.log(
    `GCSIM script snapshot updated: ${result.unique} unique configs.`
  );
  return result;
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  scrapeAll().catch((error) => {
    console.error("GCSIM script snapshot failed:", error);
    process.exitCode = 1;
  });
}

export { createDatabaseQuery, fetchPage, scrapeAll };
