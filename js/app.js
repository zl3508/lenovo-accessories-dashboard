const DATA_FILES = {
  catalog: "data/catalog.json",
  productMetrics: "data/product_metrics.json",
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
  granularity: "month",
  detailGranularity: "month",
  selectedPeriod: { category: null, detail: null },
  dimension: "market",
  filters: {},
  search: "",
  selectedModels: {},
  competitorBrand: {},
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
  month: "月",
  quarter: "季度",
  year: "年",
};

const categoryViews = {
  market: "市场分析",
  competitive: "竞品分析",
  overview: "品类总览",
  products: "产品列表",
};

const dimensionLabels = {
  market: "Market 市场",
  product: "Product 产品",
  supply: "Supply Chain 供应链",
  reviews: "User Reviews 用户评价",
};

const palette = ["#e2231a", "#0f766e", "#b45309", "#2563eb", "#7c3aed", "#15803d", "#be123c", "#475569"];
const redScale = ["#f4c7c3", "#e9877f", "#d7301f", "#a62a22", "#7f231c"];
const powerOrder = ["45W and below", "60W and below", "65W", "45W to 99W", "100W to 199W", "100W and above", "200W and above"];
const priceBands = ["<$25", "$25-45", "$45-65", "$65+"];

init();

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
  const range = source.sourceDateRange ? `${source.sourceDateRange[0].slice(0, 7)} to ${source.sourceDateRange[1].slice(0, 7)}` : "modeled";
  sourceStatus.textContent = `${range} · ${source.sourceMode || "static JSON"}`;
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
          <p class="lead">Adapter、Power Bank、Power Cable 三个品类的数据已拆分为静态 JSON，页面通过原生 CSS + JS + Plotly.js 直接聚合和渲染。</p>
        </div>
        <div class="hero-stats">
          <div class="stat-tile">
            <span>Products</span>
            <strong>${data.catalog.products.length}</strong>
            <small>当前模型数，后续可继续加入新分类。</small>
          </div>
          <div class="stat-tile">
            <span>Latest Revenue</span>
            <strong>${fmtCurrency(totalSummary.revenueNet)}</strong>
            <small>${formatPeriod(latest, "month")}</small>
          </div>
          <div class="stat-tile">
            <span>Latest Units</span>
            <strong>${fmtCompact(totalSummary.unitsNet)}</strong>
            <small>Net shipped units</small>
          </div>
          <div class="stat-tile">
            <span>Gross Margin</span>
            <strong>${fmtPercent(totalSummary.margin)}</strong>
            <small>Modeled from the provided workbook cadence.</small>
          </div>
        </div>
      </section>

      <section class="section-head">
        <div>
          <p class="eyebrow">Product Categories</p>
          <h2>选择产品分区</h2>
        </div>
        <p>每个分区包含对应的品类筛选、model 对比、单品四维度详情，以及月 / 季度 / 年聚合。</p>
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
          <p class="eyebrow">${escapeHtml(category.labelZh)}</p>
          <h2>${escapeHtml(category.label)}</h2>
        </div>
        <span class="tag">${productCount} models</span>
      </header>
      <p>${escapeHtml(category.description)}</p>
      <div class="category-metrics">
        <div><span>Units</span><strong>${fmtCompact(summary.unitsNet)}</strong></div>
        <div><span>Revenue</span><strong>${fmtCurrency(summary.revenueNet)}</strong></div>
        <div><span>Profit</span><strong>${fmtCurrency(summary.grossProfit)}</strong></div>
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
          <p class="eyebrow">${escapeHtml(category.labelZh)}</p>
          <h1>${escapeHtml(category.label)}</h1>
        </div>
        <div class="toolbar-group">
          <button class="ghost-button" type="button" data-action="home">← Home</button>
          ${renderGranularityButtons(state.granularity, "category")}
        </div>
      </section>
      ${renderCategoryTabs()}
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

