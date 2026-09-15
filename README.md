# Backend Loja com ChatGPT Integration

Backend de uma loja online com integração ao ChatGPT para assistência ao cliente.

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/lorenzoalves290-blip/Backende-loja.git
cd Backende-loja
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado em `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave de API do OpenAI:

```
OPENAI_API_KEY=sua_chave_de_api_aqui
PORT=3000
NODE_ENV=development
CHATGPT_MODEL=gpt-3.5-turbo
CHATGPT_MAX_TOKENS=2000
```

### 4. Obtenha sua chave de API do OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá para [API keys](https://platform.openai.com/api-keys)
4. Clique em "Create new secret key"
5. Copie a chave e cole no arquivo `.env`

## ⚙️ Como usar

### Iniciar o servidor

**Modo desenvolvimento:**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

### 1. Health Check
```
GET /health
```

Retorna o status do servidor.

**Resposta:**
```json
{
  "status": "OK",
  "message": "Servidor rodando!"
}
```

### 2. Chat com ChatGPT
```
POST /api/chatgpt/chat
```

**Request body:**
```json
{
  "message": "Qual é o preço do produto X?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Qual é o preço do produto X?",
  "reply": "Resposta do ChatGPT aqui...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Chat com Streaming (resposta em tempo real)
```
POST /api/chatgpt/chat-stream
```

Envia a resposta como um stream de eventos SSE (Server-Sent Events).

**Request body:**
```json
{
  "message": "Me ajude com um pedido"
}
```

## 🧪 Testar com curl

```bash
# Health check
curl http://localhost:3000/health

# Chat simples
curl -X POST http://localhost:3000/api/chatgpt/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, qual é o horário de atendimento?"}'
```

## 📦 Estrutura do Projeto

```
Backende-loja/
├── server.js           # Arquivo principal do servidor
├── routes/
│   └── chatgpt.js      # Rotas do ChatGPT
├── .env.example        # Exemplo de variáveis de ambiente
├── package.json        # Dependências do projeto
└── README.md          # Este arquivo
```

## 🔧 Dependências

- **express** - Framework web
- **openai** - SDK oficial do OpenAI
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Middleware para CORS
- **axios** - Cliente HTTP
- **nodemon** - Reinicia o servidor automaticamente em desenvolvimento

## 🔐 Segurança

- Nunca compartilhe sua chave de API do OpenAI
- Sempre use `.env` para variáveis sensíveis
- Não commite o arquivo `.env` para o repositório

## 📝 Notas

- O modelo padrão é `gpt-3.5-turbo` (mais rápido e barato)
- Para usar `gpt-4`, altere `CHATGPT_MODEL=gpt-4` no `.env`
- O limite de tokens padrão é 2000 (máximo de caracteres na resposta)

## 🤝 Contribuindo

Fique à vontade para fazer pull requests e reportar issues!

## 📄 Licença

MIT
