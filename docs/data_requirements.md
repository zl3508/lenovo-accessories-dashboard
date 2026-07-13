# Lenovo Accessories Dashboard Data Requirements

本文档说明 Lenovo accessories dashboard 需要准备的数据。当前前端是零后端结构，只读取 `data/*.json`，所以后续自动化 Python 抓取、清洗或人工补数时，应尽量保持这些字段合同稳定。当前真实产品版本以 fiscal year、fiscal quarter、segment 和 PN 为核心维度。

## 1. Overall Data Architecture

Dashboard 目前需要 7 类 JSON 数据：

| File | Purpose | Main Business Layer |
| --- | --- | --- |
| `data/catalog.json` | 品类、产品、PN variant、筛选器、财政期间、政策报告、静态元数据 | Shared master data |
| `data/product_metrics.json` | 单品、PN、segment 的订单、出货、backlog、成本、利润 | Product |
| `data/market_metrics.json` | 单品在市场和 Lenovo 内部的份额、需求、价格指数 | Market |
| `data/brand_market_metrics.json` | Lenovo 和竞品品牌层面的销售、份额、新品、明星产品 | Market / Competitor |
| `data/supply_chain.json` | 组件、供应商、价格指数、交付周期、产能、供应链新闻 | Supply Chain |
| `data/consumer_insights.json` | 用户关键词、情绪、评论量、评分 | User |
| `data/metadata.json` | 数据生成时间、来源、记录数、更新方式说明 | Governance |

Recommended grain:

| Layer | Recommended Grain | Required Keys |
| --- | --- | --- |
| Catalog | one row per category / product / PN variant | `categoryId`, `modelId`, `variantId`, `partNumber` |
| Product metrics | fiscal quarter, product, PN, segment | `date`, `fiscalYear`, `fiscalQuarter`, `categoryId`, `modelId`, `partNumber`, `segment` |
| Market metrics | fiscal quarter, product | `date`, `fiscalYear`, `fiscalQuarter`, `categoryId`, `modelId` |
| Brand market metrics | fiscal quarter, category, brand | `date`, `fiscalYear`, `fiscalQuarter`, `categoryId`, `brand` |
| Supply chain | fiscal quarter, category, component / supplier | `date`, `categoryId`, `componentType`, `supplier` |
| User insights | fiscal quarter, product, keyword | `date`, `categoryId`, `modelId`, `keyword` |

Minimum time columns:

| Field | Type | Notes |
| --- | --- | --- |
| `date` | string, `YYYY-MM-01` | Synthetic period start date used for browser sorting. Fiscal labels come from `periodMeta`. |
| `fiscalYear` | string | `FY2425`, `FY2526`, `FY2627`. |
| `fiscalQuarter` | string | `Q1`, `Q2`, `Q3`, `Q4`. |
| `year` | number | Calendar year derived from `date`; kept for backward compatibility. |
| `month` | number | Calendar month derived from `date`; kept for backward compatibility. |

The current dashboard supports fiscal quarter and fiscal year filters only. Quarter labels are formatted as `FY2627 Q1`; year labels are formatted as `FY2627`.

## 2. Shared Master Data

### 2.1 Category Master

Stored in `catalog.json > categories`.

| Field | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `id` | string | yes | `adapter` | Stable category key. Current values: `adapter`, `power_bank`, `power_cable`. |
| `label` | string | yes | `Adapter` | Display label. |
| `labelZh` | string | optional | `Charging Adapters` | Legacy display subtitle; currently English. |
| `description` | string | yes | `Wall, desktop...` | Category summary. |
| `accent` | string | yes | `#e2231a` | Lenovo red in current design. |

### 2.2 Product Master

Stored in `catalog.json > products`.

Common product fields:

| Field | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `id` | string | yes | `adapter_65w_gan` | Stable model key, used by every metric table. |
| `categoryId` | string | yes | `adapter` | Must match category master. |
| `name` | string | yes | `Lenovo 65W USB-C GaN Adapter` | Full model name. |
| `shortName` | string | yes | `65W GaN` | Chart legend and card label. |
| `listPrice` | number | yes | `49` | Current list price or latest MSRP, USD by default. |
| `attributes` | object | yes | see below | Category-specific attributes used for filters and matrices. |
| `variants` | string[] | yes | `adapter_65w_gan_40aw65wbeu` | Related PN variant IDs. |
| `partNumbers` | string[] | yes | `["40AW65WBEU", "40AW65WBUK"]` | Product-level PN selector in the Product detail dimension. |
| `tags` | string[] | optional | `["GaN", "compact"]` | Product list pills. |