function renderMarketAnalysis(categoryId) {
  const category = indexes.categories.get(categoryId);
  const period = selectedPeriod();
  const latestBrands = brandRowsForSelectedPeriod(categoryId);
  const lenovo = latestBrands.find((row) => row.brand === "Lenovo") || {};
  const totalUnits = latestBrands.reduce((sum, row) => sum + row.brandUnits, 0);
  const reports = data.catalog.policyReports?.[categoryId] || [];

  return `
    <div class="view-stack">
      <section class="analysis-hero">
        <div>
          <p class="eyebrow">Market Analysis</p>
          <h2>${escapeHtml(category.label)} 整体市场分析</h2>
          <p>市场分析分为政策解读、行业趋势和市场结构三层，当前周期为 ${escapeHtml(period)}。</p>
        </div>
        <div class="insight-list">
          <div><span>Market Units</span><strong>${fmtCompact(totalUnits)}</strong></div>
          <div><span>Lenovo Share</span><strong>${fmtPercent(lenovo.marketShare || 0)}</strong></div>
          <div><span>Policy Reports</span><strong>${reports.length}</strong></div>
          <div><span>Selected Period</span><strong>${escapeHtml(period)}</strong></div>
        </div>
      </section>

      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Module 1</p>
            <h2>政策解读</h2>
          </div>
          <p>记录政策、报告来源和对产品组合的影响，便于后续自动化更新政策库。</p>
        </div>
        <div class="policy-grid">
          ${reports.map((report) => renderPolicyCard(report)).join("")}
        </div>
      </section>

      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Module 2</p>
            <h2>行业趋势分析</h2>
          </div>
        </div>
        <div class="chart-grid">
          ${chartShell("industryHighPowerPlot", "高功率迁移速度", "share of demand")}
          ${chartShell("industryPortsPlot", "接口升级趋势", "sample share")}
          ${chartShell("industryPriceCurvePlot", "同功率价格下降曲线", "AUR by period")}
          ${chartShell("industryTechPlot", "技术渗透率趋势", "feature adoption")}
        </div>
      </section>

      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Module 3</p>
            <h2>市场结构分析</h2>
          </div>
        </div>
        <div class="chart-grid">
          ${chartShell("structurePowerTrendPlot", "功率段结构趋势", "stacked share")}
          ${chartShell("structurePowerPortHeatmap", "功率 × 接口组合分布", period)}
          ${chartShell("structurePricePowerPlot", "价格带 × 功率结构", period)}
          ${chartShell("structureScenarioPlot", "使用场景拆分", period)}
        </div>
      </section>
    </div>
  `;
}

function renderPolicyCard(report) {
  return `
    <article class="policy-card">
      <span class="tag">${escapeHtml(report.region)} · ${escapeHtml(report.effectiveDate)}</span>
      <h3>${escapeHtml(report.title)}</h3>
      <p>${escapeHtml(report.summary)}</p>
      <strong>${escapeHtml(report.impact)}</strong>
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
          <h2>竞品分析</h2>
          <p>聚焦 Anker、Belkin、Ugreen 等非 Lenovo 品牌，展示出货、市场占有率、新品动作和明星产品。</p>
        </div>
        <div class="insight-list">
          <div><span>Top Competitor</span><strong>${escapeHtml(top.brand || "—")}</strong></div>
          <div><span>Competitor Share</span><strong>${fmtPercent(avgCompetitorShare)}</strong></div>
          <div><span>Latest Star Product</span><strong>${escapeHtml(top.starProduct || "—")}</strong></div>
          <div><span>Launch Signals</span><strong>${launches.length}</strong></div>
        </div>
      </section>

      <section class="competitor-grid">
        ${competitorRows.map((row) => renderCompetitorCard(row)).join("")}
      </section>

      <section class="chart-grid">
        ${chartShell("competitorDemandByPowerPlot", "各品牌需求规模对比（按功率拆分）", period)}
        ${chartShell("competitorSalesPlot", "竞品销售情况", `${granularityLabels[state.granularity]} revenue trend`)}
        <div class="chart-shell">
          <div class="chart-title">
            <strong>价格带 × 功率结构（按品牌）</strong>
            <select class="inline-select" data-action="competitor-brand">
              ${brands.map((brand) => `<option value="${escapeAttr(brand)}" ${brand === state.competitorBrand[categoryId] ? "selected" : ""}>${escapeHtml(brand)}</option>`).join("")}
            </select>
          </div>
          <div id="competitorPricePowerPlot" class="plot"></div>
        </div>
        ${chartShell("competitorBubblePlot", "品牌定位矩阵（价格 × 平均功率）", "Bubble size = sales")}
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
        <div><span>Share</span><strong>${fmtPercent(row.marketShare)}</strong></div>
        <div><span>Units</span><strong>${fmtCompact(row.brandUnits)}</strong></div>
        <div><span>AUR</span><strong>${fmtCurrency(row.avgAUR)}</strong></div>
      </div>
    </article>
  `;
}

