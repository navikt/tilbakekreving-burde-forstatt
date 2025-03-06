FROM gcr.io/distroless/java21-debian12:nonroot

COPY --chown=nonroot:nonroot build/libs/tilbakekreving-burde-forstatt-backend-all.jar /app/app.jar

ENV TZ="Europe/Oslo"
ENTRYPOINT ["java", "-jar", "/app/app.jar"]