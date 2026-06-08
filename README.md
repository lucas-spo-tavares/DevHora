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

## Texto para Play Store

### Short description

```text
Controle sua jornada com registros, saldo diario, ajustes e backup local.
```

### Full description

```text
O DevHora e um app simples para registrar a jornada de trabalho, acompanhar o saldo de horas e manter seus dados organizados no proprio aparelho.

Ele foi pensado para quem quer controlar entrada, pausa, retorno e saida sem depender de sistemas pesados ou processos complicados. Em vez de esconder o que importa em varias telas, o DevHora mostra de forma clara o status do dia, o total trabalhado e o saldo acumulado.

Com o DevHora voce pode:

- registrar os pontos do dia com poucos toques;
- acompanhar quanto ja trabalhou e quanto ainda falta para fechar a meta diaria;
- visualizar o saldo do dia e o saldo do periodo;
- corrigir horarios com ajustes manuais quando a rotina sair do planejado;
- configurar horas por dia, data inicial e dias de trabalho;
- criar lembretes e notificacoes para nao esquecer eventos importantes da jornada;
- exportar dados em CSV para compartilhamento;
- gerar e importar backups locais para manter seu historico sob controle.

O app foi desenhado para uso direto e objetivo. A tela principal ajuda voce a agir rapido no momento certo. A area de progresso facilita a leitura do periodo. A tela de ajustes permite corrigir dias ja registrados sem ter que reconstruir tudo do zero. E a area de configuracoes concentra as regras de calculo, notificacoes e backup em um fluxo simples.

Privacidade tambem e parte central da experiencia. O DevHora nao exige criacao de conta para funcionar. Os dados da jornada ficam armazenados localmente no dispositivo, e backups ou arquivos exportados so sao compartilhados quando voce escolhe essa acao.

Se voce procura um app leve para acompanhar jornada, banco de horas e organizacao diaria sem burocracia, o DevHora foi feito para isso.
```
