# Cryptocurrency Data Crawler

A Node.js application that fetches real-time cryptocurrency market data from the CoinGecko API and saves it to your PostgreSQL database.

## Project Structure

- `/crypto` - Main directory containing the crypto crawler application
  - `crypto_crawler.js` - Main script for fetching and saving cryptocurrency data
  - `db.js` - Database connection logic
  - `package.json` - Node.js dependencies

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- A PostgreSQL database (Aiven or any PostgreSQL provider)
- CoinGecko API key

### Setting Up the Cryptocurrency Crawler

1. Navigate to the crypto crawler directory:

   ```bash
   cd crypto
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   API_URL=https://api.coingecko.com/api/v3/coins/markets
   API_KEY=your_coingecko_api_key
   VS_CURRENCY=usd
   COIN_COUNT=100
   REQUEST_INTERVAL_MS=60000

   DB_HOST=your_postgres_host
   DB_PORT=your_postgres_port
   DB_DATABASE=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```

4. Run the crawler:

   ```bash
   node crypto_crawler.js
   ```

## Features

- Fetches real-time cryptocurrency data from CoinGecko API
- Formats and processes market data for the top cryptocurrencies based on market cap
- Saves data to your PostgreSQL database (no duplicate entries for the same symbol and timestamp)
- Supports configurable parameters through environment variables
- Comprehensive error handling and logging
- Graceful shutdown handling

## Configuration Options

The crawler can be configured through the `.env` file with the following options:

| Variable            | Description                                        | Default                                        |
| ------------------- | -------------------------------------------------- | ---------------------------------------------- |
| API_URL             | The CoinGecko API endpoint URL                     | https://api.coingecko.com/api/v3/coins/markets |
| API_KEY             | Your CoinGecko API key                             | -                                              |
| VS_CURRENCY         | The currency to display prices in                  | usd                                            |
| COIN_COUNT          | Number of top cryptocurrencies to fetch            | 100                                            |
| REQUEST_INTERVAL_MS | Time interval between API requests in milliseconds | 60000 (1 minute)                               |
| DB_HOST             | PostgreSQL host                                    | -                                              |
| DB_PORT             | PostgreSQL port                                    | -                                              |
| DB_DATABASE         | PostgreSQL database name                           | -                                              |
| DB_USER             | PostgreSQL user                                    | -                                              |
| DB_PASSWORD         | PostgreSQL password                                | -                                              |

## Data Flow

1. The crypto crawler fetches data from the CoinGecko API.
2. The crawler processes and formats the raw data into a standardized format.
3. The formatted data is saved to your PostgreSQL database.

## Troubleshooting

- If the crawler fails to fetch data, check your API key and CoinGecko rate limits.
- Make sure your database connection information in `.env` is correct.
- For detailed error messages, check the console output.

## License

[MIT License](LICENSE)
