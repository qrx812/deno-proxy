const 白名单 = new Set([
  "aqtw.qq.com",
  "api.steampowered.com",
  "store.steampowered.com",
  "servers-frontend.fivem.net",
]);

const 跨域 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Cache-Control": "public, max-age=60",
};

Deno.serve(async (请求) => {
  if (请求.method === "OPTIONS") {
    return new Response(null, { headers: 跨域 });
  }

  const 地址 = new URL(请求.url);
  if (地址.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...跨域, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const 目标 = 地址.searchParams.get("url");
  if (!目标) {
    return new Response(JSON.stringify({ error: "缺少 url 参数" }), {
      status: 400,
      headers: { ...跨域, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  let 网址: URL;
  try {
    网址 = new URL(目标);
  } catch {
    return new Response(JSON.stringify({ error: "地址不合法" }), {
      status: 400,
      headers: { ...跨域, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!白名单.has(网址.hostname)) {
    return new Response(JSON.stringify({ error: "域名不在白名单" }), {
      status: 403,
      headers: { ...跨域, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const 回应 = await fetch(网址.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        "Accept": "application/json,*/*",
        "Referer": "https://aqtw.qq.com/",
      },
    });

    const 新头 = new Headers(回应.headers);
    for (const [键, 值] of Object.entries(跨域)) 新头.set(键, 值);
    新头.set("Content-Type", "application/json; charset=utf-8");

    return new Response(回应.body, { status: 回应.status, headers: 新头 });
  } catch (错) {
    return new Response(JSON.stringify({ error: String(错) }), {
      status: 502,
      headers: { ...跨域, "Content-Type": "application/json; charset=utf-8" },
    });
  }
});
