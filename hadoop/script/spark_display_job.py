# spark_display_job.py
from pyspark.sql import SparkSession
import sys

# Khởi tạo Spark session
spark = SparkSession.builder.appName("AverageLowHighDisplay").getOrCreate()

# Lấy đường dẫn từ tham số dòng lệnh
input_path = sys.argv[1]  # hdfs://namenode:8020/data/nifi/
output_path = sys.argv[2]  # /tmp/spark_output/

# Đọc dữ liệu từ HDFS
df = spark.read.json(input_path)

# Tính trung bình low_24h và high_24h theo cryptocurrency_id
result_df = df.groupBy("cryptocurrency_id").agg({
    "low_24h": "avg",
    "high_24h": "avg"
}).selectExpr(
    "cryptocurrency_id",
    "avg(low_24h) as avg_low_24h",
    "avg(high_24h) as avg_high_24h"
)

# Hiển thị kết quả (sẽ xuất ra stdout và ghi vào log NiFi)
result_df.show()

# (Tùy chọn) Lưu kết quả vào file
result_df.write.mode("overwrite").json(output_path)

# Dừng Spark session
spark.stop()