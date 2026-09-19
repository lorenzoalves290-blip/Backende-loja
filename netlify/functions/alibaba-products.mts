function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

async function hmacMd5(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "MD5" },
    false,
    ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (req) => {
  if (req.method !== "GET") return json({ ok: false, error: "Método não permitido." }, 405);

  const appKey = Netlify.env.get("ALIBABA_APP_KEY");
  const appSecret = Netlify.env.get("ALIBABA_APP_SECRET");
  const session = Netlify.env.get("ALIBABA_ACCESS_TOKEN");

  if (!appKey || !appSecret || !session) {
    return json({
      ok: false,
      setupRequired: true,
      error: "Configure ALIBABA_APP_KEY, ALIBABA_APP_SECRET e ALIBABA_ACCESS_TOKEN nas variáveis privadas da Netlify."
    }, 503);
  }

  const url = new URL(req.url);
  const page = Math.max(1, Math.min(1000, Number(url.searchParams.get("page") || "1")));
  const pageSize = Math.max(1, Math.min(30, Number(url.searchParams.get("size") || "30")));
  const subject = (url.searchParams.get("q") || "").trim();

  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const bj = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const timestamp =
    bj.getUTCFullYear() + "-" + pad(bj.getUTCMonth() + 1) + "-" + pad(bj.getUTCDate()) +
    " " + pad(bj.getUTCHours()) + ":" + pad(bj.getUTCMinutes()) + ":" + pad(bj.getUTCSeconds());

  const params = {
    app_key: appKey,
    format: "json",
    method: "alibaba.icbu.product.list",
    partner_id: "zenvik",
    session,
    sign_method: "hmac",
    timestamp,
    v: "2.0",
    current_page: String(page),
    page_size: String(pageSize),
    language: "ENGLISH"
  };

  if (subject) params.subject = subject;

  const signBase = Object.keys(params).sort().map((k) => k + params[k]).join("");
  params.sign = await hmacMd5(signBase, appSecret);

  const body = new URLSearchParams(params);
  const response = await fetch("https://eco.taobao.com/router/rest", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body
  });

  const raw = await response.json().catch(() => null);

  if (!response.ok || raw?.error_response) {
    return json({
      ok: false,
      error: "A API do Alibaba.com recusou a consulta.",
      details: raw?.error_response?.sub_msg || raw?.error_response?.msg || "Erro desconhecido."
    }, response.status || 502);
  }

  const data =
    raw?.alibaba_icbu_product_list_response?.result ||
    raw?.alibaba_icbu_product_list_response ||
    raw;

  const rows = data?.products || data?.items || data?.product_list || [];

  const products = (Array.isArray(rows) ? rows : []).map((p) => ({
    id: String(p.id || p.product_id || ""),
    sku: p.sku || "",
    name: p.subject || p.name || "Produto Alibaba",
    image: p.pic_url || p.image || p.main_image || "",
    supplier: "Alibaba",
    sourceUrl: p.product_url || p.url || "",
    category: p.category_name || "",
    stock: p.stock ?? null,
    currency: "USD",
    deliveryDays: p.delivery_days ?? null
  })).filter((p) => p.id && p.image);

  return json({
    ok: true,
    source: "Alibaba.com Open API",
    page,
    size: pageSize,
    query: subject,
    count: products.length,
    products
  });
};

export const config = {
  path: "/api/alibaba-products"
};
