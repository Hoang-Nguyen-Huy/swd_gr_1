#FROM openjdk:21
#WORKDIR /app
#COPY target/swd-0.0.1-SNAPSHOT.jar .
#EXPOSE 9090
#CMD ["java", "-jar", "swd-0.0.1-SNAPSHOT.jar"]

FROM maven:3.9-eclipse-temurin-21
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
EXPOSE 9090
CMD ["java", "-jar", "target/swd-0.0.1-SNAPSHOT.jar"]