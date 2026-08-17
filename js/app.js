const DATA_FILES = {
  catalog: "data/catalog.json",
  productMetrics: "data/product_metrics.json",
  geoMetrics: "data/geo_metrics.json",
  marketMetrics: "data/market_metrics.json",
  brandMarket: "data/brand_market_metrics.json",
  competitorProducts: "data/competitor_products.json",
  supplyChain: "data/supply_chain.json",
  consumerInsights: "data/consumer_insights.json",
  countryMarkets: "data/country_market_profiles.json",
  metadata: "data/metadata.json",
};

const DATA_VERSION = "20260817-region-country-policy";

const state = {
  categoryId: null,
  productId: null,
  categoryView: "market",
  marketModule: "global",
  granularity: "quarter",
  detailGranularity: "quarter",
  selectedPeriod: { category: null, detail: null },
  dimension: "segment",
  segmentFilter: "all",
  partNumber: "all",
  filters: {},
  search: "",
  selectedModels: {},
  competitorBrand: {},
  competitorLenovoProduct: {},
  competitorCountry: {},
  policyRegion: {},
  structureBrand: {},
  structureMarket: {},
  geoRegionDetail: {},
  geoCountryTab: {},
  summaryRevenueMetric: "orderRevenue",
  summaryQuantityMetric: "orderQty",
  summaryQuantityTrendMetric: "order",
  summaryRevenueTrendMetric: "order",
  summaryGeoMetric: "order",
  summaryCountryMetric: "order",
  summaryGeoProducts: {},
  summaryCountryProducts: {},
  summarySelectedGeo: {},
  detailRevenueMetric: "order",
  detailQuantityMetric: "order",
  detailGeoMetric: "order",
  detailProductMetric: "order",
  detailRevenueTrendMode: {},
  detailQuantityTrendMode: {},
  detailGeoTrendMode: {},
  detailCountryTrendMode: {},
  detailGeoLinkEnabled: {},
  detailSelectedGeo: {},
  industrySlides: {},
  variantId: "all",
};

const data = {};
const indexes = {
  categories: new Map(),
  products: new Map(),
  variants: new Map(),
};

const app = document.querySelector("#app");
const topNav = document.querySelector("#topNav");
const homeButton = document.querySelector("#homeButton");
const sourceStatus = document.querySelector("#sourceStatus");

const granularityLabels = {
  quarter: "Quarter",
  year: "Year",
};

const categoryViews = {
  market: "Market Analysis",
  competitive: "Competitor Analysis",
  overview: "Category Overview",
  products: "Product List",
};

const marketModules = {
  global: "Global Overview",
  geo: "Country Overview",
};

const marketRegionModules = {
  NA: { label: "NA", name: "North America", markets: ["US"] },
  EMEA: { label: "EMEA", name: "Europe, Middle East & Africa", markets: ["DE+UK+SE", "SA"] },
  AP: { label: "AP", name: "Asia Pacific", markets: ["JP", "IN"] },
  LA: { label: "LA", name: "Latin America", markets: ["BR+MEX"] },
};

const policyRegions = [
  { id: "NA", label: "NA", name: "North America" },
  { id: "LA", label: "LA", name: "Latin America" },
  { id: "EMEA", label: "EMEA", name: "Europe, Middle East & Africa" },
  { id: "AP", label: "AP", name: "Asia Pacific" },
];

const policyRegionMaps = {
  NA: {
    countries: ["USA", "CAN", "MEX"],
    labels: ["United States", "Canada", "Mexico"],
    projection: "natural earth",
  },
  LA: {
    countries: ["MEX", "BRA", "ARG", "CHL", "COL", "PER"],
    labels: ["Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru"],
    projection: "natural earth",
  },
  EMEA: {
    countries: ["GBR", "DEU", "FRA", "ITA", "ESP", "NLD", "SWE", "ZAF", "ARE", "SAU"],
    labels: ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands", "Sweden", "South Africa", "United Arab Emirates", "Saudi Arabia"],
    projection: "natural earth",
  },
  AP: {
    countries: ["JPN", "CHN", "KOR", "IND", "IDN", "SGP", "THA", "AUS", "NZL"],
    labels: ["Japan", "China", "South Korea", "India", "Indonesia", "Singapore", "Thailand", "Australia", "New Zealand"],
    projection: "natural earth",
  },
};

const policyImpactWindows = [
  { id: "current", label: "Current Quarter Impact" },
  { id: "future", label: "Future Quarter Impact" },
];

const dimensionLabels = {
  segment: "Segment",
  product: "Product",
  competitor: "Competitor",
  user: "User",
};

const palette = ["#e2231a", "#1f2328", "#6b7280", "#b91c1c", "#374151", "#0f766e", "#d97706", "#2563eb"];
const redScale = ["#f5c7c3", "#e98079", "#e2231a", "#b91c1c", "#7f1d1d"];
const powerOrder = ["45W and below", "60W and below", "65W", "45W to 99W", "100W to 199W", "100W and above", "200W and above"];
const priceBands = ["<$25", "$25-45", "$45-65", "$65+"];
const revenueMetricOptions = [
  { field: "orderRevenue", label: "Order_Rev", title: "Order_Rev", type: "currency" },
  { field: "shipRevenue", label: "Ship_Rev", title: "Ship_Rev", type: "currency" },
  { field: "backlogRevenue", label: "Bklg_Rev", title: "Bklg_Rev", type: "currency" },
];
const quantityMetricOptions = [
  { field: "orderQty", label: "Order_Qty", title: "Order Quantity", type: "number" },
  { field: "shipQty", label: "Ship_Qty", title: "Ship Quantity", type: "number" },
  { field: "backlogQty", label: "Bklg_Qty", title: "Bklg Quantity", type: "number" },
];
const flowMetricOptions = [
  { field: "order", label: "Order", revenueField: "orderRevenue", quantityField: "orderQty", revenueLabel: "Order_Rev", quantityLabel: "Order_Qty" },
  { field: "ship", label: "Ship", revenueField: "shipRevenue", quantityField: "shipQty", revenueLabel: "Ship_Rev", quantityLabel: "Ship_Qty" },
  { field: "bklg", label: "Bklg", revenueField: "backlogRevenue", quantityField: "backlogQty", revenueLabel: "Bklg_Rev", quantityLabel: "Bklg_Qty" },
];
const summaryMetricOptions = [...revenueMetricOptions, ...quantityMetricOptions];
const competitorCountries = [
  { code: "US", label: "United States", platforms: "Amazon US" },
  { code: "JP", label: "Japan", platforms: "Amazon JP / Rakuten" },
  { code: "UK", label: "United Kingdom", platforms: "Amazon UK / Currys" },
  { code: "EU", label: "Europe", platforms: "Amazon EU / MediaMarkt" },
  { code: "AU", label: "Australia", platforms: "Amazon AU / JB Hi-Fi" },
];

init();

function modeledText(label) {
  return `${label}*`;
}

