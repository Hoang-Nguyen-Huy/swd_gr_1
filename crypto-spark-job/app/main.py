
from pyspark.sql import SparkSession
from pyspark.sql.functions import avg, col, to_json, struct, from_json
from pyspark.sql.types import StructType, StructField, IntegerType, DoubleType, LongType, StringType
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define schema for the input data
schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("cryptocurrency_id", IntegerType(), False),
    StructField("price", StringType(), False),
    StructField("market_cap", LongType(), False),
    StructField("market_cap_rank", IntegerType(), False),
    StructField("total_volume", LongType(), False),
    StructField("high_24h", StringType(), False),
    StructField("low_24h", StringType(), False),
    StructField("price_change_percentage_24h", StringType(), True),
    StructField("market_cap_change_percentage_24h", StringType(), True),
    StructField("timestamp", StringType(), False)
])

# Define schema for the output JSON
json_schema = StructType([
    StructField("cryptocurrency_id", IntegerType(), False),
    StructField("avg_price", DoubleType(), True),
    StructField("avg_market_cap", DoubleType(), True),
    StructField("avg_market_cap_rank", DoubleType(), True),
    StructField("avg_total_volume", DoubleType(), True),
    StructField("avg_high_24h", DoubleType(), True),
    StructField("avg_low_24h", DoubleType(), True),
    StructField("avg_price_change_pct", DoubleType(), True),
    StructField("avg_market_cap_change_pct", DoubleType(), True)
])

# Initialize Spark Session
spark = SparkSession.builder \
    .appName("Crypto Stream Aggregation") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.13:3.5.1") \
    .getOrCreate()
logger.info("🚀 Initialized Spark Session")

# Read streaming data from HDFS using Avro format
df = spark.readStream \
    .format("avro") \
    .schema(schema) \
    .load("hdfs://namenode:9000/data/nifi")
logger.info("📊 Set up stream from HDFS")

# Cast to double 
df_casted = df.withColumn("price", col("price").cast("double")) \
    .withColumn("high_24h", col("high_24h").cast("double")) \
    .withColumn("low_24h", col("low_24h").cast("double")) \
    .withColumn("price_change_percentage_24h", col("price_change_percentage_24h").cast("double")) \
    .withColumn("market_cap_change_percentage_24h", col("market_cap_change_percentage_24h").cast("double"))

# Average by cryptocurrency_id
avg_df = df_casted.groupBy("cryptocurrency_id").agg(
    avg("price").alias("avg_price"),
    avg("market_cap").alias("avg_market_cap"),
    avg("market_cap_rank").alias("avg_market_cap_rank"),
    avg("total_volume").alias("avg_total_volume"),
    avg("high_24h").alias("avg_high_24h"),
    avg("low_24h").alias("avg_low_24h"),
    avg("price_change_percentage_24h").alias("avg_price_change_pct"),
    avg("market_cap_change_percentage_24h").alias("avg_market_cap_change_pct")
)

# Convert to JSON format to send to Kafka
json_df = avg_df.select(
    col("cryptocurrency_id").cast("string").alias("key"),
    to_json(struct(
        col("cryptocurrency_id"),
        col("avg_price"),
        col("avg_market_cap"),
        col("avg_market_cap_rank"),
        col("avg_total_volume"),
        col("avg_high_24h"),
        col("avg_low_24h"),
        col("avg_price_change_pct"),
        col("avg_market_cap_change_pct")
    )).alias("value")
)

# 🔁 Callback log results
def log_batch_results(batch_df, batch_id):
    logger.info(f"🔥 === BATCH {batch_id} ===")
    if not batch_df.isEmpty():
        batch_df.cache()
        count = batch_df.count()
        logger.info(f"💰 Processed {count} cryptocurrency(s) in batch {batch_id}")

        parsed_df = batch_df.withColumn("parsed_value", from_json(col("value"), json_schema))
        result_df = parsed_df.select(
            col("key").alias("cryptocurrency_id"),
            col("parsed_value.*")
        )

        result_df.show(truncate=False)

        for row in result_df.collect():
            logger.info(f"🪙 Cryptocurrency ID: {row['cryptocurrency_id']}")
            logger.info(f"   💵 Average price: ${row['avg_price']:,.2f}")
            logger.info(f"   🏦 Mid-cap: ${row['avg_market_cap']:,.0f}")
            logger.info(f"   📊 Average rating: {row['avg_market_cap_rank']:.1f}")
            logger.info(f"   📈 Average volume: ${row['avg_total_volume']:,.0f}")
            logger.info(f"   ⬆️  Average 24h High: ${row['avg_high_24h']:,.2f}")
            logger.info(f"   ⬇️  Average Low 24h: ${row['avg_low_24h']:,.2f}")
            if row['avg_price_change_pct'] is not None:
                logger.info(f"   📊 % 24h price change: {row['avg_price_change_pct']:.2f}%")
            if row['avg_market_cap_change_pct'] is not None:
                logger.info(f"   📈 % 24h capitalization change: {row['avg_market_cap_change_pct']:.2f}%")
            logger.info("   " + "="*60)
        batch_df.unpersist()
    else:
        logger.warning(f"⚠️  Batch {batch_id} no data to process")
    logger.info("🏁 " + "="*70)

# === 1️⃣ Pub Kafka ===
kafka_query = json_df.writeStream \
    .format("kafka") \
    .outputMode("update") \
    .trigger(processingTime="10 seconds") \
    .option("kafka.bootstrap.servers", "kafka1:29092") \
    .option("topic", "cal_avg_crypto_currency") \
    .option("checkpointLocation", "hdfs://namenode:9000/checkpoints/kafka_output") \
    .start()
logger.info("📤 Started streaming to Kafka")

# === 2️⃣ Write log results ===
log_query = json_df.writeStream \
    .outputMode("update") \
    .trigger(processingTime="10 seconds") \
    .foreachBatch(log_batch_results) \
    .option("checkpointLocation", "hdfs://namenode:9000/checkpoints/log_output") \
    .start()
logger.info("📝 Started logging detail results")

# Wait for the queries to finish
kafka_query.awaitTermination()
log_query.awaitTermination()




