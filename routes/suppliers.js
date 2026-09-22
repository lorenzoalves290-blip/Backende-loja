const express = require('express');

const router = express.Router();

function cleanBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function getConfig(provider) {
  if (provider === 'dogama') {
    return {
      name: 'Dogama',
      baseUrl: cleanBaseUrl(process.env.DOGAMA_API_BASE_URL),
      token: process.env.DOGAMA_API_TOKEN
    };
  }
  if (provider === 'aliexpress') {
    return {
      name: 'AliExpress',
      baseUrl: cleanBaseUrl(process.env.ALIEXPRESS_API_BASE_URL),
      token: process.env.ALIEXPRESS_API_TOKEN
    };
  }
  return null;
}

function requireConfigured(provider) {
  const config = getConfig(provider);
  if (!config) return { error: 'Fornecedor não suportado.' };
  if (!config.baseUrl || !config.token) {
    return {
      error: `${config.name} ainda não está autenticado/configurado no backend.`,
      configured: false
    };
  }
  return { config, configured: true };
}

async function providerFetch(provider, path, options = {}) {
  const state = requireConfigured(provider);
  if (!state.configured) {
    const err = new Error(state.error);
    err.status = 503;
    throw err;
  }

  const response = await fetch(state.config.baseUrl + path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${state.config.token}`,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!response.ok) {
    const err = new Error(`${state.config.name} respondeu HTTP ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

router.get('/status', (req, res) => {
  const providers = ['dogama', 'aliexpress'].map(provider => {
    const config = getConfig(provider);
    return {
      provider,
      configured: Boolean(config && config.baseUrl && config.token)
    };
  });

  res.json({ ok: true, providers });
});

router.get('/:provider/products', async (req, res) => {
  try {
    const { provider } = req.params;
    const data = await providerFetch(provider, process.env.SUPPLIER_PRODUCTS_PATH || '/products');
    res.json({ ok: true, provider, data });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.data || null
    });
  }
});

router.post('/:provider/orders', async (req, res) => {
  try {
    const { provider } = req.params;

    if (!req.body || !req.body.external_order_id || !Array.isArray(req.body.items)) {
      return res.status(400).json({
        ok: false,
        error: 'external_order_id e items são obrigatórios.'
      });
    }

    const data = await providerFetch(
      provider,
      process.env.SUPPLIER_ORDERS_PATH || '/orders',
      {
        method: 'POST',
        body: JSON.stringify(req.body)
      }
    );

    res.json({ ok: true, provider, data });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.data || null
    });
  }
});

module.exports = router;
