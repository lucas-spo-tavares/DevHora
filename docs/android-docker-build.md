# Android build local com Gradle dentro de Docker

Este fluxo roda o `gradlew` do projeto Android em um container Docker com:

- Node `22.16.0`
- OpenJDK `17`
- Android SDK `34`
- Build Tools `34.0.0`
- Android NDK `26.1.10909125`

## Quando usar

Use este fluxo quando voce quiser:

- evitar custo do EAS cloud durante iteracao;
- repetir builds Android em um ambiente mais previsivel;
- manter o host mais limpo, sem instalar SDK/NDK manualmente;
- gerar release sem depender de login no Expo.

## Pre-requisitos

- Docker instalado e funcionando

## Comandos

Para gerar APK:

```sh
npm run mobile:docker:build:apk
```

Para gerar AAB:

```sh
npm run mobile:docker:build:aab
```

Tambem da para chamar o script direto:

```sh
./scripts/eas-build-android-docker.sh apk
./scripts/eas-build-android-docker.sh aab
```

## Artefatos

Os artefatos copiados pelo script vao para:

```text
artifacts/android/docker-local/apk/
artifacts/android/docker-local/aab/
```

## Dicas uteis

Para forcar rebuild da imagem Docker:

```sh
DEVHORA_ANDROID_DOCKER_REBUILD=1 npm run mobile:docker:build:aab
```

Para passar argumentos extras ao Gradle:

```sh
./scripts/eas-build-android-docker.sh aab --stacktrace
./scripts/eas-build-android-docker.sh apk --info
```

## Observacoes

- O build usa `assembleRelease` para APK e `bundleRelease` para AAB.
- O cache do Gradle fica no volume Docker nomeado `devhora-android-gradle`, via `GRADLE_USER_HOME=/home/node/.gradle`, para evitar baixar o wrapper e dependencias em toda execucao.
- Se nao existir keystore de release configurada em `apps/mobile/android/keystore.properties`, o projeto hoje cai no keystore de debug para compilar o release. Isso serve para testes, mas nao para publicar atualizacoes na Play Store.
