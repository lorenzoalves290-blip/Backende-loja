export default async (req) => {
  const origin = req.headers.get("origin") || "";
  const allowed = [
    "https://lorenzoalves290-blip.github.io",
    "https://zenvik-loja-oficial.netlify.app"
  ];

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300, s-maxage=900"
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  if (req.method === "OPTIONS") {
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "Método não permitido." }), { status: 405, headers });
  }

  let token = Netlify.env.get("CJ_ACCESS_TOKEN");
  const apiKey = Netlify.env.get("CJ_API_KEY");

  if (!token && apiKey) {
    const auth = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    });
    const authData = await auth.json().catch(() => null);
    if (auth.ok && authData?.code === 200 && authData?.data?.accessToken) {
      token = authData.data.accessToken;
    }
  }

  if (!token) {
    return new Response(JSON.stringify({
      ok: false,
      setupRequired: true,
      error: "Adicione CJ_API_KEY (recomendado) ou CJ_ACCESS_TOKEN nas variáveis privadas da Netlify."
    }), { status: 503, headers });
  }

  const url = new URL(req.url);
  const page = Math.max(1, Math.min(1000, Number(url.searchParams.get("page") || "1")));
  const size = Math.max(1, Math.min(100, Number(url.searchParams.get("size") || "100")));
  const category = (url.searchParams.get("category") || "todos").toLowerCase();
  const q = (url.searchParams.get("q") || "").trim();

  const keywords = {
    auto: "car auto automotive vehicle parts accessories",
    casa: "home kitchen organizer furniture",
    bebes: "baby maternity kids",
    eletronicos: "electronics phone computer smartwatch",
    moda: "clothing fashion shoes bags",
    beleza: "beauty personal care",
    ofertas: ""
  };

  const keyword = q || keywords[category] || "";

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    countryCode: "BR"
  });
  if (keyword) params.set("keyWord", keyword);

  const cj = await fetch(
    "https://developers.cjdropshipping.com/api2.0/v1/product/listV2?" + params.toString(),
    { headers: { "CJ-Access-Token": token, Accept: "application/json" } }
  );

  const raw = await cj.json().catch(() => null);

  if (!cj.ok || !raw || raw.code !== 200) {
    return new Response(JSON.stringify({
      ok: false,
      error: "A CJ recusou a consulta.",
      details: raw?.message || "Erro desconhecido."
    }), { status: cj.status || 502, headers });
  }

  const data = raw.data || {};
  const rows = Array.isArray(data) ? data : (data.content || data.list || data.records || []);

  const products = rows.map((p) => ({
    id: p.pid || p.productId || p.id || "",
    sku: p.productSku || p.sku || "",
    name: p.productNameEn || p.productName || p.name || "Produto Zenvik",
    image: p.bigImage || p.productImage || p.image || (Array.isArray(p.productImageSet) ? p.productImageSet[0] : ""),
    priceUsd: Number(p.sellPrice ?? p.price ?? p.productPrice ?? 0),
    category: p.categoryName || "",
    weight: p.productWeight || 0,
    source: "CJ Dropshipping",
    warehouse: "BR"
  })).filter(p => p.id && p.image);

  return new Response(JSON.stringify({
    ok: true,
    page,
    size,
    category,
    query: keyword,
    warehouse: "BR",
    count: products.length,
    products
  }), { status: 200, headers });
};

export const config = {
  path: "/api/cj-products"
};
