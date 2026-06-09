FROM node:22.16.0-bookworm-slim

ARG HOST_UID=1000
ARG HOST_GID=1000
ARG ANDROID_COMPILE_SDK=34
ARG ANDROID_BUILD_TOOLS=34.0.0
ARG ANDROID_NDK_VERSION=26.1.10909125
ARG ANDROID_CMDLINE_TOOLS=11076708

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV DEV_USER=dev
ENV DEV_HOME=/home/dev
ENV PATH=/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:/usr/lib/jvm/java-17-openjdk-amd64/bin:${PATH}

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    git \
    openjdk-17-jdk \
    python3 \
    rsync \
    unzip \
    wget \
    zip \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p "${ANDROID_HOME}/cmdline-tools" /tmp/android-sdk \
  && wget -q "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDLINE_TOOLS}_latest.zip" -O /tmp/android-sdk/cmdline-tools.zip \
  && unzip -q /tmp/android-sdk/cmdline-tools.zip -d /tmp/android-sdk \
  && mv /tmp/android-sdk/cmdline-tools "${ANDROID_HOME}/cmdline-tools/latest" \
  && yes | sdkmanager --sdk_root="${ANDROID_HOME}" --licenses >/dev/null \
  && sdkmanager --sdk_root="${ANDROID_HOME}" \
    "platform-tools" \
    "platforms;android-${ANDROID_COMPILE_SDK}" \
    "build-tools;${ANDROID_BUILD_TOOLS}" \
    "ndk;${ANDROID_NDK_VERSION}" \
  && rm -rf /tmp/android-sdk

RUN existing_group="$(getent group "${HOST_GID}" | cut -d: -f1 || true)" \
  && if [ -n "${existing_group}" ]; then \
       group_name="${existing_group}"; \
     else \
       groupadd --gid "${HOST_GID}" "${DEV_USER}"; \
       group_name="${DEV_USER}"; \
     fi \
  && existing_user="$(getent passwd "${HOST_UID}" | cut -d: -f1 || true)" \
  && if [ -n "${existing_user}" ]; then \
       user_name="${existing_user}"; \
       user_home="$(getent passwd "${HOST_UID}" | cut -d: -f6)"; \
     else \
       useradd --uid "${HOST_UID}" --gid "${HOST_GID}" --create-home --shell /bin/bash "${DEV_USER}"; \
       user_name="${DEV_USER}"; \
       user_home="${DEV_HOME}"; \
     fi \
  && mkdir -p "${user_home}/.gradle" \
  && chown -R "${user_name}:${group_name}" "${user_home}" "${ANDROID_HOME}"

COPY entrypoint.sh /usr/local/bin/devhora-eas-entrypoint
RUN chmod +x /usr/local/bin/devhora-eas-entrypoint

USER ${HOST_UID}:${HOST_GID}
WORKDIR /workspace/apps/mobile

ENTRYPOINT ["devhora-eas-entrypoint"]
CMD ["bash", "-lc", "java -version && node --version"]