Adapter attributes:

| Field | Type | Example | Use |
| --- | --- | --- | --- |
| `wattage` | number | `65` | Power segment, same-spec competitor comparison. |
| `wattageBand` | string | `45W to 99W` | Adapter wattage filter. |
| `features` | string[] | `["GaN", "compact", "travel"]` | Tag display and derived analysis; not used as an Adapter filter in the current UI. |
| `compatibility` | string | `mobile`, `multi`, `laptop` | Adapter compatibility filter. |
| `powerMode` | string | `Wired` / `Wireless` | Wired / wireless filter. |
| `ports` | number | `2` | Port count calculation. |
| `portCountBand` | string | `1 port`, `2 ports`, `3+ ports` | Port filter. |
| `interfaceProtocols` | string[] | `["USB-C PD", "PPS"]` | Optional protocol metadata; not used as a current Adapter filter. |
| `scenarios` | string[] | `["daily carry", "travel"]` | Use case analysis. |
| `isTwoInOne` | boolean | `false` | Internal boolean; frontend filter uses `features: ["2-in-1"]`. |

Power bank attributes:

| Field | Type | Example | Use |
| --- | --- | --- | --- |
| `capacityMah` | number | `10000` | Capacity comparison. |
| `capacityBand` | string | `Below 10000mAh`, `10000-20000mAh`, `20000mAh and above` | Capacity filter. |
| `outputW` | number | `65` | Output power comparison. |
| `outputBand` | string | `65W and below`, `65W-100W`, `100W and above` | Output power filter. |
| `features` | string[] | `["2-in-1", "high wattage"]` | Tag display and derived analysis; not used as a current Power Bank filter. |
| `compatibility` | string | `mobile`, `multi`, `laptop` | Power Bank compatibility filter. |
| `hasCable` | string | `Yes`, `No` | Built-in / included cable filter. |
| `scenarios` | string[] | `["travel", "outdoor"]` | Optional use case analysis. |
| `isTwoInOne` | boolean | `true` | Internal boolean; use `2-in-1` in `features` for filtering. |

Power cable attributes:

| Field | Type | Example | Use |
| --- | --- | --- | --- |
| `connectors` | string[] | `["USB-C", "USB-A"]` | Connector / feature filter. |
| `lengthM` or `lengthMeters` | number | `1.8` | Length comparison. |
| `lengthBand` | string | `1m to 2m` | Length filter. |
| `powerW` | number | `100` | Power support comparison. |
| `powerBand` | string | `100W-200W`, `200W and above` | Power filter. |
| `features` | string[] | `["USB-C", "E-marker"]` | Tag display and derived analysis; not used as a current Cable filter. |
| `retractable` | string | `Yes`, `No` | Retractable filter. |
| `scenarios` | string[] | `["travel", "workstation"]` | Optional use case analysis. |

### 2.3 PN Variant Master

Stored in `catalog.json > variants`.

| Field | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `id` | string | yes | `adapter_65w_gan_40aw65wbeu` | Stable PN variant key. |
| `modelId` | string | yes | `adapter_65w_gan` | Parent product. |
| `categoryId` | string | yes | `adapter` | Category. |
| `name` | string | yes | `40AW65WBEU` | PN label. |
| `partNumber` | string | yes | `40AW65WBEU` | Source Excel `Part Number`. |
| `share` | number | optional | `0.45` | Estimated allocation if future source only has model-level totals. |
| `priceMultiplier` | number | optional | `1.0` | PN price index vs base model. |
| `costMultiplier` | number | optional | `1.0` | PN cost index vs base model. |

### 2.4 Filter Values

Stored in `catalog.json > filters` and `catalog.json > filterValues`.

Required filters by category:

| Category | Filters |
| --- | --- |
| Adapter | `wattageBand`, `compatibility`, `powerMode`, `portCountBand` |
| Power Bank | `capacityBand`, `outputBand`, `compatibility`, `hasCable` |
| Power Cable | `lengthBand`, `powerBand`, `retractable` |

Important filter rules:

- `2-in-1` should be included in `features`, not as a separate filter.
- `wireless` and `dual port` should not appear as Feature filter values if the same concept already appears in `powerMode` or `portCountBand`.
- `portCountBand` should include `3+ ports` where relevant.

## 3. Market Layer

Market data supports Market Analysis, Competitor Analysis, and category structure charts.

### 3.1 Product-Level Market Metrics

