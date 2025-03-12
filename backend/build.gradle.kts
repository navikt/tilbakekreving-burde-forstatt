val ktorVersion = "3.1.1"
val logbackVersion = "1.5.17"

plugins {
    kotlin("jvm") version "2.1.10"
    application
    id("com.gradleup.shadow") version "8.3.6"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm:$ktorVersion")
    implementation("io.ktor:ktor-server-netty-jvm:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-serialization-jackson:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-client-apache5:$ktorVersion")
    implementation("com.ibm.mq:com.ibm.mq.jakarta.client:9.4.2.0")
    implementation("org.messaginghub:pooled-jms:3.1.7")
    implementation("javax.xml.bind:jaxb-api:2.4.0-b180830.0359")
    implementation("jakarta.xml.bind:jakarta.xml.bind-api:4.0.0")

    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("com.fasterxml.jackson.core:jackson-core:2.18.3")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.13.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = "no.nav.tilbakekreving.burdeforstatt.AppKt"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
