# Cryptocurrency Big Data Processing Pipeline

A comprehensive real-time cryptocurrency data processing system built with modern big data technologies including Hadoop, Spark, Kafka, and NiFi.

## 🏗️ Project Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CoinGecko API  │───▶│ Crypto       │───▶│     MySQL       │───▶│     NiFi        │
│                 │    │ Crawler      │    │   Database      │    │   Data Flow     │
└─────────────────┘    └──────────────┘    └─────────────────┘    └─────────────────┘
                                                                            │
                                                                            ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Kafka       │◀───│    Spark     │◀───│      HDFS       │◀───│     NiFi        │
│   Streaming     │    │  Processing  │    │   Storage       │    │   Output        │
└─────────────────┘    └──────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────┐
│  Spring Boot    │    │   Console    │
│   Consumer      │    │   Logging    │
└─────────────────┘    └──────────────┘
```

## 📂 Project Structure

```
swd_gr_1/
├── crypto/                      # Data ingestion layer
│   ├── crypto_crawler.js        # CoinGecko API crawler
│   ├── db.js                   # MySQL connection pool
│   ├── db.sql                  # Database schema
│   ├── package.json            # Node.js dependencies
│   └── README.md               # Crypto crawler documentation
├── hadoop/                     # Big data infrastructure
│   ├── docker-compose.yaml     # Hadoop ecosystem orchestration
│   ├── docker-compose-kafka.yml # Kafka integration
│   ├── hadoop.env              # Environment configuration
│   ├── hadoop-conf/            # Hadoop configuration files
│   ├── script/                 # Spark processing scripts
│   └── README.md               # Hadoop infrastructure docs
├── crypto-spark-job/           # Real-time processing
│   ├── app/main.py             # Spark streaming application
│   ├── docker-compose.yml      # Spark job deployment
│   ├── Dockerfile              # Container definition
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Spark job documentation
├── crypto-ui/                  # Frontend dashboard
│   ├── src/                    # React TypeScript source code
│   ├── components/             # UI components for data visualization
│   ├── hooks/                  # Custom React hooks for data fetching
│   ├── services/               # WebSocket and API services
│   ├── package.json            # Node.js dependencies
│   └── README.md               # Frontend documentation
└── kafka/                      # Stream consumption
    ├── src/                    # Spring Boot Kafka consumer
    ├── pom.xml                 # Maven dependencies
    └── SwdApplication.java     # Main application class
