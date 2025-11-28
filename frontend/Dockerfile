FROM ubuntu:22.04

LABEL maintainer="Lucas Trindade"

ARG JAVA_VERSION=17
ARG NODE_VERSION=20

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV GRADLE_HOME=/opt/gradle

RUN apt-get update && apt-get install -y \
    curl git unzip zip openjdk-${JAVA_VERSION}-jdk python3 \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

RUN mkdir -p ${GRADLE_HOME} && \
    curl -sLo gradle.zip https://services.gradle.org/distributions/gradle-8.2.1-bin.zip && \
    unzip gradle.zip -d ${GRADLE_HOME}

ENV PATH="${PATH}:${GRADLE_HOME}/gradle-8.2.1/bin"

RUN mkdir -p ${ANDROID_HOME} && \
    curl -sLo android.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip android.zip -d ${ANDROID_HOME} && \
    yes | ${ANDROID_HOME}/cmdline-tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} --licenses && \
    ${ANDROID_HOME}/cmdline-tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} \
    "platform-tools" \
    "build-tools;34.0.0" \
    "platforms;android-34"

ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools:${ANDROID_HOME}/platform-tools"

RUN npm install -g @ionic/cli@7 @capacitor/cli@6 concurrently chokidar-cli

WORKDIR /workdir