Stored in `market_metrics.json`.

Grain: one row per fiscal quarter, category, and product.

| Field | Type | Required | Example | Used For |
| --- | --- | --- | --- | --- |
| `date` | string | yes | `2026-07-01` | Synthetic period start date for sorting. |
| `year` | number | yes | `2026` | Calendar year derived from `date`. |
| `month` | number | yes | `7` | Calendar month derived from `date`; compatibility field. |
| `categoryId` | string | yes | `adapter` | Category filter. |
| `modelId` | string | yes | `adapter_65w_gan` | Product detail. |
| `totalMarketUnits` | number | yes | `420000` | Total category demand volume. |
| `lenovoCategoryUnits` | number | yes | `49000` | Lenovo units in this category. |
| `lenovoCategoryShare` | number | yes | `0.117` | Lenovo share within total category market. |
| `modelMarketShare` | number | yes | `0.026` | Product share within total category market. |
| `modelRevenueShareWithinLenovo` | number | yes | `0.157` | Product revenue mix inside Lenovo category. |
| `marketRankInLenovo` | number | optional | `1` | Lenovo internal product rank. |
| `categoryAUR` | number | optional | `45.98` | Average unit retail price for category / comparable segment. |
| `searchIndex` | number | optional | `75.3` | Demand proxy from search, marketplace, or trend data. |
| `competitivePriceIndex` | number | optional | `102.3` | Price competitiveness index, 100 = market average. |
| `dataConfidence` | string | recommended | `modeled`, `observed`, `estimated` | Data quality marker. |

Recommended sources:

- Marketplace sales estimates: Amazon, Walmart, Best Buy, Lenovo.com, retailer panels.
- Search demand: Google Trends, Amazon search rank, keyword volume tools.
- Category market sizing: IDC, Circana, GfK, Statista, internal sell-out reports.
- Price index: scraped marketplace price by model / wattage / capacity / cable type.

### 3.2 Brand-Level Market Metrics

Stored in `brand_market_metrics.json`.

Grain: one row per fiscal quarter, category, and brand.

| Field | Type | Required | Example | Used For |
| --- | --- | --- | --- | --- |
| `date` | string | yes | `2026-07-01` | Synthetic period start date for sorting. |
| `year` | number | yes | `2026` | Calendar year derived from `date`. |
| `month` | number | yes | `7` | Calendar month derived from `date`; compatibility field. |
| `categoryId` | string | yes | `adapter` | Category. |
| `brand` | string | yes | `Anker` | Brand comparison. |
| `brandUnits` | number | yes | `92130` | Brand shipment / sell-out units. |
| `brandRevenue` | number | yes | `5059674` | Brand sales revenue. |
| `marketShare` | number | yes | `0.2904` | Brand share in category. |
| `avgAUR` | number | yes | `54.92` | Brand average unit revenue / retail price. |
| `newProductLaunch` | string or null | optional | `Anker Prime 100W GaN` | Launch table. |
| `starProduct` | string | optional | `Anker 737 GaNPrime` | Competitor cards and detail page. |
| `heroFeature` | string | optional | `GaN multi-port fast charging` | Selling point comparison. |
| `channelSignal` | number | optional | `89.4` | Channel visibility / promotion index. |
| `isLenovo` | boolean | yes | `false` | Splits Lenovo from competitors. |
| `dataConfidence` | string | recommended | `estimated` | Data quality marker. |

Recommended competitor brands:

- Adapter: Anker, Belkin, UGREEN, Baseus, Apple, Samsung, Aukey, RAVPower.
- Power Bank: Anker, UGREEN, Baseus, Belkin, Xiaomi, INIU, Mophie.
- Power Cable: Anker, UGREEN, Belkin, Apple, Amazon Basics, Baseus.

### 3.3 Market Policy Reports

Stored in `catalog.json > policyReports`.

Grain: one row per policy / report / category.

| Field | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- |
| `title` | string | yes | `EU Common Charger Directive` | Policy title. |
| `region` | string | yes | `European Union` | Region. |
| `effectiveDate` | string | recommended | `2026-04-28` | Effective date or `Current`. |
| `source` | string | yes | `European Commission` | Source name. |
| `sourceUrl` | string | yes | URL | Original source link. |
| `summary` | string | yes | short paragraph | What changed. |
| `impact` | string | yes | short paragraph | Product / portfolio impact. |

Recommended sources:

