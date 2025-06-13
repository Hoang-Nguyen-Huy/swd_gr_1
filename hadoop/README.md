# Hadoop Big Data Processing Environment

A complete Hadoop ecosystem using Docker Compose for big data processing and analytics deployment.

## Architecture Overview

The environment includes the following components:

### Hadoop Core Services

- **NameNode**: HDFS master node for metadata management
- **DataNodes (3 instances)**: HDFS data storage nodes
- **ResourceManager**: YARN cluster resource management
- **NodeManager**: YARN node-level resource management

### Additional Services

- **Apache NiFi**: Data integration and ETL workflows
- **MySQL**: Relational database for metadata storage

## Service Configuration

### Hadoop Cluster

- **NameNode**: `namenode:9870` (Web UI), `namenode:9000` (HDFS)
- **DataNode 1**: `datanode:9864`
- **DataNode 2**: `datanode2:9864`
- **DataNode 3**: `datanode3:9864`
- **ResourceManager**: `resourcemanager:8088`

### NiFi

- **Web UI**: `https://localhost:8443`
- **Credentials**: admin/admin123

### MySQL

- **Port**: `localhost:3306`
- **Root Password**: mysql

## File Structure

```
hadoop/
├── docker-compose.yaml          # Main orchestration file
├── docker-compose-kafka.yml     # Kafka integration (separate)
├── hadoop.env                   # Hadoop environment variables
├── hadoop-conf/                 # Hadoop configuration files
│   ├── core-site.xml
│   ├── hdfs-site.xml
│   └── yarn-site.xml
├── script/                      # Data processing scripts
│   ├── script.py
│   └── spark_display_job.py
├── flow-fetch-hdfs-pub-kafka.png
└── flow-querydb-put-hdfs.png
```

## Data Processing Scripts

### script.py

Script that calculates average prices from crypto data stored in HDFS.

### spark_display_job.py

Advanced analytics job that processes JSON data and calculates averages by cryptocurrency ID.

## Getting Started

1. **Start the entire stack:**

```bash
docker-compose up -d
```

2. **Check service status:**

```bash
docker-compose ps
```

3. **Access web interfaces:**

   - Hadoop NameNode: http://localhost:9870
   - NiFi: https://localhost:8443

4. **Stop services:**

```bash
docker-compose down
```

## Data Flow

1. **Data Ingestion**: Crypto data from crawler → MySQL → NiFi
2. **Data Processing**: NiFi → HDFS → Spark → Analytics Results
3. **Data Storage**: Results stored back to HDFS or external systems

## Volumes

- `hadoop_namenode`: NameNode metadata persistence
- `hadoop_datanode`: DataNode 1 data persistence
- `hadoop_datanode2`: DataNode 2 data persistence
- `hadoop_datanode3`: DataNode 3 data persistence
- `mysql-data`: MySQL database persistence

## Network

All services communicate through the `hadoop` bridge network to ensure secure internal communication.

## Integration with Other Components

- **Crypto Crawler**: Provides source data from `crypto/` directory
- **Spark Jobs**: Additional processing logic from `crypto-spark-job/` directory
- **Kafka**: Optional integration via `docker-compose-kafka.yml`

## Troubleshooting

1. **Check logs:**

```bash
docker-compose logs [service_name]
```

2. **Restart specific service:**

```bash
docker-compose restart [service_name]
```

3. **Access container shell:**

```bash
docker exec -it [container_name] bash
```

4. **Check HDFS status:**

```bash
docker exec namenode hdfs dfsadmin -report
```

## System Requirements

- Docker Engine 20.10+
- Docker Compose 1.29+
- Minimum 8GB RAM
- Minimum 10GB free disk space

## Security

- NiFi is protected with basic authentication (admin/admin123)
- MySQL uses default root password (should be changed in production)
- All services run within Docker internal network

## Monitoring and Logging

- NameNode Web UI: Monitor HDFS status
- ResourceManager UI: Monitor YARN jobs
- NiFi UI: Monitor data flows
- Container logs: Use `docker-compose logs`