function renderCategoryOverview(categoryId) {
  const visibleProducts = getFilteredProducts(categoryId);
  const selectedIds = getSelectedModelIds(categoryId, visibleProducts);
  const metricRows = data.productMetrics.filter((row) => row.categoryId === categoryId && selectedIds.includes(row.modelId));
  const latestRows = metricRows.filter((row) => rowInSelectedPeriod(row));
  const latestSummary = summarizeProductRows(latestRows);

  return `
    <div class="view-stack">
      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Template 1</p>
            <h2>产品总结模版</h2>
          </div>
        </div>
        ${renderProductMatrix(categoryId, visibleProducts, selectedIds, latestSummary)}
      </section>

      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Template 2</p>
            <h2>数据筛选模版</h2>
          </div>
          <p>筛选逻辑和原有图表保留，Adapter 新增 3 个及以上接口分类。</p>
        </div>
        ${renderCategoryFilters(categoryId)}
        <section class="chart-grid">
          ${chartShell("categorySalesPlot", "销量对比", `${granularityLabels[state.granularity]} · selected models`)}
          ${chartShell("categoryProfitPlot", "利润对比", "Gross profit")}
          ${chartShell("categoryRevenuePlot", "收入趋势", "Net revenue", true)}
          ${chartShell("categoryMarginPlot", "Margin / Return Rate", "Selected period")}
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
                <button class="solid-button" type="button" data-action="show-all-products">显示全部产品</button>
                <button class="ghost-button" type="button" data-action="select-visible-models">选择当前</button>
              </div>
            </div>
            <div class="product-rows">
              ${visibleProducts.length ? visibleProducts.map((product) => renderProductRow(product, selectedIds)).join("") : renderEmptyProducts()}
            </div>
          </section>
        </section>
      </section>

      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Template 3</p>
            <h2>用户反馈模块</h2>
          </div>
        </div>
        <div class="chart-grid">
          <div class="chart-shell">
            <div class="chart-title"><strong>用户关键词词云</strong><span>${escapeHtml(selectedPeriod())}</span></div>
            <div id="feedbackWordCloud" class="word-cloud"></div>
          </div>
          ${chartShell("feedbackPainPowerPlot", "痛点与功率关系", "stacked share")}
          ${chartShell("feedbackRatingMatrix", "评分矩阵（功率 × 接口）", selectedPeriod())}
          ${chartShell("feedbackReturnReasonsPlot", "退货原因分布", selectedPeriod())}
          ${chartShell("feedbackReturnRiskMatrix", "退货率与售后率矩阵（功率 × 接口）", "risk heatmap")}
          ${chartShell("feedbackRatingReturnPlot", "评分 × 退货率风险图", "bubble = sales")}
        </div>
      </section>

      <section class="module-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">Template 4</p>
            <h2>产品决策</h2>
          </div>
        </div>
        <div class="chart-grid">
          ${chartShell("decisionOpportunityPlot", "机会矩阵（增长 × 份额 × 利润）", "bubble = sales")}
          ${chartShell("decisionGapPlot", "产品空白区（功率 × 接口 × 价格带）", selectedPeriod())}
          <div class="detail-panel">${renderDecisionCards(categoryId, selectedIds)}</div>
        </div>
      </section>
    </div>
  `;
}