- European Commission common charger directive pages.
- U.S. Department of Energy external power supply and battery charger standards.
- California Energy Commission appliance efficiency pages.
- USB-IF specification and certification announcements.
- Airline / FAA / TSA lithium battery transport guidance for power banks.

## 4. Product Layer

Product data supports Category Overview, Data Filters, Product List, and Product Detail pages.

### 4.1 Product Metrics

Stored in `product_metrics.json`.

Grain: one row per fiscal quarter, category, product, PN, and segment.

| Field | Type | Required | Formula / Example | Used For |
| --- | --- | --- | --- | --- |
| `date` | string | yes | `2026-07-01` | Synthetic period start date for sorting. |
| `fiscalYear` | string | yes | `FY2627` | Fiscal year filter. |
| `fiscalQuarter` | string | yes | `Q2` | Fiscal quarter filter. |
| `year` | number | yes | `2026` | Calendar year derived from `date`. |
| `month` | number | yes | `7` | Calendar month derived from `date`. |
| `categoryId` | string | yes | `adapter` | Category. |
| `modelId` | string | yes | `adapter_65w_gan` | Product. |
| `variantId` | string | yes | `adapter_65w_gan_40aw65wbeu` | PN variant key. |
| `variantName` | string | yes | `40AW65WBEU` | PN label. |
| `partNumber` | string | yes | `40AW65WBEU` | Product detail PN selector. |
| `segment` | string | yes | `Commercial`, `Consumer` | Product detail segment selector. |
| `orderRevenue` | number | yes | source `Order_Rev` | Main revenue KPI from real Excel. |
| `shipRevenue` | number | yes | source `Ship_Rev` | Shipped revenue KPI. |
| `backlogRevenue` | number | yes | source `Bklg_Rev` | Backlog revenue KPI. |
| `orderQty` | number | yes | source `Order_Qty` | Main quantity KPI from real Excel. |
| `shipQty` | number | yes | source `Ship_Qty` | Shipped quantity. |
| `backlogQty` | number | yes | source `Bklg_Qty` | Backlog quantity. |
| `unitsGross` | number | yes | `orderQty` | Backward-compatible chart field. |
| `unitsReturned` | number | yes | `0` or returned units | Return volume when available. |
| `unitsNet` | number | yes | `orderQty` | Backward-compatible net units in charts. |
| `returnRate` | number | yes | `unitsReturned / unitsGross` | User / quality risk. |
| `revenueGross` | number | yes | `orderRevenue` | Backward-compatible gross revenue. |
| `refundAmount` | number | yes | refunded revenue | Refund drag. |
| `revenueNet` | number | yes | `orderRevenue - refundAmount` | Backward-compatible net revenue. |
| `aur` | number | yes | `orderRevenue / orderQty` | Average unit revenue. |
| `unitCost` | number | yes | per-unit cost | Cost trend. |
| `returnCost` | number | recommended | handling / write-off cost | Return economics. |
| `grossProfit` | number | yes | `revenueNet - unitCost * unitsNet - returnCost` | Profit charts. |
| `margin` | number | yes | `grossProfit / revenueNet` | Gross margin. |
| `inventorySellThrough` | number | optional | `0.7671` | Product health. |
| `conversionRate` | number | optional | `0.0264` | Ecommerce funnel. |
| `stockoutDays` | number | optional | `2` | Supply / demand gap. |
| `dataConfidence` | string | recommended | `observed` | Data quality marker. |

Recommended internal sources:

- Lenovo sell-in / sell-out reports.
- Ecommerce order data.
- Finance revenue / cost reports.
- Return / RMA systems.
- Inventory and stockout reports.
- Product catalog / PLM / SKU master data.

### 4.2 Product Matrix Inputs

The Product Summary module needs:

| Metric | Source | Notes |
| --- | --- | --- |
| Latest units | `product_metrics.unitsNet` | Aggregated by selected period and product. |
| Latest revenue | `product_metrics.revenueNet` | Used for core model identification. |
| Gross profit | `product_metrics.grossProfit` | Used in contribution charts. |
| Gross margin | `product_metrics.margin` | Weighted by revenue. |
| List price | `catalog.products.listPrice` | X-axis in price × margin matrix. |
| Power / capacity / length / port | `catalog.products.attributes` | Product matrix segmentation. |

### 4.3 Product Detail Inputs

The Product detail page needs these minimum fields:

