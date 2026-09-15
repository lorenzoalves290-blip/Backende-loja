require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatgptRoutes = require('./routes/chatgpt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chatgpt', chatgptRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Acesse: http://localhost:${PORT}/health`);
});

module.exports = app;