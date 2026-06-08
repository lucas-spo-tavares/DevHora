# DevHora Landing Infra

Infraestrutura Terraform para publicar a landing em `devhora.lucas-tavares.com` com:

- bucket S3 privado;
- CloudFront com fallback de SPA para `index.html`;
- certificado ACM em `us-east-1`;
- registros Route53 para o dominio final.

## Pre-requisitos

- A hosted zone publica `lucas-tavares.com` precisa existir na conta AWS.
- Credenciais AWS configuradas no ambiente.
- Terraform `>= 1.6`.
- AWS CLI para publicar o build estatico depois do `terraform apply`.

## Aplicar a infraestrutura

```sh
cd infra/terraform/landing
terraform init
terraform apply
```

## Publicar o site

1. Gerar o build da landing:

```sh
npm run landing:build
```

2. Sincronizar os arquivos para o bucket:

```sh
aws s3 sync apps/landing/dist s3://devhora.lucas-tavares.com --delete
```

3. Invalidar o cache da CloudFront:

```sh
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

Use o output `cloudfront_distribution_id` retornado pelo Terraform no comando acima.
