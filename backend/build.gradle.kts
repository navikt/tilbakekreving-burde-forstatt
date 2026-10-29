val ktorVersion = "3.6.0"
val logbackVersion = "1.6.6"
val jacksonVersion = "3.2.4"

plugins {
    kotlin("jvm") version "2.4.21"
    application
    id("com.gradleup.shadow") version "9.6.1"
    id("org.jlleitschuh.gradle.ktlint") version "14.2.0"
}

repositories {
    mavenCentral()
    maven {
        url = uri("https://maven.pkg.github.com/navikt/familie-tjenestespesifikasjoner")
        credentials {
            username = "x-access-token"
            password = System.getenv("GITHUB_TOKEN")
        }
    }
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm:$ktorVersion")
    implementation("io.ktor:ktor-server-netty-jvm:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-serialization-jackson3:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-client-apache5:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("com.ibm.mq:com.ibm.mq.jakarta.client:10.0.1.0")
    implementation("org.messaginghub:pooled-jms:3.2.5")
    implementation("javax.xml.bind:jaxb-api:2.4.0-b180830.0359")
    implementation("jakarta.xml.bind:jakarta.xml.bind-api:4.0.5")
    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("tools.jackson.core:jackson-databind:$jacksonVersion")
    implementation("tools.jackson.module:jackson-module-kotlin:$jacksonVersion")
    implementation("org.glassfish.jaxb:jaxb-runtime:4.0.9")
    implementation("net.logstash.logback:logstash-logback-encoder:9.0")
    implementation("no.nav.familie.tjenestespesifikasjoner:tilbakekreving-v1-tjenestespesifikasjon:1.0_20260611160851_f0e234f")

    implementation("org.apache.kafka:kafka-clients:4.4.0")

    implementation("com.zaxxer:HikariCP:7.1.0")
    implementation("org.postgresql:postgresql:42.7.14")
    implementation("org.flywaydb:flyway-core:13.11.1")
    implementation("org.flywaydb:flyway-database-postgresql:13.11.1")

    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:6.1.3")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

application {
    mainClass = "no.nav.tilbakekreving.burdeforstatt.AppKt"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}

tasks.shadowJar {
    duplicatesStrategy = DuplicatesStrategy.INCLUDE
    mergeServiceFiles()
}