| Detail Tab | Required Inputs |
| --- | --- |
| Market | `market_metrics.modelMarketShare`, `modelRevenueShareWithinLenovo`, `totalMarketUnits`, `searchIndex` |
| Competitor | `brand_market_metrics.brandUnits`, `brandRevenue`, `avgAUR`, `starProduct`, `heroFeature` plus product wattage / port / capacity attributes |
| Product | `product_metrics.unitsNet`, `revenueNet`, `unitCost`, `grossProfit`, `margin` |
| Supply | `supply_chain.priceIndex`, `leadTimeDays`, `capacityUtilization`, `newsSummary`, `impactLevel` |
| User | `consumer_insights.keyword`, `sentiment`, `frequency`, `avgRating`; `product_metrics.returnRate` |

## 5. Supply Chain Layer

Supply Chain data supports component risk analysis and category-level supply signals.

Stored in `supply_chain.json`.

Grain: one row per fiscal quarter, category, component type, and supplier.

| Field | Type | Required | Example | Used For |
| --- | --- | --- | --- | --- |
| `date` | string | yes | `2026-07-01` | Synthetic period start date for sorting. |
| `year` | number | yes | `2026` | Calendar year derived from `date`. |
| `month` | number | yes | `7` | Calendar month derived from `date`; compatibility field. |
| `categoryId` | string | yes | `adapter` | Category. |
| `componentType` | string | yes | `GaN power IC` | Component grouping. |
| `supplier` | string | yes | `Navitas` | Supplier. |
| `supplierRegion` | string | recommended | `US`, `EU`, `China` | Regional exposure. |
| `priceIndex` | number | yes | `103.4` | Component cost index, 100 = baseline. |
| `priceChangePct` | number | optional | `0.024` | Month-over-month or period change. |
| `leadTimeDays` | number | yes | `28` | Procurement lead time. |
| `capacityUtilization` | number | yes | `86.5` | Supplier / component utilization percentage. |
| `newProductLaunch` | string or null | optional | `new GaN IC platform` | Supply-side launch signal. |
| `launchPrice` | number or null | optional | `119` | New component / reference product price. |
| `newsSummary` | string | recommended | `PD 3.1 certification cycles add lead-time pressure.` | Supply signal text. |
| `impactLevel` | number | recommended | `1-5` | Risk / impact scoring. |
| `relatedModelIds` | string[] | yes | `["adapter_140w_desktop"]` | Links component risk to products. |
| `dataConfidence` | string | recommended | `estimated` | Data quality marker. |

Recommended component coverage:

| Category | Components to Track |
| --- | --- |
| Adapter | USB-C PD controller, GaN power IC, thermal module, AC plug / housing, cable-in-box if bundled |
| Power Bank | Battery cells, BMS / protection IC, USB-C PD controller, magnetic coil, casing / rugged shell, built-in cable module |
| Power Cable | USB-C connector, E-marker chip, braided jacket, copper / cable core, Lightning / MFi component if applicable |

Recommended sources:

- Supplier quotes and procurement systems.
- Component distributor pricing.
- Lead-time reports from suppliers.
- Logistics and inventory systems.
- Certification / compliance schedules.
- News monitoring for key suppliers.

## 6. User Layer

User data supports User Feedback module and product-level User page.

Stored in `consumer_insights.json`.

Grain: one row per fiscal quarter, category, product, and keyword.

| Field | Type | Required | Example | Used For |
| --- | --- | --- | --- | --- |
| `date` | string | yes | `2026-07-01` | Synthetic period start date for sorting. |
| `year` | number | yes | `2026` | Calendar year derived from `date`. |
| `month` | number | yes | `7` | Calendar month derived from `date`; compatibility field. |
| `categoryId` | string | yes | `adapter` | Category. |
| `modelId` | string | yes | `adapter_65w_gan` | Product. |
| `keyword` | string | yes | `charging speed` | Word cloud and keyword frequency. |
| `sentiment` | string | yes | `Positive`, `Neutral`, `Negative` | Sentiment trend. |
| `frequency` | number | yes | `84` | Keyword count in period. |
| `totalReviews` | number | yes | `361` | Review volume KPI. |
| `relativeFreq` | number | recommended | `frequency / totalReviews` | Normalized keyword intensity. |
| `avgRating` | number | yes | `4.2` | Rating trend. |
| `dataConfidence` | string | recommended | `observed`, `modeled` | Data quality marker. |

Recommended keyword taxonomy:

