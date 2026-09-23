const cors = (origin) => {
  const allowed = [
    "https://lorenzoalves290-blip.github.io",
    "https://zenvik-loja-oficial.netlify.app"
  ];
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
};

const config = {
  dogama: {
    base: () => Netlify.env.get("DOGAMA_API_BASE_URL"),
    token: () => Netlify.env.get("DOGAMA_API_TOKEN"),
    productsPath: () => Netlify.env.get("DOGAMA_PRODUCTS_PATH") || "/products",
    ordersPath: () => Netlify.env.get("DOGAMA_ORDERS_PATH") || "/orders"
  },
  aliexpress: {
    base: () => Netlify.env.get("ALIEXPRESS_API_BASE_URL"),
    token: () => Netlify.env.get("ALIEXPRESS_API_TOKEN"),
    productsPath: () => Netlify.env.get("ALIEXPRESS_PRODUCTS_PATH") || "/products",
    ordersPath: () => Netlify.env.get("ALIEXPRESS_ORDERS_PATH") || "/orders"
  }
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}

export default async (req) => {
  const headers = cors(req.headers.get("origin") || "");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  const path = new URL(req.url).pathname.replace(/^\/api\/suppliers\/?/, "").split("/").filter(Boolean);
  const provider = (path[0] || "").toLowerCase();
  const resource = (path[1] || "").toLowerCase();

  if (provider === "status") {
    return json({
      ok: true,
      suppliers: Object.fromEntries(
        Object.entries(config).map(([name, c]) => [
          name,
          {
            configured: Boolean(c.base() && c.token()),
            baseUrlConfigured: Boolean(c.base()),
            tokenConfigured: Boolean(c.token())
          }
        ])
      )
    }, 200, headers);
  }

  if (!config[provider] || !["products", "orders"].includes(resource)) {
    return json({
      ok: false,
      error: "Rota inválida.",
      routes: [
        "/api/suppliers/status",
        "/api/suppliers/dogama/products",
        "/api/suppliers/dogama/orders",
        "/api/suppliers/aliexpress/products",
        "/api/suppliers/aliexpress/orders"
      ]
    }, 404, headers);
  }

  const c = config[provider];
  const base = c.base();
  const token = c.token();

  if (!base || !token) {
    return json({
      ok: false,
      setupRequired: true,
      provider,
      error: "Configure as credenciais privadas do fornecedor na Netlify."
    }, 503, headers);
  }

  const url = new URL(req.url);
  const targetPath = resource === "products" ? c.productsPath() : c.ordersPath();
  const target = new URL(targetPath, base.endsWith("/") ? base : base + "/");
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const init = {
    method: req.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  };

  if (req.method === "POST") {
    init.headers["Content-Type"] = "application/json";
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);
  const body = await upstream.text();

  return new Response(body || JSON.stringify({ ok: upstream.ok }), {
    status: upstream.status,
    headers: {
      ...headers,
      "Cache-Control": resource === "products" && req.method === "GET" ? "public, max-age=120" : "no-store"
    }
  });
};

export const config = {
  path: "/api/suppliers/*"
};