function renderProductMatrix(categoryId, visibleProducts, selectedIds, latestSummary) {
  const summaries = getProductLatestSummaries(categoryId, selectedIds.length ? selectedIds : visibleProducts.map((product) => product.id));
  const main = summaries.slice().sort((a, b) => b.summary.revenueNet - a.summary.revenueNet)[0];
  const profit = summaries
    .slice()
    .filter((item) => item.summary.revenueNet > 0)
    .sort((a, b) => b.summary.margin - a.summary.margin)[0];
  const watch = summaries.slice().sort((a, b) => a.summary.margin - b.summary.margin)[0];
  const cards = [
    ["主力款", main, "highest revenue"],
    ["利润款", profit, "highest margin"],
    ["观察款", watch, "margin watch"],
  ];

  return `
    <section class="product-matrix">
      <div class="kpi-grid">
        ${renderKpi("Latest Units", fmtCompact(latestSummary.unitsNet), "Net shipped")}
        ${renderKpi("Latest Revenue", fmtCurrency(latestSummary.revenueNet), selectedPeriod())}
        ${renderKpi("Gross Profit", fmtCurrency(latestSummary.grossProfit), "Selected models")}
        ${renderKpi("Gross Margin", fmtPercent(latestSummary.margin), "Weighted by revenue")}
      </div>
      <div class="matrix-card-grid">
        ${cards.map(([badge, item, note]) => renderMatrixHighlightCard(badge, item, note)).join("")}
      </div>
      <div class="chart-grid">
        ${chartShell("matrixContributionPlot", "重点产品销售额贡献", "Latest period")}
        ${chartShell("matrixBubblePlot", "产品矩阵：价格 × 毛利率", "Circle size = sales volume")}
        ${chartShell("resourceContributionPlot", "功率段资源占用 vs 销量贡献", "SKU / units / revenue share")}
        ${chartShell("portSalesStructurePlot", "接口数 × 销量结构", "stacked by power segment")}
      </div>
    </section>
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
      <div class="mini-metrics">
        <div><span>Revenue</span><strong>${fmtCurrency(item.summary.revenueNet)}</strong></div>
        <div><span>Margin</span><strong>${fmtPercent(item.summary.margin)}</strong></div>
        <div><span>Signal</span><strong>${escapeHtml(note)}</strong></div>
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
            <h2>产品列表</h2>
          </div>
          <div class="toolbar-group product-list-tools">
            <input type="search" value="${escapeAttr(state.search)}" placeholder="Search product" data-action="search-products" />
            <button class="ghost-button" type="button" data-action="show-all-products">显示全部产品</button>
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

function renderProductCard(product) {
  const latestRows = data.productMetrics.filter((row) => row.modelId === product.id && rowInSelectedPeriod(row));
  const summary = summarizeProductRows(latestRows);
  const attrs = product.attributes;
  const primarySpec = attrs.wattage ? `${attrs.wattage}W` : attrs.outputW ? `${attrs.capacityBand} / ${attrs.outputW}W` : `${attrs.lengthBand} / ${attrs.powerBand}`;
  return `
    <article class="product-card">
      <button class="product-card-hit" type="button" data-route-category="${product.categoryId}" data-route-product="${product.id}">
        <div class="product-visual product-visual-${product.categoryId}">
          <span>${escapeHtml(primarySpec)}</span>
        </div>
        <div class="product-card-body">
          <span class="tag">${escapeHtml(primarySpec)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml((attrs.features || []).join(" / "))}</p>
          <div class="mini-metrics">
            <div><span>Units</span><strong>${fmtCompact(summary.unitsNet)}</strong></div>
            <div><span>Revenue</span><strong>${fmtCurrency(summary.revenueNet)}</strong></div>
            <div><span>Margin</span><strong>${fmtPercent(summary.margin)}</strong></div>
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
          <h2>品类筛选</h2>
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
        <span class="metric-label">Margin</span>
        <strong>${fmtPercent(summary.margin)}</strong>
      </div>
      <button class="ghost-button" type="button" data-route-category="${product.categoryId}" data-route-product="${product.id}">详情</button>
    </article>
  `;
}

function renderEmptyProducts() {
  return `
    <section class="empty-state">
      <div>
        <h3>No products</h3>
        <p>调整筛选条件后可继续查看 model 对比。</p>
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

  const profitTraces = products.map((product, idx) => {
    const productRows = categoryRows.filter((row) => row.modelId === product.id);
    const byPeriod = aggregateProductRows(productRows, (row) => periodKey(row.date, state.granularity));
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.grossProfit || 0),
      name: product.shortName,
      type: "bar",
      marker: { color: palette[idx % palette.length] },
    };
  });
  drawPlot("categoryProfitPlot", profitTraces, { barmode: "group", yaxis: { title: "Gross Profit" } });

  const revenueByPeriod = aggregateProductRows(categoryRows, (row) => periodKey(row.date, state.granularity));
  drawPlot(
    "categoryRevenuePlot",
    [
      {
        x: periods,
        y: periods.map((period) => revenueByPeriod.get(period)?.revenueNet || 0),
        name: "Revenue",
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        line: { color: indexes.categories.get(categoryId).accent, width: 3 },
      },
      {
        x: periods,
        y: periods.map((period) => revenueByPeriod.get(period)?.grossProfit || 0),
        name: "Gross Profit",
        type: "scatter",
        mode: "lines",
        line: { color: "#0f766e", width: 2 },
      },
    ],
    { yaxis: { title: "USD" } },
  );

  const latest = selectedPeriod();
  const latestByModel = products.map((product) => ({
    product,
    summary: summarizeProductRows(categoryRows.filter((row) => row.modelId === product.id && periodKey(row.date, state.granularity) === latest)),
  }));
  drawPlot(
    "categoryMarginPlot",
    [
      {
        x: latestByModel.map((item) => item.product.shortName),
        y: latestByModel.map((item) => item.summary.margin * 100),
        name: "Margin",
        type: "bar",
        marker: { color: indexes.categories.get(categoryId).accent },
      },
      {
        x: latestByModel.map((item) => item.product.shortName),
        y: latestByModel.map((item) => item.summary.returnRate * 100),
        name: "Return Rate",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#2563eb", width: 2 },
      },
    ],
    {
      yaxis: { title: "Margin %", ticksuffix: "%" },
      yaxis2: { title: "Return %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
  );
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
  drawPlot("industryHighPowerPlot", traces, { yaxis: { title: "占比 %", ticksuffix: "%" } });
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
  drawPlot("industryPortsPlot", traces, { yaxis: { title: "样本占比 %", ticksuffix: "%", range: [0, 100] } });
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
  drawPlot("industryPriceCurvePlot", traces, { yaxis: { title: "平均价格", tickprefix: "$" } });
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
  drawPlot("industryTechPlot", traces, { yaxis: { title: "采用率 %", ticksuffix: "%", range: [0, 100] } });
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
  drawPlot("structurePowerTrendPlot", traces, { yaxis: { title: "样本占比 %", ticksuffix: "%", range: [0, 100] } });
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
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "接口数" }, yaxis: { title: "功率段" } },
  );
}

function drawPricePowerStructure(categoryId, rows, powerSegments, id = "structurePricePowerPlot") {
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
  drawPlot(id, traces, { barmode: "stack", yaxis: { title: "样本占比 %", ticksuffix: "%", range: [0, 100] } });
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
  drawPlot("competitorPricePowerPlot", traces, { barmode: "stack", yaxis: { title: "占比 %", ticksuffix: "%", range: [0, 100] } });
}