```

## 🚀 System Components

### 1. Data Ingestion Layer (`crypto/`)

- **Technology**: Node.js + MySQL
- **Function**: Crawls cryptocurrency data from CoinGecko API
- **Features**:
  - Fetches top 250 cryptocurrencies every 5 minutes
  - Validates and parses essential data fields
  - Stores to MySQL with transaction safety
  - Graceful error handling and retry logic

### 2. Big Data Infrastructure (`hadoop/`)

- **Technology**: Hadoop HDFS + Apache NiFi + MySQL
- **Function**: Distributed storage and data flow management
- **Components**:
  - **NameNode**: HDFS metadata management (Port: 9870)
  - **DataNodes (3x)**: Distributed data storage
  - **ResourceManager**: YARN resource management (Port: 8088)
  - **NiFi**: ETL workflows and data integration (Port: 8443)
  - **MySQL**: Relational data storage (Port: 3306)

### 3. Real-time Processing (`crypto-spark-job/`)

- **Technology**: Apache Spark Streaming + Python
- **Function**: Real-time data aggregation and analytics
- **Features**:
  - Reads Avro data from HDFS
  - Calculates cryptocurrency averages by ID
  - 10-second processing triggers
  - Dual output: Kafka + Console logging
  - Fault-tolerant checkpointing

### 4. Stream Consumption (`kafka/`)

- **Technology**: Spring Boot + Apache Kafka
- **Function**: Consumes processed data streams
- **Features**:
  - Java 21 + Spring Boot 3.5.0
  - Kafka integration for real-time consumption
  - WebSocket support for real-time web interfaces

### 5. Frontend Dashboard (`crypto-ui/`)

- **Technology**: React + TypeScript + Vite
- **Function**: Real-time data visualization dashboard
- **Features**:
  - Real-time crypto data display via WebSocket
  - Interactive charts and tables
  - Dual data sources: Static JSON and live Kafka streams
  - Responsive design with Tailwind CSS
  - ShadCN UI component library integration

## 🔄 Data Flow Pipeline

1. **Data Collection**:

   - Crypto crawler fetches market data from CoinGecko API
   - Data validation and formatting
   - Storage in MySQL database

2. **Data Integration**:

   - NiFi extracts data from MySQL
   - Transforms and loads into HDFS in Avro format
   - Provides data lineage and monitoring

3. **Stream Processing**:

   - Spark reads streaming Avro files from HDFS
   - Performs real-time aggregations by cryptocurrency
   - Calculates averages for price, market cap, volume, etc.

4. **Data Distribution**:
   - Processed results streamed to Kafka topic
   - Spring Boot consumer processes Kafka messages
   - Console logging for monitoring and debugging

## 🛠️ Quick Start Guide

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+
- Node.js 16+ (for crypto crawler)
- Java 21+ (for Kafka consumer)
- Minimum 8GB RAM
- Minimum 15GB free disk space

### 1. Start Hadoop Infrastructure

```bash
cd hadoop/
docker-compose up -d
```

### 2. Set up Crypto Crawler

```bash
cd crypto/
npm install
cp .env.example .env
docker-compose up -d
```

### 3. Deploy Spark Processing Job

```bash
cd crypto-spark-job/
docker-compose up -d
```

### 4. Start Kafka Consumer

```bash
cd kafka/
./mvnw spring-boot:run
```

### 5. Launch Frontend Dashboard

```bash
cd crypto-ui/
npm install --legacy-peer-deps
npm run dev
```

Access the dashboard at http://localhost:5173

## 📊 Monitoring & Access Points

### Web Interfaces

- **Hadoop NameNode**: http://localhost:9870
- **YARN ResourceManager**: http://localhost:8088
- **Apache NiFi**: https://localhost:8443 (admin/admin123)
- **Spark UI**: http://localhost:4040
- **Crypto Dashboard**: http://localhost:5173

### API Endpoints

- **Spring Boot App**: http://localhost:9090
- **MySQL Database**: localhost:3306

## 📈 Key Metrics & Analytics

The system processes and calculates:

- **Price Analytics**: Average current price, 24h high/low
- **Market Metrics**: Average market cap and ranking
- **Volume Analysis**: Average trading volume
- **Change Indicators**: 24h price and market cap changes
- **Real-time Aggregations**: Grouped by cryptocurrency ID

## 🔧 Configuration

### Environment Variables

```bash
# Crypto Crawler (.env)
API_URL=https://api.coingecko.com/api/v3/coins/markets
API_KEY=your_coingecko_api_key
VS_CURRENCY=usd
COIN_COUNT=250
REQUEST_INTERVAL_MS=300000

# Hadoop (hadoop.env)
CORE_CONF_fs_defaultFS=hdfs://namenode:9000
YARN_CONF_yarn_resourcemanager_hostname=resourcemanager
```

### Data Schemas

- **Input**: Cryptocurrency market data (JSON from API)
- **Storage**: Normalized relational schema (MySQL)
- **Processing**: Avro format (HDFS)
- **Output**: Aggregated JSON (Kafka)

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**: Check Docker resources and port conflicts
2. **Data not flowing**: Verify NiFi processors and HDFS connectivity
3. **Spark job failing**: Check HDFS paths and schema compatibility
4. **API rate limits**: Adjust crawler interval or upgrade API plan

### Debug Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service_name]

# Access containers
docker exec -it [container_name] bash

# Check HDFS status
docker exec namenode hdfs dfsadmin -report
```

## 🔐 Security Considerations

- **NiFi**: Basic authentication (change default credentials)
- **MySQL**: Secure root password in production
- **Network**: Internal Docker network isolation
- **API Keys**: Secure storage of CoinGecko credentials
- **Volumes**: Persistent data storage with proper permissions

## 📝 Development & Contribution

### Adding New Features

1. **Data Sources**: Extend crypto crawler for additional APIs
2. **Processing Logic**: Modify Spark jobs for new analytics
3. **Storage**: Add new data models in MySQL schema
4. **Consumption**: Extend Spring Boot consumer for new use cases

### Best Practices

- Follow containerization patterns
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for business logic
- Document configuration changes

## 📄 License

This project is part of SWD Group 1 coursework and is intended for educational purposes.

## 🤝 Team & Support

**SWD Group 1** - Software Development Project

For issues and questions:

- Check component-specific README files
- Review Docker logs for troubleshooting
- Consult Apache Spark/Hadoop documentation
- Contact project maintainers

---

**Note**: This system is designed for educational big data processing scenarios. For production deployment, implement additional security, monitoring, and scaling considerations.
