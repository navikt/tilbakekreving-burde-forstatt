FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/jre:openjdk-25

COPY --chown=nonroot:nonroot build/libs/tilbakekreving-burde-forstatt-backend-all.jar /app/app.jar

ENV TZ="Europe/Oslo"
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