function drawProductMatrix(categoryId, visibleProducts, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : visibleProducts.map((product) => product.id);
  const summaries = getProductLatestSummaries(categoryId, productIds);
  drawPlot(
    "matrixContributionPlot",
    [
      {
        x: summaries.map((item) => item.product.shortName),
        y: summaries.map((item) => item.summary.revenueNet),
        name: "Revenue",
        type: "bar",
        marker: { color: indexes.categories.get(categoryId).accent },
      },
      {
        x: summaries.map((item) => item.product.shortName),
        y: summaries.map((item) => item.summary.grossProfit),
        name: "Gross Profit",
        type: "bar",
        marker: { color: "#111827" },
      },
    ],
    { barmode: "stack", yaxis: { title: "USD" } },
  );

  drawPlot(
    "matrixBubblePlot",
    [
      {
        x: summaries.map((item) => item.product.listPrice),
        y: summaries.map((item) => item.summary.margin * 100),
        text: summaries.map((item) => item.product.shortName),
        mode: "markers+text",
        type: "scatter",
        textposition: "middle center",
        marker: {
          size: summaries.map((item) => Math.max(34, Math.sqrt(item.summary.unitsNet) * 0.8)),
          color: summaries.map((_, idx) => palette[idx % palette.length]),
          opacity: 0.32,
          line: { color: "#1f2328", width: 1.6 },
        },
      },
    ],
    { xaxis: { title: "List Price" }, yaxis: { title: "Gross Margin %", ticksuffix: "%" } },
  );

  drawResourceContribution(categoryId, productIds);
  drawPortSalesStructure(categoryId, productIds);
}

function drawResourceContribution(categoryId, productIds) {
  const products = productIds.map((id) => indexes.products.get(id)).filter(Boolean);
  const rows = data.productMetrics.filter((row) => productIds.includes(row.modelId) && rowInSelectedPeriod(row));
  const segments = getCategoryPowerSegments(categoryId);
  const totalSkus = products.length || 1;
  const totalUnits = rows.reduce((sum, row) => sum + row.unitsNet, 0) || 1;
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenueNet, 0) || 1;
  drawPlot(
    "resourceContributionPlot",
    [
      {
        x: segments,
        y: segments.map((segment) => (products.filter((product) => productPowerSegment(product) === segment).length / totalSkus) * 100),
        name: "SKU占比",
        type: "bar",
        marker: { color: "#f4c7c3" },
      },
      {
        x: segments,
        y: segments.map((segment) => (rows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === segment).reduce((sum, row) => sum + row.unitsNet, 0) / totalUnits) * 100),
        name: "销量占比",
        type: "bar",
        marker: { color: "#d7301f" },
      },
      {
        x: segments,
        y: segments.map((segment) => (rows.filter((row) => productPowerSegment(indexes.products.get(row.modelId)) === segment).reduce((sum, row) => sum + row.revenueNet, 0) / totalRevenue) * 100),
        name: "收入占比",
        type: "bar",
        marker: { color: "#111827" },
      },
    ],
    { barmode: "group", yaxis: { title: "占比 %", ticksuffix: "%" } },
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
  drawPlot("feedbackPainPowerPlot", traces, { barmode: "stack", yaxis: { title: "痛点占比 %", ticksuffix: "%" } });
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
        colorbar: { title: "评分" },
      },
    ],
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "接口数" }, yaxis: { title: "功率段" } },
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
    { margin: { l: 120, r: 20, t: 8, b: 42 }, xaxis: { title: "退货样本数" } },
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
        colorbar: { title: "售后率 %" },
      },
    ],
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "接口数" }, yaxis: { title: "功率段" } },
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
    { xaxis: { title: "销量加权评分", range: [3.8, 4.9] }, yaxis: { title: "退货率 %", ticksuffix: "%" } },
  );
}

function renderDecisionCards(categoryId, selectedIds) {
  const productIds = selectedIds.length ? selectedIds : data.catalog.products.filter((product) => product.categoryId === categoryId).map((product) => product.id);
  const items = getDecisionItems(categoryId, productIds);
  const top = items.slice().sort((a, b) => b.growth + b.margin - (a.growth + a.margin))[0];
  const harvest = items.slice().sort((a, b) => b.share - a.share)[0];
  const risk = items.slice().sort((a, b) => b.returnRate - a.returnRate)[0];
  return `
    <div class="chart-title"><strong>策略机会与决策</strong><span>${escapeHtml(selectedPeriod())}</span></div>
    <div class="news-list">
      ${renderDecisionItem("加码机会", top, "增长和利润同时较强，适合增加资源投入。")}
      ${renderDecisionItem("收割主力", harvest, "份额贡献最高，适合保持供给和价格纪律。")}
      ${renderDecisionItem("风险观察", risk, "退货或售后风险较高，需要优先复盘体验问题。")}
    </div>
  `;
}

