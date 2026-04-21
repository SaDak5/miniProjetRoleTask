FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR pré-compilé
COPY target/*.jar app.jar

EXPOSE 8094

ENTRYPOINT ["java", "-jar", "app.jar"]

