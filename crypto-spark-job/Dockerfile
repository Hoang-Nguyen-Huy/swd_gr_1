FROM bitnami/spark:latest

USER root
RUN apt-get update && apt-get install -y python3-pip

WORKDIR /app

COPY ./app /app
COPY requirements.txt /app

RUN pip3 install --no-cache-dir -r requirements.txt

CMD ["python3", "main.py"]
