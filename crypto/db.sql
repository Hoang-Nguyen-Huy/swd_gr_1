CREATE TABLE IF NOT EXISTS cryptocurrencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    INDEX (symbol)
);

CREATE TABLE IF NOT EXISTS crypto_price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cryptocurrency_id INT NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    market_cap BIGINT NOT NULL,
    market_cap_rank INT NOT NULL,
    total_volume BIGINT NOT NULL,
    high_24h DECIMAL(18, 2) NOT NULL,
    low_24h DECIMAL(18, 2) NOT NULL,
    price_change_percentage_24h DECIMAL(10, 5),
    market_cap_change_percentage_24h DECIMAL(10, 5),
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrencies(id),
    INDEX (cryptocurrency_id, timestamp),
    INDEX (timestamp)
);