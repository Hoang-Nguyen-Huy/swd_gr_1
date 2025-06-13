# Crypto Spark Streaming Job

A real-time cryptocurrency data processing application built with Apache Spark, designed to aggregate cryptocurrency market data from HDFS and stream the results to Kafka.

## 🚀 Overview

This project implements a streaming data pipeline that:

- Reads cryptocurrency market data from HDFS in Avro format
- Performs real-time aggregations by cryptocurrency ID
- Calculates average metrics including price, market cap, volume, and percentage changes
- Streams processed results to a Kafka topic
- Provides detailed logging of batch processing results

## 📊 Features

- **Real-time Processing**: Processes cryptocurrency data with 10-second triggers
- **Data Aggregation**: Calculates averages for multiple metrics per cryptocurrency
- **Dual Output**: Streams to both Kafka and detailed console logs
- **Schema Validation**: Enforces strict data schemas for input and output
- **Fault Tolerance**: Uses HDFS checkpointing for reliable stream processing
- **Containerized**: Fully containerized with Docker for easy deployment

## 🏗️ Architecture

```
HDFS (Avro Data) → Spark Streaming → Aggregation → Kafka Topic
                                   ↓
                              Console Logging
```

### Data Flow

1. **Input**: Reads streaming Avro files from HDFS (`hdfs://namenode:9000/data/nifi`)
2. **Processing**: Groups by `cryptocurrency_id` and calculates averages
3. **Output**:
   - Publishes JSON messages to Kafka topic `cal_avg_crypto_currency`
   - Logs detailed results to console with emoji formatting

## 📋 Prerequisites

- Docker and Docker Compose
- Access to Hadoop cluster (namenode at `namenode:9000`)
- Kafka cluster (broker at `kafka1:29092`)
- Python 3.x

## 🛠️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd crypto-spark-job
   ```

2. **Build the Docker image**:

   ```bash
   docker build -t crypto-spark-job:latest .
   ```

3. **Ensure external network exists**:
   ```bash
   docker network ls | grep hadoop_hadoop
   ```
   If the network doesn't exist, create it or update the network name in `docker-compose.yml`.

## 🚀 Running the Application

### Using Docker Compose

```bash
docker-compose up
```

### Manual Docker Run

```bash
docker run --network hadoop_hadoop \
  -p 4040:4040 -p 8080:8080 \
  crypto-spark-job:latest
```

## 📊 Data Schema

### Input Schema (Avro)

```python
{
  "id": int,
  "cryptocurrency_id": int,
  "price": string,
  "market_cap": long,
  "market_cap_rank": int,
  "total_volume": long,
  "high_24h": string,
  "low_24h": string,
  "price_change_percentage_24h": string,
  "market_cap_change_percentage_24h": string,
  "timestamp": string
}
```

### Output Schema (JSON)

```python
{
  "cryptocurrency_id": int,
  "avg_price": double,
  "avg_market_cap": double,
  "avg_market_cap_rank": double,
  "avg_total_volume": double,
  "avg_high_24h": double,
  "avg_low_24h": double,
  "avg_price_change_pct": double,
  "avg_market_cap_change_pct": double
}
```

## 🔧 Configuration

### Key Configuration Options

- **Spark Packages**:
  - `org.apache.spark:spark-sql-kafka-0-10_2.13:3.5.1`
  - `org.apache.spark:spark-avro_2.13:3.5.1`
- **Processing Trigger**: 10 seconds
- **Checkpoint Locations**:
  - Kafka output: `hdfs://namenode:9000/checkpoints/kafka_output`
  - Log output: `hdfs://namenode:9000/checkpoints/log_output`

### Environment Variables

You can customize the following by modifying the code:

- `HDFS_INPUT_PATH`: Input data location (default: `hdfs://namenode:9000/data/nifi`)
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka brokers (default: `kafka1:29092`)
- `KAFKA_TOPIC`: Output topic (default: `cal_avg_crypto_currency`)

## 📊 Monitoring

### Spark UI

Access the Spark Web UI at: `http://localhost:4040`

### Sample Log Output

```
🔥 === BATCH 1 ===
💰 Processed 5 cryptocurrency(s) in batch 1
🪙 Cryptocurrency ID: 1
   💵 Average price: $45,123.45
   🏦 Mid-cap: $850,000,000,000
   📊 Average rating: 1.0
   📈 Average volume: $25,000,000,000
   ⬆️  Average 24h High: $46,500.00
   ⬇️  Average Low 24h: $44,200.00
   📊 % 24h price change: 2.35%
   📈 % 24h capitalization change: 1.85%
```

## 🧰 Development

### Project Structure

```
crypto-spark-job/
├── app/
│   └── main.py          # Main Spark application
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile          # Docker image definition
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

### Adding Dependencies

Add new Python packages to `requirements.txt`:

```
pyspark
pandas
numpy
```

### Modifying Processing Logic

Edit `app/main.py` to customize:

- Aggregation functions
- Output formats
- Processing intervals
- Schema definitions

## 🚨 Troubleshooting

### Common Issues

1. **Network Connection Errors**:

   - Ensure the `hadoop_hadoop` network exists
   - Verify HDFS and Kafka connectivity

2. **Permission Errors**:

   - Check HDFS permissions for checkpoint directories
   - Ensure write access to `/data/nifi` path

3. **Schema Mismatch**:
   - Verify input data matches the defined Avro schema
   - Check for null values in non-nullable fields

### Logs Location

- Application logs: Console output from Docker container
- Spark logs: Available through Spark UI at `localhost:4040`

## 📝 License

[Add your license information here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section above
- Review Spark and Kafka documentation
- Create an issue in this repository

---

**Note**: This application is designed to work within a distributed data processing environment with Hadoop and Kafka clusters. Ensure all dependencies are properly configured before running.
