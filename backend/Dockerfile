ARG SERVICE=auth-service
FROM maven:3.9.11-eclipse-temurin-21 AS build
ARG SERVICE
WORKDIR /workspace
COPY pom.xml ./pom.xml
COPY platform-security/pom.xml platform-security/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY catalog-service/pom.xml catalog-service/pom.xml
COPY projects-service/pom.xml projects-service/pom.xml
COPY gateway/pom.xml gateway/pom.xml
COPY platform-security/src platform-security/src
COPY auth-service/src auth-service/src
COPY catalog-service/src catalog-service/src
COPY projects-service/src projects-service/src
COPY gateway/src gateway/src
RUN mvn -B -f pom.xml -pl ${SERVICE} -am package -DskipTests

FROM eclipse-temurin:21-jre-jammy AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
ARG SERVICE
WORKDIR /app
COPY --from=build /workspace/${SERVICE}/target/${SERVICE}-1.0.0.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
