# Zenvik — Integração Alibaba.com

## Objetivo

Integrar o catálogo Alibaba.com ao mesmo catálogo da Zenvik, junto com o CJ Dropshipping.

Arquitetura:

Alibaba.com → backend seguro → catálogo unificado Zenvik → checkout Mercado Pago

## Documentação oficial

- Alibaba.com Open API — visão geral, registro de desenvolvedor, autorização e chamadas de API:
  https://open.alitrip.com/docs/doc.htm?articleId=118416&docType=1&treeId=684
- Portal de desenvolvedor Alibaba.com:
  https://activity.alibaba.com/pc/developer.html

A documentação oficial descreve o fluxo de:
1. Registro do desenvolvedor.
2. Criação/configuração da aplicação.
3. Autorização.
4. Obtenção do Access Token.
5. Chamadas às APIs.

## Credenciais que serão configuradas depois

Não coloque segredos neste arquivo ou no GitHub.

Variáveis previstas no backend:

- ALIBABA_APP_KEY
- ALIBABA_APP_SECRET
- ALIBABA_ACCESS_TOKEN
- ALIBABA_REFRESH_TOKEN (quando fornecido pelo fluxo de autorização)
- ALIBABA_CALLBACK_URL

As credenciais devem ficar nas variáveis privadas do backend (Netlify), nunca no JavaScript público do GitHub Pages.

## Catálogo unificado

Os produtos Alibaba serão normalizados para o mesmo formato usado pelo catálogo da Zenvik:

- id
- sku
- name
- image
- price
- currency
- supplier = Alibaba
- warehouseCountry
- deliveryDays
- stock
- category
- sourceUrl

O frontend não precisa saber como cada fornecedor funciona. Ele consulta um catálogo unificado e recebe produtos da CJ e Alibaba no mesmo formato.

## Prazo de entrega

O campo deliveryDays deve usar somente o prazo retornado/configurado de forma verificável pelo fornecedor. Não marcar automaticamente todos os produtos como 2 dias sem uma informação correspondente na integração.

## Próxima configuração

Depois de criar/obter as credenciais da aplicação Alibaba.com, configurar as variáveis privadas no backend e implementar os endpoints de catálogo necessários.

**Nunca envie App Secret, Access Token ou Refresh Token para o chat.**