function renderDecisionItem(title, item, body) {
  if (!item) return "";
  return `
    <article class="news-item">
      <strong>${escapeHtml(title)} · ${escapeHtml(item.segment)}</strong>
      <p>${escapeHtml(body)} Growth ${fmtPercent(item.growth)}, share ${fmtPercent(item.share)}, margin ${fmtPercent(item.margin)}.</p>
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
          colorbar: { title: "Margin %" },
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
    { margin: { l: 90, r: 40, t: 8, b: 56 }, xaxis: { title: "接口数" }, yaxis: { title: "功率段" } },
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
    .sort((a, b) => periodSortValue(periodKey(b.date, "month")) - periodSortValue(periodKey(a.date, "month")))
    .slice(0, 8);
  return `
    <div class="chart-title">
      <strong>竞品新品动作</strong>
      <span>modeled launch signals</span>
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
            <td>${escapeHtml(row.date.slice(0, 7))}</td>
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
  const selectedVariant = state.variantId === "all" || variants.some((variant) => variant.id === state.variantId) ? state.variantId : "all";
  state.variantId = selectedVariant;
  const detailKpis = renderDetailKpis(product, selectedVariant);

  app.innerHTML = `
    <div class="detail-shell" style="--accent:${category.accent}">
      <section class="detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(category.label)} · Product Detail</p>
          <h1>${escapeHtml(product.name)}</h1>
          <p>${escapeHtml((product.attributes.features || []).join(" / "))}</p>
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
          <div class="variant-chips">
            <button class="filter-chip ${selectedVariant === "all" ? "is-active" : ""}" type="button" data-action="variant" data-variant-id="all">All variants</button>
            ${variants
              .map(
                (variant) =>
                  `<button class="filter-chip ${selectedVariant === variant.id ? "is-active" : ""}" type="button" data-action="variant" data-variant-id="${variant.id}">${escapeHtml(variant.name)}</button>`,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="kpi-grid">
        ${detailKpis}
      </section>

      <section class="detail-grid" id="detailCharts"></section>
    </div>
  `;

  renderDetailCharts(product, selectedVariant);
}

function renderSpecItems(product) {
  const attrs = product.attributes;
  const base = [
    ["Category", indexes.categories.get(product.categoryId).label],
    ["List Price", fmtCurrency(product.listPrice)],
  ];
  if (product.categoryId === "adapter") {
    base.push(["Wattage", `${attrs.wattage}W · ${attrs.wattageBand}`], ["Ports", `${attrs.ports} · ${attrs.powerMode}`], ["Protocol", attrs.interfaceProtocols.join(" / ")], ["Scenario", attrs.scenarios.join(" / ")]);
  } else if (product.categoryId === "power_bank") {
    base.push(["Capacity", attrs.capacityBand], ["Output", `${attrs.outputW}W · ${attrs.outputBand}`], ["Scenario", attrs.scenarios.join(" / ")], ["2-in-1", attrs.isTwoInOne ? "Yes" : "No"]);
  } else {
    base.push(["Connector", attrs.connectors.join(" / ")], ["Length", attrs.lengthBand], ["Power", attrs.powerBand], ["Scenario", attrs.scenarios.join(" / ")]);
  }
  return base.map(([label, value]) => `<div class="spec-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`);
}

