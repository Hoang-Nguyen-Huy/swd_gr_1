const axios = require("axios");
const pool = require("./db"); // Import MySQL pool
const { Kafka } = require("kafkajs");
require("dotenv").config();

// --- Constants ---
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const VS_CURRENCY = process.env.VS_CURRENCY;
const COIN_COUNT = parseInt(process.env.COIN_COUNT, 10) || 250;
const REQUEST_INTERVAL_MS =
  parseInt(process.env.REQUEST_INTERVAL_MS, 10) || 300000;

// Kafka Configuration
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || "crypto_events";

// Initialize Kafka
const kafka = new Kafka({
  clientId: "crypto-crawler",
  brokers: [KAFKA_BROKER],
});

const producer = kafka.producer();

// Validate environment variables
if (!API_URL || !API_KEY || !VS_CURRENCY) {
  console.error(
    "Missing required environment variables (API_URL, API_KEY, VS_CURRENCY). Exiting."
  );
  process.exit(1);
}

// --- API Request Headers and Parameters ---
const HEADERS = {
  accept: "application/json",
  "x-cg-demo-api-key": API_KEY,
};
const PARAMS = {
  vs_currency: VS_CURRENCY,
  order: "market_cap_desc",
  per_page: COIN_COUNT,
  page: 1,
  sparkline: false,
};

// --- Functions ---

async function fetchCryptoData(url, headers, params) {
  try {
    console.log(`Fetching top ${params.per_page} coins...`);
    const response = await axios.get(url, { headers, params });
    console.log(
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
    }
    return null;
  }
}

function parseData(apiData) {
  const formattedData = [];
  if (!apiData || !Array.isArray(apiData)) {
    return formattedData;
  }

  apiData.forEach((coinData) => {
    try {
      // Chuyển đổi định dạng datetime sang YYYY-MM-DD HH:mm:ss
      const lastUpdated = coinData?.last_updated
        ? new Date(coinData.last_updated)
            .toISOString()
            .replace("T", " ")
            .replace(/\.(\d{3})Z$/, "") // Loại bỏ milliseconds và Z
        : null;

      const formattedItem = {
        name: coinData?.name,
        symbol: coinData?.symbol?.toUpperCase(),
        price: Number(coinData?.current_price),
        market_cap: Number(coinData?.market_cap),
        market_cap_rank: Number(coinData?.market_cap_rank),
        total_volume: Number(coinData?.total_volume),
        high_24h: Number(coinData?.high_24h),
        low_24h: Number(coinData?.low_24h),
        price_change_percentage_24h: Number(
          coinData?.price_change_percentage_24h
        ),
        market_cap_change_percentage_24h: Number(
          coinData?.market_cap_change_percentage_24h
        ),
        last_updated: lastUpdated, // Định dạng: '2025-06-06 23:25:38'
      };

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
      }
    } catch (error) {
      console.error(
        `Error parsing data for coin ${coinData?.id}: ${error.message}`
      );
    }
  });

  return formattedData;
}

async function saveToDatabase(data) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const coin of data) {
      // Insert or get cryptocurrency ID
      let [rows] = await connection.query(
        "INSERT INTO cryptocurrencies (name, symbol) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
        [coin.name, coin.symbol]
      );
      const cryptoId =
        rows.insertId ||
        (
          await connection.query(
            "SELECT id FROM cryptocurrencies WHERE symbol = ?",
            [coin.symbol]
          )
        )[0][0].id;

      // Insert price history
      await connection.query(
        `INSERT INTO crypto_price_history (
          cryptocurrency_id, price, market_cap, market_cap_rank, total_volume,
          high_24h, low_24h, price_change_percentage_24h, market_cap_change_percentage_24h, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cryptoId,
          coin.price,
          coin.market_cap,
          coin.market_cap_rank,
          coin.total_volume,
          coin.high_24h,
          coin.low_24h,
          coin.price_change_percentage_24h,
          coin.market_cap_change_percentage_24h,
          coin.last_updated,
        ]
      );
    }

    await connection.commit();
    console.log(`Successfully saved ${data.length} coins to database.`);
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(`Error saving to database: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
}

async function sendToKafka(data) {
  try {
    // Connect producer if not already connected
    await producer.connect();

    const messages = data.map((coin, index) => ({
      key: coin.symbol,
      value: JSON.stringify({
        cryptocurrency_id: index + 1, // Temporary ID, in production should use actual crypto ID
        avg_price: coin.price,
        avg_market_cap: coin.market_cap,
        avg_market_cap_rank: coin.market_cap_rank,
        avg_total_volume: coin.total_volume,
        avg_high_24h: coin.high_24h,
        avg_low_24h: coin.low_24h,
        avg_price_change_pct: coin.price_change_percentage_24h || 0,
        avg_market_cap_change_pct: coin.market_cap_change_percentage_24h || 0,
      }),
    }));

    await producer.send({
      topic: KAFKA_TOPIC,
      messages: messages,
    });

    console.log(
      `Successfully sent ${messages.length} crypto events to Kafka topic: ${KAFKA_TOPIC}`
    );
  } catch (error) {
    console.error(`Error sending data to Kafka: ${error.message}`);
  }
}

async function runCrawler() {
  console.log(`Fetching data at ${new Date().toISOString()}...`);
  const rawData = await fetchCryptoData(API_URL, HEADERS, PARAMS);

  if (rawData) {
    const parsedDataList = parseData(rawData);
    if (parsedDataList.length > 0) {
      console.log(
        `Successfully parsed data for ${parsedDataList.length} coins.`
      );
      await saveToDatabase(parsedDataList);
      await sendToKafka(parsedDataList); // Send data to Kafka
    } else {
      console.error("No valid data parsed from the API response.");
    }
  } else {
    console.error("Failed to fetch data, will retry next cycle.");
  }
}

// --- Main Execution ---
console.log(`Starting Crypto Crawler for Top ${COIN_COUNT} coins...`);
runCrawler();
setInterval(runCrawler, REQUEST_INTERVAL_MS);
console.log(
  `Crawler will fetch data every ${REQUEST_INTERVAL_MS / 1000} seconds.`
);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Crawler stopped by user (SIGINT).");
  await producer.disconnect();
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Crawler stopped (SIGTERM).");
  await producer.disconnect();
  await pool.end();
  process.exit(0);
});
