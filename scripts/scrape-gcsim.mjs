#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import axios from 'axios';

const API_URL = 'https://simpact.app/api/db';
const OUTPUT_DIR = './public/gcsim/scripts';
const LIMIT = 25;

// Query parameters matching the example
const BASE_QUERY = {
  query: {
    $and: [
      {
        accepted_tags: {
          $nin: [9]
        }
      }
    ]
  },
  limit: LIMIT,
  skip: 0,
  sort: {
    create_date: -1
  }
};

async function fetchPage(skip) {
  const query = {
    ...BASE_QUERY,
    skip
  };

  const queryString = encodeURIComponent(JSON.stringify(query));
  const url = `${API_URL}?q=${queryString}`;

  console.log(`Fetching page with skip=${skip}...`);

  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching page with skip=${skip}:`, error.message);
    throw error;
  }
}

async function saveConfig(id, config) {
  const filePath = path.join(OUTPUT_DIR, id);

  try {
    await fs.promises.writeFile(filePath, config, 'utf-8');
    console.log(`✓ Saved: ${id}`);
  } catch (error) {
    console.error(`✗ Failed to save ${id}:`, error.message);
  }
}

async function scrapeAll() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  let skip = 0;
  let totalFetched = 0;
  let hasMore = true;

  console.log('Starting scraper...\n');

  while (hasMore) {
    try {
      const data = await fetchPage(skip);

      if (!Array.isArray(data) || data.length === 0) {
        console.log('\nNo more data to fetch.');
        hasMore = false;
        break;
      }

      console.log(`Received ${data.length} items`);

      // Save each config
      for (const item of data) {
        if (item._id && item.config) {
          await saveConfig(item._id, item.config);
          totalFetched++;
        } else {
          console.warn(`⚠ Skipping item without _id or config:`, item._id || 'unknown');
        }
      }

      // If we received fewer items than the limit, we've reached the end
      if (data.length < LIMIT) {
        console.log('\nReached the end of available data.');
        hasMore = false;
      } else {
        skip += LIMIT;
        // Add a small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('\nError during scraping:', error.message);
      hasMore = false;
    }
  }

  console.log(`\n✓ Scraping complete! Total configs saved: ${totalFetched}`);
}

// Run the scraper
scrapeAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
