const DATA_FILES = {
  catalog: "data/catalog.json",
  productMetrics: "data/product_metrics.json",
  geoMetrics: "data/geo_metrics.json",
  marketMetrics: "data/market_metrics.json",
  brandMarket: "data/brand_market_metrics.json",
  supplyChain: "data/supply_chain.json",
  consumerInsights: "data/consumer_insights.json",
  metadata: "data/metadata.json",
};

const state = {
  categoryId: null,
  productId: null,
  categoryView: "market",
  marketModule: "policy",
  overviewModule: "summary",
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
  structureBrand: {},
  summaryRevenueMetric: "orderRevenue",
  summaryQuantityMetric: "orderQty",
  summaryGeoMetric: "orderQty",
  summaryCountryMetric: "orderQty",
  summaryGeoProducts: {},
  summaryCountryProducts: {},
  summarySelectedGeo: {},
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
  policy: "Policy Insights",
  industry: "Industry Trends",
  structure: "Market Structure",
};

const overviewModules = {
  summary: "Product Summary",
  filter: "Data Filters",
};

const dimensionLabels = {
  segment: "Segment",
  product: "Product",
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
const summaryMetricOptions = [...revenueMetricOptions, ...quantityMetricOptions];

init();

function modeledText(label) {
  return `${label}*`;
}

async function init() {
  try {
    const entries = await Promise.all(
      Object.entries(DATA_FILES).map(async ([key, path]) => {
        const response = await fetch(path);
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
            <strong>${fmtCurrency(totalSummary.orderRevenue || totalSummary.revenueNet)}</strong>
            <small>${formatPeriod(latest, "quarter")}</small>
          </div>
          <div class="stat-tile">
            <span>Latest Units</span>
            <strong>${fmtCompact(totalSummary.unitsNet)}</strong>
            <small>Net shipped units</small>
          </div>
          <div class="stat-tile">
            <span>${modeledText("Gross Margin")}</span>
            <strong>${fmtPercent(totalSummary.margin)}</strong>
            <small>Modeled from cost assumptions.</small>
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
        ${data.catalog.categories.map((category) => renderCategoryCard(category, latest)).join("")}
      </section>

      <section class="future-row" aria-label="Future categories">
        ${data.catalog.futureCategorySlots.map((slot) => `<div class="empty-slot">+ ${escapeHtml(slot)}</div>`).join("")}
      </section>
    </div>
  `;
}

function renderCategoryCard(category, latest) {
  const rows = data.productMetrics.filter((row) => row.categoryId === category.id && row.date === latest);
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
        <div><span>Units</span><strong>${fmtCompact(summary.unitsNet)}</strong></div>
        <div><span>Order_Rev</span><strong>${fmtCurrency(summary.orderRevenue || summary.revenueNet)}</strong></div>
        <div><span>${modeledText("Profit")}</span><strong>${fmtCurrency(summary.grossProfit)}</strong></div>
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
  const modules = state.categoryView === "market" ? marketModules : state.categoryView === "overview" ? overviewModules : null;
  if (!modules) return "";
  const active = state.categoryView === "market" ? state.marketModule : state.overviewModule;
  return `
    <section class="module-tabs" aria-label="${state.categoryView} modules">
      ${Object.entries(modules)
        .map(([key, label]) => `<button class="${active === key ? "is-active" : ""}" type="button" data-action="module-view" data-module="${key}">${escapeHtml(label)}</button>`)
        .join("")}
    </section>
  `;
}

function renderMarketAnalysis(categoryId) {
  const category = indexes.categories.get(categoryId);
  const period = selectedPeriod();
  const latestBrands = brandRowsForSelectedPeriod(categoryId);
  const lenovo = latestBrands.find((row) => row.brand === "Lenovo") || {};
  const totalUnits = latestBrands.reduce((sum, row) => sum + row.brandUnits, 0);
  const reports = data.catalog.policyReports?.[categoryId] || [];
  const structureBrands = unique(data.brandMarket.filter((row) => row.categoryId === categoryId).map((row) => row.brand));
  state.structureBrand[categoryId] ||= structureBrands.includes("Lenovo") ? "Lenovo" : structureBrands[0];
  const moduleMarkup = {
    policy: `
      <section class="module-block">
        <div class="module-head">
          <span>Market Module</span>
          <h2>${modeledText("Policy Insights")}</h2>
          <p>Policy reports, sources, and portfolio implications.</p>
        </div>
        <div class="policy-grid">
          ${reports.map((report) => renderPolicyCard(report)).join("")}
        </div>
      </section>
    `,
    industry: `
      <section class="module-block">
        <div class="module-head">
          <span>Market Module</span>
          <h2>${modeledText("Industry Trends")}</h2>
        </div>
        <div class="chart-grid">
          ${chartShell("industryHighPowerPlot", modeledText("High Power Migration"), "share of demand")}
          ${chartShell("industryPortsPlot", modeledText("Port Upgrade Trend"), "sample share")}
          ${chartShell("industryPriceCurvePlot", modeledText("Price Decline by Power"), "AUR by period")}
          ${chartShell("industryTechPlot", modeledText("Technology Penetration"), "feature adoption")}
        </div>
      </section>
    `,
    structure: `
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
    `,
  }[state.marketModule];

  return `
    <div class="view-stack">
      <section class="analysis-hero">
        <div>
          <p class="eyebrow">Market Analysis</p>
          <h2>${escapeHtml(category.label)} ${escapeHtml(modeledText("Market Analysis"))}</h2>
          <p>Use the module buttons above to switch between policy, trend, and structure analysis. Current period: ${escapeHtml(period)}.</p>
        </div>
        <div class="insight-list">
          <div><span>${modeledText("Market Units")}</span><strong>${fmtCompact(totalUnits)}</strong></div>
          <div><span>${modeledText("Lenovo Share")}</span><strong>${fmtPercent(lenovo.marketShare || 0)}</strong></div>
          <div><span>${modeledText("Policy Reports")}</span><strong>${reports.length}</strong></div>
          <div><span>Selected Period</span><strong>${escapeHtml(period)}</strong></div>
        </div>
      </section>
      ${moduleMarkup}
    </div>
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

function renderCompetitiveAnalysis(categoryId) {
  const period = selectedPeriod();
  const competitorRows = brandRowsForSelectedPeriod(categoryId, false).sort((a, b) => b.marketShare - a.marketShare);
  const top = competitorRows[0] || {};
  const launches = data.brandMarket.filter((row) => row.categoryId === categoryId && !row.isLenovo && row.newProductLaunch);
  const avgCompetitorShare = competitorRows.reduce((sum, row) => sum + row.marketShare, 0);
  const brands = unique(data.brandMarket.filter((row) => row.categoryId === categoryId && !row.isLenovo).map((row) => row.brand));
  state.competitorBrand[categoryId] ||= brands[0];

  return `
    <div class="view-stack">
      <section class="analysis-hero">
        <div>
          <p class="eyebrow">Competitive Analysis</p>
          <h2>${modeledText("Competitor Analysis")}</h2>
          <p>Compare competitor sales, power mix, pricing, launch signals, and positioning.</p>
        </div>
        <div class="insight-list">
          <div><span>${modeledText("Top Competitor")}</span><strong>${escapeHtml(top.brand || "—")}</strong></div>
          <div><span>${modeledText("Competitor Share")}</span><strong>${fmtPercent(avgCompetitorShare)}</strong></div>
          <div><span>${modeledText("Latest Star Product")}</span><strong>${escapeHtml(top.starProduct || "—")}</strong></div>
          <div><span>${modeledText("Launch Signals")}</span><strong>${launches.length}</strong></div>
        </div>
      </section>

      <section class="chart-grid">
        ${chartShell("competitorDemandByPowerPlot", modeledText("Brand Demand by Power"), period)}
        ${chartShell("competitorSalesPlot", modeledText("Competitor Sales Trend"), `${granularityLabels[state.granularity]} revenue trend`)}
        <div class="chart-shell">
          <div class="chart-title">
            <strong>${escapeHtml(modeledText("Price Band × Power Mix by Brand"))}</strong>
            <select class="inline-select" data-action="competitor-brand">
              ${brands.map((brand) => `<option value="${escapeAttr(brand)}" ${brand === state.competitorBrand[categoryId] ? "selected" : ""}>${escapeHtml(brand)}</option>`).join("")}
            </select>
          </div>
          <div id="competitorPricePowerPlot" class="plot"></div>
        </div>
        ${chartShell("competitorBubblePlot", modeledText("Brand Positioning Matrix"), "price × weighted power")}
        <div class="detail-panel">${renderLaunchTable(categoryId)}</div>
      </section>
    </div>
  `;
}

function renderCompetitorCard(row) {
  return `
    <article class="competitor-card">
      <span class="tag">${escapeHtml(row.heroFeature)}</span>
      <h3>${escapeHtml(row.brand)}</h3>
      <p>${escapeHtml(row.starProduct)}</p>
      <div class="mini-metrics">
        <div><span>${modeledText("Share")}</span><strong>${fmtPercent(row.marketShare)}</strong></div>
        <div><span>${modeledText("Units")}</span><strong>${fmtCompact(row.brandUnits)}</strong></div>
        <div><span>${modeledText("AUR")}</span><strong>${fmtCurrency(row.avgAUR)}</strong></div>
      </div>
    </article>
  `;
}

function renderCategoryOverview(categoryId) {
  if (!overviewModules[state.overviewModule]) state.overviewModule = "summary";
  const visibleProducts = getFilteredProducts(categoryId);
  const selectedIds = getSelectedModelIds(categoryId, visibleProducts);
  const metricRows = data.productMetrics.filter((row) => row.categoryId === categoryId && selectedIds.includes(row.modelId));
  const latestRows = metricRows.filter((row) => rowInSelectedPeriod(row));
  const latestSummary = summarizeProductRows(latestRows);
  const modules = {
    summary: `
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>${modeledText("Product Summary")}</h2>
        </div>
        ${renderProductMatrix(categoryId, visibleProducts, selectedIds, latestSummary)}
      </section>
    `,
    filter: `
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>Data Filters</h2>
          <p>Filter models, compare performance, and open product detail pages.</p>
        </div>
        ${renderCategoryFilters(categoryId)}
        <section class="chart-grid">
          ${chartShell("categorySalesPlot", "Order Quantity Trend", `${granularityLabels[state.granularity]} · selected models`)}
          ${chartShell("categoryRevenuePlot", "Order_Rev Trend", `${granularityLabels[state.granularity]} · selected models`)}
          ${chartShell("categoryFulfillmentPlot", "Ship_Rev vs Bklg_Rev", selectedPeriod())}
          ${chartShell("categoryRevenueSharePlot", "Product Order_Rev Contribution", selectedPeriod())}
          ${chartShell("categoryGeoUnitsPlot", "Geo Order_Qty by Product", selectedPeriod(), true)}
          ${chartShell("categoryCountryUnitsPlot", "Country Order_Qty by Product", selectedPeriod(), true)}
        </section>
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
      </section>
    `,
    feedback: `
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>${modeledText("User Feedback")}</h2>
        </div>
        <div class="chart-grid">
          <div class="chart-shell">
            <div class="chart-title"><strong>${escapeHtml(modeledText("Keyword Cloud"))}</strong><span>${escapeHtml(selectedPeriod())}</span></div>
            <div id="feedbackWordCloud" class="word-cloud"></div>
          </div>
          ${chartShell("feedbackPainPowerPlot", modeledText("Pain Point × Power"), "stacked share")}
          ${chartShell("feedbackRatingMatrix", modeledText("Rating Matrix"), "power × ports")}
          ${chartShell("feedbackReturnReasonsPlot", modeledText("Return Reasons"), selectedPeriod())}
          ${chartShell("feedbackReturnRiskMatrix", modeledText("Return / Service Risk"), "risk heatmap")}
          ${chartShell("feedbackRatingReturnPlot", modeledText("Rating × Return Risk"), "bubble = sales")}
        </div>
      </section>
    `,
    decision: `
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>${modeledText("Product Decision")}</h2>
        </div>
        <div class="chart-grid">
          ${chartShell("decisionOpportunityPlot", modeledText("Opportunity Matrix"), "growth × share × margin")}
          ${chartShell("decisionGapPlot", modeledText("Portfolio Gap Map"), selectedPeriod())}
          <div class="detail-panel">${renderDecisionCards(categoryId, selectedIds)}</div>
        </div>
      </section>
    `,
  };

  return `
    <div class="view-stack">
      ${modules[state.overviewModule]}
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
  const selectedGeo = state.summarySelectedGeo[categoryId];

  return `
    <section class="product-matrix">
      ${renderSummaryKpiGrid(categoryId, productIds, latestSummary)}
      <div class="matrix-card-grid">
        ${cards.map(([badge, item, note]) => renderMatrixHighlightCard(badge, item, note)).join("")}
      </div>
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
          `Geo ${metricTitle(state.summaryGeoMetric)} by Product`,
          "click a geo to filter country chart",
          `${renderMetricSelect("summary-geo-metric", state.summaryGeoMetric, quantityMetricOptions)}
          ${renderProductMultiSelect("summary-geo-products", categoryId, visibleProducts, getSummaryProductIds("summaryGeoProducts", categoryId, productIds))}`,
          true,
        )}
        ${chartShellWithControls(
          "matrixCountryUnitsPlot",
          `Country ${metricTitle(state.summaryCountryMetric)} by Product`,
          selectedGeo ? `Geo: ${selectedGeo}` : "all geos",
          `${renderMetricSelect("summary-country-metric", state.summaryCountryMetric, quantityMetricOptions)}
          ${renderProductMultiSelect("summary-country-products", categoryId, visibleProducts, getSummaryProductIds("summaryCountryProducts", categoryId, productIds))}
          ${selectedGeo ? `<button class="ghost-button compact-button" type="button" data-action="clear-summary-geo">All Geo</button>` : ""}`,
          true,
        )}
      </div>
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
            <div><span>Units</span><strong>${fmtCompact(summary.unitsNet)}</strong></div>
            <div><span>Order_Rev</span><strong>${fmtCurrency(summary.orderRevenue || summary.revenueNet)}</strong></div>
            <div><span>Bklg_Rev</span><strong>${fmtCurrency(summary.backlogRevenue)}</strong></div>
          </div>
        </div>
      </button>
    </article>
  `;
}

function renderCategoryFilters(categoryId) {
  const filters = data.catalog.filters[categoryId] || [];
  return `
    <section class="filter-panel">
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
        <span class="metric-label">Units</span>
        <strong>${fmtCompact(summary.unitsNet)}</strong>
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

  const salesTraces = products.map((product, idx) => {
    const productRows = categoryRows.filter((row) => row.modelId === product.id);
    const byPeriod = aggregateProductRows(productRows, (row) => periodKey(row.date, state.granularity));
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.unitsNet || 0),
      name: product.shortName,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.4 },
    };
  });
  drawPlot("categorySalesPlot", salesTraces, { yaxis: { title: "Units" } });

  const revenueTraces = products.map((product, idx) => {
    const productRows = categoryRows.filter((row) => row.modelId === product.id);
    const byPeriod = aggregateProductRows(productRows, (row) => periodKey(row.date, state.granularity));
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.orderRevenue || byPeriod.get(period)?.revenueNet || 0),
      name: product.shortName,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.4 },
    };
  });
  drawPlot("categoryRevenuePlot", revenueTraces, { yaxis: { title: "Order_Rev", tickprefix: "$" } });

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

