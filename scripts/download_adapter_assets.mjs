import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const database = JSON.parse(await fs.readFile(path.join(root, "data/competitor_database.json"), "utf8"));
const rows = database.products.filter((row) => row.source_url);
const brandDir = path.join(root, "assets/brands/competitive");
const productDir = path.join(root, "assets/competitive/product-library");
await fs.mkdir(brandDir, { recursive: true });
await fs.mkdir(productDir, { recursive: true });

const slug = (value) => String(value).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const fetchWithTimeout = async (url, timeout = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; LenovoMarketDashboard/1.0)" } });
  } finally {
    clearTimeout(timer);
  }
};
const download = async (url, targetBase) => {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const type = response.headers.get("content-type") || "";
  const ext = type.includes("svg") ? ".svg" : type.includes("png") ? ".png" : type.includes("webp") ? ".webp" : ".jpg";
  const file = `${targetBase}${ext}`;
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  return path.relative(root, file).split(path.sep).join("/");
};
const pageImages = (html, base) => {
  const found = [];
  const tags = [...html.matchAll(/<meta\s+[^>]*(?:property|name)=["'](?:og:image(?::url)?|twitter:image(?::src)?)["'][^>]*>/gi)].map((match) => match[0]);
  for (const tag of tags) {
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (content) found.push(content);
  }
  for (const match of html.matchAll(/(?:src|data-src|data-zoom-image|image_url|imageUrl)[=:]["']([^"']+)["']/gi)) found.push(match[1]);
  for (const match of html.matchAll(/https?:\\?\/\\?\/[^"'<>\s]+?\.(?:png|jpe?g|webp)(?:\?[^"'<>\s]*)?/gi)) found.push(match[0]);
  return [...new Set(found.map((value) => value.replace(/\\\//g, "/").replace(/&amp;/g, "&")).filter((value) => !/logo|icon|favicon|sprite|payment|badge/i.test(value)).map((value) => {
    try { return new URL(value, base).href; } catch { return null; }
  }).filter(Boolean))];
};

let manifest = { brands: {}, brandSites: {}, products: {}, checked: {}, generated: new Date().toISOString() };
try {
  const previous = JSON.parse(await fs.readFile(path.join(root, "data/adapter_product_assets.json"), "utf8"));
  manifest = { ...manifest, ...previous, brands: previous.brands || {}, brandSites: previous.brandSites || {}, products: previous.products || {}, checked: previous.checked || {} };
} catch {}
const firstByBrand = new Map();
for (const row of rows) if (!firstByBrand.has(row.brand)) firstByBrand.set(row.brand, row.source_url);

for (const [brand, source] of firstByBrand) {
  try {
    const domain = new URL(source).hostname;
    manifest.brandSites[brand] = new URL(source).origin;
    if (!manifest.brands[brand]) manifest.brands[brand] = await download(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`, path.join(brandDir, slug(brand)));
  } catch (error) {
    manifest.checked[`brand:${brand}`] = `failed: ${error.message}`;
  }
}

let cursor = 0;
const workers = Array.from({ length: 12 }, async () => {
  while (cursor < rows.length) {
    const row = rows[cursor++];
    if (manifest.products[row.source_url] && !manifest.products[row.source_url].includes("-page.")) continue;
    try {
      const response = await fetchWithTimeout(row.source_url);
      manifest.checked[row.source_url] = response.status;
      const imageUrls = pageImages(await response.text(), response.url);
      for (const imageUrl of imageUrls.slice(0, 12)) {
        try {
          manifest.products[row.source_url] = await download(imageUrl, path.join(productDir, `${slug(row.category)}-${slug(row.brand)}-${slug(row.product_name)}`));
          break;
        } catch {}
      }
    } catch (error) {
      manifest.checked[row.source_url] = `failed: ${error.message}`;
    }
    if (manifest.products[row.source_url]?.includes("-page.")) delete manifest.products[row.source_url];
  }
});
await Promise.all(workers);
await fs.writeFile(path.join(root, "data/adapter_product_assets.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ brands: Object.keys(manifest.brands).length, products: Object.keys(manifest.products).length, checked: Object.keys(manifest.checked).length }, null, 2));
