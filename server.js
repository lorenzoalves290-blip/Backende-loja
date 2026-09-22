require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatgptRoutes = require('./routes/chatgpt');
const supplierRoutes = require('./routes/suppliers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/chatgpt', chatgptRoutes);
app.use('/api/suppliers', supplierRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Acesse: http://localhost:${PORT}/health`);
});

module.exports = app;