function drawCategoryGeoChart(categoryId, selectedIds) {
  const rows = geoMetricRows({ categoryId, selectedIds });
  const geos = topGeoNames(rows);
  const products = selectedIds.map((id) => indexes.products.get(id)).filter(Boolean);
  const traces = products.map((product, idx) => ({
    x: geos,
    y: geos.map((geo) => sumGeoRows(rows.filter((row) => row.modelId === product.id && (row.geo || "Unassigned") === geo), "orderRevenue")),
    name: product.shortName,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  drawPlot("categoryGeoPlot", traces, { barmode: "stack", yaxis: { title: "Order_Rev", tickprefix: "$" } });
}

function drawCategoryGeoUnitsChart(id, categoryId, selectedIds, field = "orderQty", { interactive = false } = {}) {
  const rows = geoMetricRows({ categoryId, selectedIds });
  const geos = topGeoNamesByMetric(rows, field);
  const products = selectedIds.map((productId) => indexes.products.get(productId)).filter(Boolean);
  const traces = products.map((product, idx) => ({
    x: geos,
    y: geos.map((geo) => sumGeoRows(rows.filter((row) => row.modelId === product.id && (row.geo || "Unassigned") === geo), field)),
    name: product.shortName,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  const node = drawPlot(id, traces, { barmode: "stack", yaxis: { title: metricTitle(field) } });
  if (interactive && node?.on) {
    if (node.removeAllListeners) node.removeAllListeners("plotly_click");
    node.on("plotly_click", (eventData) => {
      const geo = eventData?.points?.[0]?.x;
      if (!geo) return;
      state.summarySelectedGeo[categoryId] = geo;
      render();
    });
  }
}

function drawCategoryCountryUnitsChart(id, categoryId, selectedIds, field = "orderQty", { geo = null } = {}) {
  const rows = geoMetricRows({ categoryId, selectedIds }).filter((row) => !geo || (row.geo || "Unassigned") === geo);
  const countries = topCountryNamesByMetric(rows, field);
  const products = selectedIds.map((productId) => indexes.products.get(productId)).filter(Boolean);
  const traces = products.map((product, idx) => ({
    x: countries,
    y: countries.map((country) => sumGeoRows(rows.filter((row) => row.modelId === product.id && (row.country || "Unassigned") === country), field)),
    name: product.shortName,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  drawPlot(id, traces, { barmode: "stack", margin: { l: 58, r: 28, t: 8, b: 86 }, yaxis: { title: metricTitle(field) } });
}

function drawMarketAnalysis(categoryId) {
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
            hovertemplate: `<b>%{label}</b><br>${label} ${valuePrefix}%{value:,.0f}<br>%{percent}<extra></extra>`,
            marker: { colors: rows.map((_, idx) => palette[idx % palette.length]) },
          },
        ]
      : [],
    { margin: { l: 18, r: 18, t: 8, b: 18 }, showlegend: false },
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
  if (!["segment", "product", "user"].includes(state.dimension)) state.dimension = "segment";
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
  } else if (state.dimension === "product") {
    target.innerHTML = `
      ${chartShell("detailPlotA", "PN Order_Rev & Growth", selectedPartNumber === "all" ? "all part numbers" : selectedPartNumber)}
      ${chartShell("detailPlotB", "PN Order Quantity & Growth", "order quantity + growth rate")}
      ${chartShell("detailGeoTrendPlot", "Geo Order_Rev & Growth", `${granularityLabels[state.detailGranularity]} trend`, true)}
      ${chartShell("detailCountrySharePlot", "Country Order_Rev Share", selectedPeriod("detail"))}
    `;
    drawPartNumberDetail(product, selectedPartNumber);
    drawProductGeoDetail(product, { partNumber: selectedPartNumber });
  } else {
    target.innerHTML = `
      ${chartShell("detailPlotA", "Order_Rev by Segment & Growth", state.segmentFilter === "all" ? "Commercial vs Consumer" : state.segmentFilter)}
      ${chartShell("detailPlotB", "Order Quantity by Segment & Growth", `${granularityLabels[state.detailGranularity]} trend`)}
      ${chartShell("detailGeoTrendPlot", "Geo Order_Rev & Growth", `${granularityLabels[state.detailGranularity]} trend`, true)}
      ${chartShell("detailCountrySharePlot", "Country Order_Rev Share", selectedPeriod("detail"))}
    `;
    drawSegmentDetail(product);
    drawProductGeoDetail(product, { segment: state.segmentFilter });
  }
}

function growthSeries(values) {
  return values.map((value, idx) => {
    if (idx === 0) return null;
    const previous = values[idx - 1];
    if (!previous) return null;
    return ((value - previous) / Math.abs(previous)) * 100;
  });
}

function drawSegmentDetail(product) {
  const rows = detailProductRows(product, { selectedOnly: false, segment: state.segmentFilter });
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const segments = state.segmentFilter === "all" ? ["Commercial", "Consumer"] : [state.segmentFilter];
  const revenueTraces = segments.map((segment, idx) => {
    const byPeriod = aggregateProductRows(
      rows.filter((row) => row.segment === segment),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.orderRevenue || byPeriod.get(period)?.revenueNet || 0),
      name: segment,
      type: "bar",
      marker: { color: palette[idx % palette.length] },
    };
  });
  const revenueByPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const revenueValues = periods.map((period) => revenueByPeriod.get(period)?.orderRevenue || revenueByPeriod.get(period)?.revenueNet || 0);
  revenueTraces.push({
    x: periods,
    y: growthSeries(revenueValues),
    name: "Order_Rev Growth %",
    type: "scatter",
    mode: "lines+markers",
    yaxis: "y2",
    line: { color: "#1f2328", width: 2.8 },
    hovertemplate: "%{x}<br>Order_Rev Growth %{y:.1f}%<extra></extra>",
  });
  drawPlot("detailPlotA", revenueTraces, {
    barmode: "stack",
    yaxis: { title: "Order_Rev", tickprefix: "$" },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });

  const quantityTraces = segments.map((segment, idx) => {
    const byPeriod = aggregateProductRows(
      rows.filter((row) => row.segment === segment),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.orderQty || byPeriod.get(period)?.unitsNet || 0),
      name: segment,
      type: "bar",
      marker: { color: palette[idx % palette.length] },
    };
  });
  const quantityByPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const quantityValues = periods.map((period) => quantityByPeriod.get(period)?.orderQty || quantityByPeriod.get(period)?.unitsNet || 0);
  quantityTraces.push({
    x: periods,
    y: growthSeries(quantityValues),
    name: "Order Qty Growth %",
    type: "scatter",
    mode: "lines+markers",
    yaxis: "y2",
    line: { color: "#1f2328", width: 2.8 },
    hovertemplate: "%{x}<br>Order Qty Growth %{y:.1f}%<extra></extra>",
  });
  drawPlot("detailPlotB", quantityTraces, {
    barmode: "stack",
    yaxis: { title: "Order Quantity" },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });
}

function drawPartNumberDetail(product, selectedPartNumber) {
  const rows = detailProductRows(product, { selectedOnly: false, partNumber: selectedPartNumber });
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const partNumbers =
    selectedPartNumber === "all"
      ? unique(rows.map((row) => row.partNumber))
          .map((partNumber) => ({
            partNumber,
            revenue: sumRows(rows.filter((row) => row.partNumber === partNumber), "orderRevenue"),
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 8)
          .map((item) => item.partNumber)
      : [selectedPartNumber];

  const revenueTraces = partNumbers.map((partNumber, idx) => {
    const byPeriod = aggregateProductRows(
      rows.filter((row) => row.partNumber === partNumber),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.orderRevenue || byPeriod.get(period)?.revenueNet || 0),
      name: partNumber,
      type: "bar",
      marker: { color: palette[idx % palette.length] },
    };
  });
  const byPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  const revenueValues = periods.map((period) => byPeriod.get(period)?.orderRevenue || byPeriod.get(period)?.revenueNet || 0);
  revenueTraces.push({
    x: periods,
    y: growthSeries(revenueValues),
    name: "Order_Rev Growth %",
    type: "scatter",
    mode: "lines+markers",
    yaxis: "y2",
    line: { color: "#1f2328", width: 2.8 },
    hovertemplate: "%{x}<br>Order_Rev Growth %{y:.1f}%<extra></extra>",
  });
  drawPlot("detailPlotA", revenueTraces, {
    barmode: "stack",
    yaxis: { title: "Order_Rev", tickprefix: "$" },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });

  const quantityValues = periods.map((period) => byPeriod.get(period)?.orderQty || byPeriod.get(period)?.unitsNet || 0);
  drawPlot(
    "detailPlotB",
    [
      {
        x: periods,
        y: quantityValues,
        name: "Order Qty",
        type: "bar",
        marker: { color: "#e2231a" },
      },
      {
        x: periods,
        y: growthSeries(quantityValues),
        name: "Order Qty Growth %",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#1f2328", width: 2.6 },
        hovertemplate: "%{x}<br>Order Qty Growth %{y:.1f}%<extra></extra>",
      },
    ],
    {
      yaxis: { title: "Order Quantity" },
      yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
  );
}

function drawProductGeoDetail(product, { partNumber = "all", segment = "all" } = {}) {
  const trendRows = detailGeoRows(product, { partNumber, segment, selectedOnly: false });
  const periods = sortedPeriods(unique(trendRows.map((row) => periodKey(row.date, state.detailGranularity))));
  const geos = topGeoNames(trendRows);
  const traces = geos.map((geo, idx) => ({
    x: periods,
    y: periods.map((period) =>
      sumGeoRows(
        trendRows.filter((row) => (row.geo || "Unassigned") === geo && periodKey(row.date, state.detailGranularity) === period),
        "orderRevenue",
      ),
    ),
    name: geo,
    type: "bar",
    marker: { color: palette[idx % palette.length] },
  }));
  const revenueByPeriod = periods.map((period) => sumGeoRows(trendRows.filter((row) => periodKey(row.date, state.detailGranularity) === period), "orderRevenue"));
  traces.push({
    x: periods,
    y: growthSeries(revenueByPeriod),
    name: "Geo Order_Rev Growth %",
    type: "scatter",
    mode: "lines+markers",
    yaxis: "y2",
    line: { color: "#1f2328", width: 2.8 },
    hovertemplate: "%{x}<br>Geo Order_Rev Growth %{y:.1f}%<extra></extra>",
  });
  drawPlot("detailGeoTrendPlot", traces, {
    barmode: "stack",
    yaxis: { title: "Order_Rev", tickprefix: "$" },
    yaxis2: { title: "Growth %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
  });

  const selectedRows = detailGeoRows(product, { partNumber, segment, selectedOnly: true });
  const countryRows = unique(selectedRows.map((row) => row.country || "Unassigned"))
    .map((country) => ({
      country,
      revenue: sumGeoRows(selectedRows.filter((row) => (row.country || "Unassigned") === country), "orderRevenue"),
    }))
    .filter((row) => row.revenue)
    .sort((a, b) => b.revenue - a.revenue);
  const countries = countryRows.slice(0, 8);
  const otherRevenue = countryRows.slice(8).reduce((sum, row) => sum + row.revenue, 0);
  if (otherRevenue) countries.push({ country: "Other", revenue: otherRevenue });
  drawPlot(
    "detailCountrySharePlot",
    countries.length
      ? [
          {
            labels: countries.map((row) => row.country),
            values: countries.map((row) => row.revenue),
            type: "pie",
            hole: 0.42,
            textinfo: "label+percent",
            hovertemplate: "<b>%{label}</b><br>Order_Rev $%{value:,.0f}<br>%{percent}<extra></extra>",
            marker: { colors: countries.map((_, idx) => palette[idx % palette.length]) },
          },
        ]
      : [],
    { margin: { l: 18, r: 18, t: 8, b: 18 }, showlegend: false },
  );
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
    hovermode: "x unified",
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
    if (state.categoryView === "overview") state.overviewModule = button.dataset.module;
    render();
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
    render();
  } else if (action === "segment-filter") {
    state.segmentFilter = button.dataset.segment;
    render();
  } else if (action === "part-number") {
    state.partNumber = button.dataset.partNumber;
    render();
  } else if (action === "clear-summary-geo") {
    delete state.summarySelectedGeo[state.categoryId];
    render();
  }
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