| Category | Positive / Functional Keywords | Pain Point Keywords |
| --- | --- | --- |
| Adapter | charging speed, compact size, GaN, port count, compatibility, desktop setup, travel size | heat, noise, plug stability, price, protocol compatibility |
| Power Bank | capacity, charging speed, magnetic hold, built-in cable, portability, outdoor use | heat, weight, slow recharge, cable durability, airline concern |
| Power Cable | durability, fast charge, cable length, connector fit, braided jacket, E-marker support | fraying, connector loose, speed drop, compatibility, stiffness |

Recommended sources:

- Lenovo.com product reviews.
- Retailer reviews: Amazon, Best Buy, Walmart, Costco, etc.
- Marketplace Q&A and return reasons.
- Support tickets, RMA reasons, after-sales tags.
- Social listening, Reddit / forum mentions if compliant with source policy.

### 6.1 User Metrics Derived From Product Data

Some User charts combine `consumer_insights.json` and `product_metrics.json`.

| Metric | Source | Formula |
| --- | --- | --- |
| Return rate | `product_metrics` | `unitsReturned / unitsGross` |
| Service rate proxy | `product_metrics` + negative sentiment | `returnRate + negativeKeywordShare * adjustmentFactor` |
| Positive mix | `consumer_insights` | positive keyword frequency / total keyword frequency |
| Rating trend | `consumer_insights.avgRating` | weighted by `frequency` if multiple keyword rows exist |

## 7. Data Quality Rules

### 7.1 Required ID Integrity

- Every `product_metrics.modelId`, `market_metrics.modelId`, and `consumer_insights.modelId` must exist in `catalog.products.id`.
- Every `product_metrics.variantId` must exist in `catalog.variants.id`.
- Every `categoryId` must exist in `catalog.categories.id`.
- Every `supply_chain.relatedModelIds[]` should map to valid product IDs.

### 7.2 Numeric Rules

| Rule | Reason |
| --- | --- |
| `unitsNet = unitsGross - unitsReturned` | Keeps volume KPIs consistent. |
| `returnRate = unitsReturned / unitsGross` | Used in User and Product views. |
| `revenueNet = revenueGross - refundAmount` | Used for revenue trend. |
| `aur = revenueNet / unitsNet` | Used for price / AUR comparisons. |
| `margin = grossProfit / revenueNet` | Used in Product Summary and Detail. |
| Shares should be decimals, not percentages | `0.458`, not `45.8`. |

### 7.3 Time Completeness

Recommended minimum:

- At least 12 months of data for trend charts.
- Same date range across product, market, brand, supply, and user tables where possible.
- If a source is missing for a month, fill with `null` only where the chart can tolerate it, otherwise use a modeled estimate and set `dataConfidence = "estimated"`.

### 7.4 Data Confidence

Use consistent values:

| Value | Meaning |
| --- | --- |
| `observed` | Directly from internal systems or reliable external source. |
| `scraped` | Collected from marketplace / web scraping. |
| `estimated` | Estimated from ranking, pricing, or sample data. |
| `modeled` | Synthetic or fitted from another dataset. |

## 8. Recommended Update Pipeline

1. Extract raw data from internal systems, public reports, web scraping, or manual sheets.
2. Normalize IDs into the master catalog: `categoryId`, `modelId`, `variantId`, `partNumber`, `segment`, `brand`.
3. Convert all base metrics to fiscal quarter rows.
4. Calculate derived metrics: net units, net revenue, AUR, margin, shares, return rate.
5. Validate referential integrity and numeric formulas.
6. Export the seven JSON files under `data/`.
7. Deploy through GitHub Pages.

Current command:

```bash
python3 scripts/generate_dashboard_data.py \
  --source-dir "/Users/albert/Desktop/2026.7.13" \
  --output-dir data
```

## 9. Priority Data Checklist

If data collection must be phased, use this priority order:

1. Product master and PN variant master: without this, filters and product pages cannot work.
2. Product metrics: order revenue, ship revenue, backlog revenue, order quantity, ship quantity, backlog quantity, cost, profit, margin, segment, and PN.
3. Market and brand metrics: category demand, Lenovo share, competitor share, brand sales.
4. User review metrics: keyword, sentiment, frequency, rating, return reasons.
5. Supply chain metrics: component price index, lead time, capacity, supplier news.
6. Policy reports: official policy / compliance reports with sources and impact notes.

## 10. Current Dashboard Field Contract

These are the current files the frontend expects:

```text
data/catalog.json
data/product_metrics.json
data/market_metrics.json
data/brand_market_metrics.json
data/supply_chain.json
data/consumer_insights.json
data/metadata.json
```

When future automation replaces the current Excel-based generation, keep these file names and field names stable unless the frontend is updated at the same time.
