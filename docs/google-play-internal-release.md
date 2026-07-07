# Upload de AAB para teste interno da Google Play

Este repositorio agora tem um script para publicar um `.aab` na track `internal` da Google Play sem depender de `fastlane`.

O script carrega automaticamente as variaveis do arquivo `.env` na raiz do repositorio, se ele existir.

## Comando

```sh
npm run mobile:play:internal -- /caminho/para/app-release.aab
```

Voce tambem pode informar o caminho por variavel:

```sh
GOOGLE_PLAY_AAB_PATH=/caminho/para/app-release.aab npm run mobile:play:internal
```

Se voce nao informar nada, o script usa por padrao:

```sh
artifacts/android/docker-local/aab/devhora-release.aab
```

## Variaveis obrigatorias

Use uma destas duas:

```sh
GOOGLE_PLAY_AAB_PATH=artifacts/android/docker-local/aab/devhora-release.aab
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_FILE=/caminho/para/google-play-service-account.json
```

ou

```sh
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

## Variaveis opcionais

```sh
GOOGLE_PLAY_PACKAGE_NAME=com.devhora.app
GOOGLE_PLAY_TRACK=internal
GOOGLE_PLAY_RELEASE_STATUS=completed
GOOGLE_PLAY_RELEASE_NAME=1.0.5
GOOGLE_PLAY_RELEASE_NOTES='Correcao de layout e ajuste de notificacoes.'
GOOGLE_PLAY_RELEASE_NOTES_LOCALE=pt-BR
GOOGLE_PLAY_CHANGES_NOT_SENT_FOR_REVIEW=false
GOOGLE_PLAY_TIMEOUT_MS=120000
```

Padroes atuais:

- `GOOGLE_PLAY_PACKAGE_NAME`: `com.devhora.app`
- `GOOGLE_PLAY_TRACK`: `internal`
- `GOOGLE_PLAY_RELEASE_STATUS`: `completed`
- `GOOGLE_PLAY_RELEASE_NOTES_LOCALE`: `pt-BR`
- `GOOGLE_PLAY_TIMEOUT_MS`: `120000`

## Exemplo completo

```sh
cp .env.example .env
```

Depois ajuste ao menos a credencial:

```sh
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_FILE="$HOME/.secrets/devhora-play.json"
```

E rode:

```sh
npm run mobile:play:internal
```

## Setup necessario na Google

O script usa a Google Play Developer Publishing API. Para funcionar, a conta de servico precisa:

- existir em um projeto GCP;
- ter chave JSON ativa;
- ter acesso ao app `com.devhora.app` no Play Console;
- ter permissao para releases da app.

Na pratica, voce vai vincular a service account em `Play Console > Users and permissions` e conceder acesso ao app.

## Observacoes

- O script cria um `edit`, sobe o bundle, atualiza a track e faz `commit`.
- Se houver mudancas ja em revisao, a API pode rejeitar o `commit`.
- Para publicar update real na Play Store, o `.aab` precisa estar assinado com a keystore de release correta.
