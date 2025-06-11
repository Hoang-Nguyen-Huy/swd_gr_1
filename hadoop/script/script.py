from pyspark.sql import SparkSession
from pyspark.sql.functions import avg

spark = SparkSession.builder \
    .appName("AvgLowHigh24h") \
    .getOrCreate()

# Đọc file Avro từ HDFS
df = spark.read.format("avro").load("hdfs://namenode:9000/data/crypto/crypto_price_history.avro")

# Tính trung bình các cột
result = df.select(
    avg("low_24h").alias("avg_low_24h"),
    avg("high_24h").alias("avg_high_24h")
)

result.show()

# (Tùy chọn) Ghi kết quả ra HDFS
result.write.mode("overwrite").json("hdfs://namenode:9000/data/crypto/avg_result")

spark.stop()