function renderDetailKpis(product, selectedVariant) {
  if (state.dimension === "market") {
    const rows = data.marketMetrics.filter((row) => row.modelId === product.id);
    const latest = rows.filter((row) => rowInSelectedPeriod(row, "detail")).at(0) || {};
    return [
      renderKpi("Model Share", fmtPercent(latest.modelMarketShare || 0), "Total category market"),
      renderKpi("Lenovo Share", fmtPercent(latest.lenovoCategoryShare || 0), "Category share"),
      renderKpi("Market Rank", latest.marketRankInLenovo ? `#${latest.marketRankInLenovo}` : "—", "Within Lenovo models"),
      renderKpi("Search Index", latest.searchIndex ? latest.searchIndex.toFixed(1) : "—", "Modeled demand signal"),
    ].join("");
  }
  if (state.dimension === "supply") {
    const rows = getSupplyRowsForProduct(product);
    const latestRows = rows.filter((row) => rowInSelectedPeriod(row, "detail"));
    const avgPrice = avg(latestRows.map((row) => row.priceIndex));
    const avgLead = avg(latestRows.map((row) => row.leadTimeDays));
    const maxImpact = Math.max(...latestRows.map((row) => row.impactLevel), 0);
    const launch = latestRows.find((row) => row.newProductLaunch)?.newProductLaunch || "No launch";
    return [
      renderKpi("Price Index", avgPrice.toFixed(1), "Related components"),
      renderKpi("Lead Time", `${avgLead.toFixed(0)} days`, "Average"),
      renderKpi("Impact Level", `${maxImpact}/5`, "Latest period"),
      renderKpi("Launch Signal", escapeHtml(launch), selectedPeriod("detail")),
    ].join("");
  }
  if (state.dimension === "reviews") {
    const rows = data.consumerInsights.filter((row) => row.modelId === product.id);
    const latestRows = rows.filter((row) => rowInSelectedPeriod(row, "detail"));
    const totalReviews = Math.max(...latestRows.map((row) => row.totalReviews), 0);
    const rating = avg(latestRows.map((row) => row.avgRating));
    const positive = latestRows.filter((row) => row.sentiment === "Positive").reduce((sum, row) => sum + row.frequency, 0);
    const all = latestRows.reduce((sum, row) => sum + row.frequency, 0);
    const top = latestRows.slice().sort((a, b) => b.frequency - a.frequency)[0]?.keyword || "—";
    return [
      renderKpi("Reviews", fmtCompact(totalReviews), "Latest period"),
      renderKpi("Rating", rating.toFixed(2), "Average score"),
      renderKpi("Positive Mix", fmtPercent(positive / Math.max(1, all)), "Keyword frequency"),
      renderKpi("Top Keyword", escapeHtml(top), "Latest period"),
    ].join("");
  }

  const rows = data.productMetrics.filter((row) => {
    if (row.modelId !== product.id) return false;
    return selectedVariant === "all" || row.variantId === selectedVariant;
  });
  const latestRows = rows.filter((row) => rowInSelectedPeriod(row, "detail"));
  const summary = summarizeProductRows(latestRows);
  return [
    renderKpi("Units", fmtCompact(summary.unitsNet), "Latest period"),
    renderKpi("Revenue", fmtCurrency(summary.revenueNet), selectedVariant === "all" ? "All variants" : "Selected variant"),
    renderKpi("Gross Profit", fmtCurrency(summary.grossProfit), "Latest period"),
    renderKpi("Margin", fmtPercent(summary.margin), "Weighted"),
  ].join("");
}

function renderDetailCharts(product, selectedVariant) {
  const target = document.querySelector("#detailCharts");
  if (!target) return;
  if (state.dimension === "market") {
    target.innerHTML = `
      ${chartShell("detailPlotA", "市场份额", `${granularityLabels[state.detailGranularity]} trend`)}
      ${chartShell("detailPlotB", "需求与搜索", "Market units / search index")}
      ${chartShell("detailPlotC", "价格竞争指数", "AUR vs list price", true)}
    `;
    drawMarketDetail(product);
  } else if (state.dimension === "supply") {
    target.innerHTML = `
      ${chartShell("detailPlotA", "组件价格指数", "Related components")}
      ${chartShell("detailPlotB", "交付周期与产能", "Lead time / utilization")}
      <div class="detail-panel">${renderSupplyNews(product)}</div>
    `;
    drawSupplyDetail(product);
  } else if (state.dimension === "reviews") {
    target.innerHTML = `
      ${chartShell("detailPlotA", "评价情绪", `${granularityLabels[state.detailGranularity]} aggregation`)}
      ${chartShell("detailPlotB", "关键词频率", "Latest period")}
      ${chartShell("detailPlotC", "评分趋势", "Average rating", true)}
    `;
    drawReviewDetail(product);
  } else {
    target.innerHTML = `
      ${chartShell("detailPlotA", "Variant 销量", `${granularityLabels[state.detailGranularity]} comparison`)}
      ${chartShell("detailPlotB", "Variant 利润", "Gross profit")}
      ${chartShell("detailPlotC", "Margin / Return Rate", "Product health", true)}
    `;
    drawProductDetail(product, selectedVariant);
  }
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
        y: periods.map((period) => (byPeriod.get(period)?.lenovoCategoryShare || 0) * 100),
        name: "Lenovo Category Share",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#0f766e", width: 2 },
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
        name: "Market Units",
        type: "bar",
        marker: { color: "#d97706" },
      },
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.searchIndex || 0),
        name: "Search Index",
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
  drawPlot(
    "detailPlotC",
    [
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.competitivePriceIndex || 0),
        name: "Competitive Price Index",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#7c3aed", width: 3 },
      },
    ],
    { yaxis: { title: "Index" } },
  );
}

