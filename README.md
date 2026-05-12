# DevHora

Monorepo com Turborepo para manter o app mobile e a landing page no mesmo escopo.

## Estrutura

```text
apps/
  mobile/   App Expo/React Native
  landing/  Landing estatica para features e download do APK
artifacts/
  android/  APKs usados pela build da landing
```

## Comandos principais

```sh
npm run mobile:start
npm run mobile:android
npm run mobile:build:apk
npm run landing:dev
npm run landing:build
npm run typecheck
npm run build
```

## Publicar APK na landing

Gere ou baixe o APK e deixe o arquivo em um destes caminhos:

```text
artifacts/android/devhora-latest.apk
apps/mobile/dist/devhora-latest.apk
```

Depois rode:

```sh
npm run landing:build
```

A landing vai copiar o APK para:

```text
apps/landing/dist/downloads/devhora-latest.apk
```

Tambem da para apontar para um APK especifico:

```sh
DEVHORA_APK_PATH=/caminho/para/app.apk npm run landing:build
```
