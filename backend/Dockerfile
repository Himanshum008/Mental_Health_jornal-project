# =============================================================================
# Java Spring Boot Backend Dockerfile (Multi-stage Build)
# =============================================================================

# --- Stage 1: Build Application with Maven ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Minimal JRE Runtime ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl/wget for container healthcheck
RUN apk add --no-cache curl wget

# Create non-root directory for persistent database data
RUN mkdir -p /app/data && chmod 777 /app/data

# Copy packaged JAR from build stage
COPY --from=build /workspace/target/*.jar /app/app.jar

# Expose Spring Boot port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=h2
ENV ML_SERVICE_URL=http://ml-service:8000
ENV SPRING_DATASOURCE_URL="jdbc:h2:file:/app/data/mentalhealth;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:8080/h2-console || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
