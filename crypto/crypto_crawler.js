const axios = require("axios");
require("dotenv").config();

// --- Constants ---
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const VS_CURRENCY = process.env.VS_CURRENCY;
const COIN_COUNT = parseInt(process.env.COIN_COUNT, 10);
const REQUEST_INTERVAL_MS = parseInt(process.env.REQUEST_INTERVAL_MS, 10);

// --- API Request Headers and Parameters ---
const HEADERS = {
  accept: "application/json",
  "x-cg-demo-api-key": API_KEY,
};
const PARAMS = {
  vs_currency: VS_CURRENCY,
  order: "market_cap_desc", // Order by market cap descending
  per_page: COIN_COUNT, // Get the top N coins
  page: 1, // Fetch the first page
  sparkline: false, // We don't need sparkline data
  // Note: 'ids' parameter is removed as we fetch by market cap rank now
};

// --- Functions ---

/**
 * Fetches cryptocurrency market data from the CoinGecko API for top N coins.
 * @param {string} url - The API endpoint URL.
 * @param {object} headers - Request headers.
 * @param {object} params - Request query parameters.
 * @returns {Promise<object|null>} - A promise that resolves with the API data or null on error.
 */
async function fetchCryptoData(url, headers, params) {
  try {
    console.error(`Fetching top ${params.per_page} coins...`);
    const response = await axios.get(url, { headers, params });
    console.error(
      `Successfully fetched data for ${
        response.data?.length || 0
      } coins at ${new Date().toISOString()}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from CoinGecko API: ${error.message}`);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Request:", error.request);
    } else {
      console.error("Error", error.message);
    }
    return null;
  }
}

/**
 * Parses the API response and formats it into the desired JSON structure.
 * @param {Array<object>|null} apiData - The raw data array from the API.
 * @returns {Array<object>} - An array of formatted coin data objects.
 */
function parseData(apiData) {
  const formattedData = [];
  if (!apiData || !Array.isArray(apiData)) {
    return formattedData;
  }

  apiData.forEach((coinData) => {
    try {
      const formattedItem = {
        name: coinData?.name,
        symbol: coinData?.symbol?.toUpperCase(), // Ensure symbol is uppercase
        price: coinData?.current_price,
        market_cap: coinData?.market_cap,
        market_cap_rank: coinData?.market_cap_rank, // Added rank
        total_volume: coinData?.total_volume,
        high_24h: coinData?.high_24h,
        low_24h: coinData?.low_24h,
        price_change_percentage_24h: coinData?.price_change_percentage_24h,
        market_cap_change_percentage_24h:
          coinData?.market_cap_change_percentage_24h,
        last_updated: coinData?.last_updated,
      };

      // Basic validation to ensure essential fields are present (excluding potentially null change percentages)
      const essentialFields = [
        "name",
        "symbol",
        "price",
        "market_cap",
        "market_cap_rank",
        "total_volume",
        "high_24h",
        "low_24h",
        "last_updated",
      ];
      const hasEssentialData = essentialFields.every(
        (field) =>
          formattedItem[field] !== undefined &&
          formattedItem[field] !== null &&
          formattedItem[field] !== ""
      );

      if (hasEssentialData) {
        formattedData.push(formattedItem);
      } else {
        console.error(
          `Warning: Missing essential data for coin ${coinData?.id} (Rank: ${coinData?.market_cap_rank}), skipping.`
        );
        // console.error(`Raw data: ${JSON.stringify(coinData)}`); // Uncomment for detailed debugging
      }
    } catch (error) {
      console.error(
        `Error parsing data for coin ${coinData?.id}: ${error.message}`
      );
      // console.error(`Raw data: ${JSON.stringify(coinData)}`); // Uncomment for detailed debugging
    }
  });

  return formattedData;
}

/**
 * Placeholder function to send data to Kafka or RabbitMQ.
 * @param {object} data - The formatted coin data object.
 */
function sendToMessageQueue(data) {
  // --- Placeholder: Replace with your Kafka/RabbitMQ producer code ---
  // Example: print the JSON data to stdout
  console.log(JSON.stringify(data, null, 2));
  // console.error(`Placeholder: Sending data for ${data.name} to message queue.`);
  // --- End Placeholder ---
}

/**
 * Main function to fetch, parse, and send data periodically.
 */
async function runCrawler() {
  console.error(`\nFetching data at ${new Date().toISOString()}...`);
  const rawData = await fetchCryptoData(API_URL, HEADERS, PARAMS);

  if (rawData) {
    const parsedDataList = parseData(rawData);
    if (parsedDataList.length > 0) {
      console.error(
        `Successfully parsed data for ${parsedDataList.length} coins.`
      );
      parsedDataList.forEach((coinJson) => {
        sendToMessageQueue(coinJson);
      });
    } else {
      console.error("No valid data parsed from the API response.");
    }
  } else {
    console.error("Failed to fetch data, will retry next cycle.");
  }
}

// --- Main Execution ---
console.error(
  `Starting Crypto Crawler (Node.js) for Top ${COIN_COUNT} coins...`
);

// Run immediately on start
runCrawler();

// Then run periodically
const intervalId = setInterval(runCrawler, REQUEST_INTERVAL_MS);

console.error(
  `Crawler will fetch data every ${REQUEST_INTERVAL_MS / 1000} seconds.`
);

// Graceful shutdown
process.on("SIGINT", () => {
  console.error("\nCrawler stopped by user (SIGINT).");
  clearInterval(intervalId);
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("\nCrawler stopped (SIGTERM).");
  clearInterval(intervalId);
  process.exit(0);
});