function drawProductDetail(product, selectedVariant) {
  const rows = data.productMetrics.filter((row) => {
    if (row.modelId !== product.id) return false;
    return selectedVariant === "all" || row.variantId === selectedVariant;
  });
  const variantIds = unique(rows.map((row) => row.variantId));
  const periods = sortedPeriods(unique(rows.map((row) => periodKey(row.date, state.detailGranularity))));
  const traces = variantIds.map((variantId, idx) => {
    const variant = indexes.variants.get(variantId);
    const byPeriod = aggregateProductRows(
      rows.filter((row) => row.variantId === variantId),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.unitsNet || 0),
      name: variant?.name || variantId,
      type: "scatter",
      mode: "lines+markers",
      line: { color: palette[idx % palette.length], width: 2.4 },
    };
  });
  drawPlot("detailPlotA", traces, { yaxis: { title: "Units" } });

  const profitTraces = variantIds.map((variantId, idx) => {
    const variant = indexes.variants.get(variantId);
    const byPeriod = aggregateProductRows(
      rows.filter((row) => row.variantId === variantId),
      (row) => periodKey(row.date, state.detailGranularity),
    );
    return {
      x: periods,
      y: periods.map((period) => byPeriod.get(period)?.grossProfit || 0),
      name: variant?.name || variantId,
      type: "bar",
      marker: { color: palette[idx % palette.length] },
    };
  });
  drawPlot("detailPlotB", profitTraces, { barmode: "group", yaxis: { title: "Gross Profit" } });

  const byPeriod = aggregateProductRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  drawPlot(
    "detailPlotC",
    [
      {
        x: periods,
        y: periods.map((period) => (byPeriod.get(period)?.margin || 0) * 100),
        name: "Margin",
        type: "scatter",
        mode: "lines+markers",
        line: { color: indexes.categories.get(product.categoryId).accent, width: 3 },
      },
      {
        x: periods,
        y: periods.map((period) => (byPeriod.get(period)?.returnRate || 0) * 100),
        name: "Return Rate",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        line: { color: "#2563eb", width: 2 },
      },
    ],
    {
      yaxis: { title: "Margin %", ticksuffix: "%" },
      yaxis2: { title: "Return %", overlaying: "y", side: "right", ticksuffix: "%", showgrid: false },
    },
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
  const sentiments = ["Positive", "Neutral", "Negative"];
  const colors = { Positive: "#15803d", Neutral: "#b45309", Negative: "#be123c" };
  const traces = sentiments.map((sentiment) => {
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
  drawPlot("detailPlotA", traces, { barmode: "stack", yaxis: { title: "Frequency" } });

  const latestRows = rows.filter((row) => rowInSelectedPeriod(row, "detail")).sort((a, b) => b.frequency - a.frequency);
  drawPlot(
    "detailPlotB",
    [
      {
        x: latestRows.map((row) => row.frequency),
        y: latestRows.map((row) => row.keyword),
        type: "bar",
        orientation: "h",
        marker: { color: latestRows.map((row) => colors[row.sentiment]) },
        name: "Keyword",
      },
    ],
    { margin: { l: 118, r: 20, t: 8, b: 36 }, xaxis: { title: "Frequency" } },
  );

  const byPeriod = aggregateReviewRows(rows, (row) => periodKey(row.date, state.detailGranularity));
  drawPlot(
    "detailPlotC",
    [
      {
        x: periods,
        y: periods.map((period) => byPeriod.get(period)?.avgRating || 0),
        name: "Rating",
        type: "scatter",
        mode: "lines+markers",
        line: { color: indexes.categories.get(product.categoryId).accent, width: 3 },
      },
    ],
    { yaxis: { title: "Average Rating", range: [3.6, 5] } },
  );
}

function renderSupplyNews(product) {
  const latestRows = getSupplyRowsForProduct(product)
    .filter((row) => rowInSelectedPeriod(row, "detail"))
    .sort((a, b) => b.impactLevel - a.impactLevel);
  return `
    <div class="chart-title">
      <strong>供应链信息</strong>
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
    return;
  }
  if (!traces.length) {
    node.innerHTML = `<div class="plot-fallback">No data for current filters.</div>`;
    return;
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
  } else if (action === "variant") {
    state.variantId = button.dataset.variantId;
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
  if (target.dataset.action === "category-filter") {
    ensureCategoryFilterState(state.categoryId);
    state.filters[state.categoryId][target.dataset.filterId] = target.value;
    state.selectedModels[state.categoryId] = null;
    render();
  }
  if (target.dataset.action === "toggle-model") {
    const visible = getFilteredProducts(state.categoryId);
    const currentIds = getSelectedModelIds(state.categoryId, visible);
    const next = new Set(currentIds);
    if (target.checked) next.add(target.dataset.modelId);
    else next.delete(target.dataset.modelId);
    state.selectedModels[state.categoryId] = next;
    render();
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
  summary.aur = summary.unitsNet ? summary.revenueNet / summary.unitsNet : 0;
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
  if (count >= 4) return "4 ports";
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
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7));
  if (granularity === "year") return String(year);
  if (granularity === "quarter") return `${year} Q${Math.floor((month - 1) / 3) + 1}`;
  return dateString.slice(0, 7);
}

function sortedPeriods(periods) {
  return periods.slice().sort((a, b) => periodSortValue(a) - periodSortValue(b));
}

function periodSortValue(period) {
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
