# Android artifacts

Coloque aqui o APK publico da landing com o nome `devhora-latest.apk`.

Quando voce rodar `npm run landing:build`, o arquivo sera copiado para:

```text
apps/landing/dist/downloads/devhora-latest.apk
```

Tambem da para apontar para qualquer APK usando:

```sh
DEVHORA_APK_PATH=/caminho/para/app.apk npm run landing:build
```