async function init() {
  try {
    const entries = await Promise.all(
      Object.entries(DATA_FILES).map(async ([key, path]) => {
        const response = await fetch(`${path}?v=${DATA_VERSION}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`${path} ${response.status}`);
        return [key, await response.json()];
      }),
    );
    Object.assign(data, Object.fromEntries(entries));
    indexData();
    syncRouteFromHash();
    window.addEventListener("hashchange", () => {
      syncRouteFromHash();
      render();
    });
    homeButton.addEventListener("click", () => routeTo());
    app.addEventListener("click", handleClick);
    app.addEventListener("change", handleChange);
    app.addEventListener("input", handleInput);
    app.addEventListener("toggle", (event) => {
      if (event.target.matches(".geo-na-card-disclosure") && event.target.open) {
        requestAnimationFrame(() => drawMarketAnalysis(state.categoryId));
      }
    }, true);
    topNav.addEventListener("click", handleClick);
    render();
  } catch (error) {
    app.innerHTML = `
      <section class="error-state">
        <div>
          <h1>Data loading failed</h1>
          <p>${escapeHtml(error.message)}. Start a local static server or deploy through GitHub Pages so JSON files can be loaded by fetch.</p>
        </div>
      </section>
    `;
  }
}

function indexData() {
  indexes.categories = new Map(data.catalog.categories.map((category) => [category.id, category]));
  indexes.products = new Map(data.catalog.products.map((product) => [product.id, product]));
  indexes.variants = new Map(data.catalog.variants.map((variant) => [variant.id, variant]));
}

function syncRouteFromHash() {
  const previousCategoryId = state.categoryId;
  const clean = window.location.hash.replace(/^#\/?/, "");
  const parts = clean.split("/").filter(Boolean);
  state.categoryId = parts[0] && indexes.categories.has(parts[0]) ? parts[0] : null;
  state.productId = parts[1] && indexes.products.has(parts[1]) ? parts[1] : null;
  if (!state.categoryId) {
    state.productId = null;
    state.categoryView = "market";
  } else if (state.categoryId !== previousCategoryId && !state.productId) {
    state.categoryView = "market";
  }
  if (state.productId) {
    const product = indexes.products.get(state.productId);
    if (!product || product.categoryId !== state.categoryId) state.productId = null;
  }
}

function routeTo(categoryId, productId) {
  const next = categoryId ? `#/${categoryId}${productId ? `/${productId}` : ""}` : "#/";
  if (window.location.hash === next) {
    syncRouteFromHash();
    render();
    return;
  }
  window.location.hash = next;
}

function render() {
  renderTopNav();
  renderSourceStatus();
  if (!state.categoryId) {
    renderHome();
    return;
  }
  if (state.productId) {
    renderProductDetail(state.productId);
    return;
  }
  renderCategory(state.categoryId);
}

function renderSourceStatus() {
  const source = data.metadata?.source;
  if (!source) return;
  const periodMeta = data.catalog?.periodMeta || [];
  const range = periodMeta.length
    ? `${periodMeta[0].quarterLabel || periodMeta[0].date} to ${periodMeta.at(-1).quarterLabel || periodMeta.at(-1).date}`
    : source.sourceDateRange
      ? `${source.sourceDateRange[0].slice(0, 7)} to ${source.sourceDateRange[1].slice(0, 7)}`
      : "modeled";
  sourceStatus.textContent = `${range} · ${source.sourceMode || "static JSON"} · * modeled/non-Excel data`;
}

function renderTopNav() {
  topNav.innerHTML = data.catalog.categories
    .map((category) => {
      const active = state.categoryId === category.id ? "is-active" : "";
      return `<button class="nav-pill ${active}" type="button" data-route-category="${category.id}">${category.label}</button>`;
    })
    .join("");
}

function renderHome() {
  const latest = data.catalog.periods.at(-1);
  const allRows = data.productMetrics.filter((row) => row.date === latest);
  const totalSummary = summarizeProductRows(allRows);
  app.innerHTML = `
    <div class="view-stack">
      <section class="hero-band">
        <div class="hero-copy">
          <p class="eyebrow">Static GitHub Pages Dashboard</p>
          <h1>Lenovo Product Data Visualization</h1>
        </div>
        <div class="hero-stats">
          <div class="stat-tile">
            <span>Products</span>
            <strong>${data.catalog.products.length}</strong>
            <small>Current model count with room for future categories.</small>
          </div>
          <div class="stat-tile">
            <span>Latest Order_Rev</span>
            <strong>${fmtExactCurrency(totalSummary.orderRevenue || totalSummary.revenueNet)}</strong>
            <small>${formatPeriod(latest, "quarter")}</small>
          </div>
        </div>
      </section>

      <section class="section-head">
        <div>
          <p class="eyebrow">Product Categories</p>
          <h2>Select a Category</h2>
        </div>
        <p>Each category includes filters, model comparison, product detail views, and fiscal quarter / fiscal year aggregation.</p>
      </section>

      <section class="category-grid">
        ${data.catalog.categories.map((category) => renderCategoryCard(category)).join("")}
      </section>

      <section class="future-row" aria-label="Future categories">
        ${data.catalog.futureCategorySlots.map((slot) => `<div class="empty-slot">+ ${escapeHtml(slot)}</div>`).join("")}
      </section>
    </div>
  `;
}

function renderCategoryCard(category) {
  const rows = data.productMetrics.filter((row) => row.categoryId === category.id);
  const summary = summarizeProductRows(rows);
  const productCount = data.catalog.products.filter((product) => product.categoryId === category.id).length;
  return `
    <button class="category-card" type="button" style="--accent:${category.accent}" data-route-category="${category.id}">
      <header>
        <div>
          <p class="eyebrow">Product Category</p>
          <h2>${escapeHtml(category.label)}</h2>
        </div>
        <span class="tag">${productCount} models</span>
      </header>
      <p>${escapeHtml(category.description)}</p>
      <div class="category-metrics">
        <div><span>Total Order_Qty</span><strong>${fmtExactNumber(summary.orderQty || summary.unitsNet)}</strong></div>
        <div><span>Total Order_Rev</span><strong>${fmtExactCurrency(summary.orderRevenue || summary.revenueNet)}</strong></div>
        <div><span>Avg Ship_AUR</span><strong>${fmtExactCurrency(summary.shipAUR)}</strong></div>
      </div>
    </button>
  `;
}

function renderCategory(categoryId) {
  const category = indexes.categories.get(categoryId);
  ensureCategoryFilterState(categoryId);
  app.innerHTML = `
    <div class="view-stack" style="--accent:${category.accent}">
      <section class="page-head">
        <div>
          <p class="eyebrow">Product Category</p>
          <h1>${escapeHtml(category.label)}</h1>
        </div>
        <div class="toolbar-group">
          <button class="ghost-button" type="button" data-action="home">← Home</button>
          ${renderGranularityButtons(state.granularity, "category")}
        </div>
      </section>
      ${renderCategoryTabs()}
      ${renderModuleTabs(categoryId)}
      <div id="categoryViewMount"></div>
    </div>
  `;

  const mount = document.querySelector("#categoryViewMount");
  if (state.categoryView === "competitive") {
    mount.innerHTML = renderCompetitiveAnalysis(categoryId);
    drawCompetitiveAnalysis(categoryId);
  } else if (state.categoryView === "overview") {
    mount.innerHTML = renderCategoryOverview(categoryId);
    const visibleProducts = getFilteredProducts(categoryId);
    const selectedIds = getSelectedModelIds(categoryId, visibleProducts);
    drawProductMatrix(categoryId, visibleProducts, selectedIds);
    drawCategoryCharts(categoryId, selectedIds);
    drawFeedbackModule(categoryId, selectedIds);
    drawDecisionModule(categoryId, selectedIds);
  } else if (state.categoryView === "products") {
    mount.innerHTML = renderProductListPage(categoryId);
  } else {
    state.categoryView = "market";
    mount.innerHTML = renderMarketAnalysis(categoryId);
    drawMarketAnalysis(categoryId);
  }
}

function renderCategoryTabs() {
  return `
    <section class="category-tabs" aria-label="Category views">
      ${Object.entries(categoryViews)
        .map(([key, label]) => `<button class="${state.categoryView === key ? "is-active" : ""}" type="button" data-action="category-view" data-view="${key}">${escapeHtml(label)}</button>`)
        .join("")}
    </section>
  `;
}

function renderModuleTabs(categoryId) {
  const modules = state.categoryView === "market" ? marketModules : null;
  if (!modules) return "";
  const active = selectedMarketModule();
  return `
    <section class="module-tabs" aria-label="${state.categoryView} modules">
      ${Object.entries(modules)
        .map(([key, label]) => `<button class="${active === key ? "is-active" : ""}" type="button" data-action="module-view" data-module="${key}">${escapeHtml(label)}</button>`)
        .join("")}
    </section>
  `;
}

function renderMarketAnalysis(categoryId) {
  const active = selectedMarketModule();
  const moduleMarkup = active === "global"
    ? renderGlobalMarketModule(categoryId)
    : active === "geo"
    ? renderGeoOverviewModule(categoryId)
    : renderRegionalMarketModule(categoryId, active);
  return `
    <div class="view-stack">
      ${moduleMarkup}
    </div>
  `;
}

function renderGeoOverviewModule(categoryId) {
  const overview = data.countryMarkets?.[categoryId];
  if (!overview) {
    return `
      <section class="module-block">
        <div class="module-head">
          <span>Country Overview</span>
          <h2>Country Market Summary</h2>
          <p>No country market summary has been configured for this category yet.</p>
        </div>
      </section>
    `;
  }
  const selectedRegion = state.geoRegionDetail[categoryId];
  if (selectedRegion) return renderRegionCountryWorkspace(categoryId, overview, selectedRegion);
  return `
    <section class="module-block">
      <section class="geo-overview-module">
        <div class="module-head country-overview-head">
          <span>Country Overview</span>
          <h2>Regional Entry Points</h2>
          <p>Select a region to review its representative country markets and the regulations shaping current and future portfolio decisions.</p>
        </div>
        <div class="geo-region-grid">
          ${(overview.regions || []).map(renderRegionEntryCard).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderRegionEntryCard(region) {
  return `
    <article class="geo-region-card">
      <header class="geo-region-card-head">
        <div>
          <h3>${escapeHtml(region.label)} &mdash; ${escapeHtml(region.heading)}</h3>
        </div>
      </header>
      <button class="geo-region-card-hit" type="button" data-action="country-region" data-region-id="${escapeAttr(region.id)}" aria-label="Open ${escapeAttr(region.label)} country overview"></button>
      <div class="geo-region-map" id="countryOverviewMap${escapeAttr(region.id)}" aria-label="${escapeAttr(region.label)} map"></div>
      <div class="geo-region-summary">
        <p><strong>Characteristics:</strong> ${geoCardValue(region.characteristics)}</p>
        <p><strong>Representative Countries:</strong> ${geoCardValue(region.representatives)}</p>
        <p><strong>Policy Focus:</strong> ${geoCardValue(region.policyFocus)}</p>
      </div>
      <span class="country-card-action" aria-hidden="true">View countries & policy <b>↗</b></span>
    </article>
  `;
}

function renderRegionCountryWorkspace(categoryId, overview, regionId) {
  const region = (overview.regions || []).find((item) => item.id === regionId);
  if (!region) return renderGeoOverviewModuleFallback(regionId);
  const tabs = [...(region.countryTabs || []), { id: "policy", label: "Policy & Standards" }];
  const configuredTab = state.geoCountryTab[categoryId];
  const activeTab = tabs.some((tab) => tab.id === configuredTab) ? configuredTab : tabs[0]?.id;
  state.geoCountryTab[categoryId] = activeTab;
  const tab = tabs.find((item) => item.id === activeTab);
  const country = (overview.countries || []).find((item) => item.id === tab?.countryId);
  return `
    <section class="module-block">
      <section class="geo-detail-view region-country-workspace">
        <header class="geo-detail-head region-country-head">
          <button class="ghost-button" type="button" data-action="country-back">← Country Overview</button>
          <span>${escapeHtml(region.label)} Regional Overview</span>
          <h2>${escapeHtml(region.label)} &mdash; ${escapeHtml(region.heading)}</h2>
          <ul class="country-summary-list">${(region.summaryPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </header>
        <nav class="country-region-tabs" aria-label="${escapeAttr(region.label)} country and policy views">
          ${tabs.map((item) => `<button class="${item.id === activeTab ? "is-active" : ""}" type="button" data-action="country-tab" data-tab-id="${escapeAttr(item.id)}">${escapeHtml(item.label)}</button>`).join("")}
        </nav>
        ${activeTab === "policy"
          ? renderRegionPolicyView(region)
          : renderRegionCountryPanel(overview, country, tab?.label || country?.label)}
      </section>
    </section>
  `;
}

function renderRegionCountryPanel(overview, country, displayLabel) {
  if (!country) return `<section class="country-region-empty"><strong>Country detail unavailable</strong><p>No sourced market profile is configured for this country.</p></section>`;
  const sections = (overview.insightSets?.[country.insightSet] || []).filter((section) => !/policy|standards/i.test(section.title || ""));
  return `
    <section class="country-region-panel">
      <header class="country-panel-head">
        <span>Representative Country</span>
        <h3>${escapeHtml(displayLabel)} Adapter Market</h3>
        <ul class="country-summary-list">${(country.summaryPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </header>
      <section class="geo-na-metrics">
        ${(country.metrics || []).slice(0, 4).map((metric) => `
          <div class="geo-na-metric-card">
            <span>${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.value)}</strong>
            <small>${escapeHtml(countryMetricNote(country, metric))}</small>
          </div>
        `).join("")}
      </section>
      ${country.research ? `
        <section class="country-research-basis" aria-label="Research sample and methodology">
          <div><span>Research Sample</span><strong>${escapeHtml(country.research.sampleLabel || "Not reported")}</strong></div>
          <p>${escapeHtml(country.research.method || "Research methodology was not disclosed.")}</p>
        </section>
      ` : ""}
      <section class="geo-detail-grid country-detail-grid">
        ${sections.map((section, index) => renderCountryInsightCard(country, section, index)).join("")}
      </section>
    </section>
  `;
}

function renderRegionPolicyView(region) {
  const policies = region.policies || {};
  return `
    <section class="country-region-panel region-policy-panel">
      <header class="country-panel-head">
        <span>Regional Policy</span>
        <h3>${escapeHtml(region.label)} Policy Impact</h3>
        <p>Current requirements affect active market access and compliance work. Future items should be tracked in portfolio and launch planning.</p>
      </header>
      <div class="region-policy-grid country-region-policy-grid">
        ${renderRegionPolicyBucket("Current Impact", "Requirements affecting products and channels now", policies.current || [])}
        ${renderRegionPolicyBucket("Future Impact", "Rules and implementation changes to prepare for", policies.future || [])}
      </div>
    </section>
  `;
}

function renderRegionPolicyBucket(title, subtitle, items) {
  return `
    <section class="region-policy-bucket">
      <header class="country-policy-bucket-head"><span>${escapeHtml(title)}</span><p>${escapeHtml(subtitle)}</p></header>
      <div class="region-row-list">
        ${items.length ? items.map(renderRegionPolicyItem).join("") : `<div class="policy-empty"><strong>No sourced item loaded</strong><p>Add a confirmed regulation when the source is available.</p></div>`}
      </div>
    </section>
  `;
}

function renderRegionPolicyItem(item) {
  return `
    <details class="region-policy-row country-region-policy-row">
      <summary>
        <div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.summary)}</p>
        </div>
        <em>Details</em>
      </summary>
      <div class="region-policy-detail">
        <p>${escapeHtml(item.detail)}</p>
        <div class="policy-impact-meta">
          <span><strong>Affected Countries</strong>${escapeHtml((item.affectedCountries || []).join(" · "))}</span>
          <span><strong>Timing</strong>${escapeHtml(item.timing || "Monitor")}</span>
        </div>
        ${item.sourceUrl ? `<a href="${escapeAttr(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official reference ↗</a>` : ""}
      </div>
    </details>
  `;
}

function renderCountryDetail(categoryId, overview, countryId) {
  const country = (overview.countries || []).find((item) => item.id === countryId);
  if (!country) return renderGeoOverviewModuleFallback(countryId);
  const sections = overview.insightSets?.[country.insightSet] || [];
  return `
    <section class="module-block">
      <section class="geo-detail-view">
        <header class="geo-detail-head country-detail-head">
          <button class="ghost-button" type="button" data-action="country-back">← Country Overview</button>
          <span>Country Overview</span>
          <h2>${escapeHtml(country.label)} Adapter Market</h2>
          ${country.summaryPoints?.length
            ? `<ul class="country-summary-list">${country.summaryPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>${escapeHtml(country.summary)}</p>`}
        </header>

        <section class="geo-na-metrics">
          ${(country.metrics || []).slice(0, 4).map((metric) => `
            <div class="geo-na-metric-card">
              <span>${escapeHtml(metric.label)}</span>
              <strong>${escapeHtml(metric.value)}</strong>
              <small>${escapeHtml(countryMetricNote(country, metric))}</small>
            </div>
          `).join("")}
        </section>

        ${country.research ? `
          <section class="country-research-basis" aria-label="Research sample and methodology">
            <div><span>Research Sample</span><strong>${escapeHtml(country.research.sampleLabel || "Not reported")}</strong></div>
            <p>${escapeHtml(country.research.method || "Research methodology was not disclosed.")}</p>
          </section>
        ` : ""}

        <section class="geo-detail-grid country-detail-grid">
          ${sections.map((section, index) => renderCountryInsightCard(country, section, index)).join("")}
        </section>
      </section>
    </section>
  `;
}

function countryMetricNote(country, metric) {
  if (/survey/i.test(metric.note || "") && country.research?.sampleLabel) {
    return `Research basis · ${country.research.sampleLabel}`;
  }
  return metric.note || "";
}

function renderCountryInsightCard(country, section, index) {
  const displaySection = section;
  const charts = section.charts || (section.chart ? [section.chart] : []);
  const key = idFromText(section.title || `section-${index}`);
  return `
    <article class="geo-detail-section geo-na-detail-card">
      <details class="geo-na-card-disclosure">
        <summary class="country-insight-summary">
          <span class="country-insight-number">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>${escapeHtml(displaySection.title)}</h3>
            <ul class="country-insight-points">${(displaySection.summaryPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <em>Details</em>
        </summary>
        <div class="geo-na-detail-content">
          <div class="geo-na-detail-split ${charts.length ? "" : "is-copy-only"}">
                <div class="geo-na-detail-copy"><p>${escapeHtml(section.body || "")}</p><ul class="geo-driver-list">${(section.detailPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
                ${charts.length ? `<div class="geo-na-detail-visual geo-regional-chart-grid">${charts.map((chart, chartIndex) => renderCountryChartPanel(country, section, chart, `country${country.id}${key}Plot${chartIndex}`)).join("")}</div>` : ""}
              </div>
        </div>
      </details>
    </article>
  `;
}

function renderCountryChartPanel(country, section, chart, chartId) {
  const research = country.research || {};
  const marketBased = /competitive|market scale/i.test(section.title || "");
  const sampleLabel = chart.sampleLabel || (marketBased ? research.marketBasis : research.sampleLabel) || "Sample base not reported";
  const method = marketBased ? "" : research.method || "";
  return `
    <section class="geo-regional-chart country-chart-panel">
      <div class="country-chart-head">
        <h4>${escapeHtml(chart.title || "")}</h4>
        <small>${escapeHtml(sampleLabel)}</small>
      </div>
      <div id="${escapeAttr(chartId)}" class="plot geo-detail-plot"></div>
      <div class="country-chart-legend" aria-label="${escapeAttr(chart.title || "Chart")} legend">
        ${(chart.items || []).map((item, itemIndex) => `
          <span><i style="--legend-color:${escapeAttr(structureChartColor(itemIndex))}"></i><b>${escapeHtml(item.label)}</b><em>${escapeHtml(item.valueLabel || String(item.value))}</em></span>
        `).join("")}
      </div>
      ${method ? `<p class="country-chart-method">${escapeHtml(method)}</p>` : ""}
    </section>
  `;
}

function renderCountryPolicyColumns(policy) {
  return `
    <div class="country-policy-columns">
      <section>
        <span>Current Requirements</span>
        <ul>${(policy.current || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <span>Upcoming / Monitor</span>
        <ul>${(policy.upcoming || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
    </div>
  `;
}

function renderNARegionalDetail(categoryId, overview) {
  const region = overview.regions.find((item) => item.id === "NA");
  const detail = region?.detail;
  if (!detail) return renderGeoOverviewModuleFallback("NA");
  const usaMetrics = detail.usaMetrics || [];
  const trend = detail.usMarketTrend || {};
  const policyItems = detail.policy?.items || [];
  const effectivePolicy = policyItems.filter((item) => item.status === "Effective");
  const futurePolicy = policyItems.filter((item) => item.status !== "Effective");
  return `
    <section class="module-block">
      <section class="geo-detail-view">
        <header class="geo-detail-head">
          <button class="ghost-button" type="button" data-action="geo-back">← Country Overview</button>
          <span>${escapeHtml(detail.eyebrow)}</span>
          <h2>${escapeHtml(detail.title)}</h2>
          <ul class="geo-na-takeaway-list">${(detail.opportunity.corePoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </header>

        <section class="geo-na-metrics">
          ${(usaMetrics.slice(0, 4)).map((metric) => `
            <div class="geo-na-metric-card">
              <span>${escapeHtml(metric.label)}</span>
              <strong>${escapeHtml(metric.value)}</strong>
              <small>${escapeHtml(metric.note || "")}</small>
            </div>
          `).join("")}
        </section>

        <section class="geo-na-market-trend">
          <div class="geo-na-market-trend-copy">
            <span>Market Size Trend</span>
            <h3>${escapeHtml(trend.title || "U.S. Power Adapter Market Size*")}</h3>
            <ul class="geo-core-list">
              <li>Market size: USD 1.29B in 2024</li>
              <li>Forecast CAGR: 3.9% from 2023 to 2033</li>
              <li>Demand is supported by replacement, travel and multi-device charging</li>
            </ul>
          </div>
          <div class="geo-na-market-trend-visual">
            <span class="geo-na-virtual-note">${escapeHtml(trend.note || "* Virtual / modeled data for layout preview.")}</span>
            <div id="geoNaUSMarketTrendPlot" class="plot geo-na-us-market-plot"></div>
            ${(trend.references || []).length ? `<div class="geo-na-references"><strong>References</strong><ol>${trend.references.map((reference) => `<li>${reference.url ? `<a href="${escapeAttr(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.title)}</a>` : `<span>${escapeHtml(reference.title)}</span>`}<small>${escapeHtml(reference.note || "")}</small></li>`).join("")}</ol></div>` : ""}
          </div>
        </section>

        <section class="geo-detail-grid">
          ${renderNADetailCard(1, detail.competitive, [
            "OEM compatibility and trust remain important purchase drivers",
            "Anker, Belkin and other premium accessory brands lead third-party competition",
            "The market remains fragmented, leaving room for differentiated products"
          ], `<div class="geo-na-detail-split"><div class="geo-na-detail-copy"><p>${escapeHtml(detail.competitive.body)}</p><ul class="geo-driver-list"><li>PC manufacturers win through compatibility, brand trust and official support.</li><li>Third-party brands compete through compact GaN designs, multiple ports and fast charging.</li><li>Anker represents approximately 17% of the U.S. power adapter market.</li></ul></div><div class="geo-na-detail-visual"><div id="geoNaCompetitivePlot" class="plot geo-detail-plot"></div><div class="geo-compare-grid">${detail.competitive.groups.map((group) => `<div><strong>${escapeHtml(group.title)}</strong><ul>${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`).join("")}</div></div>`)}
          ${renderNADetailCard(2, detail.price, [
            "Average surveyed purchase price: USD 65.18",
            "USD 40-79.99 is the core price opportunity",
            "Higher-priced products compete through power, portability and brand trust"
          ], `<div class="geo-na-detail-split"><div class="geo-na-detail-copy"><p>${escapeHtml(detail.price.body)}</p><ul class="geo-driver-list"><li>USD 40-79.99 is the largest surveyed price tier at 47%.</li><li>Below USD 40 accounts for 28%, while USD 80+ accounts for 25%.</li><li>The core opportunity is branded 65W-100W USB-C and multi-port adapters.</li></ul></div><div class="geo-na-detail-visual"><div id="geoNaPricePlot" class="plot geo-detail-plot"></div></div></div>`)}
          ${renderNADetailCard(3, detail.channel, [
            "Physical stores: 41% of surveyed purchases",
            "Official brand websites: 30% | Online e-commerce: 29%",
            "Amazon, major retailers and direct brand channels each play a distinct role"
          ], `<div class="geo-na-detail-split"><div class="geo-na-detail-copy"><p>${escapeHtml(detail.channel.body)}</p><ul class="geo-driver-list">${detail.channel.representative.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="geo-na-detail-visual"><div id="geoNaChannelPlot" class="plot geo-detail-donut"></div></div></div>`)}
          ${renderNAUserResearchCard(4, detail.user)}
        </section>

        <article class="geo-detail-section geo-na-detail-card geo-na-policy-card">
          <div class="geo-na-detail-summary">
            <div class="geo-detail-section-head"><span>05</span><h3>${escapeHtml(detail.policy.title)}</h3></div>
          </div>
          <div class="geo-na-policy-summary">
            <div><strong>Effective now</strong><p>${escapeHtml(detail.policy.effectiveSummary || detail.policy.body)}</p></div>
            <div><strong>Future direction</strong><p>${escapeHtml(detail.policy.futureSummary || "Monitor future requirements.")}</p></div>
          </div>
          <details class="geo-na-card-disclosure">
            <summary class="geo-details-trigger">Details</summary>
            <div class="geo-na-detail-content"><div class="geo-na-policy-detail-list">${[...effectivePolicy, ...futurePolicy].map((item) => `<article><span class="geo-policy-status">${escapeHtml(item.status || "Policy")}</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div></div>
          </details>
        </article>
      </section>
    </section>
  `;
}

function renderGeoRegionalDetail(categoryId, overview, regionId) {
  const region = overview.regions.find((item) => item.id === regionId);
  const detail = region?.detail;
  if (!detail) return renderGeoOverviewModuleFallback(regionId);
  const trend = detail.marketTrend || {};
  const policyItems = detail.policy?.items || [];
  const effectivePolicy = policyItems.filter((item) => item.status === "Effective");
  const futurePolicy = policyItems.filter((item) => item.status !== "Effective");
  return `
    <section class="module-block">
      <section class="geo-detail-view">
        <header class="geo-detail-head">
          <button class="ghost-button" type="button" data-action="geo-back">← Country Overview</button>
          <span>${escapeHtml(detail.eyebrow)}</span>
          <h2>${escapeHtml(detail.title)}</h2>
          <ul class="geo-na-takeaway-list">${(detail.opportunity?.corePoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </header>

        <section class="geo-na-metrics">
          ${(detail.metrics || []).slice(0, 4).map((metric) => `
            <div class="geo-na-metric-card">
              <span>${escapeHtml(metric.label)}</span>
              <strong>${escapeHtml(metric.value)}</strong>
              <small>${escapeHtml(metric.note || "")}</small>
            </div>
          `).join("")}
        </section>

        <section class="geo-na-market-trend">
          <div class="geo-na-market-trend-copy">
            <span>Market Size Trend</span>
            <h3>${escapeHtml(trend.title || `${region.label} Power Adapter Market Size*`)}</h3>
            <ul class="geo-core-list">${(trend.bullets || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="geo-na-market-trend-visual">
            <span class="geo-na-virtual-note">${escapeHtml(trend.note || "* Modeled data based on the cited regional base.")}</span>
            <div id="geo${escapeAttr(regionId)}MarketTrendPlot" class="plot geo-na-us-market-plot"></div>
            ${(trend.references || []).length ? `<div class="geo-na-references"><strong>References</strong><ol>${trend.references.map((reference) => `<li>${reference.url ? `<a href="${escapeAttr(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.title)}</a>` : `<span>${escapeHtml(reference.title)}</span>`}<small>${escapeHtml(reference.note || "")}</small></li>`).join("")}</ol></div>` : ""}
          </div>
        </section>

        <section class="geo-detail-grid">
          ${renderGeoRegionalInsightCard(regionId, 1, "competitive", detail.competitive)}
          ${renderGeoRegionalInsightCard(regionId, 2, "price", detail.price)}
          ${renderGeoRegionalInsightCard(regionId, 3, "channel", detail.channel)}
          ${renderGeoRegionalUserCard(4, detail.user)}
        </section>

        <article class="geo-detail-section geo-na-detail-card geo-na-policy-card">
          <div class="geo-na-detail-summary">
            <div class="geo-detail-section-head"><span>05</span><h3>${escapeHtml(detail.policy.title)}</h3></div>
          </div>
          <div class="geo-na-policy-summary">
            <div><strong>Effective now</strong><p>${escapeHtml(detail.policy.effectiveSummary || detail.policy.body)}</p></div>
            <div><strong>Future direction</strong><p>${escapeHtml(detail.policy.futureSummary || "Monitor future requirements.")}</p></div>
          </div>
          <details class="geo-na-card-disclosure">
            <summary class="geo-details-trigger">Details</summary>
            <div class="geo-na-detail-content"><div class="geo-na-policy-detail-list">${[...effectivePolicy, ...futurePolicy].map((item) => `<article><span class="geo-policy-status">${escapeHtml(item.status || "Policy")}</span><div><strong>${item.url ? `<a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>` : escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div></div>
          </details>
        </article>
      </section>
    </section>
  `;
}

function renderGeoRegionalInsightCard(regionId, index, key, section) {
  if (!section) return "";
  const charts = section.charts || (section.chart ? [section.chart] : []);
  return `
    <article class="geo-detail-section geo-na-detail-card">
      <div class="geo-na-detail-summary">
        <div class="geo-detail-section-head"><span>${String(index).padStart(2, "0")}</span><h3>${escapeHtml(section.title)}</h3></div>
      </div>
      <ul class="geo-core-list">${(section.summaryPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <details class="geo-na-card-disclosure">
        <summary class="geo-details-trigger">Details</summary>
        <div class="geo-na-detail-content">
          <div class="geo-na-detail-split">
            <div class="geo-na-detail-copy"><p>${escapeHtml(section.body || "")}</p><ul class="geo-driver-list">${(section.detailPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
            <div class="geo-na-detail-visual geo-regional-chart-grid">${charts.map((chart, chartIndex) => `<section class="geo-regional-chart"><h4>${escapeHtml(chart.title || "")}</h4><div id="geo${escapeAttr(regionId)}${escapeAttr(key)}Plot${chartIndex}" class="plot geo-detail-plot"></div></section>`).join("")}</div>
          </div>
        </div>
      </details>
    </article>
  `;
}

function renderGeoRegionalUserCard(index, section) {
  if (!section) return "";
  const metricRow = (row) => `
    <section class="geo-na-user-metric-row">
      <h4>${escapeHtml(row.title)}</h4>
      <div class="geo-na-user-metric-cards">${(row.items || []).map((item) => `<div class="geo-na-user-metric-card"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.valueLabel || `${item.value}%`)}</strong></div>`).join("")}</div>
      <p>${escapeHtml(row.conclusion || "")}</p>
    </section>
  `;
  return `
    <article class="geo-detail-section geo-na-detail-card geo-na-user-static-card">
      <div class="geo-na-detail-summary"><div class="geo-detail-section-head"><span>${String(index).padStart(2, "0")}</span><h3>${escapeHtml(section.title)}</h3></div></div>
      <ul class="geo-core-list">${(section.summaryPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <details class="geo-na-card-disclosure">
        <summary class="geo-details-trigger">Details</summary>
        <div class="geo-na-detail-content">
          <div class="geo-na-user-metric-groups">${(section.rows || []).map(metricRow).join("")}</div>
        </div>
      </details>
    </article>
  `;
}

function renderNADetailCard(index, section, bullets, detailMarkup) {
  return `
    <article class="geo-detail-section geo-na-detail-card">
      <div class="geo-na-detail-summary">
        <div class="geo-detail-section-head"><span>${String(index).padStart(2, "0")}</span><h3>${escapeHtml(section.title)}</h3></div>
      </div>
      <ul class="geo-core-list">${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <details class="geo-na-card-disclosure">
        <summary class="geo-details-trigger">Details</summary>
        <div class="geo-na-detail-content">${detailMarkup}</div>
      </details>
    </article>
  `;
}

function renderNAUserResearchCard(index, section) {
  const metricRow = (title, items, conclusion) => `
    <section class="geo-na-user-metric-row">
      <h4>${escapeHtml(title)}</h4>
      <div class="geo-na-user-metric-cards">
        ${(items || []).map((item) => `
          <div class="geo-na-user-metric-card">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.valueLabel || `${item.value}%`)}</strong>
          </div>
        `).join("")}
      </div>
      <p>${escapeHtml(conclusion)}</p>
    </section>
  `;

  return `
    <article class="geo-detail-section geo-na-detail-card geo-na-user-static-card">
      <div class="geo-na-detail-summary">
        <div class="geo-detail-section-head"><span>${String(index).padStart(2, "0")}</span><h3>${escapeHtml(section.title)}</h3></div>
      </div>
      <ul class="geo-core-list">
        <li>68% self-purchase rate among surveyed U.S. consumers</li>
        <li>Top needs: multi-device compatibility, safety protection and super-fast charging</li>
        <li>Main pain points: portability, cable storage and charging speed</li>
      </ul>
      <details class="geo-na-card-disclosure">
        <summary class="geo-details-trigger">Details</summary>
        <div class="geo-na-detail-content">
          <div class="geo-na-user-metric-groups">
            ${metricRow("Top Needs", section.expectations, "Multi-device compatibility, safety and charging speed are similarly important to U.S. consumers.")}
            ${metricRow("Main Pain Points", section.painPoints, "Portability, cable storage and charging speed are equally reported pain points.")}
          </div>
        </div>
      </details>
    </article>
  `;
}

function renderGeoOverviewModuleFallback(regionId) {
  return `<section class="module-block"><div class="module-head"><span>Country Overview</span><h2>${escapeHtml(regionId)} Country Overview</h2><p>No country detail is configured yet.</p></div></section>`;
}

function geoPolicyIcon(icon) {
  return { signal: "⌁", shield: "◇", leaf: "⌁", check: "✓" }[icon] || "•";
}

function geoEmphasize(value) {
  return escapeHtml(value || "").replace(/((?:USD|RMB)\s?[\d,.]+B?|\d+(?:\.\d+)?%)/g, '<strong class="geo-highlight">$1</strong>');
}

function geoCardValue(value) {
  return escapeHtml(String(value || ""));
}

function selectedMarketModule() {
  if (!marketModules[state.marketModule]) state.marketModule = "global";
  return state.marketModule;
}

function renderGlobalMarketModule(categoryId) {
  const report = marketStructureReport(categoryId);
  if (report?.overview) {
    return `
      <section class="module-block">
        ${renderMarketStructureOverview(report)}
      </section>
    `;
  }
  return `
    <section class="module-block">
      <div class="module-head">
        <span>Global</span>
        <h2>${escapeHtml(categoryLabel(categoryId))} Global Market</h2>
        <p>No global market narrative has been configured for this category yet.</p>
      </div>
    </section>
  `;
}

function renderRegionalMarketModule(categoryId, regionId) {
  const region = marketRegionModules[regionId];
  const report = marketStructureReport(categoryId);
  const markets = (report?.markets || []).filter((market) => region?.markets?.includes(market.code));
  return `
    <section class="module-block market-region-module">
      <div class="module-head">
        <span>${escapeHtml(region?.label || regionId)}</span>
        <h2>${escapeHtml(region?.name || regionId)}</h2>
      </div>
      <section class="market-region-section">
        <div class="market-region-head">
          <span>Market</span>
          <h3>Country Market Reading</h3>
        </div>
        <div class="region-row-list">
          ${markets.length ? markets.map(renderRegionalMarketRow).join("") : `<div class="policy-empty"><strong>No country market reading loaded</strong><p>Add regional market bullets when the source data is ready.</p></div>`}
        </div>
      </section>
      ${renderRegionalPolicySection(categoryId, regionId)}
    </section>
  `;
}

function renderRegionalMarketRow(market) {
  const summary = market.insights?.[0] || market.note;
  return `
    <details class="region-market-row">
      <summary>
        <span class="tag">${escapeHtml(market.code)}</span>
        <div>
          <h4>${escapeHtml(market.label)}</h4>
          <p>${escapeHtml(summary)}</p>
        </div>
        <em>Details</em>
      </summary>
      <div class="region-row-detail">
        ${renderMarketCountryInsights(market)}
      </div>
    </details>
  `;
}

function renderRegionalPolicySection(categoryId, regionId) {
  const reports = (data.catalog.policyReports?.[categoryId] || []).filter((report) => report.regionGroup === regionId);
  return `
    <section class="market-region-section">
      <div class="market-region-head">
        <span>Policy</span>
        <h3>Regulation Impact</h3>
      </div>
      <div class="region-policy-grid">
        ${policyImpactWindows.map((window) => renderRegionalPolicyBucket(window, reports.filter((report) => report.impactWindow === window.id))).join("")}
      </div>
    </section>
  `;
}

function renderRegionalPolicyBucket(window, reports) {
  return `
    <div class="region-policy-bucket">
      <h4>${escapeHtml(window.label)}</h4>
      <div class="region-row-list">
        ${reports.length ? reports.map(renderRegionalPolicyRow).join("") : `<div class="policy-empty"><strong>No confirmed regulation loaded</strong><p>No ${escapeHtml(window.label.toLowerCase())} policy item is currently configured.</p></div>`}
      </div>
    </div>
  `;
}

function renderRegionalPolicyRow(report) {
  return `
    <details class="region-policy-row">
      <summary>
        <span>${escapeHtml(report.effectiveDate || "Current")}</span>
        <div>
          <h4>${escapeHtml(report.title)}</h4>
          <p>${escapeHtml(report.region || "")}</p>
        </div>
        <em>Details</em>
      </summary>
      <div class="region-policy-detail">
        <p>${escapeHtml(report.summary || "")}</p>
        <strong>Portfolio Impact</strong>
        <p>${escapeHtml(report.impact || "")}</p>
      </div>
    </details>
  `;
}

function categoryLabel(categoryId) {
  return indexes.categories.get(categoryId)?.label || categoryId;
}

function renderPolicyInsights(categoryId, reports) {
  const selectedRegion = selectedPolicyRegion(categoryId, reports);
  return `
    <div class="policy-workspace">
      <div class="policy-region-tabs" aria-label="Policy regions">
        ${policyRegions.map((region) => renderPolicyRegionTab(region, reports, selectedRegion)).join("")}
      </div>
      ${renderPolicyRegionDetail(selectedRegion, reports)}
    </div>
  `;
}

function selectedPolicyRegion(categoryId, reports) {
  const current = state.policyRegion[categoryId];
  const validCurrent = policyRegions.find((region) => region.id === current);
  const firstWithReports = policyRegions.find((region) => reports.some((report) => report.regionGroup === region.id));
  const selected = validCurrent || firstWithReports || policyRegions[0];
  state.policyRegion[categoryId] = selected.id;
  return selected;
}

function renderPolicyRegionTab(region, reports, selectedRegion) {
  const regionReports = reports.filter((report) => report.regionGroup === region.id);
  const currentCount = regionReports.filter((report) => (report.impactWindow || "current") === "current").length;
  const futureCount = regionReports.filter((report) => report.impactWindow === "future").length;
  const active = region.id === selectedRegion.id;
  return `
    <button class="policy-region-tab ${active ? "is-active" : ""}" type="button" data-action="policy-region" data-region-id="${escapeAttr(region.id)}" aria-pressed="${active}">
      <div class="policy-map" id="policyMap${escapeAttr(region.id)}" aria-hidden="true"></div>
      <div class="policy-region-tab-copy">
        <span>${escapeHtml(region.label)}</span>
        <strong>${escapeHtml(region.name)}</strong>
        <small>${fmtExactNumber(regionReports.length)} regulations · ${fmtExactNumber(currentCount)} current · ${fmtExactNumber(futureCount)} future</small>
      </div>
    </button>
  `;
}

function renderPolicyRegionDetail(region, reports) {
  const regionReports = reports.filter((report) => report.regionGroup === region.id);
  const currentCount = regionReports.filter((report) => (report.impactWindow || "current") === "current").length;
  const futureCount = regionReports.filter((report) => report.impactWindow === "future").length;
  return `
    <article class="policy-region-detail">
      <header class="policy-region-detail-head">
        <div>
          <span>${escapeHtml(region.label)}</span>
          <h3>${escapeHtml(region.name)}</h3>
          <p>Regional policy view split by near-term and later-quarter portfolio impact.</p>
        </div>
        <div class="policy-region-statline">
          <div><span>Total</span><strong>${fmtExactNumber(regionReports.length)}</strong></div>
          <div><span>Current</span><strong>${fmtExactNumber(currentCount)}</strong></div>
          <div><span>Future</span><strong>${fmtExactNumber(futureCount)}</strong></div>
        </div>
      </header>
      <div class="policy-impact-columns">
        ${policyImpactWindows.map((window) => renderPolicyImpactBucket(region, window, regionReports)).join("")}
      </div>
    </article>
  `;
}

function renderPolicyImpactBucket(region, window, reports) {
  const bucketReports = reports.filter((report) => (report.impactWindow || "current") === window.id);
  return `
    <section class="policy-impact-bucket">
      <div class="policy-bucket-head">
        <span>${escapeHtml(window.label)}</span>
        <strong>${fmtExactNumber(bucketReports.length)}</strong>
      </div>
      <div class="policy-card-stack">
        ${bucketReports.length
          ? bucketReports.map((report) => renderPolicyCard(report)).join("")
          : renderPolicyEmpty(region, window)}
      </div>
    </section>
  `;
}

function renderPolicyCard(report) {
  return `
    <article class="policy-card">
      <span class="tag">${escapeHtml(report.region)} · ${escapeHtml(report.effectiveDate)}</span>
      <h3>${escapeHtml(modeledText(report.title))}</h3>
      <p>${escapeHtml(report.summary)}</p>
      <strong>${escapeHtml(modeledText(report.impact))}</strong>
      <a href="${escapeAttr(report.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(report.source)}</a>
    </article>
  `;
}

function renderPolicyEmpty(region, window) {
  return `
    <div class="policy-empty">
      <strong>No confirmed regulation loaded</strong>
      <p>Add a sourced ${escapeHtml(region.label)} policy item when it affects ${escapeHtml(window.label.toLowerCase())}.</p>
    </div>
  `;
}

function renderIndustryTrendsModule(categoryId, options = {}) {
  const report = industryBrandReport(categoryId);
  const eyebrow = options.eyebrow || "Market Module";
  const title = options.title || report?.title || modeledText("Industry Trends");
  const description = options.description ?? report?.categoryLens;
  if (!report) {
    return `
      <section class="module-block">
        <div class="module-head">
          <span>${escapeHtml(eyebrow)}</span>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <div class="chart-grid">
          ${chartShell("industryHighPowerPlot", modeledText("High Power Migration"), "share of demand")}
          ${chartShell("industryPortsPlot", modeledText("Port Upgrade Trend"), "sample share")}
          ${chartShell("industryPriceCurvePlot", modeledText("Price Decline by Power"), "AUR by period")}
          ${chartShell("industryTechPlot", modeledText("Technology Penetration"), "feature adoption")}
        </div>
      </section>
    `;
  }
  return `
    <section class="module-block">
      <div class="module-head">
        <span>${escapeHtml(eyebrow)}</span>
        <h2>${escapeHtml(title)}</h2>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      </div>
      <div class="source-note">${escapeHtml(report.source)}</div>
      <div class="industry-brand-grid">
        ${report.brands.map((brand, index) => renderIndustryBrandModule(brand, index === 0)).join("")}
      </div>
    </section>
  `;
}

function renderIndustryBrandModule(brand, featured = false) {
  const overviewSlides = buildIndustryOverviewSlides(brand);
  return `
    <article class="industry-brand-module ${featured ? "is-featured" : ""}">
      <header class="industry-brand-head">
        <div>
          <span class="tag">${escapeHtml(brand.role)}</span>
          <h3>${escapeHtml(brand.brand)}</h3>
          <p>${escapeHtml(brand.summary)}</p>
        </div>
        ${brand.metrics?.length ? `<div class="industry-metric-strip">${brand.metrics.map(renderIndustryMetric).join("")}</div>` : ""}
      </header>
      ${overviewSlides.length ? renderIndustryOverviewDeck(brand, overviewSlides) : ""}
      ${brand.countries?.length ? renderIndustryCountryBlockSection(brand) : ""}
      ${brand.notes?.length ? `<section class="industry-quick-notes">${brand.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("")}</section>` : ""}
      ${brand.products?.length ? renderIndustryProductSection(brand.products) : ""}
    </article>
  `;
}

function renderIndustryMetric(metric) {
  return `
    <div>
      <span>${escapeHtml(metric.label)}</span>
      <strong>${escapeHtml(metric.value)}</strong>
    </div>
  `;
}

function renderIndustryStorySection(title, items) {
  return `
    <section class="industry-story-section">
      <h4>${escapeHtml(title)}</h4>
      <div class="industry-story-grid">
        ${items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </div>
    </section>
  `;
}

function buildIndustryOverviewSlides(brand) {
  if (brand.reportSlides?.length) {
    return brand.reportSlides.map((slide) => ({ kind: "report", section: slide.title, slide }));
  }
  const slides = [];
  (brand.flowDecks || []).forEach((deck) => {
    slides.push({ section: deck.title || "Flow", deck });
  });
  return slides;
}

function renderIndustryOverviewDeck(brand, slides) {
  const carouselId = `industry-${idFromText(brand.brand)}-overview`;
  const activeIndex = selectedIndustrySlide(carouselId, slides.length);
  const activeSlide = slides[activeIndex] || slides[0];
  return `
    <section class="industry-ppt-deck">
      <div class="industry-deck-head">
        <div>
          <span>Report Slideshow</span>
          <h4>${escapeHtml(activeSlide.section || "Industry Slide")}</h4>
        </div>
        ${renderCarouselCounter(activeIndex, slides.length)}
      </div>
      ${renderIndustryCarousel(carouselId, slides, (slide) => renderIndustryOverviewSlide(slide, brand), activeIndex)}
    </section>
  `;
}

function renderIndustryOverviewSlide(slide, brand) {
  if (slide.kind === "report") return renderIndustryReportSlide(slide.slide);
  const cards = slide.deck?.cards || [];
  return `
    <article class="industry-ppt-slide is-overview-slide">
      <div class="industry-ppt-aside">
        <span>${escapeHtml(brand.brand)}</span>
        <h5>${escapeHtml(slide.section || "Industry Overview")}</h5>
        <div class="industry-ppt-kpis">
          ${(brand.metrics || []).slice(0, 3).map((metric) => `<strong>${escapeHtml(metric.label)}: ${escapeHtml(metric.value)}</strong>`).join("")}
        </div>
      </div>
      <div class="industry-ppt-canvas">
        <span class="flow-eyebrow">${escapeHtml(slide.section || "Overview")}</span>
        <div class="industry-overview-card-grid">
          ${cards.map((card) => renderIndustryFlowCard(card, "is-overview")).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderIndustryReportSlide(slide) {
  return `
    <article class="industry-report-slide">
      <figure class="industry-report-image">
        <a href="${escapeAttr(slide.image)}" target="_blank" rel="noreferrer">
          <img src="${escapeAttr(slide.image)}" alt="${escapeAttr(slide.title)}" loading="lazy">
        </a>
      </figure>
    </article>
  `;
}

function renderIndustryProductSection(products) {
  return `
    <section class="industry-product-section">
      <div class="industry-deck-head">
        <div>
          <span>Official Product Links</span>
          <h4>Representative Products</h4>
        </div>
      </div>
      <div class="industry-product-grid">
        ${products.map(renderIndustryProductCard).join("")}
      </div>
    </section>
  `;
}

function renderIndustryProductCard(product) {
  const productHref = product.productUrl || product.amazonUrl || "#";
  const specs = product.specs || [];
  return `
    <article class="industry-product-card">
      <a class="industry-product-image" href="${escapeAttr(productHref)}" target="_blank" rel="noreferrer" aria-label="${escapeAttr(product.name)}">
        <img src="${escapeAttr(product.imageUrl || "")}" alt="${escapeAttr(product.name)}" loading="lazy">
      </a>
      <div class="industry-product-body">
        <div class="industry-product-kicker">
          <span class="tag">${escapeHtml(product.type || "Product")}</span>
          <strong>${escapeHtml(product.price || "Price varies")}</strong>
        </div>
        <h5>${escapeHtml(product.name)}</h5>
        <p>${escapeHtml(product.positioning || "")}</p>
        ${specs.length ? `<div class="industry-product-specs">${specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join("")}</div>` : ""}
        <div class="industry-product-links">
          ${product.productUrl ? `<a class="primary-link" href="${escapeAttr(product.productUrl)}" target="_blank" rel="noreferrer">Official site</a>` : ""}
          ${product.amazonUrl ? `<a href="${escapeAttr(product.amazonUrl)}" target="_blank" rel="noreferrer">Amazon</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderCarouselCounter(index, total) {
  return `<span class="industry-slide-count">${Math.min(index + 1, total || 1)} / ${total || 1}</span>`;
}

function renderIndustryCarousel(carouselId, items, renderer, activeIndex = selectedIndustrySlide(carouselId, items.length), className = "") {
  if (!items.length) return "";
  const current = items[activeIndex] || items[0];
  return `
    <div class="industry-carousel ${escapeAttr(className)}" data-carousel-id="${escapeAttr(carouselId)}">
      <button class="industry-carousel-nav is-previous" type="button" data-action="industry-slide" data-carousel-id="${escapeAttr(carouselId)}" data-direction="previous" aria-label="Previous slide">&lt;</button>
      <div class="industry-slide-frame">
        ${renderer(current, activeIndex)}
      </div>
      <button class="industry-carousel-nav is-next" type="button" data-action="industry-slide" data-carousel-id="${escapeAttr(carouselId)}" data-direction="next" aria-label="Next slide">&gt;</button>
      <div class="industry-slide-dots" aria-hidden="true">
        ${items.map((_, index) => `<span class="${index === activeIndex ? "is-active" : ""}"></span>`).join("")}
      </div>
    </div>
  `;
}

function renderIndustryCountryBlockSection(brand) {
  return `
    <section class="industry-country-block-section">
      <div class="industry-deck-head">
        <div>
          <span>Country Strategy</span>
          <h4>Country Strategy Slides</h4>
        </div>
      </div>
      <div class="industry-country-block-grid">
        ${brand.countries.map((country) => renderIndustryCountryBlock(brand, country)).join("")}
      </div>
    </section>
  `;
}

function renderIndustryCountryBlock(brand, country) {
  const sections = country.reportSlides?.length
    ? country.reportSlides.map((slide) => ({ kind: "report", slide }))
    : country.flowSections?.length
    ? country.flowSections
    : [{ eyebrow: "Channel", heading: country.model, steps: country.flow || [] }];
  const carouselId = `industry-${idFromText(brand.brand)}-country-${idFromText(country.market)}`;
  const activeIndex = selectedIndustrySlide(carouselId, sections.length);
  return `
    <article class="industry-country-block">
      <header class="industry-country-block-head">
        <div>
          <span>${escapeHtml(country.market)}</span>
          <h5>${escapeHtml(country.model)}</h5>
        </div>
        ${renderCarouselCounter(activeIndex, sections.length)}
      </header>
      <div class="industry-country-metrics">
        ${(country.metrics || []).map(renderIndustryMetric).join("")}
      </div>
      ${renderIndustryCarousel(carouselId, sections, renderIndustryCountryBlockSlide, activeIndex, "is-country-block")}
      ${country.implication ? `<strong class="industry-implication">${escapeHtml(country.implication)}</strong>` : ""}
    </article>
  `;
}

function renderIndustryCountryBlockSlide(section) {
  if (section.kind === "report") {
    return renderIndustryReportSlide(section.slide);
  }
  return `
    <article class="industry-country-mini-slide">
      ${renderIndustryFlowCard(section, "is-country")}
    </article>
  `;
}

function renderIndustryFlowCard(card, className = "") {
  const kpis = card.kpis || [];
  return `
    <article class="industry-flow-card ${escapeAttr(className)}">
      <span class="flow-eyebrow">${escapeHtml(card.eyebrow || "")}</span>
      <h5>${escapeHtml(card.heading || "")}</h5>
      ${kpis.length ? `<div class="industry-flow-kpis">${kpis.map((kpi) => `<span>${escapeHtml(kpi)}</span>`).join("")}</div>` : ""}
      ${card.steps?.length ? renderIndustryFlow(card.steps) : ""}
    </article>
  `;
}

function renderIndustryFlow(steps) {
  return `
    <ol class="industry-flow">
      ${steps.map((step) => `
        <li>
          <span>${escapeHtml(step.label || step)}</span>
          ${step.detail ? `<strong>${escapeHtml(step.detail)}</strong>` : ""}
        </li>
      `).join("")}
    </ol>
  `;
}

function industryBrandReport(categoryId) {
  return data.catalog.industryBrandReports?.[categoryId] || null;
}

function idFromText(value) {
  const fallback = "section";
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function renderMarketStructureModule(categoryId, structureBrands, period) {
  const report = marketStructureReport(categoryId);
  if (report) {
    const selected = selectedStructureMarket(categoryId, report);
    return `
      <section class="module-block">
        <div class="module-head">
          <span>Market Module</span>
          <h2>${escapeHtml(report.title)}</h2>
        </div>
        ${renderMarketStructureOverview(report)}
        <div class="structure-report-layout">
          <div class="structure-country-grid">
            ${report.markets.map((market) => renderMarketCountryCard(categoryId, market, report, selected)).join("")}
          </div>
          ${renderMarketStructureDetail(selected, report)}
        </div>
      </section>
    `;
  }
  return `
    <section class="module-block">
      <div class="module-head">
        <span>Market Module</span>
        <h2>${modeledText("Market Structure")}</h2>
      </div>
      <div class="chart-grid">
        ${chartShell("structurePowerTrendPlot", modeledText("Power Segment Structure"), "stacked share")}
        ${chartShell("structurePowerPortHeatmap", modeledText("Power × Port Distribution"), period)}
        <div class="chart-shell">
          <div class="chart-title">
            <strong>${escapeHtml(modeledText("Price Band × Power Structure"))}</strong>
            <select class="inline-select" data-action="structure-brand">
              ${structureBrands.map((brand) => `<option value="${escapeAttr(brand)}" ${brand === state.structureBrand[categoryId] ? "selected" : ""}>${escapeHtml(brand)}</option>`).join("")}
            </select>
          </div>
          <div id="structurePricePowerPlot" class="plot"></div>
        </div>
        ${chartShell("structureScenarioPlot", modeledText("Use Case Split"), period)}
      </div>
    </section>
  `;
}

function renderMarketStructureOverview(report) {
  const overview = report.overview;
  if (!overview) return "";
  const metrics = overview.metrics || [];
  const conclusions = overview.conclusions || overview.sections || [];
  return `
    <section class="structure-overview">
      <div class="structure-overview-copy">
        <span>${escapeHtml(overview.eyebrow || "Report Summary")}</span>
        <h3>${escapeHtml(overview.heading || "Global Market Summary")}</h3>
        ${overview.subtitle ? `<p class="structure-overview-subtitle">${escapeHtml(overview.subtitle)}</p>` : ""}
        <p>${escapeHtml(overview.body || "")}</p>
      </div>
      ${metrics.length ? `
        <div class="structure-overview-metrics">
          ${metrics.map((metric) => `
            <div>
              <span>${escapeHtml(metric.label)}</span>
              <strong>${escapeHtml(metric.value)}</strong>
              ${metric.note ? `<em>${escapeHtml(metric.note)}</em>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
      ${overview.trend ? `
        <article class="structure-trend-panel">
          <div>
            <span>${escapeHtml(overview.trend.eyebrow || "Trend")}</span>
            <h4>${escapeHtml(overview.trend.title || "Market Size Trend")}</h4>
            ${overview.trend.note ? `<p>${escapeHtml(overview.trend.note)}</p>` : ""}
          </div>
          <div id="globalMarketSizeTrendPlot" class="plot global-market-size-plot"></div>
        </article>
      ` : ""}
      ${conclusions.length ? `
        <div class="structure-conclusion-grid">
          ${conclusions.map((section, index) => {
            const number = String(index + 1).padStart(2, "0");
            const charts = section.charts || (section.chart ? [section.chart] : []);
            return `
            <details class="structure-conclusion-card">
              <summary class="structure-conclusion-summary">
                <span>${number}</span>
                <div>
                  <h4>${escapeHtml(section.title)}</h4>
                  ${section.summaryPoints?.length ? `<ol class="structure-conclusion-summary-points">${section.summaryPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ol>` : `<p>${escapeHtml(section.body)}</p>`}
                </div>
                <em>Details</em>
              </summary>
              <div class="structure-conclusion-detail">
                <div class="structure-conclusion-copy">
                ${section.points?.length ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : ""}
                </div>
                ${charts.length ? `<div class="structure-conclusion-charts">${charts.map((chart, chartIndex) => renderStructurePlotPanel(chart, `${idFromText(section.title)}-${chartIndex}`)).join("")}</div>` : ""}
              </div>
            </details>
          `;}).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

function renderStructurePlotPanel(chart, chartId) {
  const legendSide = chart.legendSide === "left" || chart.legendSide === "right" ? chart.legendSide : null;
  const legendTotal = (chart.items || []).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const legend = legendSide ? `
    <div class="structure-chart-legend" aria-label="${escapeAttr(chart.title || "Chart")} legend">
      ${(chart.items || []).map((item, index) => `
        <div class="structure-chart-legend-item">
          <i style="--legend-color:${escapeAttr(structureChartColor(index))}"></i>
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.valueLabel || fmtExactNumber(item.value))} · ${legendTotal ? ((Number(item.value) || 0) / legendTotal * 100).toFixed(2) : "0.00"}%</span>
            ${item.description ? `<small>${escapeHtml(item.description)}</small>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  ` : "";
  return `
    <div class="structure-mini-chart structure-plot-panel ${legendSide ? `has-side-legend legend-${legendSide}` : ""}">
      <div class="structure-mini-chart-head">
        <strong>${escapeHtml(chart.title || "Share")}</strong>
        <span>${escapeHtml(chart.center || "Selected period")}</span>
      </div>
      <div class="structure-pie-layout">
        ${legendSide === "left" ? legend : ""}
        <div id="structurePlot-${escapeAttr(chartId)}" class="plot structure-pie-plot"></div>
        ${legendSide === "right" ? legend : ""}
      </div>
    </div>
  `;
}

function renderStructureVerticalChart(chart) {
  const items = chart.items || [];
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return `
    <div class="structure-vertical-chart" aria-label="${escapeAttr(chart.title || "Trend chart")}">
      ${items.map((item) => {
        const height = `${Math.max(4, ((Number(item.value) || 0) / max) * 100)}%`;
        return `
          <div class="structure-vertical-bar">
            <span style="height:${escapeAttr(height)}"></span>
            <strong>${escapeHtml(item.label)}</strong>
            <em>${escapeHtml(item.valueLabel || fmtExactNumber(item.value))}</em>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderStructureMiniChart(chart) {
  const items = chart.items || [];
  if (!items.length) return "";
  if (chart.type === "donut") return renderStructureDonutChart(chart, items);
  if (chart.type === "stacked") return renderStructureStackedChart(chart, items);
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return `
    <div class="structure-mini-chart">
      <div class="structure-mini-chart-head">
        <strong>${escapeHtml(chart.title || "Chart")}</strong>
        ${chart.note ? `<span>${escapeHtml(chart.note)}</span>` : ""}
      </div>
      <div class="structure-mini-bars">
        ${items.map((item) => {
          const width = `${Math.max(3, ((Number(item.value) || 0) / max) * 100)}%`;
          return `
            <div class="structure-mini-row">
              <div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.valueLabel || fmtWholePercent(item.value))}</strong></div>
              <i><b style="width:${escapeAttr(width)}"></b></i>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderStructureDonutChart(chart, items) {
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
  let cursor = 0;
  const segments = items.map((item, index) => {
    const start = cursor;
    const end = cursor + ((Number(item.value) || 0) / total) * 100;
    cursor = end;
    return `${structureChartColor(index)} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });
  return `
    <div class="structure-mini-chart">
      <div class="structure-mini-chart-head">
        <strong>${escapeHtml(chart.title || "Share")}</strong>
        ${chart.note ? `<span>${escapeHtml(chart.note)}</span>` : ""}
      </div>
      <div class="structure-donut-wrap">
        <div class="structure-donut" style="background: conic-gradient(${escapeAttr(segments.join(", "))})">
          <span>${escapeHtml(chart.center || "Share")}</span>
        </div>
        <div class="structure-stack-legend">
          ${items.map((item, index) => `<span><i style="background:${escapeAttr(structureChartColor(index))}"></i>${escapeHtml(item.label)} <strong>${escapeHtml(item.valueLabel || fmtWholePercent(item.value))}</strong></span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderStructureStackedChart(chart, items) {
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
  return `
    <div class="structure-mini-chart">
      <div class="structure-mini-chart-head">
        <strong>${escapeHtml(chart.title || "Share")}</strong>
        ${chart.note ? `<span>${escapeHtml(chart.note)}</span>` : ""}
      </div>
      <div class="structure-stacked-bar">
        ${items.map((item, index) => {
          const width = `${Math.max(3, ((Number(item.value) || 0) / total) * 100)}%`;
          return `<span style="width:${escapeAttr(width)}; background:${escapeAttr(structureChartColor(index))}"></span>`;
        }).join("")}
      </div>
      <div class="structure-stack-legend">
        ${items.map((item, index) => `<span><i style="background:${escapeAttr(structureChartColor(index))}"></i>${escapeHtml(item.label)} <strong>${escapeHtml(item.valueLabel || fmtWholePercent(item.value))}</strong></span>`).join("")}
      </div>
    </div>
  `;
}

function structureChartColor(index) {
  const colors = ["#e2231a", "#861f18", "#f08b82", "#232733", "#6b7280", "#d16a5e"];
  return colors[index % colors.length];
}

function selectedStructureMarket(categoryId, report) {
  const selectedCode = state.structureMarket[categoryId];
  return report.markets.find((market) => market.code === selectedCode) || report.markets[0];
}

function renderMarketCountryCard(categoryId, market, report, selected) {
  const topDemand = topMarketMetric(market, report.demandMetrics);
  const topChannel = topMarketMetric(market, report.channelMetrics);
  const cardMetrics = market.cardMetrics || [
    { label: "Sample", value: fmtExactNumber(market.sample) },
    { label: "Self-purchased", value: fmtWholePercent(market.selfPurchased) },
    { label: "Mean price", value: fmtExactCurrency(market.meanPrice) },
  ];
  const cardNote = market.cardNote || `${topDemand.label} ${fmtWholePercent(topDemand.value)} · ${topChannel.label} ${fmtWholePercent(topChannel.value)}`;
  const active = selected?.code === market.code ? "is-active" : "";
  return `
    <button class="structure-country-card ${active}" type="button" data-action="structure-market" data-market-code="${escapeAttr(market.code)}" data-category="${escapeAttr(categoryId)}">
      <span class="tag">${escapeHtml(market.code)}</span>
      <span class="structure-country-name">${escapeHtml(market.label)}</span>
      <span class="structure-card-metrics">
        ${cardMetrics.map((metric) => `<span><strong>${escapeHtml(metric.value)}</strong><em>${escapeHtml(metric.label)}</em></span>`).join("")}
      </span>
      <span class="structure-card-note">${escapeHtml(cardNote)}</span>
    </button>
  `;
}

function renderMarketStructureDetail(market, report) {
  const topDemand = topMarketMetric(market, report.demandMetrics);
  const secondDemand = rankedMarketMetrics(market, report.demandMetrics)[1] || topDemand;
  const topChannel = topMarketMetric(market, report.channelMetrics);
  const industryNotes = relatedIndustryNotes(report, market);
  const story = market.story || {};
  const hasInsightLayout = market.insights?.length || market.charts?.length;
  return `
    <article class="structure-report-detail">
      <header class="structure-report-head">
        <div>
          <span class="tag">${escapeHtml(market.code)}</span>
          <h3>${escapeHtml(market.label)} Market Reading</h3>
          <p>${escapeHtml(market.note)}</p>
        </div>
        <div class="structure-report-kpis">
          <div><span>Sample</span><strong>${fmtExactNumber(market.sample)}</strong></div>
          <div><span>Buyer Base</span><strong>${fmtExactNumber(market.buyerBase)}</strong></div>
          <div><span>Feature Base</span><strong>${fmtExactNumber(market.featureBase)}</strong></div>
          <div><span>Mean Price</span><strong>${fmtExactCurrency(market.meanPrice)}</strong></div>
        </div>
      </header>

      ${hasInsightLayout ? renderMarketCountryInsights(market) : `
        <section class="structure-story-grid">
          <div>
            <h4>Market Behavior</h4>
            <p>${escapeHtml(story.behavior || marketBehaviorText(market, topChannel))}</p>
          </div>
          <div>
            <h4>Demand Signal</h4>
            <p>${escapeHtml(story.demand || marketDemandText(market, topDemand, secondDemand))}</p>
          </div>
          <div>
            <h4>Portfolio Implication</h4>
            <p>${escapeHtml(story.implication || marketImplicationText(market, report, topDemand, topChannel))}</p>
          </div>
        </section>
      `}

      <section class="structure-metric-section">
        <div>
          <h4>Demand Priorities</h4>
          ${renderReportMetricRows(market, report.demandMetrics)}
        </div>
        <div>
          <h4>Purchase Channels</h4>
          ${renderReportMetricRows(market, report.channelMetrics)}
        </div>
      </section>

      <section class="structure-industry-notes">
        <h4>Industry Context</h4>
        ${industryNotes.length ? industryNotes.map(renderIndustryNote).join("") : `<p>No additional country context is configured for this market block.</p>`}
      </section>
    </article>
  `;
}

function renderMarketCountryInsights(market) {
  return `
    <section class="structure-country-insights">
      <div class="structure-insight-copy">
        <h4>Key Conclusions</h4>
        <ol>
          ${(market.insights || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>
      <div class="structure-country-chart-grid">
        ${(market.charts || []).map(renderStructureMiniChart).join("")}
      </div>
    </section>
  `;
}

function renderReportMetricRows(market, metrics) {
  return `
    <div class="structure-metric-list">
      ${rankedMarketMetrics(market, metrics)
        .map(
          (metric) => `
            <div class="structure-metric-row" style="--value:${Math.max(0, Math.min(100, metric.value))}%">
              <div><span>${escapeHtml(metric.label)}</span><strong>${fmtWholePercent(metric.value)}</strong></div>
              <i></i>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderIndustryNote(item) {
  return `
    <article class="structure-note">
      <strong>${escapeHtml(item.country)} · ${escapeHtml(item.headline)}</strong>
      <p>${escapeHtml(item.metrics)}</p>
    </article>
  `;
}

function marketStructureReport(categoryId) {
  return data.catalog.marketStructureReports?.[categoryId] || null;
}

function rankedMarketMetrics(market, metrics) {
  return (metrics || [])
    .map((metric) => ({ ...metric, value: market[metric.field] || 0 }))
    .sort((a, b) => b.value - a.value);
}

function topMarketMetric(market, metrics) {
  return rankedMarketMetrics(market, metrics)[0] || { label: "N/A", value: 0 };
}

function relatedIndustryNotes(report, market) {
  const map = {
    "US": ["USA"],
    "JP": ["Japan"],
    "DE+UK+SE": ["UK"],
    "IN": ["India"],
    "BR+MEX": ["Brazil/Mexico"],
    "SA": ["SA"],
  };
  const targets = map[market.code] || [];
  return (report.industryCountries || []).filter((item) => targets.includes(item.country));
}

function marketBehaviorText(market, topChannel) {
  return `Self-purchased buyers represent ${fmtWholePercent(market.selfPurchased)} of respondents, with a mean purchase price of ${fmtExactCurrency(market.meanPrice)}. The leading channel is ${topChannel.label.toLowerCase()} at ${fmtWholePercent(topChannel.value)}, so channel execution should match local buying behavior instead of using one global route-to-market.`;
}

function marketDemandText(market, topDemand, secondDemand) {
  return `${topDemand.label} is the strongest stated feature priority at ${fmtWholePercent(topDemand.value)}, followed by ${secondDemand.label.toLowerCase()} at ${fmtWholePercent(secondDemand.value)}. The report suggests messaging should focus on concrete product utility rather than broad accessory positioning.`;
}

function marketImplicationText(market, report, topDemand, topChannel) {
  const categoryPhrase = report.title.toLowerCase().includes("power bank") ? "power bank portfolio" : "adapter portfolio";
  return `For the ${categoryPhrase}, ${market.label} should be treated as a distinct market block: prioritize ${topDemand.label.toLowerCase()} claims, keep price architecture close to the ${fmtExactCurrency(market.meanPrice)} observed mean, and support the ${topChannel.label.toLowerCase()} path with matching product content.`;
}

function renderCompetitiveAnalysis(categoryId) {
  const report = industryBrandReport(categoryId);
  return `
    <div class="view-stack">
      <section class="competitor-analysis-part">
        <div class="module-head">
          <span>Company Profiles</span>
          <h2>Company Profiles</h2>
          <p>Review the companies shaping the ${escapeHtml(indexes.categories.get(categoryId)?.label || "category")} market. Select a company module to open its detailed positioning, strategy, and representative products.</p>
        </div>
        ${report?.brands?.length ? `<div class="company-profile-grid">${report.brands.map(renderCompanyProfileCard).join("")}</div>` : renderCompanyProfileEmpty(categoryId)}
      </section>
    </div>
  `;
}

function renderCompanyProfileCard(brand) {
  const details = [
    brand.strategy?.length ? renderCompanyDetailGroup("Strategic Focus", brand.strategy) : "",
    brand.portfolio?.length ? renderCompanyDetailGroup("Portfolio Architecture", brand.portfolio) : "",
    brand.pricing?.length ? renderCompanyDetailGroup("Pricing and Promotion", brand.pricing) : "",
    brand.countries?.length ? renderCompanyCountryDetails(brand.countries) : "",
    brand.products?.length ? renderCompanyProducts(brand.products) : "",
  ].filter(Boolean).join("");
  return `
    <details class="company-profile-card">
      <summary>
        <img class="company-logo-image" src="${escapeAttr(brandLogoPath(brand))}" alt="${escapeAttr(brand.brand)} logo" loading="lazy">
        <span class="company-profile-summary">
          <span class="tag">${escapeHtml(brand.role || "Market Participant")}</span>
          <strong>${escapeHtml(brand.brand)}</strong>
          <span>${escapeHtml(brand.summary || "Company profile available in the category report.")}</span>
        </span>
        <span class="company-profile-caret" aria-hidden="true">+</span>
      </summary>
      <div class="company-profile-detail">
        ${brand.metrics?.length ? `<div class="company-profile-metrics">${brand.metrics.map(renderIndustryMetric).join("")}</div>` : ""}
        ${details || `<p class="product-meta">No additional company detail is loaded for this category.</p>`}
      </div>
    </details>
  `;
}

function brandLogoPath(brand) {
  const key = idFromText(brand?.brand);
  return `assets/brands/${["anker", "baseus", "ugreen"].includes(key) ? key : "generic"}.svg`;
}

function renderCompanyDetailGroup(title, items) {
  return `
    <section class="company-detail-group">
      <h4>${escapeHtml(title)}</h4>
      <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderCompanyCountryDetails(countries) {
  return `
    <section class="company-detail-group company-country-details">
      <h4>Country Strategy</h4>
      <div class="company-country-list">
        ${countries.map((country) => `
          <article>
            <header><strong>${escapeHtml(country.market)}</strong><span>${escapeHtml(country.model || "")}</span></header>
            ${(country.metrics || []).length ? `<div class="company-country-metrics">${country.metrics.map(renderIndustryMetric).join("")}</div>` : ""}
            <ul>${(country.strategy || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            ${country.implication ? `<p>${escapeHtml(country.implication)}</p>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompanyProducts(products) {
  return `
    <section class="company-detail-group">
      <h4>Representative Products</h4>
      <div class="company-product-list">
        ${products.map((product) => `
          <article class="company-product-item">
            <a class="company-product-image" href="${escapeAttr(product.productUrl || product.amazonUrl || "#")}" target="_blank" rel="noreferrer">
              <img src="${escapeAttr(product.imageUrl || "")}" alt="${escapeAttr(product.name)}" loading="lazy">
            </a>
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <span>${escapeHtml(product.price || "Price varies")}</span>
              <p>${escapeHtml(product.positioning || "")}</p>
              <div class="company-product-links">
                ${product.productUrl ? `<a href="${escapeAttr(product.productUrl)}" target="_blank" rel="noreferrer">Official site</a>` : ""}
                ${product.amazonUrl ? `<a href="${escapeAttr(product.amazonUrl)}" target="_blank" rel="noreferrer">Amazon</a>` : ""}
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompanyProfileEmpty(categoryId) {
  return `<div class="empty-state"><div><h3>No company profiles loaded</h3><p>Company-level profiles are not yet configured for ${escapeHtml(indexes.categories.get(categoryId)?.label || "this category")}.</p></div></div>`;
}

function selectedCompetitorLenovoProduct(categoryId, products) {
  const current = state.competitorLenovoProduct[categoryId];
  const selected = products.find((product) => product.id === current) || products[0];
  state.competitorLenovoProduct[categoryId] = selected?.id;
  return selected;
}

function selectedCompetitorCountry(categoryId) {
  const current = state.competitorCountry[categoryId];
  const selected = competitorCountries.find((country) => country.code === current) || competitorCountries[0];
  state.competitorCountry[categoryId] = selected.code;
  return selected;
}

function competitorRowsForSelection(categoryId, productId, countryCode) {
  return (data.competitorProducts || [])
    .filter((row) => row.categoryId === categoryId && row.lenovoProductId === productId && row.countryCode === countryCode)
    .sort((a, b) => (b.metrics?.monthlyRevenue || 0) - (a.metrics?.monthlyRevenue || 0));
}

function summarizeCompetitorRows(rows, lenovoProduct) {
  const monthlyUnits = rows.reduce((sum, row) => sum + (row.metrics?.monthlyUnits || 0), 0);
  const monthlyRevenue = rows.reduce((sum, row) => sum + (row.metrics?.monthlyRevenue || 0), 0);
  const reviewWeight = rows.reduce((sum, row) => sum + (row.metrics?.reviewCount || 0), 0);
  const rating = reviewWeight ? rows.reduce((sum, row) => sum + (row.metrics?.rating || 0) * (row.metrics?.reviewCount || 0), 0) / reviewWeight : 0;
  const aur = monthlyUnits ? monthlyRevenue / monthlyUnits : 0;
  const priceIndexRows = rows.filter((row) => row.metrics?.rsp && lenovoProduct?.listPrice);
  const priceIndex = priceIndexRows.length ? avg(priceIndexRows.map((row) => row.metrics.rsp / lenovoProduct.listPrice)) : 0;
  return { monthlyUnits, monthlyRevenue, aur, rating, priceIndex };
}

function renderCompetitorKpi(label, value, note) {
  return `
    <div class="competitor-kpi">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(note)}</small>
    </div>
  `;
}

function renderCompetitorLenovoContext(product) {
  const rows = data.productMetrics.filter((row) => row.modelId === product.id && rowInSelectedPeriod(row));
  const summary = summarizeProductRows(rows);
  const attrs = product.attributes || {};
  const specs = product.categoryId === "adapter"
    ? [`${attrs.wattage || "—"}W`, `${attrs.ports || "—"} ports`, attrs.compatibility || "—"]
    : product.categoryId === "power_bank"
      ? [`${attrs.outputW || "—"}W`, attrs.capacityBand || "—", attrs.compatibility || "—"]
      : [`${attrs.powerW || "—"}W`, attrs.lengthBand || "—", attrs.retractable || "—"];
  return `
    <article class="competitor-lenovo-context">
      <div class="competitor-lenovo-image">
        <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" loading="lazy" />
      </div>
      <div>
        <span class="tag">Lenovo reference product</span>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${specs.map(escapeHtml).join(" · ")}</p>
        <div class="mini-metrics">
          <div><span>RSP</span><strong>${fmtExactCurrency(product.listPrice)}</strong></div>
          <div><span>Order_Qty</span><strong>${fmtExactNumber(summary.orderQty || summary.unitsNet)}</strong></div>
          <div><span>Order_Rev</span><strong>${fmtExactCurrency(summary.orderRevenue || summary.revenueNet)}</strong></div>
        </div>
      </div>
    </article>
  `;
}

function renderMarketplaceCompetitorCard(row, lenovoProduct) {
  const metrics = row.metrics || {};
  const specs = row.specs || {};
  const priceIndex = metrics.rsp && lenovoProduct?.listPrice ? metrics.rsp / lenovoProduct.listPrice : 0;
  const portDelta = Number.isFinite(specs.totalPorts - (lenovoProduct.attributes?.ports || 0)) ? specs.totalPorts - (lenovoProduct.attributes?.ports || 0) : null;
  return `
    <article class="marketplace-competitor-card">
      <div class="marketplace-competitor-image">
        <img src="${escapeAttr(row.image)}" alt="${escapeAttr(row.productName)}" loading="lazy" />
      </div>
      <div class="marketplace-competitor-body">
        <header>
          <div>
            <span class="tag">${escapeHtml(row.country)} · ${escapeHtml(row.platform)}</span>
            <h3>${escapeHtml(row.productName)}</h3>
            <p>${escapeHtml(row.title)}</p>
          </div>
          <a class="ghost-button compact-button" href="${escapeAttr(row.productUrl)}" target="_blank" rel="noreferrer">Source</a>
        </header>

        <div class="competitor-boss-grid">
          ${renderBossMetric("Price Index", priceIndex ? `${(priceIndex * 100).toFixed(1)}%` : "—", `Lenovo RSP ${fmtExactCurrency(lenovoProduct.listPrice)}`)}
          ${renderBossMetric("RSP / AUR", `${fmtExactCurrency(metrics.rsp)} / ${fmtExactCurrency(metrics.aur)}`, "marketplace price")}
          ${renderBossMetric("Monthly Sales", fmtExactNumber(metrics.monthlyUnits), `${formatSignedPercent(metrics.unitsMomGrowth)} MoM`)}
          ${renderBossMetric("Monthly Revenue", fmtExactCurrency(metrics.monthlyRevenue), "sales velocity")}
          ${renderBossMetric("Rating / Reviews", `${Number(metrics.rating || 0).toFixed(1)} / ${fmtExactNumber(metrics.reviewCount)}`, `${fmtExactNumber(metrics.monthlyNewReviews)} new reviews`)}
          ${renderBossMetric("BSR", fmtExactNumber(metrics.subBsr), metrics.subCategory || "subcategory")}
        </div>

        <div class="competitor-detail-grid">
          <div>
            <h4>Product Parameters</h4>
            <ul>
              <li>${fmtExactNumber(specs.wattageW)}W · ${fmtExactNumber(specs.totalPorts)} total ports ${portDelta === null ? "" : `(${portDelta >= 0 ? "+" : ""}${portDelta} vs Lenovo)`}</li>
              <li>${escapeHtml(specs.connectorType || "—")} · ${escapeHtml(specs.color || "—")}</li>
              <li>${escapeHtml(specs.specialFeature || "—")}</li>
              <li>${escapeHtml(metrics.productSize || "—")}</li>
            </ul>
          </div>
          <div>
            <h4>Channel / Seller</h4>
            <ul>
              <li>BuyBox: ${escapeHtml(metrics.buyBoxSeller || "—")} · ${escapeHtml(metrics.buyBoxType || "—")}</li>
              <li>Sellers: ${fmtExactNumber(metrics.sellerCount)} · FBA fee ${fmtExactCurrency(metrics.fbaFee)}</li>
              <li>Gross margin: ${fmtPercent(metrics.grossMargin)} · LQS ${Number(metrics.lqs || 0).toFixed(1)}</li>
              <li>Launch: ${escapeHtml(metrics.launchDate || "—")} · ${fmtExactNumber(metrics.daysOnMarket)} days</li>
            </ul>
          </div>
        </div>

        <footer>
          ${(row.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          <span class="product-meta">${escapeHtml(row.source.dataProvider)} · ${escapeHtml(row.source.sourceDate)} · ${escapeHtml(row.dataConfidence)}</span>
        </footer>
      </div>
    </article>
  `;
}

function renderBossMetric(label, value, note) {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(note || "")}</small>
    </div>
  `;
}

function renderCompetitorEmptyState(product, country) {
  return `
    <section class="empty-state competitor-empty-state">
      <div>
        <h3>No marketplace competitor loaded for ${escapeHtml(product.name)} in ${escapeHtml(country.label)}</h3>
        <p>The comparison framework is ready for this market. Add 1-2 mainstream ecommerce exports with image, RSP, AUR, monthly sales, revenue, rating, BSR, seller, and product parameters.</p>
        <p class="product-meta">Target platforms: ${escapeHtml(country.platforms)}</p>
      </div>
    </section>
  `;
}

function renderCategoryOverview(categoryId) {
  const visibleProducts = getFilteredProducts(categoryId);
  const selectedIds = getSelectedModelIds(categoryId, visibleProducts);
  const metricRows = data.productMetrics.filter((row) => row.categoryId === categoryId && selectedIds.includes(row.modelId));
  const latestRows = metricRows.filter((row) => rowInSelectedPeriod(row));
  const latestSummary = summarizeProductRows(latestRows);
  return `
    <div class="view-stack category-overview-stack">
      ${renderCategoryFilters(categoryId, { compact: true })}
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>Product Summary</h2>
        </div>
        ${renderProductMatrix(categoryId, visibleProducts, selectedIds, latestSummary)}
      </section>
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>Product Performance</h2>
          <p>Compare product contribution, revenue, quantity, geo, and country performance under the selected filters.</p>
        </div>
        ${renderProductPerformanceMatrix(categoryId, visibleProducts, selectedIds)}
      </section>
    </div>
  `;
}

function renderProductMatrix(categoryId, visibleProducts, selectedIds, latestSummary) {
  const productIds = selectedIds.length ? selectedIds : visibleProducts.map((product) => product.id);
  const summaries = getProductLatestSummaries(categoryId, productIds);
  const main = summaries.slice().sort((a, b) => b.summary.orderRevenue - a.summary.orderRevenue)[0];
  const volume = summaries.slice().sort((a, b) => b.summary.orderQty - a.summary.orderQty)[0];
  const backlog = summaries.slice().sort((a, b) => b.summary.backlogRevenue - a.summary.backlogRevenue)[0];
  const cards = [
    ["Order_Rev Leader", main, "highest Order_Rev"],
    ["Order_Qty Leader", volume, "highest Order_Qty"],
    ["Bklg_Rev Watch", backlog, "highest Bklg_Rev"],
  ];

  return `
    <section class="product-matrix">
      ${renderSummaryKpiGrid(categoryId, productIds, latestSummary)}
      <div class="matrix-card-grid">
        ${cards.map(([badge, item, note]) => renderMatrixHighlightCard(badge, item, note)).join("")}
      </div>
      <section class="chart-grid product-summary-trends">
        ${chartShellWithControls(
          "categorySalesPlot",
          `${flowMetricConfig(state.summaryQuantityTrendMetric).quantityLabel} Trend`,
          "",
          renderMetricSelect("summary-quantity-trend-metric", state.summaryQuantityTrendMetric, flowMetricOptions),
        )}
        ${chartShellWithControls(
          "categoryRevenuePlot",
          `${flowMetricConfig(state.summaryRevenueTrendMetric).revenueLabel} Trend`,
          "",
          renderMetricSelect("summary-revenue-trend-metric", state.summaryRevenueTrendMetric, flowMetricOptions),
        )}
      </section>
      ${renderProductBrowser(visibleProducts, selectedIds)}
    </section>
  `;
}

function renderProductPerformanceMatrix(categoryId, visibleProducts, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : visibleProducts.map((product) => product.id);
  const selectedGeo = state.summarySelectedGeo[categoryId];
  return `
    <section class="product-matrix">
      <div class="chart-grid">
        ${chartShellWithControls(
          "matrixRevenueSharePlot",
          "Product Revenue Contribution",
          selectedPeriod(),
          renderMetricSelect("summary-revenue-metric", state.summaryRevenueMetric, revenueMetricOptions),
        )}
        ${chartShellWithControls(
          "matrixUnitSharePlot",
          "Product Quantity Contribution",
          selectedPeriod(),
          renderMetricSelect("summary-quantity-metric", state.summaryQuantityMetric, quantityMetricOptions),
        )}
        ${chartShellWithControls(
          "matrixGeoUnitsPlot",
          `Geo ${flowMetricLabel(state.summaryGeoMetric)} Revenue + Quantity by Product`,
          "click a geo to filter country chart",
          `${renderMetricSelect("summary-geo-metric", state.summaryGeoMetric, flowMetricOptions)}
          ${renderProductCheckboxList("summary-geo-product-toggle", categoryId, visibleProducts, getSummaryProductIds("summaryGeoProducts", categoryId, productIds))}`,
          true,
        )}
        ${chartShellWithControls(
          "matrixCountryUnitsPlot",
          `Country ${flowMetricLabel(state.summaryCountryMetric)} Revenue + Quantity by Product`,
          selectedGeo ? `Geo: ${displayLocationLabel(selectedGeo)}` : "all geos",
          `${renderMetricSelect("summary-country-metric", state.summaryCountryMetric, flowMetricOptions)}
          ${renderProductCheckboxList("summary-country-product-toggle", categoryId, visibleProducts, getSummaryProductIds("summaryCountryProducts", categoryId, productIds))}
          ${selectedGeo ? `<button class="ghost-button compact-button" type="button" data-action="clear-summary-geo">All Geo</button>` : ""}`,
          true,
        )}
      </div>
    </section>
  `;
}

function renderProductBrowser(visibleProducts, selectedIds) {
  return `
    <section class="product-browser product-browser-full">
      <section class="product-list product-list-full">
        <div class="product-list-head">
          <div>
            <h3>Products</h3>
            <span class="product-meta">${visibleProducts.length} visible · ${selectedIds.length} charted</span>
          </div>
          <div class="toolbar-group product-list-tools">
            <input type="search" value="${escapeAttr(state.search)}" placeholder="Search product" data-action="search-products" />
            <button class="solid-button" type="button" data-action="show-all-products">Show all</button>
            <button class="ghost-button" type="button" data-action="select-visible-models">Select visible</button>
          </div>
        </div>
        <div class="product-rows">
          ${visibleProducts.length ? visibleProducts.map((product) => renderProductRow(product, selectedIds)).join("") : renderEmptyProducts()}
        </div>
      </section>
    </section>
  `;
}

function renderSummaryKpiGrid(categoryId, productIds, latestSummary) {
  const currentPeriod = selectedPeriod();
  const previous = previousSelectedPeriod();
  const previousRows = previous
    ? data.productMetrics.filter((row) => row.categoryId === categoryId && productIds.includes(row.modelId) && periodKey(row.date, state.granularity) === previous)
    : [];
  const previousSummary = summarizeProductRows(previousRows);
  const metrics = [
    { field: "orderRevenue", label: "Order_Rev" },
    { field: "shipRevenue", label: "Ship_Rev" },
    { field: "orderQty", label: "Order_Qty" },
    { field: "shipQty", label: "Ship_Qty" },
  ];
  return `
    <div class="kpi-grid summary-kpi-grid">
      ${metrics.map(({ field, label }) => renderTrendKpi(label, summaryMetricValue(latestSummary, field), summaryMetricValue(previousSummary, field), field, currentPeriod, previous)).join("")}
    </div>
  `;
}

function renderTrendKpi(label, currentValue, previousValue, field, currentPeriod, previousPeriod) {
  const delta = currentValue - previousValue;
  const pct = previousValue ? delta / Math.abs(previousValue) : currentValue ? 1 : 0;
  const isUp = delta >= 0;
  return `
    <div class="kpi-tile trend-kpi">
      <span>${escapeHtml(label)}</span>
      <strong>${formatMetricValue(field, currentValue)}</strong>
      <small>${escapeHtml(currentPeriod)}</small>
      <div class="trend-line ${isUp ? "is-up" : "is-down"}">
        <span>${isUp ? "&uarr;" : "&darr;"} ${formatSignedPercent(pct)}</span>
        <em>vs ${escapeHtml(previousPeriod || "previous")}</em>
      </div>
    </div>
  `;
}

function renderMatrixHighlightCard(badge, item, note) {
  if (!item) return "";
  const product = item.product;
  const attrs = product.attributes;
  const subtitle = attrs.wattage ? `${attrs.wattage}W / ${(attrs.features || []).slice(0, 2).join(" / ")}` : attrs.outputW ? `${attrs.outputW}W / ${attrs.capacityBand}` : `${attrs.powerW}W / ${attrs.lengthBand}`;
  return `
    <article class="matrix-highlight">
      <span class="matrix-badge">${escapeHtml(badge)}</span>
      <h3>${escapeHtml(product.shortName)}</h3>
      <p>${escapeHtml(subtitle)}</p>
      <div class="mini-metrics matrix-metrics-two-row">
        <div><span>Order_Rev</span><strong>${fmtExactCurrency(item.summary.orderRevenue || item.summary.revenueNet)}</strong></div>
        <div><span>Ship_Rev</span><strong>${fmtExactCurrency(item.summary.shipRevenue)}</strong></div>
        <div><span>Bklg_Rev</span><strong>${fmtExactCurrency(item.summary.backlogRevenue)}</strong></div>
        <div><span>Order_Qty</span><strong>${fmtExactNumber(item.summary.orderQty || item.summary.unitsNet)}</strong></div>
        <div><span>Ship_Qty</span><strong>${fmtExactNumber(item.summary.shipQty)}</strong></div>
        <div><span>Bklg_Qty</span><strong>${fmtExactNumber(item.summary.backlogQty)}</strong></div>
      </div>
    </article>
  `;
}

function renderProductListPage(categoryId) {
  const category = indexes.categories.get(categoryId);
  const visibleProducts = getFilteredProducts(categoryId);
  return `
    <div class="view-stack">
      ${renderCategoryFilters(categoryId)}
      <section class="product-catalog">
        <div class="section-head">
          <div>
            <p class="eyebrow">Product List</p>
            <h2>Product List</h2>
          </div>
          <div class="toolbar-group product-list-tools">
            <input type="search" value="${escapeAttr(state.search)}" placeholder="Search product" data-action="search-products" />
            <button class="ghost-button" type="button" data-action="show-all-products">Show all</button>
          </div>
        </div>
        <div class="product-card-grid">
          ${visibleProducts.length ? visibleProducts.map((product) => renderProductCard(product)).join("") : renderEmptyProducts()}
        </div>
        <p class="product-meta">${visibleProducts.length} ${escapeHtml(category.label)} products matched.</p>
      </section>
    </div>
  `;
}

function productImageItems(product) {
  if (Array.isArray(product.images) && product.images.length) return product.images;
  return product.image ? [{ label: "", src: product.image }] : [];
}

function renderProductCard(product) {
  const latestRows = data.productMetrics.filter((row) => row.modelId === product.id && rowInSelectedPeriod(row));
  const summary = summarizeProductRows(latestRows);
  const attrs = product.attributes;
  const primarySpec = attrs.wattage ? `${attrs.wattage}W` : attrs.outputW ? `${attrs.capacityBand} / ${attrs.outputW}W` : `${attrs.lengthBand} / ${attrs.powerBand}`;
  const images = productImageItems(product);
  return `
    <article class="product-card">
      <button class="product-card-hit" type="button" data-route-category="${product.categoryId}" data-route-product="${product.id}">
        <div class="product-visual product-visual-${product.categoryId} ${images.length ? "has-image" : ""} ${images.length > 1 ? "has-multiple-images" : ""}">
          ${
            images.length > 1
              ? `<div class="product-image-pair">${images
                  .map(
                    (image) => `
                    <figure class="product-image-option">
                      <img src="${escapeAttr(image.src)}" alt="${escapeAttr(`${product.name} ${image.label}`.trim())}" loading="lazy" />
                      <figcaption>${escapeHtml(image.label)}</figcaption>
                    </figure>
                  `,
                  )
                  .join("")}</div>`
              : images[0]
                ? `<img src="${escapeAttr(images[0].src)}" alt="${escapeAttr(product.name)}" loading="lazy" />`
                : ""
          }
          <span class="product-spec-badge">${escapeHtml(primarySpec)}</span>
        </div>
        <div class="product-card-body">
          <span class="tag">${escapeHtml(primarySpec)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml((attrs.features || []).join(" / "))}</p>
          <div class="mini-metrics">
            <div><span>Order_Qty</span><strong>${fmtExactNumber(summary.orderQty || summary.unitsNet)}</strong></div>
            <div><span>Order_Rev</span><strong>${fmtCurrency(summary.orderRevenue || summary.revenueNet)}</strong></div>
            <div><span>Bklg_Rev</span><strong>${fmtCurrency(summary.backlogRevenue)}</strong></div>
          </div>
        </div>
      </button>
    </article>
  `;
}

function renderCategoryFilters(categoryId, options = {}) {
  const filters = data.catalog.filters[categoryId] || [];
  const compactClass = options.compact ? " is-compact" : "";
  return `
    <section class="filter-panel${compactClass}">
      <div class="section-head">
        <div>
          <p class="eyebrow">Filters</p>
          <h2>Category Filters</h2>
        </div>
        <button class="ghost-button" type="button" data-action="reset-category-filters">Reset</button>
      </div>
      <div class="filter-grid">
        ${filters.map((filter) => renderFilterSelect(categoryId, filter)).join("")}
      </div>
    </section>
  `;
}

function renderFilterSelect(categoryId, filter) {
  const values = data.catalog.filterValues[categoryId]?.[filter.id] || [];
  const selected = state.filters[categoryId]?.[filter.id] ?? "all";
  return `
    <div class="filter-group">
      <label for="filter-${filter.id}">${escapeHtml(filter.label)}</label>
      <select id="filter-${filter.id}" data-action="category-filter" data-filter-id="${filter.id}">
        <option value="all">All</option>
        ${values
          .map((value) => {
            const optionValue = String(value);
            const isSelected = String(selected) === optionValue ? "selected" : "";
            return `<option value="${escapeAttr(optionValue)}" ${isSelected}>${escapeHtml(labelValue(value))}</option>`;
          })
          .join("")}
      </select>
    </div>
  `;
}

function getProductLatestSummaries(categoryId, productIds) {
  const ids = productIds || data.catalog.products.filter((product) => product.categoryId === categoryId).map((product) => product.id);
  return ids
    .map((id) => {
      const product = indexes.products.get(id);
      const rows = data.productMetrics.filter((row) => row.modelId === id && rowInSelectedPeriod(row));
      return product ? { product, summary: summarizeProductRows(rows) } : null;
    })
    .filter(Boolean);
}

function getFastestGrowingProduct(categoryId) {
  const months = data.catalog.periods;
  const first = months[0];
  const latest = months.at(-1);
  const products = data.catalog.products.filter((product) => product.categoryId === categoryId);
  return products
    .map((product) => {
      const firstSummary = summarizeProductRows(data.productMetrics.filter((row) => row.modelId === product.id && row.date === first));
      const latestSummary = summarizeProductRows(data.productMetrics.filter((row) => row.modelId === product.id && row.date === latest));
      const growth = (latestSummary.unitsNet - firstSummary.unitsNet) / Math.max(1, firstSummary.unitsNet);
      return { product, growth, summary: latestSummary };
    })
    .sort((a, b) => b.growth - a.growth)[0];
}

function renderProductRow(product, selectedIds) {
  const latestRows = data.productMetrics.filter((row) => row.modelId === product.id && rowInSelectedPeriod(row));
  const summary = summarizeProductRows(latestRows);
  const checked = selectedIds.includes(product.id) ? "checked" : "";
  const attrs = product.attributes;
  const power = attrs.wattage ? `${attrs.wattage}W` : attrs.outputW ? `${attrs.outputW}W` : `${attrs.powerW}W`;
  return `
    <article class="product-row">
      <label class="checkline">
        <input type="checkbox" ${checked} data-action="toggle-model" data-model-id="${product.id}" />
        <span class="product-main">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(power)} · ${escapeHtml((attrs.features || []).slice(0, 3).join(" / "))}</span>
          <span class="tagline">${(product.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</span>
        </span>
      </label>
      <div>
        <span class="metric-label">Order_Qty</span>
        <strong>${fmtExactNumber(summary.orderQty || summary.unitsNet)}</strong>
      </div>
      <div>
        <span class="metric-label">Order_Rev</span>
        <strong>${fmtCurrency(summary.orderRevenue || summary.revenueNet)}</strong>
      </div>
      <button class="ghost-button" type="button" data-route-category="${product.categoryId}" data-route-product="${product.id}">Details</button>
    </article>
  `;
}

function renderEmptyProducts() {
  return `
    <section class="empty-state">
      <div>
        <h3>No products</h3>
        <p>Adjust filters to continue model comparison.</p>
      </div>
    </section>
  `;
}

function drawCategoryCharts(categoryId, selectedIds) {
  const categoryRows = data.productMetrics.filter((row) => row.categoryId === categoryId && selectedIds.includes(row.modelId));
  const periods = sortedPeriods(unique(categoryRows.map((row) => periodKey(row.date, state.granularity))));
  const products = selectedIds.map((id) => indexes.products.get(id)).filter(Boolean);
  const quantityTrendMetric = flowMetricConfig(state.summaryQuantityTrendMetric);
  const revenueTrendMetric = flowMetricConfig(state.summaryRevenueTrendMetric);

  const salesTraces = products.map((product, idx) => {
    const productRows = categoryRows.filter((row) => row.modelId === product.id);
    const byPeriod = aggregateProductRows(productRows, (row) => periodKey(row.date, state.granularity));
    return {
      x: periods,
      y: periods.map((period) => summaryMetricValue(byPeriod.get(period) || {}, quantityTrendMetric.quantityField)),
      name: product.shortName,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.4 },
    };
  });
  drawPlot("categorySalesPlot", salesTraces, { yaxis: { title: quantityTrendMetric.quantityLabel } });

  const revenueTraces = products.map((product, idx) => {
    const productRows = categoryRows.filter((row) => row.modelId === product.id);
    const byPeriod = aggregateProductRows(productRows, (row) => periodKey(row.date, state.granularity));
    return {
      x: periods,
      y: periods.map((period) => summaryMetricValue(byPeriod.get(period) || {}, revenueTrendMetric.revenueField)),
      name: product.shortName,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.4 },
    };
  });
  drawPlot("categoryRevenuePlot", revenueTraces, { yaxis: { title: revenueTrendMetric.revenueLabel, tickprefix: "$" } });

  const latest = selectedPeriod();
  const latestByModel = products.map((product) => ({
    product,
    summary: summarizeProductRows(categoryRows.filter((row) => row.modelId === product.id && periodKey(row.date, state.granularity) === latest)),
  }));
  drawPlot(
    "categoryFulfillmentPlot",
    [
      {
        x: latestByModel.map((item) => item.product.shortName),
        y: latestByModel.map((item) => item.summary.shipRevenue || 0),
        name: "Ship_Rev",
        type: "bar",
        marker: { color: indexes.categories.get(categoryId).accent },
      },
      {
        x: latestByModel.map((item) => item.product.shortName),
        y: latestByModel.map((item) => item.summary.backlogRevenue || 0),
        name: "Bklg_Rev",
        type: "bar",
        marker: { color: "#1f2328" },
      },
    ],
    { barmode: "stack", yaxis: { title: "Ship_Rev + Bklg_Rev", tickprefix: "$" } },
  );
  drawProductSharePie("categoryRevenueSharePlot", latestByModel, "orderRevenue", "Order_Rev");
  drawCategoryGeoUnitsChart("categoryGeoUnitsPlot", categoryId, selectedIds);
  drawCategoryCountryUnitsChart("categoryCountryUnitsPlot", categoryId, selectedIds);
}

function geoMetricRows({ categoryId = null, modelId = null, partNumber = null, segment = null, scope = "category", selectedIds = null } = {}) {
  return (data.geoMetrics || []).filter((row) => {
    if (categoryId && row.categoryId !== categoryId) return false;
    if (modelId && row.modelId !== modelId) return false;
    if (selectedIds && !selectedIds.includes(row.modelId)) return false;
    if (partNumber && partNumber !== "all" && row.partNumber !== partNumber) return false;
    if (segment && segment !== "all" && row.segment !== segment) return false;
    return rowInSelectedPeriod(row, scope);
  });
}

function sumGeoRows(rows, field) {
  return rows.reduce((sum, row) => sum + (row[field] || 0), 0);
}

function topGeoNames(rows, limit = 6) {
  return unique(rows.map((row) => row.geo || "Unassigned"))
    .map((geo) => ({ geo, value: sumGeoRows(rows.filter((row) => (row.geo || "Unassigned") === geo), "orderRevenue") }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => item.geo);
}

function topGeoNamesByMetric(rows, field = "orderQty", limit = 8) {
  return unique(rows.map((row) => row.geo || "Unassigned"))
    .map((geo) => ({ geo, value: sumGeoRows(rows.filter((row) => (row.geo || "Unassigned") === geo), field) }))
    .filter((item) => item.value)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => item.geo);
}

function topGeoNamesByUnits(rows, limit = 8) {
  return topGeoNamesByMetric(rows, "orderQty", limit);
}

function topCountryNamesByMetric(rows, field = "orderQty", limit = 8) {
  return unique(rows.map((row) => row.country || "Unassigned"))
    .map((country) => ({ country, value: sumGeoRows(rows.filter((row) => (row.country || "Unassigned") === country), field) }))
    .filter((item) => item.value)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => item.country);
}

function topCountryNamesByUnits(rows, limit = 8) {
  return topCountryNamesByMetric(rows, "orderQty", limit);
}

function displayLocationLabel(value) {
  const label = String(value || "Unassigned");
  if (["United States of America", "United States", "USA"].includes(label)) return "US";
  if (["United Kingdom of Great Britain and Northern Ireland", "United Kingdom", "Great Britain"].includes(label)) return "UK";
  return label;
}

function drawCategoryGeoChart(categoryId, selectedIds) {
  const rows = geoMetricRows({ categoryId, selectedIds });
  const geos = topGeoNames(rows);
  const products = selectedIds.map((id) => indexes.products.get(id)).filter(Boolean);
  const traces = products.map((product, idx) => ({
    x: geos.map(displayLocationLabel),
    customdata: geos,
    y: geos.map((geo) => sumGeoRows(rows.filter((row) => row.modelId === product.id && (row.geo || "Unassigned") === geo), "orderRevenue")),
    name: product.shortName,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  drawPlot("categoryGeoPlot", traces, { barmode: "stack", yaxis: { title: "Order_Rev", tickprefix: "$" } });
}

function drawCategoryGeoUnitsChart(id, categoryId, selectedIds, field = "orderQty", { interactive = false } = {}) {
  if (isFlowMetric(field)) {
    drawCategoryGeoFlowChart(id, categoryId, selectedIds, field, { interactive });
    return;
  }
  const rows = geoMetricRows({ categoryId, selectedIds });
  const geos = topGeoNamesByMetric(rows, field);
  const products = selectedIds.map((productId) => indexes.products.get(productId)).filter(Boolean);
  const traces = products.map((product, idx) => ({
    x: geos.map(displayLocationLabel),
    customdata: geos,
    y: geos.map((geo) => sumGeoRows(rows.filter((row) => row.modelId === product.id && (row.geo || "Unassigned") === geo), field)),
    name: product.shortName,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  const node = drawPlot(id, traces, { barmode: "stack", yaxis: { title: metricTitle(field) } });
  if (interactive && node?.on) {
    if (node.removeAllListeners) node.removeAllListeners("plotly_click");
    node.on("plotly_click", (eventData) => {
      const geo = eventData?.points?.[0]?.customdata || eventData?.points?.[0]?.x;
      if (!geo) return;
      state.summarySelectedGeo[categoryId] = geo;
      render();
    });
  }
}

function drawCategoryCountryUnitsChart(id, categoryId, selectedIds, field = "orderQty", { geo = null } = {}) {
  if (isFlowMetric(field)) {
    drawCategoryCountryFlowChart(id, categoryId, selectedIds, field, { geo });
    return;
  }
  const rows = geoMetricRows({ categoryId, selectedIds }).filter((row) => !geo || (row.geo || "Unassigned") === geo);
  const countries = topCountryNamesByMetric(rows, field);
  const products = selectedIds.map((productId) => indexes.products.get(productId)).filter(Boolean);
  const traces = products.map((product, idx) => ({
    x: countries.map(displayLocationLabel),
    customdata: countries,
    y: countries.map((country) => sumGeoRows(rows.filter((row) => row.modelId === product.id && (row.country || "Unassigned") === country), field)),
    name: product.shortName,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  drawPlot(id, traces, { barmode: "stack", margin: { l: 58, r: 28, t: 8, b: 86 }, yaxis: { title: metricTitle(field) } });
}

function drawCategoryGeoFlowChart(id, categoryId, selectedIds, flow, { interactive = false } = {}) {
  const metric = flowMetricConfig(flow);
  const rows = geoMetricRows({ categoryId, selectedIds });
  const geos = topGeoNamesByMetric(rows, metric.revenueField);
  const products = selectedIds.map((productId) => indexes.products.get(productId)).filter(Boolean);
  const traces = buildDualMetricProductBarTraces(products, geos, rows, "geo", metric);
  const node = drawPlot(id, traces, dualMetricBarLayout(metric, { barmode: "group" }));
  if (interactive && node?.on) {
    if (node.removeAllListeners) node.removeAllListeners("plotly_click");
    node.on("plotly_click", (eventData) => {
      const geo = eventData?.points?.[0]?.customdata || eventData?.points?.[0]?.x;
      if (!geo) return;
      state.summarySelectedGeo[categoryId] = geo;
      render();
    });
  }
}

function drawCategoryCountryFlowChart(id, categoryId, selectedIds, flow, { geo = null } = {}) {
  const metric = flowMetricConfig(flow);
  const rows = geoMetricRows({ categoryId, selectedIds }).filter((row) => !geo || (row.geo || "Unassigned") === geo);
  const countries = topCountryNamesByMetric(rows, metric.revenueField);
  const products = selectedIds.map((productId) => indexes.products.get(productId)).filter(Boolean);
  const traces = buildDualMetricProductBarTraces(products, countries, rows, "country", metric);
  drawPlot(id, traces, dualMetricBarLayout(metric, { margin: { l: 64, r: 64, t: 8, b: 86 }, barmode: "group" }));
}

function buildDualMetricProductBarTraces(products, groups, rows, groupField, metric) {
  const groupValue = (row) => (groupField === "geo" ? row.geo || "Unassigned" : row.country || "Unassigned");
  return products.flatMap((product, idx) => {
    const color = palette[idx % palette.length];
    const productRows = rows.filter((row) => row.modelId === product.id);
    return [
      {
        x: groups.map(displayLocationLabel),
        customdata: groups,
        y: groups.map((group) => sumGeoRows(productRows.filter((row) => groupValue(row) === group), metric.revenueField)),
        name: `${product.shortName} ${metric.revenueLabel}`,
        type: "bar",
        offsetgroup: `${product.id}-rev`,
        legendgroup: product.id,
        marker: { color },
        hovertemplate: `<b>%{x}</b><br>${product.shortName}<br>${metric.revenueLabel} $%{y:,.0f}<extra></extra>`,
      },
      {
        x: groups.map(displayLocationLabel),
        customdata: groups,
        y: groups.map((group) => sumGeoRows(productRows.filter((row) => groupValue(row) === group), metric.quantityField)),
        name: `${product.shortName} ${metric.quantityLabel}`,
        type: "bar",
        yaxis: "y2",
        offsetgroup: `${product.id}-qty`,
        legendgroup: product.id,
        marker: { color, opacity: 0.42, line: { color, width: 1 } },
        hovertemplate: `<b>%{x}</b><br>${product.shortName}<br>${metric.quantityLabel} %{y:,.0f}<extra></extra>`,
      },
    ];
  });
}

function dualMetricBarLayout(metric, overrides = {}) {
  return {
    barmode: "group",
    yaxis: { title: metric.revenueLabel, tickprefix: "$" },
    yaxis2: { title: metric.quantityLabel, overlaying: "y", side: "right", showgrid: false },
    legend: { orientation: "h", y: -0.22, x: 0 },
    ...overrides,
  };
}

function drawGlobalMarketStructure(report) {
  const overview = report?.overview;
  if (!overview) return;
  drawGlobalMarketTrend(overview.trend);
  const conclusions = overview.conclusions || overview.sections || [];
  conclusions.forEach((section) => {
    const charts = section.charts || (section.chart ? [section.chart] : []);
    charts.forEach((chart, chartIndex) => {
      drawStructurePiePlot(`structurePlot-${idFromText(section.title)}-${chartIndex}`, chart);
    });
  });
}

function drawGlobalMarketTrend(trend) {
  const node = document.getElementById("globalMarketSizeTrendPlot");
  if (!node || !trend?.items?.length || !window.Plotly) return;
  const items = trend.items;
  const years = items.map((item) => Number(item.label));
  const values = items.map((item) => (Number(item.value) || 0) / 1000);
  const growth = values.map((value, index) => (index === 0 ? null : ((value - values[index - 1]) / values[index - 1]) * 100));
  const labels = years.map((year, index) => ([2025, 2026, 2027, 2032].includes(year) ? `$${values[index].toFixed(2)}B` : ""));
  const growthLabels = years.map((year, index) => ([2025, 2026].includes(year) ? `${growth[index].toFixed(2)}%` : ""));
  const forecastStart = years.indexOf(2026);
  const shapes = forecastStart >= 0
    ? [{
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: 2025.5,
        x1: 2032.5,
        y0: 0,
        y1: 1,
        fillcolor: "rgba(226, 35, 26, 0.055)",
        line: { width: 0 },
        layer: "below",
      }, {
        type: "line",
        xref: "x",
        yref: "paper",
        x0: 2025.5,
        x1: 2025.5,
        y0: 0,
        y1: 1,
        line: { color: "#9ca3af", width: 1.5, dash: "dash" },
      }]
    : [];
  drawPlot(
    "globalMarketSizeTrendPlot",
    [
      {
        x: years,
        y: values,
        text: labels,
        textposition: "outside",
        textfont: { size: 11, color: "#1f2328" },
        hovertemplate: "<b>%{x}</b><br>Market Size: $%{y:.2f}B<extra></extra>",
        name: "Market Size",
        type: "bar",
        marker: { color: years.map((year) => year <= 2025 ? "#e98079" : "#f3b7b2") },
        cliponaxis: false,
      },
      {
        x: years,
        y: growth,
        yaxis: "y2",
        name: "YoY Growth",
        type: "scatter",
        mode: "lines+markers+text",
        text: growthLabels,
        textposition: "top center",
        textfont: { size: 11, color: "#1f2328" },
        line: { color: "#1f2328", width: 2.5 },
        marker: { size: 6, color: "#1f2328" },
        hovertemplate: "<b>%{x}</b><br>YoY Growth: %{y:.2f}%<extra></extra>",
      },
    ],
    {
      margin: { l: 58, r: 64, t: 24, b: 54 },
      barmode: "group",
      shapes,
      xaxis: { title: "Year", type: "linear", tickmode: "array", tickvals: years, ticktext: years.map(String), range: [2019.5, 2032.5], dtick: 1 },
      yaxis: { title: "Market Size", ticksuffix: "B", tickprefix: "$" },
      yaxis2: { title: "YoY Growth", ticksuffix: "%", overlaying: "y", side: "right", showgrid: false },
      legend: { orientation: "h", y: -0.2, x: 0 },
    },
  );
}

function drawStructurePiePlot(id, chart) {
  const node = document.getElementById(id);
  if (!node || !chart?.items?.length || !window.Plotly) return;
  const items = chart.items;
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const hoverText = items.map((item) => {
    const value = Number(item.value) || 0;
    const share = total ? value / total * 100 : 0;
    const description = item.description ? `<br>${item.description}` : "";
    return `<b>${item.label}</b><br>Market Value: ${item.valueLabel || `$${value.toFixed(2)}M`}<br>Share: ${share.toFixed(2)}%${description}`;
  });
  const showLabels = chart.showLabels !== false;
  const hasSideLegend = chart.legendSide === "left" || chart.legendSide === "right";
  drawPlot(
    id,
    [{
      labels: items.map((item) => item.label),
      values: items.map((item) => Number(item.value) || 0),
      type: "pie",
      hole: 0.56,
      sort: false,
      direction: "clockwise",
      textinfo: showLabels ? "text" : "none",
      textposition: showLabels ? "outside" : "none",
      text: items.map((item) => `${item.label}<br>${item.valueLabel || `$${Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`}`),
      texttemplate: showLabels ? "%{text}<br>%{percent:.1%}" : "",
      hovertext: hoverText,
      hovertemplate: "%{hovertext}<extra></extra>",
      marker: { colors: items.map((_, index) => structureChartColor(index)), line: { color: "#ffffff", width: 2 } },
      domain: hasSideLegend ? { x: chart.legendSide === "right" ? [0.16, 1] : [0.08, 0.92], y: [0.04, 0.96] } : undefined,
    }],
    {
      margin: showLabels ? { l: 84, r: 84, t: 34, b: 32 } : { l: 18, r: 18, t: 16, b: 16 },
      showlegend: false,
      hoverlabel: { bgcolor: "#1f2328", font: { color: "#ffffff" } },
      uniformtext: { minsize: 10, mode: "hide" },
    },
  );
}

function drawMarketAnalysis(categoryId) {
  if (state.marketModule === "global" && marketStructureReport(categoryId)?.overview) {
    drawGlobalMarketStructure(marketStructureReport(categoryId));
    return;
  }
  if (state.marketModule === "geo") {
    const selectedRegion = state.geoRegionDetail[categoryId];
    if (selectedRegion) {
      const overview = data.countryMarkets?.[categoryId];
      const region = overview?.regions?.find((item) => item.id === selectedRegion);
      const tabId = state.geoCountryTab[categoryId] || region?.countryTabs?.[0]?.id;
      const tab = region?.countryTabs?.find((item) => item.id === tabId);
      if (tab?.countryId) drawCountryDetail(categoryId, tab.countryId);
    } else drawCountryOverviewMaps(categoryId);
    return;
  }
  if (marketModules[state.marketModule]) {
    return;
  }
  if (state.marketModule === "policy") {
    drawPolicyRegionMaps();
    return;
  }
  if (state.marketModule === "structure" && marketStructureReport(categoryId)) {
    return;
  }
  if (state.marketModule === "industry" && industryBrandReport(categoryId)) {
    return;
  }
  const period = selectedPeriod();
  const trendPeriods = periodsThroughSelected(state.granularity, period);
  const categoryRows = data.productMetrics.filter((row) => row.categoryId === categoryId && trendPeriods.includes(periodKey(row.date, state.granularity)));
  const selectedRows = categoryRows.filter((row) => rowInSelectedPeriod(row));
  const powerSegments = getCategoryPowerSegments(categoryId);
  const portSegments = getCategoryPortSegments(categoryId);

  drawHighPowerMigration(categoryId, trendPeriods, categoryRows);
  drawPortUpgradeTrend(categoryId, trendPeriods, categoryRows);
  drawSamePowerPriceCurve(categoryId, trendPeriods, categoryRows, powerSegments);
  drawTechnologyPenetration(categoryId, trendPeriods, categoryRows);
  drawPowerStructureTrend(categoryId, trendPeriods, categoryRows, powerSegments);
  drawPowerPortHeatmap("structurePowerPortHeatmap", selectedRows, powerSegments, portSegments, "Units");
  drawPricePowerStructure(categoryId, selectedRows, powerSegments);
  drawScenarioDonut(categoryId, selectedRows);
}

function drawCountryOverviewMaps(categoryId) {
  const regions = data.countryMarkets?.[categoryId]?.regions || [];
  regions.forEach((region) => {
    const node = document.getElementById(`countryOverviewMap${region.id}`);
    if (!node) return;
    if (!window.Plotly) {
      node.innerHTML = `<div class="policy-map-fallback">${escapeHtml(region.label)}</div>`;
      return;
    }
    Plotly.react(
      node,
      [{
        type: "choropleth",
        locationmode: "ISO-3",
        locations: region.iso3 || [],
        z: (region.iso3 || []).map(() => 1),
        text: (region.iso3 || []).map(() => region.label),
        hoverinfo: "skip",
        showscale: false,
        colorscale: [[0, "#e2231a"], [1, "#e2231a"]],
        marker: { line: { color: "#ffffff", width: 0.6 } },
      }],
      {
        margin: { l: 0, r: 0, t: 0, b: 0 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        geo: {
          projection: { type: region.projection || "natural earth" },
          fitbounds: "locations",
          showframe: false,
          showcoastlines: false,
          showcountries: false,
          showland: true,
          landcolor: "#eeeae2",
          showocean: true,
          oceancolor: "#fbfaf7",
          bgcolor: "rgba(0,0,0,0)",
        },
      },
      { displayModeBar: false, staticPlot: true, responsive: false },
    );
  });
}

function drawCountryDetail(categoryId, countryId) {
  const overview = data.countryMarkets?.[categoryId];
  const country = overview?.countries?.find((item) => item.id === countryId);
  const sections = overview?.insightSets?.[country?.insightSet] || [];
  if (!country) return;
  sections.forEach((section, sectionIndex) => {
    const key = idFromText(section.title || `section-${sectionIndex}`);
    const charts = section.charts || (section.chart ? [section.chart] : []);
    charts.forEach((chart, chartIndex) => drawGeoRegionalChart(`country${country.id}${key}Plot${chartIndex}`, chart));
  });
}

function drawNARegionalDetail(categoryId) {
  const detail = marketStructureReport(categoryId)?.geoOverview?.regions?.find((region) => region.id === "NA")?.detail;
  if (!detail) return;
  drawNAUSMarketTrend(detail.usMarketTrend);
  drawGeoShareDonut("geoNaCompetitivePlot", detail.competitive.share, "100%<br>Market Share");
  drawGeoShareDonut("geoNaPricePlot", detail.price.share, "100%<br>Purchases");
  drawGeoShareDonut("geoNaChannelPlot", detail.channel.share, "100%<br>Purchases");
}

function drawGeoRegionalDetail(categoryId, regionId) {
  const detail = marketStructureReport(categoryId)?.geoOverview?.regions?.find((region) => region.id === regionId)?.detail;
  if (!detail) return;
  drawGeoMarketTrend(`geo${regionId}MarketTrendPlot`, detail.marketTrend);
  ["competitive", "price", "channel"].forEach((key) => {
    const section = detail[key];
    const charts = section?.charts || (section?.chart ? [section.chart] : []);
    charts.forEach((chart, index) => drawGeoRegionalChart(`geo${regionId}${key}Plot${index}`, chart));
  });
}

function drawNAUSMarketTrend(trend) {
  drawGeoMarketTrend("geoNaUSMarketTrendPlot", trend);
}

function drawGeoMarketTrend(id, trend) {
  const items = trend?.items || [];
  if (!items.length) return;
  const years = items.map((item) => String(item.label));
  const values = items.map((item) => Number(item.value) || 0);
  const growth = values.map((value, index) => index === 0 ? null : ((value - values[index - 1]) / values[index - 1]) * 100);
  const maxValue = Math.max(...values, 1);
  const growthMax = Math.max(...growth.filter((value) => Number.isFinite(value)), 1);
  drawPlot(id, [
    {
      x: years,
      y: values,
      text: values.map((value) => `$${value.toFixed(2)}B`),
      textposition: "outside",
      textfont: { size: 10, color: "#1f2328" },
      type: "bar",
      name: "Market Size",
      marker: { color: items.map((item) => item.type === "Base" ? "#e2231a" : "#efaaa4") },
      cliponaxis: false,
      hovertemplate: "<b>%{x}</b><br>Market Size: $%{y:.2f}B<extra></extra>",
    },
    {
      x: years,
      y: growth,
      type: "scatter",
      mode: "lines+markers",
      name: "YoY Growth",
      yaxis: "y2",
      line: { color: "#1f2328", width: 2.2 },
      marker: { color: "#1f2328", size: 6 },
      hovertemplate: "<b>%{x}</b><br>YoY Growth: %{y:.1f}%<extra></extra>",
    },
  ], {
    margin: { l: 76, r: 70, t: 30, b: 54 },
    barmode: "group",
    xaxis: { title: "Year", type: "category", tickfont: { size: 10 } },
    yaxis: { title: "Market Size (USD Billion)", ticksuffix: "B", tickprefix: "$", range: [0, maxValue * 1.22], titlefont: { size: 11 } },
    yaxis2: { title: "YoY Growth", ticksuffix: "%", overlaying: "y", side: "right", showgrid: false, range: [0, growthMax * 1.3], titlefont: { size: 11 } },
    legend: { orientation: "h", y: -0.26, x: 0 },
  });
}

function drawGeoRegionalChart(id, chart) {
  const items = chart?.items || [];
  if (!items.length) return;
  if (chart.type === "donut") {
    drawGeoShareDonut(id, items, chart.center || "Share");
    return;
  }
  const values = items.map((item) => Number(item.value) || 0);
  const maxValue = Math.max(...values, 1);
  const prefix = chart.prefix || "";
  const suffix = chart.suffix || "";
  drawPlot(id, [{
    x: values,
    y: items.map((item) => item.label),
    type: "bar",
    orientation: "h",
    text: items.map((item) => item.valueLabel || `${prefix}${item.value}${suffix}`),
    textposition: "outside",
    cliponaxis: false,
    marker: { color: items.map((_, index) => structureChartColor(index)) },
    hovertemplate: `<b>%{y}</b><br>${escapeHtml(chart.hoverLabel || "Value")}: %{text}<extra></extra>`,
    textfont: { size: 11, color: "#1f2328" },
  }], {
    margin: { l: 136, r: 48, t: 8, b: 34 },
    showlegend: false,
    xaxis: { title: chart.axisTitle || "", tickprefix: prefix, ticksuffix: suffix, range: [0, maxValue * 1.22], titlefont: { size: 10 }, tickfont: { size: 9 } },
    yaxis: { autorange: "reversed", tickfont: { size: 11 } },
  });
}

function drawGeoShareDonut(id, items, center) {
  drawPlot(id, [{
    labels: items.map((item) => item.label),
    values: items.map((item) => Number(item.value) || 0),
    type: "pie",
    hole: 0.58,
    sort: false,
    textinfo: "label+percent",
    textposition: "outside",
    texttemplate: "%{label}<br>%{percent:.0%}",
    marker: { colors: items.map((_, index) => structureChartColor(index)), line: { color: "#ffffff", width: 2 } },
    hovertemplate: "<b>%{label}</b><br>%{value}%<extra></extra>",
    textfont: { size: 12, color: "#1f2328" },
  }], {
    margin: { l: 62, r: 62, t: 24, b: 20 },
    showlegend: false,
    uniformtext: { minsize: 10, mode: "hide" },
    annotations: [{ text: center, x: 0.5, y: 0.5, xref: "paper", yref: "paper", showarrow: false, font: { size: 14, color: "#1f2328" } }],
  });
}

function drawGeoReportedShareBars(id, items) {
  const values = items.map((item) => Number(item.value) || 0);
  const maxValue = Math.max(...values, 1);
  drawPlot(id, [{
    x: values,
    y: items.map((item) => item.label),
    customdata: items.map((item) => item.valueLabel || `${item.value}%`),
    type: "bar",
    orientation: "h",
    text: items.map((item) => item.valueLabel || `${item.value}%`),
    textposition: "outside",
    cliponaxis: false,
    marker: { color: items.map((_, index) => structureChartColor(index)) },
    hovertemplate: "<b>%{y}</b><br>Reported share: %{customdata}<extra></extra>",
    textfont: { size: 10, color: "#1f2328" },
  }], {
    margin: { l: 142, r: 34, t: 8, b: 34 },
    showlegend: false,
    xaxis: { title: "Reported Share", ticksuffix: "%", range: [0, maxValue * 1.2], titlefont: { size: 10 }, tickfont: { size: 9 } },
    yaxis: { autorange: "reversed", tickfont: { size: 10 } },
  });
}

function drawPolicyRegionMaps() {
  if (!window.Plotly) {
    policyRegions.forEach((region) => {
      const node = document.getElementById(`policyMap${region.id}`);
      if (node) node.innerHTML = `<div class="policy-map-fallback">${escapeHtml(region.label)}</div>`;
    });
    return;
  }
  policyRegions.forEach((region) => {
    const node = document.getElementById(`policyMap${region.id}`);
    const map = policyRegionMaps[region.id];
    if (!node || !map) return;
    const active = state.policyRegion[state.categoryId] === region.id;
    Plotly.react(
      node,
      [
        {
          type: "choropleth",
          locationmode: "ISO-3",
          locations: map.countries,
          z: map.countries.map(() => 1),
          text: map.labels,
          hoverinfo: "skip",
          showscale: false,
          colorscale: [
            [0, active ? "#e2231a" : "#6b7280"],
            [1, active ? "#e2231a" : "#6b7280"],
          ],
          marker: { line: { color: "#ffffff", width: 0.6 } },
        },
      ],
      {
        margin: { l: 0, r: 0, t: 0, b: 0 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        geo: {
          projection: { type: map.projection },
          fitbounds: "locations",
          showframe: false,
          showcoastlines: false,
          showcountries: true,
          countrycolor: "#d8d3ca",
          countrywidth: 0.5,
          showland: true,
          landcolor: "#eeeae2",
          showocean: true,
          oceancolor: "#fbfaf7",
          bgcolor: "rgba(0,0,0,0)",
        },
      },
      {
        displayModeBar: false,
        responsive: true,
        staticPlot: true,
      },
    );
  });
}

function drawHighPowerMigration(categoryId, periods, rows) {
  const thresholds = categoryId === "power_cable" ? [60, 100, 200] : [65, 100, 140];
  const traces = thresholds.map((threshold, idx) => ({
    x: periods,
    y: periods.map((period) => {
      const bucket = rows.filter((row) => periodKey(row.date, state.granularity) === period);
      const total = bucket.reduce((sum, row) => sum + row.unitsNet, 0);
      const high = bucket.filter((row) => productPower(indexes.products.get(row.modelId)) >= threshold).reduce((sum, row) => sum + row.unitsNet, 0);
      return total ? (high / total) * 100 : 0;
    }),
    name: `${threshold}W+`,
    type: "scatter",
    mode: "lines+markers",
    line: { color: redScale[idx + 1] || palette[idx], width: 2.8 },
  }));
  drawPlot("industryHighPowerPlot", traces, { yaxis: { title: "Share %", ticksuffix: "%" } });
}

function drawPortUpgradeTrend(categoryId, periods, rows) {
  const ports = getCategoryPortSegments(categoryId);
  const traces = ports.map((port, idx) => ({
    x: periods,
    y: periods.map((period) => {
      const bucket = rows.filter((row) => periodKey(row.date, state.granularity) === period);
      const total = bucket.reduce((sum, row) => sum + row.unitsNet, 0);
      const subtotal = bucket.filter((row) => productPortSegment(indexes.products.get(row.modelId)) === port).reduce((sum, row) => sum + row.unitsNet, 0);
      return total ? (subtotal / total) * 100 : 0;
    }),
    name: port,
    type: "scatter",
    mode: "lines",
    stackgroup: "one",
    groupnorm: "percent",
    line: { color: redScale[idx] || palette[idx], width: 1.5 },
  }));
  drawPlot("industryPortsPlot", traces, { yaxis: { title: "Sample Share %", ticksuffix: "%", range: [0, 100] } });
}

function drawSamePowerPriceCurve(categoryId, periods, rows, powerSegments) {
  const traces = powerSegments.map((segment, idx) => ({
    x: periods,
    y: periods.map((period) => {
      const bucket = rows.filter((row) => periodKey(row.date, state.granularity) === period && productPowerSegment(indexes.products.get(row.modelId)) === segment);
      return summarizeProductRows(bucket).aur;
    }),
    name: segment,
    type: "scatter",
    mode: "lines+markers",
    line: { color: redScale[idx] || palette[idx], width: 2.4 },
  }));
  drawPlot("industryPriceCurvePlot", traces, { yaxis: { title: "Average Price", tickprefix: "$" } });
}

function drawTechnologyPenetration(categoryId, periods, rows) {
  const techs = getTechnologySignals(categoryId);
  const traces = techs.map((tech, idx) => ({
    x: periods,
    y: periods.map((period) => {
      const bucket = rows.filter((row) => periodKey(row.date, state.granularity) === period);
      const total = bucket.reduce((sum, row) => sum + row.unitsNet, 0);
      const subtotal = bucket.filter((row) => productHasTech(indexes.products.get(row.modelId), tech)).reduce((sum, row) => sum + row.unitsNet, 0);
      return total ? (subtotal / total) * 100 : 0;
    }),
    name: tech,
    type: "scatter",
    mode: "lines+markers",
    line: { color: redScale[idx] || palette[idx], width: 2.4 },
  }));
  drawPlot("industryTechPlot", traces, { yaxis: { title: "Adoption %", ticksuffix: "%", range: [0, 100] } });
}

function drawPowerStructureTrend(categoryId, periods, rows, powerSegments) {
  const traces = powerSegments.map((segment, idx) => ({
    x: periods,
    y: periods.map((period) => {
      const bucket = rows.filter((row) => periodKey(row.date, state.granularity) === period);
      const total = bucket.reduce((sum, row) => sum + row.unitsNet, 0);
      const subtotal = bucket.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === segment).reduce((sum, row) => sum + row.unitsNet, 0);
      return total ? (subtotal / total) * 100 : 0;
    }),
    name: segment,
    type: "scatter",
    mode: "lines",
    stackgroup: "one",
    groupnorm: "percent",
    line: { color: redScale[idx] || palette[idx], width: 1.5 },
  }));
  drawPlot("structurePowerTrendPlot", traces, { yaxis: { title: "Sample Share %", ticksuffix: "%", range: [0, 100] } });
}

function drawPowerPortHeatmap(id, rows, powerSegments, portSegments, title = "Units") {
  const z = powerSegments.map((power) =>
    portSegments.map((port) =>
      rows
        .filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === power && productPortSegment(indexes.products.get(row.modelId)) === port)
        .reduce((sum, row) => sum + row.unitsNet, 0),
    ),
  );
  drawPlot(
    id,
    [
      {
        z,
        x: portSegments,
        y: powerSegments,
        type: "heatmap",
        colorscale: [
          [0, "#fff5f2"],
          [0.35, "#efb0aa"],
          [0.7, "#d7301f"],
          [1, "#7f231c"],
        ],
        colorbar: { title },
      },
    ],
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "Port Count" }, yaxis: { title: "Power Segment" } },
  );
}

function drawPricePowerStructure(categoryId, rows, powerSegments, id = "structurePricePowerPlot") {
  const brand = state.structureBrand[categoryId] || "Lenovo";
  if (brand !== "Lenovo") {
    drawBrandPricePowerStructure(categoryId, brand, powerSegments, id);
    return;
  }
  const traces = powerSegments.map((segment, idx) => ({
    x: priceBands,
    y: priceBands.map((band) => {
      const bucket = rows.filter((row) => priceBandForProduct(indexes.products.get(row.modelId)) === band);
      const total = bucket.reduce((sum, row) => sum + row.unitsNet, 0);
      const subtotal = bucket.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === segment).reduce((sum, row) => sum + row.unitsNet, 0);
      return total ? (subtotal / total) * 100 : 0;
    }),
    name: segment,
    type: "bar",
    marker: { color: redScale[idx] || palette[idx] },
  }));
  drawPlot(id, traces, { barmode: "stack", yaxis: { title: "Sample Share %", ticksuffix: "%", range: [0, 100] } });
}

function drawBrandPricePowerStructure(categoryId, brand, powerSegments, id) {
  const row = brandRowsForSelectedPeriod(categoryId, true).find((item) => item.brand === brand);
  const traces = powerSegments.map((segment, idx) => ({
    x: priceBands,
    y: priceBands.map((band) => {
      const base = row ? row.brandRevenue : 0;
      return base * competitorPowerWeight(categoryId, brand, segment) * competitorPriceBandWeight(brand, band);
    }),
    name: segment,
    type: "bar",
    marker: { color: redScale[idx] || palette[idx] },
  }));
  const totals = priceBands.map((_, col) => traces.reduce((sum, trace) => sum + trace.y[col], 0));
  for (const trace of traces) {
    trace.y = trace.y.map((value, idx) => (totals[idx] ? (value / totals[idx]) * 100 : 0));
  }
  drawPlot(id, traces, { barmode: "stack", yaxis: { title: "Sample Share %", ticksuffix: "%", range: [0, 100] } });
}

function drawScenarioDonut(categoryId, rows) {
  const buckets = new Map();
  for (const row of rows) {
    const product = indexes.products.get(row.modelId);
    const scenarios = product?.attributes.scenarios || ["daily carry"];
    for (const scenario of scenarios) buckets.set(scenario, (buckets.get(scenario) || 0) + row.unitsNet / scenarios.length);
  }
  const entries = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  drawPlot(
    "structureScenarioPlot",
    [
      {
        labels: entries.map(([label]) => label),
        values: entries.map(([, value]) => value),
        type: "pie",
        hole: 0.5,
        textinfo: "label+percent",
        marker: { colors: entries.map((_, idx) => redScale[idx] || palette[idx]) },
      },
    ],
    { showlegend: false, margin: { l: 10, r: 10, t: 8, b: 8 } },
  );
}

function drawCompetitiveAnalysis(categoryId) {
  return;
  const rows = data.brandMarket.filter((row) => row.categoryId === categoryId && !row.isLenovo);
  const selectedRows = brandRowsForSelectedPeriod(categoryId, false).sort((a, b) => b.marketShare - a.marketShare);
  const periods = periodsThroughSelected(state.granularity, selectedPeriod());
  const brands = unique(rows.map((row) => row.brand));
  const powerSegments = getCategoryPowerSegments(categoryId);

  drawCompetitorDemandByPower(categoryId, selectedRows, brands, powerSegments);

  const salesTraces = brands.map((brand, idx) => {
    const byPeriod = aggregateBrandRows(
      rows.filter((row) => row.brand === brand && periods.includes(periodKey(row.date, state.granularity))),
      (row) => periodKey(row.date, state.granularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.brandRevenue || 0),
      name: brand,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.4 },
    };
  });
  drawPlot("competitorSalesPlot", salesTraces, { yaxis: { title: "Sales", tickprefix: "$" } });

  drawCompetitorPricePower(categoryId, selectedRows, powerSegments);
  drawPlot(
    "competitorBubblePlot",
    [
      {
        x: selectedRows.map((row) => row.avgAUR),
        y: selectedRows.map((row) => competitorAveragePower(categoryId, row.brand)),
        text: selectedRows.map((row) => row.brand),
        mode: "markers+text",
        type: "scatter",
        textposition: "top center",
        marker: {
          size: selectedRows.map((row) => Math.max(28, Math.sqrt(row.brandRevenue) * 0.02)),
          color: selectedRows.map((_, idx) => palette[idx % palette.length]),
          opacity: 0.42,
          line: { color: "#1f2328", width: 1.5 },
        },
      },
    ],
    { xaxis: { title: "Weighted Price", tickprefix: "$" }, yaxis: { title: "Weighted Power W" } },
  );
}

function drawCompetitorDemandByPower(categoryId, brandRows, brands, powerSegments) {
  const traces = powerSegments.map((segment, idx) => ({
    x: brands,
    y: brands.map((brand) => {
      const brandRow = brandRows.find((row) => row.brand === brand);
      return brandRow ? brandRow.brandRevenue * competitorPowerWeight(categoryId, brand, segment) : 0;
    }),
    name: segment,
    type: "bar",
    marker: { color: redScale[idx] || palette[idx] },
  }));
  drawPlot("competitorDemandByPowerPlot", traces, { barmode: "stack", yaxis: { title: "Sales", tickprefix: "$" } });
}

function drawCompetitorPricePower(categoryId, brandRows, powerSegments) {
  const brand = state.competitorBrand[categoryId] || brandRows[0]?.brand;
  const row = brandRows.find((item) => item.brand === brand) || brandRows[0];
  const traces = powerSegments.map((segment, idx) => ({
    x: priceBands,
    y: priceBands.map((band) => {
      const base = row ? row.brandRevenue : 0;
      return base * competitorPowerWeight(categoryId, brand, segment) * competitorPriceBandWeight(brand, band);
    }),
    name: segment,
    type: "bar",
    marker: { color: redScale[idx] || palette[idx] },
  }));
  const totals = priceBands.map((_, col) => traces.reduce((sum, trace) => sum + trace.y[col], 0));
  for (const trace of traces) {
    trace.y = trace.y.map((value, idx) => (totals[idx] ? (value / totals[idx]) * 100 : 0));
  }
  drawPlot("competitorPricePowerPlot", traces, { barmode: "stack", yaxis: { title: "Share %", ticksuffix: "%", range: [0, 100] } });
}

function drawProductMatrix(categoryId, visibleProducts, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : visibleProducts.map((product) => product.id);
  const summaries = getProductLatestSummaries(categoryId, productIds);
  drawProductSharePie("matrixRevenueSharePlot", summaries, state.summaryRevenueMetric, metricLabel(state.summaryRevenueMetric));
  drawProductSharePie("matrixUnitSharePlot", summaries, state.summaryQuantityMetric, metricLabel(state.summaryQuantityMetric));
  drawCategoryGeoUnitsChart("matrixGeoUnitsPlot", categoryId, getSummaryProductIds("summaryGeoProducts", categoryId, productIds), state.summaryGeoMetric, { interactive: true });
  drawCategoryCountryUnitsChart("matrixCountryUnitsPlot", categoryId, getSummaryProductIds("summaryCountryProducts", categoryId, productIds), state.summaryCountryMetric, {
    geo: state.summarySelectedGeo[categoryId],
  });
}

function drawProductSharePie(id, summaries, field, label) {
  const valuePrefix = metricType(field) === "currency" ? "$" : "";
  const rows = summaries
    .map((item) => ({
      name: item.product.shortName,
      value: summaryMetricValue(item.summary, field),
    }))
    .filter((row) => row.value)
    .sort((a, b) => b.value - a.value);
  drawPlot(
    id,
    rows.length
      ? [
          {
            labels: rows.map((row) => row.name),
            values: rows.map((row) => row.value),
            type: "pie",
            hole: 0.42,
            textinfo: "label+percent",
            textposition: "outside",
            automargin: true,
            hovertemplate: `<b>%{label}</b><br>${label} ${valuePrefix}%{value:,.0f}<br>%{percent}<extra></extra>`,
            marker: { colors: rows.map((_, idx) => palette[idx % palette.length]) },
          },
        ]
      : [],
    { margin: { l: 28, r: 28, t: 8, b: 42 }, showlegend: true, legend: { orientation: "h", y: -0.18, x: 0 } },
  );
}

function drawResourceContribution(categoryId, productIds) {
  const products = productIds.map((id) => indexes.products.get(id)).filter(Boolean);
  const rows = data.productMetrics.filter((row) => productIds.includes(row.modelId) && rowInSelectedPeriod(row));
  const segments = getCategoryPowerSegments(categoryId);
  const totalSkus = products.length || 1;
  const totalUnits = rows.reduce((sum, row) => sum + row.unitsNet, 0) || 1;
  const totalRevenue = rows.reduce((sum, row) => sum + (row.orderRevenue || row.revenueNet || 0), 0) || 1;
  drawPlot(
    "resourceContributionPlot",
    [
      {
        x: segments,
        y: segments.map((segment) => (products.filter((product) => productPowerSegment(product) === segment).length / totalSkus) * 100),
        name: "SKU Share",
        type: "bar",
        marker: { color: "#f4c7c3" },
      },
      {
        x: segments,
        y: segments.map((segment) => (rows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === segment).reduce((sum, row) => sum + row.unitsNet, 0) / totalUnits) * 100),
        name: "Unit Share",
        type: "bar",
        marker: { color: "#d7301f" },
      },
      {
        x: segments,
        y: segments.map((segment) => (rows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === segment).reduce((sum, row) => sum + (row.orderRevenue || row.revenueNet || 0), 0) / totalRevenue) * 100),
        name: "Order_Rev Share",
        type: "bar",
        marker: { color: "#111827" },
      },
    ],
    { barmode: "group", yaxis: { title: "Share %", ticksuffix: "%" } },
  );
}

function drawPortSalesStructure(categoryId, productIds) {
  const rows = data.productMetrics.filter((row) => productIds.includes(row.modelId) && rowInSelectedPeriod(row));
  const ports = getCategoryPortSegments(categoryId);
  const powers = getCategoryPowerSegments(categoryId);
  const traces = powers.map((power, idx) => ({
    x: ports,
    y: ports.map((port) =>
      rows
        .filter((row) => productPortSegment(indexes.products.get(row.modelId)) === port && productPowerSegment(indexes.products.get(row.modelId)) === power)
        .reduce((sum, row) => sum + row.unitsNet, 0),
    ),
    name: power,
    type: "bar",
    marker: { color: redScale[idx] || palette[idx] },
  }));
  drawPlot("portSalesStructurePlot", traces, { barmode: "stack", yaxis: { title: "Sales Volume" } });
}

function drawFeedbackModule(categoryId, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : data.catalog.products.filter((product) => product.categoryId === categoryId).map((product) => product.id);
  const reviewRows = data.consumerInsights.filter((row) => productIds.includes(row.modelId) && rowInSelectedPeriod(row));
  const metricRows = data.productMetrics.filter((row) => productIds.includes(row.modelId) && rowInSelectedPeriod(row));
  const powers = getCategoryPowerSegments(categoryId);
  const ports = getCategoryPortSegments(categoryId);

  renderFeedbackWordCloud(reviewRows);
  drawPainPowerRelationship(reviewRows, powers);
  drawRatingMatrix(reviewRows, powers, ports);
  drawReturnReasons(metricRows, reviewRows);
  drawReturnRiskMatrix(metricRows, powers, ports);
  drawRatingReturnRisk(productIds, reviewRows, metricRows);
}

function renderFeedbackWordCloud(reviewRows) {
  const node = document.getElementById("feedbackWordCloud");
  if (!node) return;
  const byKeyword = new Map();
  for (const row of reviewRows) byKeyword.set(row.keyword, (byKeyword.get(row.keyword) || 0) + row.frequency);
  const entries = [...byKeyword.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  node.innerHTML = entries
    .map(([word, value], idx) => {
      const size = 16 + (value / max) * 30;
      return `<span style="font-size:${size}px;color:${redScale[idx % redScale.length]}">${escapeHtml(word)}</span>`;
    })
    .join("");
}

function drawPainPowerRelationship(reviewRows, powers) {
  const painRows = reviewRows.filter((row) => row.sentiment !== "Positive");
  const painKeys = unique(painRows.map((row) => row.keyword)).slice(0, 6);
  const traces = painKeys.map((keyword, idx) => ({
    x: powers,
    y: powers.map((power) => {
      const bucket = painRows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === power);
      const total = bucket.reduce((sum, row) => sum + row.frequency, 0);
      const subtotal = bucket.filter((row) => row.keyword === keyword).reduce((sum, row) => sum + row.frequency, 0);
      return total ? (subtotal / total) * 100 : 0;
    }),
    name: keyword,
    type: "bar",
    marker: { color: redScale[idx] || palette[idx] },
  }));
  drawPlot("feedbackPainPowerPlot", traces, { barmode: "stack", yaxis: { title: "Pain Point Share %", ticksuffix: "%" } });
}

function drawRatingMatrix(reviewRows, powers, ports) {
  const z = powers.map((power) =>
    ports.map((port) => {
      const bucket = reviewRows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === power && productPortSegment(indexes.products.get(row.modelId)) === port);
      return weightedAvg(bucket, (row) => row.avgRating, (row) => row.frequency) || null;
    }),
  );
  drawPlot(
    "feedbackRatingMatrix",
    [
      {
        z,
        x: ports,
        y: powers,
        type: "heatmap",
        colorscale: [
          [0, "#fff5f2"],
          [0.45, "#efb0aa"],
          [1, "#a62a22"],
        ],
        zmin: 3.6,
        zmax: 4.8,
        colorbar: { title: "Rating" },
      },
    ],
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "Port Count" }, yaxis: { title: "Power Segment" } },
  );
}

function drawReturnReasons(metricRows, reviewRows) {
  const negative = reviewRows.filter((row) => row.sentiment !== "Positive");
  const totalReturns = metricRows.reduce((sum, row) => sum + row.unitsReturned, 0);
  const byKeyword = new Map();
  const totalNeg = negative.reduce((sum, row) => sum + row.frequency, 0) || 1;
  for (const row of negative) byKeyword.set(row.keyword, (byKeyword.get(row.keyword) || 0) + row.frequency);
  const entries = [...byKeyword.entries()]
    .map(([keyword, value]) => [keyword, Math.round((value / totalNeg) * totalReturns)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  drawPlot(
    "feedbackReturnReasonsPlot",
    [
      {
        x: entries.map(([, value]) => value),
        y: entries.map(([keyword]) => keyword),
        type: "bar",
        orientation: "h",
        marker: { color: "#d7301f" },
      },
    ],
    { margin: { l: 120, r: 20, t: 8, b: 42 }, xaxis: { title: "Return Samples" } },
  );
}

function drawReturnRiskMatrix(metricRows, powers, ports) {
  const z = powers.map((power) =>
    ports.map((port) => {
      const bucket = metricRows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === power && productPortSegment(indexes.products.get(row.modelId)) === port);
      const summary = summarizeProductRows(bucket);
      const serviceRisk = summary.returnRate + summary.stockoutDays * 0.002 + (Number(String(port).match(/\d+/)?.[0] || 1) - 1) * 0.006;
      return serviceRisk * 100;
    }),
  );
  drawPlot(
    "feedbackReturnRiskMatrix",
    [
      {
        z,
        x: ports,
        y: powers,
        type: "heatmap",
        colorscale: [
          [0, "#fff5f2"],
          [0.5, "#de6f62"],
          [1, "#7f231c"],
        ],
        colorbar: { title: "Service Rate %" },
      },
    ],
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "Port Count" }, yaxis: { title: "Power Segment" } },
  );
}

function drawRatingReturnRisk(productIds, reviewRows, metricRows) {
  const items = productIds.map((id) => {
    const product = indexes.products.get(id);
    const reviews = reviewRows.filter((row) => row.modelId === id);
    const metrics = summarizeProductRows(metricRows.filter((row) => row.modelId === id));
    return {
      product,
      rating: weightedAvg(reviews, (row) => row.avgRating, (row) => row.frequency),
      returnRate: metrics.returnRate * 100,
      units: metrics.unitsNet,
      power: productPowerSegment(product),
    };
  });
  drawPlot(
    "feedbackRatingReturnPlot",
    [
      {
        x: items.map((item) => item.rating),
        y: items.map((item) => item.returnRate),
        text: items.map((item) => item.product.shortName),
        mode: "markers+text",
        type: "scatter",
        textposition: "top center",
        marker: {
          size: items.map((item) => Math.max(18, Math.sqrt(item.units) * 0.7)),
          color: items.map((item, idx) => redScale[getCategoryPowerSegments(item.product.categoryId).indexOf(item.power)] || palette[idx]),
          opacity: 0.48,
          line: { color: "#7f231c", width: 1 },
        },
      },
    ],
    { xaxis: { title: modeledText("Sales Weighted Rating"), range: [3.8, 4.9] }, yaxis: { title: modeledText("Return Rate %"), ticksuffix: "%" } },
  );
}

function renderDecisionCards(categoryId, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : data.catalog.products.filter((product) => product.categoryId === categoryId).map((product) => product.id);
  const items = getDecisionItems(categoryId, productIds);
  const top = items.slice().sort((a, b) => b.growth + b.margin - (a.growth + a.margin))[0];
  const harvest = items.slice().sort((a, b) => b.share - a.share)[0];
  const risk = items.slice().sort((a, b) => b.returnRate - a.returnRate)[0];
  return `
    <div class="chart-title"><strong>${escapeHtml(modeledText("Strategy Opportunities"))}</strong><span>${escapeHtml(selectedPeriod())}</span></div>
    <div class="news-list">
      ${renderDecisionItem("Scale Opportunity", top, "Growth and margin are both strong; allocate more product and channel resources.")}
      ${renderDecisionItem("Core Harvest", harvest, "Share contribution is highest; keep supply and pricing discipline stable.")}
      ${renderDecisionItem("Risk Watch", risk, "Return or service risk is elevated; review experience issues first.")}
    </div>
  `;
}

function renderDecisionItem(title, item, body) {
  if (!item) return "";
  return `
    <article class="news-item">
      <strong>${escapeHtml(modeledText(title))} · ${escapeHtml(item.segment)}</strong>
      <p>${escapeHtml(body)} Growth* ${fmtPercent(item.growth)}, share* ${fmtPercent(item.share)}, margin* ${fmtPercent(item.margin)}.</p>
    </article>
  `;
}

function drawDecisionModule(categoryId, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : data.catalog.products.filter((product) => product.categoryId === categoryId).map((product) => product.id);
  const items = getDecisionItems(categoryId, productIds);
  drawPlot(
    "decisionOpportunityPlot",
    [
      {
        x: items.map((item) => item.growth * 100),
        y: items.map((item) => item.share * 100),
        text: items.map((item) => item.segment),
        mode: "markers+text",
        type: "scatter",
        textposition: "top center",
        marker: {
          size: items.map((item) => Math.max(26, Math.sqrt(item.units) * 0.9)),
          color: items.map((item) => item.margin * 100),
          colorscale: [
            [0, "#f4c7c3"],
            [1, "#7f231c"],
          ],
          colorbar: { title: modeledText("Margin %") },
          opacity: 0.48,
          line: { color: "#1f2328", width: 1 },
        },
      },
    ],
    { xaxis: { title: "Market Growth Proxy %", ticksuffix: "%" }, yaxis: { title: "Lenovo Share Proxy %", ticksuffix: "%" } },
  );

  const powers = getCategoryPowerSegments(categoryId);
  const ports = getCategoryPortSegments(categoryId);
  const rows = data.productMetrics.filter((row) => productIds.includes(row.modelId) && rowInSelectedPeriod(row));
  const z = powers.map((power) =>
    ports.map((port) => {
      const products = productIds.map((id) => indexes.products.get(id)).filter((product) => productPowerSegment(product) === power && productPortSegment(product) === port);
      const units = rows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === power && productPortSegment(indexes.products.get(row.modelId)) === port).reduce((sum, row) => sum + row.unitsNet, 0);
      return products.length ? units / products.length / 1000 : units / 1000;
    }),
  );
  drawPlot(
    "decisionGapPlot",
    [
      {
        z,
        x: ports,
        y: powers,
        type: "heatmap",
        colorscale: [
          [0, "#fff5f2"],
          [0.45, "#efb0aa"],
          [1, "#a62a22"],
        ],
        colorbar: { title: "Gap Score" },
      },
    ],
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "Port Count" }, yaxis: { title: "Power Segment" } },
  );
}

function getDecisionItems(categoryId, productIds) {
  const firstPeriod = getPeriodOptions(state.granularity)[0];
  const current = selectedPeriod();
  const rows = data.productMetrics.filter((row) => productIds.includes(row.modelId));
  const segments = getCategoryPowerSegments(categoryId);
  const totalCurrent = rows.filter((row) => periodKey(row.date, state.granularity) === current).reduce((sum, row) => sum + row.unitsNet, 0) || 1;
  return segments.map((segment) => {
    const currentRows = rows.filter((row) => periodKey(row.date, state.granularity) === current && productPowerSegment(indexes.products.get(row.modelId)) === segment);
    const firstRows = rows.filter((row) => periodKey(row.date, state.granularity) === firstPeriod && productPowerSegment(indexes.products.get(row.modelId)) === segment);
    const currentSummary = summarizeProductRows(currentRows);
    const firstSummary = summarizeProductRows(firstRows);
    return {
      segment,
      units: currentSummary.unitsNet,
      share: currentSummary.unitsNet / totalCurrent,
      growth: (currentSummary.unitsNet - firstSummary.unitsNet) / Math.max(1, firstSummary.unitsNet),
      margin: currentSummary.margin,
      returnRate: currentSummary.returnRate,
    };
  });
}

function renderLaunchTable(categoryId) {
  const rows = data.brandMarket
    .filter((row) => row.categoryId === categoryId && !row.isLenovo && row.newProductLaunch)
    .slice()
    .sort((a, b) => periodSortValue(periodKey(b.date, "quarter")) - periodSortValue(periodKey(a.date, "quarter")))
    .slice(0, 8);
  return `
    <div class="chart-title">
      <strong>${escapeHtml(modeledText("Competitor Launch Signals"))}</strong>
      <span>modeled launch signals*</span>
    </div>
    <table class="data-table">
      <thead>
        <tr><th>Month</th><th>Brand</th><th>New Product</th><th>Star Product</th></tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${escapeHtml(periodKey(row.date, "quarter"))}</td>
            <td>${escapeHtml(row.brand)}</td>
            <td>${escapeHtml(row.newProductLaunch)}</td>
            <td>${escapeHtml(row.starProduct)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderProductDetail(productId) {
  const product = indexes.products.get(productId);
  const category = indexes.categories.get(product.categoryId);
  const variants = data.catalog.variants.filter((variant) => variant.modelId === productId);
  const partNumbers = product.partNumbers || variants.map((variant) => variant.partNumber || variant.name);
  const selectedPartNumber = state.partNumber === "all" || partNumbers.includes(state.partNumber) ? state.partNumber : "all";
  state.partNumber = selectedPartNumber;
  if (!["segment", "product", "competitor", "user"].includes(state.dimension)) state.dimension = "segment";
  const detailKpis = renderDetailKpis(product, selectedPartNumber);

  app.innerHTML = `
    <div class="detail-shell" style="--accent:${category.accent}">
      <section class="detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(category.label)} · Product Detail</p>
          <h1>${escapeHtml(product.name)}</h1>
          <p>${escapeHtml(productDetailSubtitle(product))}</p>
        </div>
        <div class="toolbar-group">
          <button class="ghost-button" type="button" data-route-category="${category.id}">← ${escapeHtml(category.label)}</button>
          ${renderGranularityButtons(state.detailGranularity, "detail")}
        </div>
      </section>

      <section class="detail-hero">
        <div class="detail-panel">
          <div class="spec-grid">
            ${renderSpecItems(product).join("")}
          </div>
        </div>
        <div class="detail-panel">
          <div class="dimension-row">
            <div>
              <span class="metric-label">Dimension</span>
              <h3>${dimensionLabels[state.dimension]}</h3>
            </div>
            <div class="segmented">
              ${Object.entries(dimensionLabels)
                .map(
                  ([key, label]) =>
                    `<button type="button" class="${state.dimension === key ? "is-active" : ""}" data-action="dimension" data-dimension="${key}">${escapeHtml(label.split(" ")[0])}</button>`,
                )
                .join("")}
            </div>
          </div>
          ${renderDetailSelector(product, partNumbers, selectedPartNumber)}
        </div>
      </section>

      <section class="kpi-grid">
        ${detailKpis}
      </section>

      <section class="detail-grid" id="detailCharts"></section>
    </div>
  `;

  renderDetailCharts(product, selectedPartNumber);
}

function productDetailSubtitle(product) {
  const attrs = product.attributes;
  if (product.categoryId === "adapter") return `${attrs.wattage}W · ${attrs.compatibility} · ${attrs.portCountBand}`;
  if (product.categoryId === "power_bank") return `${attrs.outputW}W · ${attrs.capacityBand} · cable ${attrs.hasCable}`;
  return `${attrs.powerW}W · ${attrs.lengthBand} · retractable ${attrs.retractable}`;
}

function renderDetailSelector(product, partNumbers, selectedPartNumber) {
  if (state.dimension === "segment") {
    const segments = [
      ["all", "All"],
      ["Commercial", "Commercial"],
      ["Consumer", "Consumer"],
    ];
    return `
      <div class="variant-chips">
        ${segments.map(([value, label]) => `<button class="filter-chip ${state.segmentFilter === value ? "is-active" : ""}" type="button" data-action="segment-filter" data-segment="${escapeAttr(value)}">${escapeHtml(label)}</button>`).join("")}
      </div>
    `;
  }
  if (state.dimension === "product") {
    return `
      <div class="variant-chips">
        <button class="filter-chip ${selectedPartNumber === "all" ? "is-active" : ""}" type="button" data-action="part-number" data-part-number="all">All PN</button>
        ${partNumbers.map((pn) => `<button class="filter-chip ${selectedPartNumber === pn ? "is-active" : ""}" type="button" data-action="part-number" data-part-number="${escapeAttr(pn)}">${escapeHtml(pn)}</button>`).join("")}
      </div>
    `;
  }
  if (state.dimension === "competitor") {
    return `<p class="product-meta">Compare this Lenovo product with 1-2 mainstream marketplace competitors by country.</p>`;
  }
  return `<p class="product-meta">Product-level user overview. Segment and PN filters are intentionally disabled for this view.</p>`;
}

function renderSpecItems(product) {
  const attrs = product.attributes;
  const base = [
    ["Category", indexes.categories.get(product.categoryId).label],
    [modeledText("List Price"), fmtCurrency(product.listPrice)],
  ];
  if (product.categoryId === "adapter") {
    base.push(["Wattage", `${attrs.wattage}W · ${attrs.wattageBand}`], ["Compatibility", attrs.compatibility], ["Ports", `${attrs.ports} · ${attrs.portCountBand}`], ["Power Mode", attrs.powerMode]);
  } else if (product.categoryId === "power_bank") {
    base.push(["Capacity", attrs.capacityBand], ["Output", `${attrs.outputW}W · ${attrs.outputBand}`], ["Compatibility", attrs.compatibility], ["Cable", attrs.hasCable]);
  } else {
    base.push(["Connector", attrs.connectors.join(" / ")], ["Length", attrs.lengthBand], ["Power", attrs.powerBand], ["Retractable", attrs.retractable]);
  }
  return base.map(([label, value]) => `<div class="spec-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`);
}

function detailProductRows(product, { selectedOnly = true, segment = null, partNumber = null } = {}) {
  return data.productMetrics.filter((row) => {
    if (row.modelId !== product.id) return false;
    if (selectedOnly && !rowInSelectedPeriod(row, "detail")) return false;
    if (segment && segment !== "all" && row.segment !== segment) return false;
    if (partNumber && partNumber !== "all" && row.partNumber !== partNumber) return false;
    return true;
  });
}

function sumRows(rows, field) {
  return rows.reduce((sum, row) => sum + (row[field] || 0), 0);
}

function renderDetailKpis(product, selectedPartNumber) {
  if (state.dimension === "user") {
    const rows = data.consumerInsights.filter((row) => row.modelId === product.id);
    const latestRows = rows.filter((row) => rowInSelectedPeriod(row, "detail"));
    const totalReviews = Math.max(...latestRows.map((row) => row.totalReviews), 0);
    const rating = avg(latestRows.map((row) => row.avgRating));
    const positive = latestRows.filter((row) => row.sentiment === "Positive").reduce((sum, row) => sum + row.frequency, 0);
    const all = latestRows.reduce((sum, row) => sum + row.frequency, 0);
    const top = latestRows.slice().sort((a, b) => b.frequency - a.frequency)[0]?.keyword || "—";
    return [
      renderKpi(modeledText("Reviews"), fmtCompact(totalReviews), "Latest period"),
      renderKpi(modeledText("Rating"), rating.toFixed(2), "Average score"),
      renderKpi(modeledText("Positive Mix"), fmtPercent(positive / Math.max(1, all)), "Keyword frequency"),
      renderKpi(modeledText("Top Keyword"), escapeHtml(top), "Latest period"),
    ].join("");
  }

  const rows = state.dimension === "segment" ? detailProductRows(product, { segment: state.segmentFilter }) : detailProductRows(product, { partNumber: selectedPartNumber });
  const summary = summarizeProductRows(rows);
  const pnCount = unique(rows.filter((row) => (row.orderQty || row.revenueNet || row.backlogRevenue)).map((row) => row.partNumber)).length || product.partNumbers?.length || 0;
  return [
    renderKpi("Order_Rev", fmtCurrency(sumRows(rows, "orderRevenue") || summary.revenueNet), selectedPeriod("detail")),
    renderKpi("Ship_Rev", fmtCurrency(sumRows(rows, "shipRevenue")), state.dimension === "product" ? `${selectedPartNumber === "all" ? pnCount : 1} PN` : state.segmentFilter === "all" ? "All segments" : state.segmentFilter),
    renderKpi("Bklg_Rev", fmtCurrency(sumRows(rows, "backlogRevenue")), "Open backlog"),
    renderKpi("Order Qty", fmtCompact(sumRows(rows, "orderQty") || summary.unitsNet), "Real product Excel"),
  ].join("");
}

function renderDetailCharts(product, selectedPartNumber) {
  const target = document.querySelector("#detailCharts");
  if (!target) return;
  if (state.dimension === "competitor") {
    target.innerHTML = renderProductCompetitorDimension(product);
    return;
  }
  const geoMetric = flowMetricConfig(state.detailGeoMetric);
  if (state.dimension === "user") {
    target.innerHTML = `
      <div class="chart-shell">
        <div class="chart-title"><strong>${escapeHtml(modeledText("Keyword Cloud"))}</strong><span>${escapeHtml(selectedPeriod("detail"))}</span></div>
        <div id="detailUserWordCloud" class="word-cloud compact"></div>
      </div>
      ${chartShell("detailUserSentimentPlot", modeledText("Sentiment Trend"), `${granularityLabels[state.detailGranularity]} aggregation`)}
      ${chartShell("detailUserKeywordPlot", modeledText("Keyword Frequency"), "latest period")}
      ${chartShell("detailPlotB", modeledText("Rating / Return / Service Trend"), "combined user health", true)}
    `;
    drawReviewDetail(product);
  } else {
    const metric = flowMetricConfig(state.detailProductMetric);
    const focusKey = detailCurrentFocusKey(selectedPartNumber);
    const focusFilters = detailFiltersFromFocus(focusKey);
    const selectedGeo = validDetailSelectedGeo(product, focusFilters);
    const revenueTrendMode = detailTrendMode(product, "revenue", focusKey);
    const quantityTrendMode = detailTrendMode(product, "quantity", focusKey);
    const geoTrendFocusKey = selectedGeo ? `geo:${selectedGeo}` : "all";
    const geoTrendMode = detailTrendMode(product, "geo", geoTrendFocusKey);
    const countryTrendMode = detailTrendMode(product, "country", geoTrendFocusKey);
    const shareLabel = state.dimension === "product" ? "PN" : "Segment";
    const latestRows = detailProductRows(product, { selectedOnly: true });
    const revenueTotal = sumRows(latestRows, metric.revenueField);
    const quantityTotal = sumRows(latestRows, metric.quantityField);
    const selectedGeoRows = detailGeoRows(product, { ...focusFilters, selectedOnly: true });
    const geoTotal = sumGeoRows(selectedGeoRows, geoMetric.revenueField);
    const countryGeoRows = selectedGeo ? selectedGeoRows.filter((row) => (row.geo || "Unassigned") === selectedGeo) : selectedGeoRows;
    const countryTotal = sumGeoRows(countryGeoRows, geoMetric.revenueField);
    target.innerHTML = `
      ${detailChartRow(
        chartShellWithControls(
          "detailRevenueSharePlot",
          `${shareLabel} ${metric.revenueLabel} Share`,
          `Total ${formatMetricValue(metric.revenueField, revenueTotal)} · ${selectedPeriod("detail")}`,
          renderMetricSelect("detail-product-metric", state.detailProductMetric, flowMetricOptions),
        ),
        chartShellWithControls(
          "detailRevenueTrendPlot",
          `${flowMetricConfig(state.detailRevenueMetric).revenueLabel} Trend`,
          detailTrendMeta(revenueTrendMode, focusKey),
          `${renderMetricSelect("detail-revenue-metric", state.detailRevenueMetric, flowMetricOptions)}
          ${renderDetailTrendModeButtons(revenueTrendMode, "revenue")}`,
        ),
        "is-balanced",
      )}
      ${detailChartRow(
        chartShellWithControls(
          "detailQuantitySharePlot",
          `${shareLabel} ${metric.quantityLabel} Share`,
          `Total ${formatMetricValue(metric.quantityField, quantityTotal)} · ${selectedPeriod("detail")}`,
          renderMetricSelect("detail-product-metric", state.detailProductMetric, flowMetricOptions),
        ),
        chartShellWithControls(
          "detailQuantityTrendPlot",
          `${flowMetricConfig(state.detailQuantityMetric).quantityLabel} Trend`,
          detailTrendMeta(quantityTrendMode, focusKey),
          `${renderMetricSelect("detail-quantity-metric", state.detailQuantityMetric, flowMetricOptions)}
          ${renderDetailTrendModeButtons(quantityTrendMode, "quantity")}`,
        ),
        "is-balanced",
      )}
      ${detailChartRow(
        chartShellWithControls(
          "detailGeoSharePlot",
          `Geo ${geoMetric.revenueLabel} Share`,
          `Total ${formatMetricValue(geoMetric.revenueField, geoTotal)} · ${selectedPeriod("detail")}`,
          `${renderMetricSelect("detail-geo-metric", state.detailGeoMetric, flowMetricOptions)}
          ${renderDetailGeoLinkButton(product)}`,
        ),
        chartShellWithControls(
          "detailGeoTrendPlot",
          `Geo ${geoMetric.revenueLabel} by Quarter`,
          geoTrendMeta(geoTrendMode, selectedGeo, "geo"),
          `${renderMetricSelect("detail-geo-metric", state.detailGeoMetric, flowMetricOptions)}
          ${renderDetailTrendModeButtons(geoTrendMode, "geo")}`,
        ),
        "is-balanced",
      )}
      ${detailChartRow(
        chartShellWithControls(
          "detailCountrySharePlot",
          `Country ${geoMetric.revenueLabel} Share`,
          `Total ${formatMetricValue(geoMetric.revenueField, countryTotal)} · ${selectedPeriod("detail")}`,
          `${renderMetricSelect("detail-geo-metric", state.detailGeoMetric, flowMetricOptions)}
          ${renderDetailCountryResetButton(selectedGeo)}`,
        ),
        chartShellWithControls(
          "detailCountryTrendPlot",
          `Country ${geoMetric.revenueLabel} by Quarter`,
          geoTrendMeta(countryTrendMode, selectedGeo, "country"),
          `${renderMetricSelect("detail-geo-metric", state.detailGeoMetric, flowMetricOptions)}
          ${renderDetailTrendModeButtons(countryTrendMode, "country")}`,
        ),
        "is-balanced",
      )}
    `;
    drawDetailProductPerformance(product, selectedPartNumber);
    drawProductGeoDetail(product, focusFilters);
  }
}

function renderProductCompetitorDimension(product) {
  const selectedCountry = selectedCompetitorCountry(product.categoryId);
  const rows = competitorRowsForSelection(product.categoryId, product.id, selectedCountry.code);
  const summary = summarizeCompetitorRows(rows, product);
  return `
    <section class="product-competitor-module">
      <header class="product-competitor-head">
        <div>
          <p class="eyebrow">Competitor Dimension</p>
          <h2>Marketplace Competitor Comparison</h2>
          <p>Review comparable products for this Lenovo model by country. Marketplace metrics are shown only when a source export has been loaded.</p>
        </div>
        <label class="filter-group product-competitor-country">
          <span>Country / Market</span>
          <select data-action="competitor-country">
            ${competitorCountries.map((country) => `<option value="${escapeAttr(country.code)}" ${country.code === selectedCountry.code ? "selected" : ""}>${escapeHtml(country.label)}</option>`).join("")}
          </select>
        </label>
      </header>
      <section class="competitor-market-header">
        ${renderCompetitorLenovoContext(product)}
        <div class="competitor-market-kpis">
          ${renderCompetitorKpi("Loaded Competitors", fmtExactNumber(rows.length), selectedCountry.label)}
          ${renderCompetitorKpi("Monthly Sales Qty", fmtExactNumber(summary.monthlyUnits), "marketplace export")}
          ${renderCompetitorKpi("Monthly Sales Revenue", fmtExactCurrency(summary.monthlyRevenue), "marketplace export")}
          ${renderCompetitorKpi("Weighted AUR", fmtExactCurrency(summary.aur), "revenue / sales qty")}
          ${renderCompetitorKpi("Avg Rating", summary.rating ? summary.rating.toFixed(1) : "—", "review-weighted")}
          ${renderCompetitorKpi("Avg Price Index", summary.priceIndex ? `${(summary.priceIndex * 100).toFixed(1)}%` : "—", "vs Lenovo RSP")}
        </div>
      </section>
      <section class="competitor-results">
        ${rows.length ? rows.map((row) => renderMarketplaceCompetitorCard(row, product)).join("") : renderCompetitorEmptyState(product, selectedCountry)}
      </section>
    </section>
  `;
}

function detailChartRow(mainMarkup, sideMarkup = "", modifier = "") {
  return `
    <section class="detail-chart-row ${sideMarkup ? "has-side" : "is-main-only"} ${modifier}">
      ${mainMarkup}
      ${sideMarkup}
    </section>
  `;
}

function validDetailSelectedGeo(product, filters = {}) {
  const partNumber = filters.partNumber ?? (state.dimension === "product" ? state.partNumber : "all");
  const segment = filters.segment ?? (state.dimension === "segment" ? state.segmentFilter : "all");
  const selected = state.detailSelectedGeo[product.id];
  if (!selected) return null;
  const rows = detailGeoRows(product, { partNumber, segment, selectedOnly: true });
  return rows.some((row) => (row.geo || "Unassigned") === selected) ? selected : null;
}

function detailCurrentFocusKey(selectedPartNumber = state.partNumber) {
  if (state.dimension === "product") return detailPartNumberKey(selectedPartNumber);
  return detailSegmentKey(state.segmentFilter);
}

function setDetailFocusFromPie(product, itemKey) {
  delete state.detailSelectedGeo[product.id];
  if (state.dimension === "product") {
    state.partNumber = itemKey === "all" ? "all" : detailItemLabel(itemKey);
  } else {
    state.segmentFilter = itemKey === "all" ? "all" : detailItemLabel(itemKey);
  }
  const mode = itemKey === "all" ? "overall" : "breakdown";
  state.detailRevenueTrendMode[product.id] = mode;
  state.detailQuantityTrendMode[product.id] = mode;
  state.detailGeoTrendMode[product.id] = "overall";
  state.detailCountryTrendMode[product.id] = "overall";
}

function setDetailFocusFromTrend(product, itemKey, target = "revenue") {
  delete state.detailSelectedGeo[product.id];
  if (state.dimension === "product") {
    state.partNumber = itemKey === "all" ? "all" : detailItemLabel(itemKey);
  } else {
    state.segmentFilter = itemKey === "all" ? "all" : detailItemLabel(itemKey);
  }
  detailTrendModeStore(target)[product.id] = "focus";
  state.detailGeoTrendMode[product.id] = "overall";
  state.detailCountryTrendMode[product.id] = "overall";
}

function detailTrendModeStore(target) {
  if (target === "quantity") return state.detailQuantityTrendMode;
  if (target === "geo") return state.detailGeoTrendMode;
  if (target === "country") return state.detailCountryTrendMode;
  return state.detailRevenueTrendMode;
}

function detailTrendMode(product, target, focusKey = detailCurrentFocusKey()) {
  const stored = detailTrendModeStore(target)[product.id];
  if (["overall", "breakdown", "focus"].includes(stored)) return stored;
  return focusKey === "all" ? "overall" : "breakdown";
}

function renderDetailTrendModeButtons(activeMode, target) {
  return `
    <div class="segmented trend-mode-control" aria-label="Trend view">
      <button type="button" class="${activeMode === "overall" ? "is-active" : ""}" data-action="detail-trend-mode" data-trend-target="${escapeAttr(target)}" data-trend-mode="overall">Overall</button>
      <button type="button" class="${activeMode !== "overall" ? "is-active" : ""}" data-action="detail-trend-mode" data-trend-target="${escapeAttr(target)}" data-trend-mode="breakdown">Breakdown</button>
    </div>
  `;
}

function renderDetailGeoLinkButton(product) {
  const isActive = Boolean(state.detailGeoLinkEnabled[product.id]);
  return `
    <div class="inline-field geo-link-field">
      <span>Geo Link</span>
      <div class="segmented trend-mode-control geo-link-control" aria-label="Geo country link">
        <button type="button" class="${!isActive ? "is-active" : ""}" data-action="detail-geo-link-toggle" data-link-enabled="false">Off</button>
        <button type="button" class="${isActive ? "is-active" : ""}" data-action="detail-geo-link-toggle" data-link-enabled="true">On</button>
      </div>
    </div>
  `;
}

function renderDetailCountryResetButton(selectedGeo) {
  if (!selectedGeo) return "";
  return `
    <div class="segmented trend-mode-control" aria-label="Country reset">
      <button type="button" data-action="detail-clear-geo">Reset Country</button>
    </div>
  `;
}

function detailTrendMeta(mode, focusKey) {
  if (mode === "overall") return "Overall total";
  if (mode === "focus") return `${detailItemLabel(focusKey)} only`;
  if (focusKey === "all") return state.dimension === "product" ? "All PN lines" : "Consumer / Commercial lines";
  return `${detailItemLabel(focusKey)} highlighted`;
}

function geoTrendMeta(mode, selectedGeo, scope) {
  if (mode === "overall") return scope === "country" && selectedGeo ? `${displayLocationLabel(selectedGeo)} total` : "Overall total";
  if (scope === "geo") return selectedGeo ? `${displayLocationLabel(selectedGeo)} highlighted` : "All geo lines";
  return selectedGeo ? `${displayLocationLabel(selectedGeo)} country lines` : "All country lines";
}

function plotClickValue(point) {
  if (!point) return null;
  const pointIndex = Number.isInteger(point.pointNumber) ? point.pointNumber : Number.isInteger(point.pointIndex) ? point.pointIndex : null;
  if (point.id) return point.id;
  if (Array.isArray(point.customdata)) return pointIndex === null ? point.label || null : point.customdata[pointIndex] ?? point.label ?? null;
  if (point.customdata) return point.customdata;
  const traceCustomdata = point.data?.customdata;
  if (Array.isArray(traceCustomdata)) return pointIndex === null ? point.label || null : traceCustomdata[pointIndex] ?? point.label ?? null;
  return point.label || null;
}

function pieClickValue(point, slices) {
  const label = point?.label;
  if (label) {
    const byDisplayLabel = slices.find((slice) => displayLocationLabel(slice.name) === label);
    if (byDisplayLabel) return byDisplayLabel.name;
  }
  const direct = plotClickValue(point);
  if (!direct) return null;
  const byDisplayLabel = slices.find((slice) => displayLocationLabel(slice.name) === direct);
  return byDisplayLabel?.name || direct;
}

function setPlotClickHandler(node, handler) {
  if (!node?.on) return;
  if (node._codexPlotClickHandler && node.removeListener) {
    node.removeListener("plotly_click", node._codexPlotClickHandler);
  } else if (node.removeAllListeners) {
    node.removeAllListeners("plotly_click");
  }
  delete node._codexPlotClickHandler;
  if (!handler) return;
  node._codexPlotClickHandler = handler;
  node.on("plotly_click", handler);
}

function detailBreakdownItems(product) {
  const rows = detailProductRows(product, { selectedOnly: false });
  if (state.dimension === "product") {
    const partNumbers = product.partNumbers?.length ? product.partNumbers : unique(rows.map((row) => row.partNumber).filter(Boolean));
    return partNumbers.map((partNumber) => ({
      key: detailPartNumberKey(partNumber),
      label: partNumber,
      shortLabel: shortPartNumberLabel(partNumber),
    }));
  }
  return ["Consumer", "Commercial"]
    .filter((segment) => rows.some((row) => row.segment === segment))
    .map((segment) => ({ key: detailSegmentKey(segment), label: segment, shortLabel: segment }));
}

function detailTrendItemKeys(product, focusKey, mode) {
  if (mode === "overall") return ["all"];
  if (mode === "focus") return [focusKey || "all"];
  const keys = detailBreakdownItems(product).map((item) => item.key);
  return keys.length ? keys : ["all"];
}

function detailSegmentKey(segment) {
  return !segment || segment === "all" ? "all" : `segment:${segment}`;
}

function detailPartNumberKey(partNumber) {
  return !partNumber || partNumber === "all" ? "all" : `pn:${partNumber}`;
}

function detailItemLabel(key) {
  if (!key || key === "all") return "All";
  if (key.startsWith("segment:")) return key.slice("segment:".length);
  if (key.startsWith("pn:")) return key.slice("pn:".length);
  return key;
}

function shortPartNumberLabel(partNumber) {
  if (!partNumber) return "PN";
  if (partNumber.length <= 12) return partNumber;
  return `${partNumber.slice(0, 6)}…${partNumber.slice(-4)}`;
}

function compactPartNumberLabel(partNumber) {
  if (!partNumber) return "PN";
  if (partNumber.length <= 8) return partNumber;
  return `${partNumber.slice(0, 4)}…${partNumber.slice(-3)}`;
}

function detailFiltersFromFocus(key) {
  if (key?.startsWith("segment:")) return { segment: detailItemLabel(key), partNumber: "all" };
  if (key?.startsWith("pn:")) return { segment: "all", partNumber: detailItemLabel(key) };
  return { segment: "all", partNumber: "all" };
}

function detailRowsForItem(product, itemKey, selectedOnly = false) {
  const filters = detailFiltersFromFocus(itemKey);
  return detailProductRows(product, { selectedOnly, ...filters });
}

function growthSeries(values) {
  return values.map((value, idx) => {
    if (idx === 0) return null;
    const previous = values[idx - 1];
    if (!previous) return null;
    return ((value - previous) / Math.abs(previous)) * 100;
  });
}

function drawDetailProductPerformance(product, selectedPartNumber) {
  const metric = flowMetricConfig(state.detailProductMetric);
  const revenueMetric = flowMetricConfig(state.detailRevenueMetric);
  const quantityMetric = flowMetricConfig(state.detailQuantityMetric);
  const focusKey = detailCurrentFocusKey(selectedPartNumber);
  const revenueTrendMode = detailTrendMode(product, "revenue", focusKey);
  const quantityTrendMode = detailTrendMode(product, "quantity", focusKey);
  const revenueTrendItemKeys = detailTrendItemKeys(product, focusKey, revenueTrendMode);
  const quantityTrendItemKeys = detailTrendItemKeys(product, focusKey, quantityTrendMode);
  drawDetailDimensionPie("detailRevenueSharePlot", product, metric.revenueField, metric.revenueLabel, focusKey);
  drawDetailDimensionPie("detailQuantitySharePlot", product, metric.quantityField, metric.quantityLabel, focusKey);
  drawDetailTrendLines("detailRevenueTrendPlot", product, revenueTrendItemKeys, revenueMetric.revenueField, revenueMetric.revenueLabel, {
    focusKey,
    trendMode: revenueTrendMode,
    trendTarget: "revenue",
  });
  drawDetailTrendLines("detailQuantityTrendPlot", product, quantityTrendItemKeys, quantityMetric.quantityField, quantityMetric.quantityLabel, {
    focusKey,
    trendMode: quantityTrendMode,
    trendTarget: "quantity",
  });
}

function drawDetailDimensionPie(id, product, metricField, metricLabelText, focusKey) {
  const rows = detailProductRows(product, { selectedOnly: true });
  const isProductPie = state.dimension === "product";
  const rawItems =
    state.dimension === "product"
      ? (product.partNumbers?.length ? product.partNumbers : unique(rows.map((row) => row.partNumber).filter(Boolean))).map((partNumber) => ({
          key: detailPartNumberKey(partNumber),
          label: partNumber,
          shortLabel: compactPartNumberLabel(partNumber),
          value: sumRows(rows.filter((row) => row.partNumber === partNumber), metricField),
        }))
      : ["Consumer", "Commercial"].map((segment) => ({
          key: detailSegmentKey(segment),
          label: segment,
          shortLabel: segment,
          value: sumRows(rows.filter((row) => row.segment === segment), metricField),
        }));
  const valuedItems = rawItems.filter((item) => item.value);
  const total = valuedItems.reduce((sum, item) => sum + item.value, 0);
  const slices = isProductPie ? compactProductPieSlices(valuedItems, focusKey) : valuedItems;
  if (!valuedItems.length || !total) {
    drawPlot(id, [], {});
    return;
  }
  const colors = slices.map((item, idx) => (focusKey === "all" || item.key === focusKey ? palette[idx % palette.length] : "#e8e2d9"));
  const node = drawPlot(
    id,
    [{
      labels: slices.map((item) => item.shortLabel || item.label),
      customdata: slices.map((item) => item.key),
      values: slices.map((item) => item.value),
      type: "pie",
      hole: isProductPie ? 0.52 : 0.42,
      sort: false,
      textinfo: "label+percent",
      textposition: "outside",
      textfont: { size: isProductPie ? 10 : 12 },
      hovertext: slices.map((item) => item.label),
      automargin: true,
      hovertemplate: `<b>%{hovertext}</b><br>${metricLabelText}: ${metricField.toLowerCase().includes("revenue") ? "$" : ""}%{value:,.0f}<br>Share: %{percent}<extra></extra>`,
      marker: { colors, line: { color: "#ffffff", width: 2 } },
    }],
    {
      margin: isProductPie ? { l: 68, r: 68, t: 8, b: 30 } : { l: 54, r: 54, t: 8, b: 26 },
      showlegend: false,
      legend: { orientation: "h", y: -0.18, x: 0 },
      annotations: [
        {
          text: `<b>${escapeHtml(formatMetricValue(metricField, total))}</b><br><span style="font-size:11px;color:#6b7280">Total</span>`,
          showarrow: false,
          x: 0.5,
          y: 0.5,
          xref: "paper",
          yref: "paper",
          align: "center",
        },
      ],
    },
  );
  if (node?.on) {
    setPlotClickHandler(node, (eventData) => {
      const itemKey = eventData?.points?.[0]?.customdata;
      if (!itemKey || itemKey === "__other__") return;
      setDetailFocusFromPie(product, itemKey);
      render();
    });
  }
}

function compactProductPieSlices(items, focusKey) {
  const maxSlices = 6;
  if (items.length <= maxSlices) return items;
  const sorted = items.slice().sort((a, b) => b.value - a.value);
  let kept = sorted.slice(0, maxSlices - 1);
  const focused = focusKey !== "all" ? sorted.find((item) => item.key === focusKey) : null;
  if (focused && !kept.some((item) => item.key === focused.key)) {
    kept = [...sorted.slice(0, maxSlices - 2), focused];
  }
  const keptKeys = new Set(kept.map((item) => item.key));
  const otherItems = sorted.filter((item) => !keptKeys.has(item.key));
  if (otherItems.length) {
    kept.push({
      key: "__other__",
      label: `${otherItems.length} other PN`,
      shortLabel: "Other PN",
      value: otherItems.reduce((sum, item) => sum + item.value, 0),
    });
  }
  return kept;
}

function drawDetailTrendLines(id, product, itemKeys, metricField, metricLabelText, options = {}) {
  const baseRows = detailProductRows(product, { selectedOnly: false });
  const periods = sortedPeriods(unique(baseRows.map((row) => periodKey(row.date, state.detailGranularity))));
  const focusKey = options.focusKey || itemKeys[0] || "all";
  const trendMode = options.trendMode || "focus";
  const trendTarget = options.trendTarget || "revenue";
  const isRevenue = metricField.toLowerCase().includes("revenue");
  const hoverValue = isRevenue ? "$%{y:,.2f}" : "%{y:,.0f}";
  const traces = itemKeys.map((itemKey, idx) => {
    const rows = detailRowsForItem(product, itemKey, false);
    const byPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
    const values = periods.map((period) => summaryMetricValue(byPeriod.get(period) || {}, metricField));
    const isMuted = trendMode === "breakdown" && focusKey !== "all" && itemKey !== focusKey;
    const isFocused = itemKey === focusKey || trendMode === "overall";
    return {
      x: periods,
      y: values,
      customdata: periods.map(() => itemKey),
      name: detailItemLabel(itemKey),
      type: "scatter",
      mode: "lines+markers",
      opacity: isMuted ? 0.22 : 1,
      line: { color: detailTrendColor(itemKey, idx), width: isFocused ? 3.6 : 2.2 },
      marker: { size: isFocused ? 8 : 5 },
      hovertemplate: `<b>${escapeHtml(detailItemLabel(itemKey))}</b><br>%{x}<br>${metricLabelText}: ${hoverValue}<extra></extra>`,
    };
  });
  const node = drawPlot(id, traces, {
    margin: { l: 66, r: 28, t: 8, b: 58 },
    yaxis: { title: metricLabelText, tickprefix: isRevenue ? "$" : "" },
  });
  if (node?.on) {
    setPlotClickHandler(node, (eventData) => {
      const itemKey = eventData?.points?.[0]?.customdata || itemKeys[eventData?.points?.[0]?.curveNumber || 0];
      if (!itemKey) return;
      setDetailFocusFromTrend(product, itemKey, trendTarget);
      render();
    });
  }
}

function detailTrendColor(itemKey, idx) {
  if (itemKey === "all") return "#1f2328";
  if (itemKey.startsWith("segment:Consumer")) return "#e2231a";
  if (itemKey.startsWith("segment:Commercial")) return "#0f766e";
  return palette[(idx + 2) % palette.length];
}

function drawSegmentDetail(product) {
  const rows = detailProductRows(product, { selectedOnly: false, segment: state.segmentFilter });
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const revenueMetric = flowMetricConfig(state.detailRevenueMetric);
  const quantityMetric = flowMetricConfig(state.detailQuantityMetric);
  const activeLabel = state.segmentFilter === "all" ? "All Segments" : state.segmentFilter;
  const revenueByPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const revenueValues = periods.map((period) => summaryMetricValue(revenueByPeriod.get(period) || {}, revenueMetric.revenueField));
  const revenueTraces = [
    {
      x: periods,
      y: revenueValues,
      name: activeLabel,
      type: "bar",
      marker: { color: "#e2231a" },
    },
    {
      x: periods,
      y: growthSeries(revenueValues),
      name: `${revenueMetric.revenueLabel} Growth %`,
      type: "scatter",
      mode: "lines+markers",
      yaxis: "y2",
      line: { color: "#1f2328", width: 2.8 },
      hovertemplate: `%{x}<br>${revenueMetric.revenueLabel} Growth %{y:.1f}%<extra></extra>`,
    },
  ];
  drawPlot("detailPlotA", revenueTraces, {
    yaxis: { title: revenueMetric.revenueLabel, tickprefix: "$" },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });

  const quantityByPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const quantityValues = periods.map((period) => summaryMetricValue(quantityByPeriod.get(period) || {}, quantityMetric.quantityField));
  const quantityTraces = [
    {
      x: periods,
      y: quantityValues,
      name: activeLabel,
      type: "bar",
      marker: { color: "#e2231a" },
    },
    {
      x: periods,
      y: growthSeries(quantityValues),
      name: `${quantityMetric.quantityLabel} Growth %`,
      type: "scatter",
      mode: "lines+markers",
      yaxis: "y2",
      line: { color: "#1f2328", width: 2.8 },
      hovertemplate: `%{x}<br>${quantityMetric.quantityLabel} Growth %{y:.1f}%<extra></extra>`,
    },
  ];
  drawPlot("detailPlotB", quantityTraces, {
    yaxis: { title: quantityMetric.quantityLabel },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });

  if (state.segmentFilter === "all") {
    const shareRows = detailProductRows(product, { selectedOnly: true, segment: "all" });
    drawDetailSharePie("detailRevenueSharePlot", shareRows, "segment", revenueMetric.revenueField, revenueMetric.revenueLabel);
    drawDetailSharePie("detailQuantitySharePlot", shareRows, "segment", quantityMetric.quantityField, quantityMetric.quantityLabel);
  }
}

function drawPartNumberDetail(product, selectedPartNumber) {
  const rows = detailProductRows(product, { selectedOnly: false, partNumber: selectedPartNumber });
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const revenueMetric = flowMetricConfig(state.detailRevenueMetric);
  const quantityMetric = flowMetricConfig(state.detailQuantityMetric);
  const activeLabel = selectedPartNumber === "all" ? "All PN" : selectedPartNumber;
  const byPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const revenueValues = periods.map((period) => summaryMetricValue(byPeriod.get(period) || {}, revenueMetric.revenueField));
  const revenueTraces = [
    {
      x: periods,
      y: revenueValues,
      name: activeLabel,
      type: "bar",
      marker: { color: "#e2231a" },
    },
    {
      x: periods,
      y: growthSeries(revenueValues),
      name: `${revenueMetric.revenueLabel} Growth %`,
      type: "scatter",
      mode: "lines+markers",
      yaxis: "y2",
      line: { color: "#1f2328", width: 2.8 },
      hovertemplate: `%{x}<br>${revenueMetric.revenueLabel} Growth %{y:.1f}%<extra></extra>`,
    },
  ];
  drawPlot("detailPlotA", revenueTraces, {
    yaxis: { title: revenueMetric.revenueLabel, tickprefix: "$" },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });

  const quantityValues = periods.map((period) => summaryMetricValue(byPeriod.get(period) || {}, quantityMetric.quantityField));
  drawPlot(
    "detailPlotB",
    [
      {
        x: periods,
        y: quantityValues,
        name: activeLabel,
        type: "bar",
        marker: { color: "#e2231a" },
      },
      {
        x: periods,
        y: growthSeries(quantityValues),
        name: `${quantityMetric.quantityLabel} Growth %`,
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#1f2328", width: 2.6 },
        hovertemplate: `%{x}<br>${quantityMetric.quantityLabel} Growth %{y:.1f}%<extra></extra>`,
      },
    ],
    {
      yaxis: { title: quantityMetric.quantityLabel },
      yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
  );

  if (selectedPartNumber === "all") {
    const shareRows = detailProductRows(product, { selectedOnly: true, partNumber: "all" });
    drawDetailSharePie("detailRevenueSharePlot", shareRows, "partNumber", revenueMetric.revenueField, revenueMetric.revenueLabel);
    drawDetailSharePie("detailQuantitySharePlot", shareRows, "partNumber", quantityMetric.quantityField, quantityMetric.quantityLabel);
  }
}

function drawDetailSharePie(id, rows, groupField, metricField, metricLabelText, options = {}) {
  const grouped = unique(rows.map((row) => row[groupField] || "Unassigned"))
    .map((name) => ({
      name,
      value: rows.filter((row) => (row[groupField] || "Unassigned") === name).reduce((sum, row) => sum + (row[metricField] || 0), 0),
    }))
    .filter((row) => row.value)
    .sort((a, b) => b.value - a.value);
  const slices = grouped.slice(0, 8);
  const otherValue = grouped.slice(8).reduce((sum, row) => sum + row.value, 0);
  if (otherValue) slices.push({ name: "Other", value: otherValue });
  const valuePrefix = metricField.toLowerCase().includes("revenue") ? "$" : "";
  const inlineLabels = Boolean(options.inlineLabels);
  const outsideLabels = Boolean(options.outsideLabels);
  const showLegend = options.showLegend ?? (!inlineLabels && !outsideLabels);
  const total = slices.reduce((sum, row) => sum + row.value, 0);
  const node = drawPlot(
    id,
    slices.length
      ? [
          {
            labels: slices.map((row) => displayLocationLabel(row.name)),
            ids: slices.map((row) => row.name),
            customdata: slices.map((row) => row.name),
            values: slices.map((row) => row.value),
            type: "pie",
            hole: 0.42,
            textinfo: "label+percent",
            textposition: inlineLabels ? "inside" : "outside",
            insidetextorientation: inlineLabels ? "radial" : undefined,
            automargin: true,
            hovertemplate: `<b>%{label}</b><br>${metricLabelText} ${valuePrefix}%{value:,.0f}<br>%{percent}<extra></extra>`,
            marker: { colors: slices.map((_, idx) => palette[idx % palette.length]) },
          },
        ]
      : [],
    {
      margin: inlineLabels ? { l: 12, r: 12, t: 8, b: 12 } : outsideLabels ? { l: 54, r: 54, t: 8, b: 26 } : { l: 28, r: 28, t: 8, b: 42 },
      showlegend: showLegend,
      legend: { orientation: "h", y: -0.18, x: 0 },
      annotations: [
        {
          text: `<b>${escapeHtml(formatMetricValue(metricField, total))}</b><br><span style="font-size:11px;color:#6b7280">Total</span>`,
          showarrow: false,
          x: 0.5,
          y: 0.5,
          xref: "paper",
          yref: "paper",
          align: "center",
        },
      ],
    },
  );
  if (node?.on) {
    setPlotClickHandler(
      node,
      options.onClick
        ? (eventData) => {
        const name = pieClickValue(eventData?.points?.[0], slices);
        if (name && name !== "Other") options.onClick(name);
          }
        : null,
    );
  }
}

function drawProductGeoDetail(product, { partNumber = "all", segment = "all" } = {}) {
  const trendRows = detailGeoRows(product, { partNumber, segment, selectedOnly: false });
  const periods = sortedPeriods(unique(trendRows.map((row) => periodKey(row.date, state.detailGranularity))));
  const metric = flowMetricConfig(state.detailGeoMetric);
  const selectedRows = detailGeoRows(product, { partNumber, segment, selectedOnly: true });
  const selectedGeo = validDetailSelectedGeo(product, { partNumber, segment });
  const geoTrendMode = detailTrendMode(product, "geo", selectedGeo ? `geo:${selectedGeo}` : "all");
  const countryTrendMode = detailTrendMode(product, "country", selectedGeo ? `geo:${selectedGeo}` : "all");
  const isRevenueMetric = metric.revenueField.toLowerCase().includes("revenue");
  const hoverValue = isRevenueMetric ? "$%{y:,.2f}" : "%{y:,.0f}";
  const geoLinkEnabled = Boolean(state.detailGeoLinkEnabled[product.id]);
  const selectLinkedGeo = (geo) => {
    if (!geo || geo === "Other") return;
    state.detailGeoLinkEnabled[product.id] = true;
    state.detailSelectedGeo[product.id] = geo;
    state.detailGeoTrendMode[product.id] = "breakdown";
    state.detailCountryTrendMode[product.id] = "breakdown";
    render();
  };

  drawDetailSharePie("detailGeoSharePlot", selectedRows, "geo", metric.revenueField, metric.revenueLabel, {
    outsideLabels: true,
    showLegend: false,
    onClick: selectLinkedGeo,
  });

  const countrySelectedRows = selectedGeo ? selectedRows.filter((row) => (row.geo || "Unassigned") === selectedGeo) : selectedRows;
  drawDetailSharePie("detailCountrySharePlot", countrySelectedRows, "country", metric.revenueField, metric.revenueLabel, { outsideLabels: true, showLegend: false });

  const traces =
    geoTrendMode === "overall"
      ? [
          {
            x: periods,
            y: periods.map((period) => sumGeoRows(trendRows.filter((row) => periodKey(row.date, state.detailGranularity) === period), metric.revenueField)),
            name: "All Geo",
            type: "scatter",
            mode: "lines+markers",
            line: { color: "#1f2328", width: 3.4 },
            marker: { color: "#1f2328", size: 8 },
            hovertemplate: `<b>All Geo</b><br>%{x}<br>${metric.revenueLabel}: ${hoverValue}<extra></extra>`,
          },
        ]
      : topGeoNamesByMetric(trendRows, metric.revenueField).map((geo, idx) => {
          const isMuted = selectedGeo && geo !== selectedGeo;
          const color = palette[idx % palette.length];
          return {
            x: periods,
            customdata: periods.map(() => geo),
            y: periods.map((period) =>
              sumGeoRows(
                trendRows.filter((row) => (row.geo || "Unassigned") === geo && periodKey(row.date, state.detailGranularity) === period),
                metric.revenueField,
              ),
            ),
            name: displayLocationLabel(geo),
            type: "scatter",
            mode: "lines+markers",
            opacity: isMuted ? 0.22 : 1,
            line: { color, width: selectedGeo === geo ? 3.6 : 2.4 },
            marker: { color, size: selectedGeo === geo ? 8 : 6 },
            hovertemplate: `<b>${escapeHtml(displayLocationLabel(geo))}</b><br>%{x}<br>${metric.revenueLabel}: ${hoverValue}<extra></extra>`,
          };
        });
  const geoNode = drawPlot("detailGeoTrendPlot", traces, {
    margin: { l: 66, r: 28, t: 8, b: 58 },
    yaxis: { title: metric.revenueLabel, tickprefix: "$" },
  });
  if (geoNode?.on) {
    setPlotClickHandler(
      geoNode,
      geoLinkEnabled
        ? (eventData) => {
            selectLinkedGeo(plotClickValue(eventData?.points?.[0]));
          }
        : null,
    );
  }

  const countryTrendRows = selectedGeo ? trendRows.filter((row) => (row.geo || "Unassigned") === selectedGeo) : trendRows;
  const countryOverallName = selectedGeo ? `${displayLocationLabel(selectedGeo)} Total` : "All Countries";
  const countryTraces =
    countryTrendMode === "overall"
      ? [
          {
            x: periods,
            y: periods.map((period) => sumGeoRows(countryTrendRows.filter((row) => periodKey(row.date, state.detailGranularity) === period), metric.revenueField)),
            name: countryOverallName,
            type: "scatter",
            mode: "lines+markers",
            line: { color: "#1f2328", width: 3.4 },
            marker: { color: "#1f2328", size: 8 },
            hovertemplate: `<b>${escapeHtml(countryOverallName)}</b><br>%{x}<br>${metric.revenueLabel}: ${hoverValue}<extra></extra>`,
          },
        ]
      : topCountryNamesByMetric(countryTrendRows, metric.revenueField).map((country, idx) => {
          const color = palette[idx % palette.length];
          return {
            x: periods,
            customdata: periods.map(() => country),
            y: periods.map((period) =>
              sumGeoRows(
                countryTrendRows.filter((row) => (row.country || "Unassigned") === country && periodKey(row.date, state.detailGranularity) === period),
                metric.revenueField,
              ),
            ),
            name: displayLocationLabel(country),
            type: "scatter",
            mode: "lines+markers",
            line: { color, width: 2.6 },
            marker: { color, size: 6 },
            hovertemplate: `<b>${escapeHtml(displayLocationLabel(country))}</b><br>%{x}<br>${metric.revenueLabel}: ${hoverValue}<extra></extra>`,
          };
        });
  drawPlot("detailCountryTrendPlot", countryTraces, {
    margin: { l: 66, r: 28, t: 8, b: 58 },
    yaxis: { title: metric.revenueLabel, tickprefix: "$" },
  });
}

function detailGeoRows(product, { partNumber = "all", segment = "all", selectedOnly = true } = {}) {
  return (data.geoMetrics || []).filter((row) => {
    if (row.modelId !== product.id) return false;
    if (partNumber !== "all" && row.partNumber !== partNumber) return false;
    if (segment !== "all" && row.segment !== segment) return false;
    if (selectedOnly && !rowInSelectedPeriod(row, "detail")) return false;
    return true;
  });
}

function drawMarketDetail(product) {
  const rows = data.marketMetrics.filter((row) => row.modelId === product.id);
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const byPeriod = aggregateMarketRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  drawPlot(
    "detailPlotA",
    [
      {
        x: periods,
        y: periods.map((period) => (byPeriod.get(period)?.modelMarketShare || 0) * 100),
        name: "Model Share",
        type: "scatter",
        mode: "lines+markers",
        line: { color: indexes.categories.get(product.categoryId).accent, width: 3 },
      },
      {
        x: periods,
        y: periods.map((period) => (byPeriod.get(period)?.modelRevenueShareWithinLenovo || 0) * 100),
        name: "Lenovo Sales Mix",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#1f2328", width: 2.5 },
      },
    ],
    { yaxis: { title: "Share %", ticksuffix: "%" } },
  );
  drawPlot(
    "detailPlotB",
    [
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.totalMarketUnits || 0),
        name: modeledText("Market Units"),
        type: "bar",
        marker: { color: "#d97706" },
      },
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.searchIndex || 0),
        name: modeledText("Search Index"),
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#2563eb", width: 2 },
      },
    ],
    {
      yaxis: { title: "Units" },
      yaxis2: { title: "Index", overlaying: "y", side: "right", showgrid: false },
    },
  );
}

function drawProductDetail(product, selectedVariant) {
  const rows = data.productMetrics.filter((row) => {
    if (row.modelId !== product.id) return false;
    return selectedVariant === "all" || row.variantId === selectedVariant;
  });
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const byPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  drawPlot(
    "detailPlotA",
    [
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.unitsNet || 0),
        name: "Units",
        type: "bar",
        marker: { color: "#e2231a" },
      },
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.orderRevenue || byPeriod.get(period)?.revenueNet || 0),
        name: "Order_Rev",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#1f2328", width: 2.6 },
      },
    ],
    {
      yaxis: { title: "Units" },
      yaxis2: { title: "Order_Rev", overlaying: "y", side: "right", tickprefix: "$", showgrid: false },
    },
  );
  drawPlot(
    "detailPlotB",
    [
      {
        x: periods,
        y: periods.map((period) => {
          const summary = byPeriod.get(period);
          return summary ? summary.revenueNet - summary.grossProfit : 0;
        }),
        name: modeledText("Cost"),
        type: "bar",
        marker: { color: "#6b7280" },
      },
      {
        x: periods,
        y: periods.map((period) => (byPeriod.get(period)?.margin || 0) * 100),
        name: modeledText("Gross Margin"),
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#e2231a", width: 2.6 },
      },
    ],
    {
      yaxis: { title: modeledText("Cost"), tickprefix: "$" },
      yaxis2: { title: modeledText("Gross Margin %"), overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
  );
}

function getComparableBrandRows(product) {
  const brandRows = brandRowsForSelectedPeriod(product.categoryId, true);
  const powerSegment = productPowerSegment(product);
  const priceBand = priceBandForProduct(product);
  const portCount = productPortCount(product);
  const premium = {
    Apple: 1.18,
    Anker: 1.08,
    Belkin: 1.04,
    Lenovo: 1,
    Samsung: 0.98,
    UGREEN: 0.92,
    Ugreen: 0.92,
    Baseus: 0.86,
    RAVPower: 0.9,
    Xiaomi: 0.82,
    Aukey: 0.84,
    "Amazon Basics": 0.72,
  };
  const comparable = brandRows.map((row) => {
    const brand = row.brand;
    const powerFit = competitorPowerWeight(product.categoryId, brand, powerSegment);
    const priceFit = competitorPriceBandWeight(brand, priceBand);
    const portFit = portCount >= 3 ? (["Anker", "Belkin", "Lenovo"].includes(brand) ? 0.34 : 0.22) : portCount === 2 ? 0.28 : 0.2;
    const comparableScore = row.brandUnits * (0.42 + powerFit * 2.1 + priceFit * 1.15 + portFit);
    return {
      ...row,
      comparableScore,
      avgAUR: brand === "Lenovo" ? product.listPrice : product.listPrice * (premium[brand] || 0.9) * (1 + Math.max(0, portCount - 1) * 0.035),
      specLabel: `${productPower(product)}W · ${productPortSegment(product)}`,
    };
  });
  const total = comparable.reduce((sum, row) => sum + row.comparableScore, 0) || 1;
  return comparable
    .map((row) => ({ ...row, marketShare: row.comparableScore / total }))
    .sort((a, b) => b.marketShare - a.marketShare)
    .slice(0, 7);
}

function drawCompetitorDetail(product) {
  const rows = getComparableBrandRows(product);
  drawPlot(
    "detailPlotA",
    [
      {
        x: rows.map((row) => row.brand),
        y: rows.map((row) => row.marketShare * 100),
        text: rows.map((row) => fmtPercent(row.marketShare)),
        customdata: rows.map((row) => [row.starProduct, row.heroFeature]),
        type: "bar",
        marker: { color: rows.map((row) => (row.brand === "Lenovo" ? "#e2231a" : "#1f2328")) },
        hovertemplate: "<b>%{x}</b><br>Share %{y:.1f}%<br>%{customdata[0]}<br>%{customdata[1]}<extra></extra>",
      },
    ],
    { yaxis: { title: "Comparable Share %", ticksuffix: "%" } },
  );
  drawPlot(
    "detailPlotB",
    [
      {
        x: rows.map((row) => row.avgAUR),
        y: rows.map((row) => row.brand),
        text: rows.map((row) => row.heroFeature),
        customdata: rows.map((row) => [row.starProduct, fmtPercent(row.marketShare)]),
        type: "bar",
        orientation: "h",
        marker: { color: rows.map((row) => (row.brand === "Lenovo" ? "#e2231a" : "#6b7280")) },
        hovertemplate: "<b>%{y}</b><br>AUR $%{x:.0f}<br>%{customdata[0]}<br>Share %{customdata[1]}<br>%{text}<extra></extra>",
      },
    ],
    { margin: { l: 98, r: 24, t: 8, b: 44 }, xaxis: { title: "Average Unit Price", tickprefix: "$" } },
  );
}

function drawSupplyDetail(product) {
  const rows = getSupplyRowsForProduct(product);
  const components = unique(rows.map((row) => row.componentType));
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const priceTraces = components.map((component, idx) => {
    const byPeriod = aggregateSupplyRows(
      rows.filter((row) => row.componentType === component),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.priceIndex || 0),
      name: component,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.2 },
    };
  });
  drawPlot("detailPlotA", priceTraces, { yaxis: { title: "Price Index" } });

  const byPeriod = aggregateSupplyRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  drawPlot(
    "detailPlotB",
    [
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.leadTimeDays || 0),
        name: "Lead Time",
        type: "bar",
        marker: { color: "#b45309" },
      },
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.capacityUtilization || 0),
        name: "Capacity Utilization",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#0f766e", width: 2 },
      },
    ],
    {
      yaxis: { title: "Days" },
      yaxis2: { title: "Utilization %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
  );
}

function drawReviewDetail(product) {
  const rows = data.consumerInsights.filter((row) => row.modelId === product.id);
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const latestRows = rows.filter((row) => rowInSelectedPeriod(row, "detail")).sort((a, b) => b.frequency - a.frequency);
  renderDetailWordCloud(latestRows);
  const sentiments = ["Positive", "Neutral", "Negative"];
  const colors = { Positive: "#15803d", Neutral: "#b45309", Negative: "#b91c1c" };
  const sentimentTraces = sentiments.map((sentiment) => {
    const byPeriod = aggregateReviewRows(
      rows.filter((row) => row.sentiment === sentiment),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.frequency || 0),
      name: sentiment,
      type: "bar",
      marker: { color: colors[sentiment] },
    };
  });
  drawPlot("detailUserSentimentPlot", sentimentTraces, { barmode: "stack", yaxis: { title: "Frequency" } });

  const topKeywords = latestRows.slice(0, 8).reverse();
  drawPlot(
    "detailUserKeywordPlot",
    [
      {
        x: topKeywords.map((row) => row.frequency),
        y: topKeywords.map((row) => row.keyword),
        type: "bar",
        orientation: "h",
        marker: { color: topKeywords.map((row) => colors[row.sentiment]) },
        name: "Keyword",
        hovertemplate: "<b>%{y}</b><br>Frequency %{x}<extra></extra>",
      },
    ],
    { margin: { l: 116, r: 22, t: 8, b: 42 }, xaxis: { title: "Frequency" } },
  );
  const reviewByPeriod = aggregateReviewRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const metricRows = data.productMetrics.filter((row) => row.modelId === product.id);
  const metricByPeriod = aggregateProductRows(metricRows, (row) => periodKey(row.date, state.detailGranularity));
  const negativeShareByPeriod = new Map(
    periods.map((period) => {
      const bucket = rows.filter((row) => periodKey(row.date, state.detailGranularity) === period);
      const total = bucket.reduce((sum, row) => sum + row.frequency, 0) || 1;
      const negative = bucket.filter((row) => row.sentiment === "Negative").reduce((sum, row) => sum + row.frequency, 0);
      return [period, negative / total];
    }),
  );
  drawPlot(
    "detailPlotB",
    [
      {
        x: periods,
        y: periods.map((period) => reviewByPeriod.get(period)?.avgRating || 0),
        name: "Rating",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#1f2328", width: 2.8 },
      },
      {
        x: periods,
        y: periods.map((period) => (metricByPeriod.get(period)?.returnRate || 0) * 100),
        name: modeledText("Return Rate"),
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#e2231a", width: 2.4 },
      },
      {
        x: periods,
        y: periods.map((period) => ((metricByPeriod.get(period)?.returnRate || 0) + (negativeShareByPeriod.get(period) || 0) * 0.04) * 100),
        name: "Service Rate",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#6b7280", width: 2.2, dash: "dot" },
      },
    ],
    {
      yaxis: { title: "Average Rating", range: [3.6, 5] },
      yaxis2: { title: "Rate %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
  );
}

function renderDetailWordCloud(reviewRows) {
  const node = document.getElementById("detailUserWordCloud");
  if (!node) return;
  const byKeyword = new Map();
  for (const row of reviewRows) byKeyword.set(row.keyword, (byKeyword.get(row.keyword) || 0) + row.frequency);
  const entries = [...byKeyword.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  node.innerHTML = entries
    .map(([word, value], idx) => {
      const size = 15 + (value / max) * 26;
      return `<span style="font-size:${size}px;color:${redScale[idx % redScale.length]}">${escapeHtml(word)}</span>`;
    })
    .join("");
}

function renderSupplyNews(product) {
  const latestRows = getSupplyRowsForProduct(product)
    .filter((row) => rowInSelectedPeriod(row, "detail"))
    .sort((a, b) => b.impactLevel - a.impactLevel);
  return `
    <div class="chart-title">
      <strong>${escapeHtml(modeledText("Supply Signals"))}</strong>
      <span>${escapeHtml(selectedPeriod("detail"))}</span>
    </div>
    <div class="news-list">
      ${latestRows
        .map(
          (row) => `
          <article class="news-item">
            <strong>${escapeHtml(row.componentType)} · ${escapeHtml(row.supplier)}</strong>
            <p>${escapeHtml(row.newsSummary)} Impact ${row.impactLevel}/5 · Lead time ${row.leadTimeDays} days</p>
          </article>
        `,
        )
        .join("")}
    </div>
  `;
}

function getSupplyRowsForProduct(product) {
  const rows = data.supplyChain.filter((row) => row.categoryId === product.categoryId && row.relatedModelIds.includes(product.id));
  if (rows.length) return rows;
  return data.supplyChain.filter((row) => row.categoryId === product.categoryId);
}

function renderKpi(label, value, note) {
  return `
    <div class="kpi-tile">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(note)}</small>
    </div>
  `;
}

function chartShellWithControls(id, title, meta = "", controls = "", wide = false) {
  return `
    <div class="chart-shell ${wide ? "is-wide" : ""}">
      <div class="chart-title chart-title-with-controls">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(meta)}</span>
        </div>
        <div class="chart-controls">${controls}</div>
      </div>
      <div id="${id}" class="plot ${wide ? "tall" : ""}"></div>
    </div>
  `;
}

function renderMetricSelect(action, selected, options) {
  return `
    <label class="inline-field">
      <span>Metric</span>
      <select class="inline-select" data-action="${escapeAttr(action)}">
        ${options.map((option) => `<option value="${escapeAttr(option.field)}" ${option.field === selected ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderProductMultiSelect(action, categoryId, products, selectedIds) {
  return `
    <label class="inline-field product-multi-field">
      <span>Products</span>
      <select class="inline-select product-multi-select" multiple size="${Math.min(4, Math.max(2, products.length))}" data-action="${escapeAttr(action)}" data-category="${escapeAttr(categoryId)}">
        ${products.map((product) => `<option value="${escapeAttr(product.id)}" ${selectedIds.includes(product.id) ? "selected" : ""}>${escapeHtml(product.shortName)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderProductCheckboxList(action, categoryId, products, selectedIds) {
  return `
    <div class="inline-field product-check-field" role="group" aria-label="${escapeAttr(categoryId)} products">
      <span>Products</span>
      <div class="product-check-list">
        ${products
          .map(
            (product) => `
            <label class="product-check-option">
              <input type="checkbox" data-action="${escapeAttr(action)}" data-category="${escapeAttr(categoryId)}" data-model-id="${escapeAttr(product.id)}" ${selectedIds.includes(product.id) ? "checked" : ""} />
              <span>${escapeHtml(product.shortName)}</span>
            </label>
          `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function chartShell(id, title, meta = "", wide = false) {
  return `
    <div class="chart-shell ${wide ? "is-wide" : ""}">
      <div class="chart-title">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(meta)}</span>
      </div>
      <div id="${id}" class="plot ${wide ? "tall" : ""}"></div>
    </div>
  `;
}

function drawPlot(id, traces, layout = {}) {
  const node = document.getElementById(id);
  if (!node) return;
  if (!window.Plotly) {
    node.innerHTML = `<div class="plot-fallback">Plotly.js not loaded.</div>`;
    return node;
  }
  if (!traces.length) {
    node.innerHTML = `<div class="plot-fallback">No data for current filters.</div>`;
    return node;
  }
  const baseLayout = {
    margin: layout.margin || { l: 54, r: 28, t: 8, b: 42 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "#ffffff",
    font: { family: "Inter, system-ui, sans-serif", size: 12, color: "#1f2328" },
    legend: { orientation: "h", y: -0.18, x: 0 },
    hovermode: "closest",
    hoverlabel: { namelength: -1 },
    xaxis: { automargin: true, gridcolor: "#ece8df", zerolinecolor: "#dedbd2", ...(layout.xaxis || {}) },
    yaxis: { automargin: true, gridcolor: "#ece8df", zerolinecolor: "#dedbd2", ...(layout.yaxis || {}) },
    ...layout,
  };
  Plotly.react(node, traces, baseLayout, {
    displayModeBar: false,
    responsive: true,
  });
  return node;
}

function renderGranularityButtons(active, scope) {
  const selected = ensureSelectedPeriod(scope, active);
  const options = getPeriodOptions(active);
  return `
    <div class="time-control">
      <div class="segmented" aria-label="${scope} time granularity">
        ${Object.entries(granularityLabels)
          .map(([key, label]) => `<button type="button" class="${active === key ? "is-active" : ""}" data-action="granularity" data-scope="${scope}" data-granularity="${key}">${label}</button>`)
          .join("")}
      </div>
      <select class="period-select" data-action="period-select" data-scope="${scope}" aria-label="${scope} period">
        ${options.map((period) => `<option value="${escapeAttr(period)}" ${period === selected ? "selected" : ""}>${escapeHtml(period)}</option>`).join("")}
      </select>
    </div>
  `;
}

function getPeriodOptions(granularity) {
  return sortedPeriods(unique(data.catalog.periods.map((date) => periodKey(date, granularity))));
}

function ensureSelectedPeriod(scope, granularity) {
  const options = getPeriodOptions(granularity);
  if (!state.selectedPeriod[scope] || !options.includes(state.selectedPeriod[scope])) {
    state.selectedPeriod[scope] = options.at(-1);
  }
  return state.selectedPeriod[scope];
}

function selectedPeriod(scope = "category") {
  const granularity = scope === "detail" ? state.detailGranularity : state.granularity;
  return ensureSelectedPeriod(scope, granularity);
}

function previousSelectedPeriod(scope = "category") {
  const granularity = scope === "detail" ? state.detailGranularity : state.granularity;
  const options = getPeriodOptions(granularity);
  const current = selectedPeriod(scope);
  const index = options.indexOf(current);
  return index > 0 ? options[index - 1] : null;
}

function selectedDates(scope = "category") {
  const granularity = scope === "detail" ? state.detailGranularity : state.granularity;
  const period = selectedPeriod(scope);
  return data.catalog.periods.filter((date) => periodKey(date, granularity) === period);
}

function rowInSelectedPeriod(row, scope = "category") {
  const granularity = scope === "detail" ? state.detailGranularity : state.granularity;
  return periodKey(row.date, granularity) === selectedPeriod(scope);
}

function periodsThroughSelected(granularity, period) {
  return getPeriodOptions(granularity).filter((item) => periodSortValue(item) <= periodSortValue(period));
}

function ensureCategoryFilterState(categoryId) {
  state.filters[categoryId] ||= {};
  for (const filter of data.catalog.filters[categoryId] || []) {
    state.filters[categoryId][filter.id] ??= "all";
  }
}

function getFilteredProducts(categoryId) {
  ensureCategoryFilterState(categoryId);
  const filters = state.filters[categoryId] || {};
  const query = state.search.trim().toLowerCase();
  return data.catalog.products.filter((product) => {
    if (product.categoryId !== categoryId) return false;
    if (query && !`${product.name} ${product.shortName} ${(product.tags || []).join(" ")}`.toLowerCase().includes(query)) return false;
    return Object.entries(filters).every(([filterId, selected]) => productMatchesFilter(product, filterId, selected));
  });
}

function productMatchesFilter(product, filterId, selected) {
  if (selected === "all" || selected === undefined || selected === null || selected === "") return true;
  const raw = product.attributes[filterId];
  if (Array.isArray(raw)) return raw.map(String).includes(String(selected));
  if (typeof raw === "boolean") return String(raw) === String(selected);
  return String(raw) === String(selected);
}

function getSelectedModelIds(categoryId, visibleProducts) {
  const ids = visibleProducts.map((product) => product.id);
  const selected = state.selectedModels[categoryId];
  if (!selected || !selected.size) return ids;
  const scoped = ids.filter((id) => selected.has(id));
  return scoped.length ? scoped : ids;
}

function getSummaryProductIds(stateKey, categoryId, fallbackIds) {
  const selected = state[stateKey]?.[categoryId];
  const scoped = Array.isArray(selected) ? selected.filter((id) => fallbackIds.includes(id)) : [];
  return scoped.length ? scoped : fallbackIds;
}

function setSummaryProductSelection(stateKey, categoryId, selectedIds) {
  state[stateKey] ||= {};
  state[stateKey][categoryId] = selectedIds.length ? selectedIds : null;
}

function updateSummaryProductCheckboxSelection(stateKey, modelId, checked) {
  const visibleProducts = getFilteredProducts(state.categoryId);
  const fallbackIds = visibleProducts.map((product) => product.id);
  const current = new Set(getSummaryProductIds(stateKey, state.categoryId, fallbackIds));
  if (checked) current.add(modelId);
  else current.delete(modelId);
  setSummaryProductSelection(stateKey, state.categoryId, fallbackIds.filter((id) => current.has(id)));
}

function selectedOptionValues(select) {
  return Array.from(select.selectedOptions || []).map((option) => option.value);
}

function handleClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const routeCategory = button.dataset.routeCategory;
  if (routeCategory) {
    if (!button.dataset.routeProduct) state.categoryView = button.dataset.routeView || "market";
    routeTo(routeCategory, button.dataset.routeProduct);
    return;
  }

  const action = button.dataset.action;
  if (!action) return;

  if (action === "home") {
    routeTo();
  } else if (action === "category-view") {
    state.categoryView = button.dataset.view;
    render();
  } else if (action === "module-view") {
    if (state.categoryView === "market") state.marketModule = button.dataset.module;
    render();
  } else if (action === "country-region") {
    state.geoRegionDetail[state.categoryId] = button.dataset.regionId;
    delete state.geoCountryTab[state.categoryId];
    render();
  } else if (action === "country-back") {
    delete state.geoRegionDetail[state.categoryId];
    delete state.geoCountryTab[state.categoryId];
    render();
  } else if (action === "country-tab") {
    state.geoCountryTab[state.categoryId] = button.dataset.tabId;
    render();
  } else if (action === "geo-region") {
    state.geoRegionDetail[state.categoryId] = button.dataset.regionId;
    render();
  } else if (action === "geo-back") {
    delete state.geoRegionDetail[state.categoryId];
    render();
  } else if (action === "policy-region") {
    state.policyRegion[state.categoryId] = button.dataset.regionId;
    render();
  } else if (action === "structure-market") {
    state.structureMarket[button.dataset.category || state.categoryId] = button.dataset.marketCode;
    render();
  } else if (action === "industry-slide") {
    updateIndustrySlide(button.dataset.carouselId, button.dataset.direction);
  } else if (action === "granularity") {
    const scope = button.dataset.scope;
    if (scope === "detail") state.detailGranularity = button.dataset.granularity;
    else state.granularity = button.dataset.granularity;
    state.selectedPeriod[scope] = getPeriodOptions(button.dataset.granularity).at(-1);
    render();
  } else if (action === "reset-category-filters") {
    state.filters[state.categoryId] = {};
    state.search = "";
    state.selectedModels[state.categoryId] = null;
    render();
  } else if (action === "show-all-products") {
    state.filters[state.categoryId] = {};
    state.search = "";
    state.selectedModels[state.categoryId] = null;
    render();
  } else if (action === "select-visible-models") {
    const visible = getFilteredProducts(state.categoryId);
    state.selectedModels[state.categoryId] = new Set(visible.map((product) => product.id));
    render();
  } else if (action === "dimension") {
    state.dimension = button.dataset.dimension;
    if (state.productId) {
      delete state.detailSelectedGeo[state.productId];
      const focusKey = detailCurrentFocusKey();
      const mode = focusKey === "all" ? "overall" : "breakdown";
      state.detailRevenueTrendMode[state.productId] = mode;
      state.detailQuantityTrendMode[state.productId] = mode;
      state.detailGeoTrendMode[state.productId] = "overall";
      state.detailCountryTrendMode[state.productId] = "overall";
    }
    render();
  } else if (action === "segment-filter") {
    state.segmentFilter = button.dataset.segment;
    if (state.productId) {
      delete state.detailSelectedGeo[state.productId];
      const mode = state.segmentFilter === "all" ? "overall" : "breakdown";
      state.detailRevenueTrendMode[state.productId] = mode;
      state.detailQuantityTrendMode[state.productId] = mode;
      state.detailGeoTrendMode[state.productId] = "overall";
      state.detailCountryTrendMode[state.productId] = "overall";
    }
    render();
  } else if (action === "part-number") {
    state.partNumber = button.dataset.partNumber;
    if (state.productId) {
      delete state.detailSelectedGeo[state.productId];
      const mode = state.partNumber === "all" ? "overall" : "breakdown";
      state.detailRevenueTrendMode[state.productId] = mode;
      state.detailQuantityTrendMode[state.productId] = mode;
      state.detailGeoTrendMode[state.productId] = "overall";
      state.detailCountryTrendMode[state.productId] = "overall";
    }
    render();
  } else if (action === "detail-trend-mode") {
    if (state.productId) detailTrendModeStore(button.dataset.trendTarget)[state.productId] = button.dataset.trendMode;
    render();
  } else if (action === "detail-geo-link-toggle") {
    if (state.productId) {
      const next = button.dataset.linkEnabled === "true";
      state.detailGeoLinkEnabled[state.productId] = next;
      if (next) {
        state.detailGeoTrendMode[state.productId] = "breakdown";
        state.detailCountryTrendMode[state.productId] = "breakdown";
      } else {
        delete state.detailSelectedGeo[state.productId];
        state.detailCountryTrendMode[state.productId] = "overall";
      }
    }
    render();
  } else if (action === "detail-clear-geo") {
    if (state.productId) {
      delete state.detailSelectedGeo[state.productId];
      state.detailCountryTrendMode[state.productId] = state.detailGeoLinkEnabled[state.productId] ? "breakdown" : "overall";
    }
    render();
  } else if (action === "clear-summary-geo") {
    delete state.summarySelectedGeo[state.categoryId];
    render();
  }
}

function selectedIndustrySlide(carouselId, total) {
  if (!total) return 0;
  const current = state.industrySlides[carouselId] || 0;
  return Math.max(0, Math.min(total - 1, current));
}

function updateIndustrySlide(carouselId, direction) {
  if (!carouselId) return;
  const total = industrySlideTotal(carouselId);
  if (!total) return;
  const current = selectedIndustrySlide(carouselId, total);
  const step = direction === "previous" ? -1 : 1;
  state.industrySlides[carouselId] = (current + step + total) % total;
  render();
}

function industrySlideTotal(carouselId) {
  const report = industryBrandReport(state.categoryId);
  if (!report) return 0;
  for (const brand of report.brands || []) {
    const overviewId = `industry-${idFromText(brand.brand)}-overview`;
    if (overviewId === carouselId) return buildIndustryOverviewSlides(brand).length;
    for (const country of brand.countries || []) {
      const countryId = `industry-${idFromText(brand.brand)}-country-${idFromText(country.market)}`;
      if (countryId === carouselId) {
        if (country.reportSlides?.length) return country.reportSlides.length;
        return country.flowSections?.length ? country.flowSections.length : 1;
      }
    }
  }
  return 0;
}

function handleChange(event) {
  const target = event.target;
  if (target.dataset.action === "period-select") {
    state.selectedPeriod[target.dataset.scope] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "competitor-brand") {
    state.competitorBrand[state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "structure-brand") {
    state.structureBrand[state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "competitor-lenovo-product") {
    state.competitorLenovoProduct[state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "competitor-country") {
    state.competitorCountry[state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "category-filter") {
    ensureCategoryFilterState(state.categoryId);
    state.filters[state.categoryId][target.dataset.filterId] = target.value;
    state.selectedModels[state.categoryId] = null;
    render();
    return;
  }
  if (target.dataset.action === "summary-revenue-metric") {
    state.summaryRevenueMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "summary-quantity-metric") {
    state.summaryQuantityMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "summary-quantity-trend-metric") {
    state.summaryQuantityTrendMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "summary-revenue-trend-metric") {
    state.summaryRevenueTrendMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "summary-geo-metric") {
    state.summaryGeoMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "summary-country-metric") {
    state.summaryCountryMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "detail-revenue-metric") {
    state.detailRevenueMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "detail-quantity-metric") {
    state.detailQuantityMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "detail-geo-metric") {
    state.detailGeoMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "detail-product-metric") {
    state.detailProductMetric = target.value;
    render();
    return;
  }
  if (target.dataset.action === "summary-geo-products") {
    setSummaryProductSelection("summaryGeoProducts", state.categoryId, selectedOptionValues(target));
    render();
    return;
  }
  if (target.dataset.action === "summary-country-products") {
    setSummaryProductSelection("summaryCountryProducts", state.categoryId, selectedOptionValues(target));
    render();
    return;
  }
  if (target.dataset.action === "summary-geo-product-toggle") {
    updateSummaryProductCheckboxSelection("summaryGeoProducts", target.dataset.modelId, target.checked);
    render();
    return;
  }
  if (target.dataset.action === "summary-country-product-toggle") {
    updateSummaryProductCheckboxSelection("summaryCountryProducts", target.dataset.modelId, target.checked);
    render();
    return;
  }
  if (target.dataset.action === "toggle-model") {
    const visible = getFilteredProducts(state.categoryId);
    const currentIds = getSelectedModelIds(state.categoryId, visible);
    const next = new Set(currentIds);
    if (target.checked) next.add(target.dataset.modelId);
    else next.delete(target.dataset.modelId);
    state.selectedModels[state.categoryId] = next;
    render();
    return;
  }
}

function handleInput(event) {
  const target = event.target;
  if (target.dataset.action === "search-products") {
    state.search = target.value;
    state.selectedModels[state.categoryId] = null;
    render();
  }
}

function summarizeProductRows(rows) {
  const summary = rows.reduce(
    (acc, row) => {
      acc.orderRevenue += row.orderRevenue || 0;
      acc.shipRevenue += row.shipRevenue || 0;
      acc.backlogRevenue += row.backlogRevenue || 0;
      acc.orderQty += row.orderQty || 0;
      acc.shipQty += row.shipQty || 0;
      acc.backlogQty += row.backlogQty || 0;
      acc.unitsGross += row.unitsGross || 0;
      acc.unitsReturned += row.unitsReturned || 0;
      acc.unitsNet += row.unitsNet || 0;
      acc.revenueNet += row.revenueNet || 0;
      acc.grossProfit += row.grossProfit || 0;
      acc.refundAmount += row.refundAmount || 0;
      acc.stockoutDays += row.stockoutDays || 0;
      acc.inventorySellThrough += row.inventorySellThrough || 0;
      acc.conversionRate += row.conversionRate || 0;
      acc.count += 1;
      return acc;
    },
    {
      orderRevenue: 0,
      shipRevenue: 0,
      backlogRevenue: 0,
      orderQty: 0,
      shipQty: 0,
      backlogQty: 0,
      unitsGross: 0,
      unitsReturned: 0,
      unitsNet: 0,
      revenueNet: 0,
      grossProfit: 0,
      refundAmount: 0,
      stockoutDays: 0,
      inventorySellThrough: 0,
      conversionRate: 0,
      count: 0,
    },
  );
  summary.margin = summary.revenueNet ? summary.grossProfit / summary.revenueNet : 0;
  summary.returnRate = summary.unitsGross ? summary.unitsReturned / summary.unitsGross : 0;
  summary.aur = summary.orderQty ? summary.orderRevenue / summary.orderQty : summary.unitsNet ? summary.revenueNet / summary.unitsNet : 0;
  summary.shipAUR = summary.shipQty ? summary.shipRevenue / summary.shipQty : 0;
  summary.inventorySellThrough = summary.count ? summary.inventorySellThrough / summary.count : 0;
  summary.conversionRate = summary.count ? summary.conversionRate / summary.count : 0;
  return summary;
}

function aggregateProductRows(rows, keyFn) {
  const buckets = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const existing = buckets.get(key) || [];
    existing.push(row);
    buckets.set(key, existing);
  }
  return new Map([...buckets.entries()].map(([key, bucketRows]) => [key, summarizeProductRows(bucketRows)]));
}

function aggregateMarketRows(rows, keyFn) {
  const buckets = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = buckets.get(key) || [];
    bucket.push(row);
    buckets.set(key, bucket);
  }
  return new Map(
    [...buckets.entries()].map(([key, bucket]) => [
      key,
      {
        totalMarketUnits: bucket.reduce((sum, row) => sum + row.totalMarketUnits, 0),
        lenovoCategoryUnits: bucket.reduce((sum, row) => sum + row.lenovoCategoryUnits, 0),
        modelMarketShare: avg(bucket.map((row) => row.modelMarketShare)),
        lenovoCategoryShare: avg(bucket.map((row) => row.lenovoCategoryShare)),
        modelRevenueShareWithinLenovo: avg(bucket.map((row) => row.modelRevenueShareWithinLenovo)),
        marketRankInLenovo: avg(bucket.map((row) => row.marketRankInLenovo)),
        categoryAUR: avg(bucket.map((row) => row.categoryAUR)),
        searchIndex: avg(bucket.map((row) => row.searchIndex)),
        competitivePriceIndex: avg(bucket.map((row) => row.competitivePriceIndex)),
      },
    ]),
  );
}

function aggregateBrandRows(rows, keyFn) {
  const buckets = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = buckets.get(key) || [];
    bucket.push(row);
    buckets.set(key, bucket);
  }
  return new Map(
    [...buckets.entries()].map(([key, bucket]) => {
      const units = bucket.reduce((sum, row) => sum + row.brandUnits, 0);
      const revenue = bucket.reduce((sum, row) => sum + row.brandRevenue, 0);
      const lenovoUnits = bucket.filter((row) => row.brand === "Lenovo").reduce((sum, row) => sum + row.brandUnits, 0);
      return [
        key,
        {
          brandUnits: units,
          brandRevenue: revenue,
          marketShare: avg(bucket.map((row) => row.marketShare)),
          avgAUR: revenue / Math.max(1, units),
          lenovoShare: lenovoUnits / Math.max(1, units),
        },
      ];
    }),
  );
}

function brandRowsForSelectedPeriod(categoryId, includeLenovo = true) {
  const allRows = data.brandMarket.filter((row) => row.categoryId === categoryId && rowInSelectedPeriod(row));
  const rows = allRows.filter((row) => includeLenovo || !row.isLenovo);
  const totalUnits = allRows.reduce((sum, row) => sum + row.brandUnits, 0) || 1;
  const grouped = new Map();
  for (const row of rows) {
    const bucket = grouped.get(row.brand) || { ...row, brandUnits: 0, brandRevenue: 0, launches: [] };
    bucket.brandUnits += row.brandUnits;
    bucket.brandRevenue += row.brandRevenue;
    if (row.newProductLaunch) bucket.launches.push(row.newProductLaunch);
    bucket.newProductLaunch ||= row.newProductLaunch;
    grouped.set(row.brand, bucket);
  }
  return [...grouped.values()].map((row) => ({
    ...row,
    marketShare: row.brandUnits / totalUnits,
    avgAUR: row.brandRevenue / Math.max(1, row.brandUnits),
  }));
}

function aggregateSupplyRows(rows, keyFn) {
  const buckets = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = buckets.get(key) || [];
    bucket.push(row);
    buckets.set(key, bucket);
  }
  return new Map(
    [...buckets.entries()].map(([key, bucket]) => [
      key,
      {
        priceIndex: avg(bucket.map((row) => row.priceIndex)),
        leadTimeDays: avg(bucket.map((row) => row.leadTimeDays)),
        capacityUtilization: avg(bucket.map((row) => row.capacityUtilization)),
        impactLevel: avg(bucket.map((row) => row.impactLevel)),
      },
    ]),
  );
}

function aggregateReviewRows(rows, keyFn) {
  const buckets = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const bucket = buckets.get(key) || [];
    bucket.push(row);
    buckets.set(key, bucket);
  }
  return new Map(
    [...buckets.entries()].map(([key, bucket]) => [
      key,
      {
        frequency: bucket.reduce((sum, row) => sum + row.frequency, 0),
        totalReviews: Math.max(...bucket.map((row) => row.totalReviews), 0),
        relativeFreq: avg(bucket.map((row) => row.relativeFreq)),
        avgRating: avg(bucket.map((row) => row.avgRating)),
      },
    ]),
  );
}

function productPower(product) {
  const attrs = product?.attributes || {};
  return attrs.wattage || attrs.outputW || attrs.powerW || 0;
}

function productPowerSegment(product) {
  const attrs = product?.attributes || {};
  if (attrs.wattageBand) return attrs.wattageBand;
  if (attrs.outputBand) return attrs.outputBand;
  if (attrs.powerBand) return attrs.powerBand;
  const power = productPower(product);
  if (power <= 60) return "60W and below";
  if (power < 100) return "45W to 99W";
  if (power < 200) return "100W to 199W";
  return "200W and above";
}

function productPortCount(product) {
  const attrs = product?.attributes || {};
  if (attrs.ports) return attrs.ports;
  if (attrs.connectors) return Math.max(1, attrs.connectors.length);
  if (attrs.features?.includes("multi-device") || attrs.features?.includes("built-in cable")) return 2;
  return 1;
}

function productPortSegment(product) {
  const count = productPortCount(product);
  if (count >= 3) return "3+ ports";
  if (count === 2) return "2 ports";
  return "1 port";
}

function getCategoryPowerSegments(categoryId) {
  const values = data.catalog.products
    .filter((product) => product.categoryId === categoryId)
    .map((product) => productPowerSegment(product));
  return unique(values).sort((a, b) => {
    const ai = powerOrder.indexOf(a);
    const bi = powerOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function getCategoryPortSegments(categoryId) {
  const values = data.catalog.products
    .filter((product) => product.categoryId === categoryId)
    .map((product) => productPortSegment(product));
  const order = ["1 port", "2 ports", "3+ ports", "4 ports"];
  return unique(values).sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function priceBandForProduct(product) {
  const price = product?.listPrice || 0;
  if (price < 25) return "<$25";
  if (price < 45) return "$25-45";
  if (price < 65) return "$45-65";
  return "$65+";
}

function getTechnologySignals(categoryId) {
  if (categoryId === "adapter") return ["GaN", "PD/PPS", "Wireless", "2-in-1"];
  if (categoryId === "power_bank") return ["High Capacity", "High Wattage", "Magnetic", "Built-in Cable"];
  return ["USB-C", "High Wattage", "E-marker", "Bundle"];
}

function productHasTech(product, tech) {
  const attrs = product?.attributes || {};
  const haystack = [...(attrs.features || []), ...(attrs.interfaceProtocols || []), ...(attrs.connectors || [])].join(" ").toLowerCase();
  const tests = {
    "GaN": () => haystack.includes("gan"),
    "PD/PPS": () => haystack.includes("pd") || haystack.includes("pps"),
    "Wireless": () => haystack.includes("wireless") || haystack.includes("qi"),
    "2-in-1": () => Boolean(attrs.isTwoInOne),
    "High Capacity": () => (attrs.capacityMah || 0) >= 20000,
    "High Wattage": () => productPower(product) >= 100 || haystack.includes("high wattage"),
    "Magnetic": () => haystack.includes("magnetic"),
    "Built-in Cable": () => haystack.includes("built-in cable"),
    "USB-C": () => haystack.includes("usb-c"),
    "E-marker": () => haystack.includes("e-marker"),
    "Bundle": () => haystack.includes("bundle"),
  };
  return tests[tech]?.() || false;
}

function competitorPowerWeight(categoryId, brand, segment) {
  const segments = getCategoryPowerSegments(categoryId);
  const idx = Math.max(0, segments.indexOf(segment));
  const brandBias = {
    Anker: 1.35,
    Ugreen: 1.18,
    Baseus: 1.12,
    Belkin: 0.96,
    Apple: 0.82,
    Samsung: 0.78,
    "Amazon Basics": 0.58,
  }[brand] || 1;
  const weights = segments.map((_, i) => Math.pow(1.32, i) * (i >= segments.length - 2 ? brandBias : 1 / brandBias));
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights[idx] / total;
}

function competitorPriceBandWeight(brand, band) {
  const premium = ["Anker", "Apple", "Belkin"].includes(brand);
  const value = ["Ugreen", "Amazon Basics", "Baseus"].includes(brand);
  const map = premium ? [0.08, 0.18, 0.34, 0.4] : value ? [0.24, 0.34, 0.26, 0.16] : [0.16, 0.28, 0.3, 0.26];
  return map[Math.max(0, priceBands.indexOf(band))] || 0;
}

function competitorAveragePower(categoryId, brand) {
  const segments = getCategoryPowerSegments(categoryId);
  const midpoint = (segment) => {
    if (segment.includes("45W and below") || segment.includes("60W")) return 45;
    if (segment.includes("45W to 99W") || segment.includes("65W")) return 65;
    if (segment.includes("100W")) return 120;
    if (segment.includes("200W")) return 220;
    return 90;
  };
  return segments.reduce((sum, segment) => sum + midpoint(segment) * competitorPowerWeight(categoryId, brand, segment), 0);
}

function weightedAvg(rows, valueFn, weightFn) {
  const totalWeight = rows.reduce((sum, row) => sum + (weightFn(row) || 0), 0);
  if (!totalWeight) return 0;
  return rows.reduce((sum, row) => sum + (valueFn(row) || 0) * (weightFn(row) || 0), 0) / totalWeight;
}

function periodKey(dateString, granularity) {
  const fiscal = fiscalMetaForDate(dateString);
  if (fiscal) {
    if (granularity === "year") return fiscal.yearLabel || fiscal.fiscalYear;
    if (granularity === "quarter") return fiscal.quarterLabel || `${fiscal.fiscalYear} ${fiscal.fiscalQuarter}`;
  }
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7));
  if (granularity === "year") return String(year);
  if (granularity === "quarter") return `${year} Q${Math.floor((month - 1) / 3) + 1}`;
  return dateString.slice(0, 7);
}

function fiscalMetaForDate(dateString) {
  return data.catalog?.periodMeta?.find((period) => period.date === dateString);
}

function sortedPeriods(periods) {
  return periods.slice().sort((a, b) => periodSortValue(a) - periodSortValue(b));
}

function periodSortValue(period) {
  const fiscalMatch = String(period).match(/^FY(\d{4})(?:\s+Q(\d))?$/);
  if (fiscalMatch) return Number(fiscalMatch[1]) * 10 + Number(fiscalMatch[2] || 9);
  if (period.includes("Q")) {
    const [year, quarter] = period.split(" Q").map(Number);
    return year * 10 + quarter;
  }
  if (period.length === 4) return Number(period) * 10;
  return Number(period.slice(0, 4)) * 100 + Number(period.slice(5, 7));
}

function formatPeriod(dateString, granularity) {
  if (!dateString) return "";
  return periodKey(dateString, granularity);
}

function fmtCompact(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}

function fmtExactNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value || 0);
}

function fmtExactCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function fmtCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(value || 0) >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value || 0) >= 1000000 ? 1 : 0,
  }).format(value || 0);
}

function fmtPercent(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function fmtWholePercent(value) {
  return `${Math.round(value || 0)}%`;
}

function formatSignedPercent(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${((value || 0) * 100).toFixed(1)}%`;
}

function metricConfig(field) {
  return summaryMetricOptions.find((option) => option.field === field) || summaryMetricOptions[0];
}

function metricLabel(field) {
  return metricConfig(field).label;
}

function metricTitle(field) {
  return metricConfig(field).title;
}

function metricType(field) {
  return metricConfig(field).type;
}

function flowMetricConfig(field) {
  return flowMetricOptions.find((option) => option.field === field) || flowMetricOptions[0];
}

function isFlowMetric(field) {
  return flowMetricOptions.some((option) => option.field === field);
}

function flowMetricLabel(field) {
  return flowMetricConfig(field).label;
}

function summaryMetricValue(summary, field) {
  if (field === "orderRevenue") return summary.orderRevenue || summary.revenueNet || 0;
  if (field === "orderQty") return summary.orderQty || summary.unitsNet || 0;
  return summary[field] || 0;
}

function formatMetricValue(field, value) {
  return metricType(field) === "currency" ? fmtExactCurrency(value) : fmtExactNumber(value);
}

function avg(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function unique(values) {
  return [...new Set(values)];
}

function labelValue(value) {
  if (value === true || value === "true") return "Yes";
  if (value === false || value === "false") return "No";
  return String(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
