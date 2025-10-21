# Imagen base muy liviana con Java 17 (solo JRE)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el JAR compilado al contenedor
COPY target/vg-ms-fut-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto en el que tu app escucha
EXPOSE 8106

# Ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
