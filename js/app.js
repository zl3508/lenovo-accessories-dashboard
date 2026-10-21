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
  powerHome: "data/iso_power/home_dashboard.json",
  competitorDatabase: "data/competitor_database.json",
  adapterAssets: "data/adapter_product_assets.json",
};

const DATA_VERSION = "20261021-remove-future-categories-v38";

const state = {
  categoryId: null,
  productId: null,
  categoryView: "overview",
  marketModule: "global",
  granularity: "quarter",
  detailGranularity: "quarter",
  selectedPeriod: { category: "FY2627 Q2", detail: null },
  selectedCategoryPeriods: ["FY2627 Q2"],
  selectedCategoryMonths: ["2026-07", "2026-08", "2026-09"],
  selectedCategoryYears: [],
  categoryPeriodMenuOpen: false,
  globalTimeMenuOpen: false,
  globalTimeTab: "quarter",
  dimension: "segment",
  segmentFilter: "all",
  partNumber: "all",
  filters: {},
  search: "",
  selectedModels: {},
  competitorBrand: {},
  competitorLenovoProduct: {},
  competitorCountry: {},
  competitorDbFilters: {},
  competitorDbBrand: {},
  adapterCompetitiveFilters: {},
  adapterCompetitiveBrand: null,
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
  homeView: "landing",
  homePowerScope: "total",
  homeTopModelFilters: { geo: "all", segment: "all", dib: "all", channel: "all" },
  homeTopPartnerFilters: { geo: "all", segment: "all", dib: "all" },
  categoryOverviewMetrics: {},
  categoryOverviewSegments: {},
  categoryOverviewProducts: {},
  categoryContributionGeo: {},
  categoryContributionSegment: {},
  categoryProductSelectorOpen: false,
  categoryTrendProducts: {},
  categoryTrendProductSelectorOpen: false,
  categoryTrendMode: {},
  quarterComparisonMode: {},
  categoryTrendGeo: {},
  categoryTrendGeos: {},
  categoryTrendGeoMenuOpen: false,
  categoryTrendPeriods: {},
  categoryTrendPeriodMenuOpen: false,
  expandedTrendChart: null,
  categoryRankingGeo: {},
  quarterComparisonYears: {},
  categoryTrendVisibleSeries: {},
  categoryGeoSelected: {},
  categoryGeoProducts: {},
  categoryGeoMetric: {},
  categoryGeoProductSelectorOpen: false,
  categoryGeoPeriods: {},
  categoryGeoTimeMenuOpen: false,
  categoryGeoChartModes: {},
  detailPanelPns: {},
  selectedComplianceIndex: {},
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
let adapterLogoDrag = null;

const granularityLabels = {
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

const marketOverviewSupplements = {
  adapter: {
    eyebrow: "Global Overview",
    heading: "Global Laptop Charger TAM Scope",
    subtitle: "Market Size, Region, Technology and Channel Summary",
    body: "The global laptop charger market is expanding steadily, driven by USB-C PD standardization, demand for replacement and multi-device charging, and the adoption of compact GaN designs. Market growth is global, but product preferences and channel strategies remain highly localized.",
    bullets: [
      "Growth is not a short spike: the market moves from $3.45B in 2020 to $7.08B in 2032, with 2025-2032 CAGR at 6.85%.",
      "APAC is the largest structural block at 40.21%, while North America and Europe together remain the key premium and enterprise demand pools.",
      "65W-100W is the mainstream power band, but 100W+ becomes strategically important as USB-C PD 3.1 and high-performance laptops expand.",
      "Online retail leads globally, but country-level execution still requires different balances of online, offline, OEM, and brand-owned channels.",
    ],
    metrics: [
      { label: "Global laptop charger market", value: "$4.45B", note: "2025 market size" },
      { label: "2026 Forecast", value: "$4.94B", note: "2026 market size" },
      { label: "2026 YoY Growth", value: "10.97%", note: "2025 to 2026" },
      { label: "Top Power Segment", value: "65W-100W", note: "42.88% share" },
    ],
    trend: {
      eyebrow: "Market Size Trend",
      title: "2020–2032 Global Laptop Charger Market Size",
      forecastStartYear: 2026,
      note: "The market recovered after a temporary decline in 2022 and is projected to expand from $4.45 billion in 2025 to $7.08 billion by 2032. Growth remains positive throughout the forecast period, although annual growth rates vary significantly.",
      items: [
        { label: "2020", value: 3450.2, valueLabel: "$3.45B" },
        { label: "2021", value: 3753.68, valueLabel: "$3.75B" },
        { label: "2022", value: 3534.93, valueLabel: "$3.53B" },
        { label: "2023", value: 3736.81, valueLabel: "$3.74B" },
        { label: "2024", value: 4156.65, valueLabel: "$4.16B" },
        { label: "2025", value: 4450, valueLabel: "$4.45B" },
        { label: "2026", value: 4938.32, valueLabel: "$4.94B" },
        { label: "2027", value: 5006.36, valueLabel: "$5.01B" },
        { label: "2028", value: 5405.9, valueLabel: "$5.41B" },
        { label: "2029", value: 5756.41, valueLabel: "$5.76B" },
        { label: "2030", value: 6254.99, valueLabel: "$6.25B" },
        { label: "2031", value: 6843.2, valueLabel: "$6.84B" },
        { label: "2032", value: 7075.9, valueLabel: "$7.08B" },
      ],
    },
    conclusions: [
      {
        title: "Regional Summary",
        body: "APAC leads the market by scale, while North America and Europe together contribute 48.82% of global value and remain important premium and enterprise markets.",
        summaryPoints: [
          "APAC leads the market by scale, supported by a large consumer base and electronics manufacturing ecosystem.",
          "North America and Europe together contribute 48.82% of global value and remain important premium and enterprise markets.",
        ],
        points: [
          "APAC accounts for more than 40% of the global market, supported by its large consumer base and established electronics manufacturing ecosystem.",
          "Regional execution remains highly differentiated, requiring localized product, pricing and channel strategies.",
        ],
        chart: {
          title: "2025 Region Share",
          type: "donut",
          center: "2025 Share",
          legendSide: "left",
          showLabels: false,
          items: [
            { label: "APAC", value: 1789.13, valueLabel: "$1,789.13M", description: "China, Japan, India, South Korea and Southeast Asia" },
            { label: "North America", value: 1157.84, valueLabel: "$1,157.84M", description: "USA, Canada and Mexico" },
            { label: "Europe", value: 1014.58, valueLabel: "$1,014.58M", description: "UK, Germany, France, Italy and Spain" },
            { label: "Latin America", value: 288.74, valueLabel: "$288.74M", description: "Brazil, Mexico, Argentina and Chile" },
            { label: "MEA", value: 199.71, valueLabel: "$199.71M", description: "Middle East and Africa: Saudi Arabia, UAE, South Africa and Egypt" },
          ],
        },
      },
      {
        title: "Product & Technology Structure Summary",
        body: "The market is concentrated below 100W, with the 65W–100W segment leading narrowly. GaN has reached meaningful scale, although silicon-based chargers still dominate total market value.",
        summaryPoints: [
          "The market is concentrated below 100W, with the 65W–100W segment leading narrowly.",
          "GaN has reached meaningful scale, although silicon-based chargers still dominate total market value.",
        ],
        points: [
          "65W–100W represents the largest power segment, but below-65W products remain almost equally important.",
          "Above-100W chargers remain a smaller, high-performance segment serving premium laptops, gaming devices and workstations.",
          "GaN supports smaller and more efficient form factors, while silicon remains dominant due to cost and supply-chain maturity.",
        ],
        charts: [
          {
            title: "2025 Power Output Share",
            type: "donut",
            center: "2025 Power",
            items: [
              { label: "65W-100W", value: 1908.27, valueLabel: "$1,908.27M" },
              { label: "Below 65W", value: 1828.29, valueLabel: "$1,828.29M" },
              { label: "Above 100W", value: 713.44, valueLabel: "$713.44M" },
            ],
          },
          {
            title: "2025 Technology Mix",
            type: "donut",
            center: "2025 Mix",
            items: [
              { label: "Silicon Based", value: 3076.26, valueLabel: "$3,076.26M" },
              { label: "GaN", value: 1373.74, valueLabel: "$1,373.74M" },
            ],
          },
        ],
      },
      {
        title: "Channel Summary",
        body: "Online retail accounts for more than 58% of global market value, supported by broad product selection, price transparency and convenient delivery. Offline and OEM channels remain relevant where buyers value immediate service, warranty support, product compatibility and direct brand relationships.",
        summaryPoints: [
          "Online retail accounts for more than 58% of global market value, supported by broad product selection, price transparency and convenient delivery.",
          "Offline and OEM channels remain relevant where buyers value immediate service, warranty support, compatibility and direct brand relationships.",
        ],
        points: [
          "Online retail accounts for more than 58% of global market value, supported by broad product selection, price transparency and convenient delivery.",
          "Offline and OEM channels remain relevant where buyers value immediate service, warranty support, product compatibility and direct brand relationships.",
        ],
        chart: {
          title: "2025 Channel Share",
          type: "donut",
          center: "2025 Share",
          legendSide: "right",
          showLabels: false,
          items: [
            { label: "Online Retail", value: 2593.62, valueLabel: "$2,593.62M", description: "E-commerce marketplaces and brand-owned online stores" },
            { label: "Offline Stores", value: 1098.49, valueLabel: "$1,098.49M", description: "Physical electronics retailers, distributors and resellers" },
            { label: "Direct OEM Sales", value: 757.89, valueLabel: "$757.89M", description: "PC-bundled or direct sales through device manufacturers" },
          ],
        },
      },
    ],
  },
  power_bank: {
    eyebrow: "Global Overview",
    heading: "Global Laptop Power Bank (65W+) TAM Scope",
    subtitle: "Output Power, Capacity, Regional Scale and Portfolio Direction",
    body: "This analysis focuses on laptop-class power banks delivering 65W or more, matching Lenovo's high-power portfolio scope. The category is expanding with mobile work, gaming laptops and USB-C PD adoption, while buyers balance sustained laptop output, capacity, portability and the 100Wh air-travel threshold.",
    metrics: [
      { label: "Laptop power bank market", value: "$2.535B", note: "2025 global estimate" },
      { label: "2032 Forecast", value: "$4.706B", note: "Global laptop power banks" },
      { label: "2025–2032 CAGR", value: "9.24%", note: "Published forecast" },
      { label: "65W+ Revenue Share", value: "81.09%", note: "65–100W plus above 100W" },
    ],
    trend: {
      eyebrow: "Market Size Trend",
      title: "2025–2032 Global Laptop Power Bank Market",
      forecastStartYear: 2026,
      note: "Published worldwide laptop power bank market forecast; values shown in USD millions.",
      items: [
        { label: "2025", value: 2535.00, valueLabel: "$2.535B" },
        { label: "2026", value: 2737.96, valueLabel: "$2.738B" },
        { label: "2027", value: 3044.41, valueLabel: "$3.044B" },
        { label: "2028", value: 3407.70, valueLabel: "$3.408B" },
        { label: "2029", value: 3708.02, valueLabel: "$3.708B" },
        { label: "2030", value: 3998.19, valueLabel: "$3.998B" },
        { label: "2031", value: 4373.76, valueLabel: "$4.374B" },
        { label: "2032", value: 4706.07, valueLabel: "$4.706B" },
      ],
    },
    conclusions: [
      {
        title: "65W+ Output Power Structure",
        summaryPoints: [
          "65–100W is the largest laptop power bank segment, representing 54.86% of 2025 revenue.",
          "Above 100W adds 26.23%, taking the combined 65W+ opportunity to 81.09%.",
        ],
        points: [
          "The 65–100W tier is the mainstream laptop sweet spot for office, travel and hybrid-work charging.",
          "Above 100W serves higher-performance laptops, multi-device charging and shorter top-up windows.",
          "Below 65W is only 18.91% of laptop power bank revenue and is outside the primary Lenovo analysis scope.",
        ],
        chart: {
          title: "2025 Revenue Share by Output Power",
          type: "donut",
          legendSide: "right",
          items: [
            { label: "65W–100W", value: 54.86, valueLabel: "54.86%" },
            { label: "Above 100W", value: 26.23, valueLabel: "26.23%" },
            { label: "Below 65W", value: 18.91, valueLabel: "18.91%" },
          ],
        },
      },
      {
        title: "Capacity & Travel Design",
        summaryPoints: [
          "20,000–40,000mAh leads with 57.94% of 2025 laptop power bank revenue.",
          "The 100Wh carry-on threshold makes roughly 20K–27K mAh the practical premium travel zone.",
        ],
        points: [
          "Below 20,000mAh accounts for 25.68%, favoring portability but offering less laptop runtime.",
          "Above 40,000mAh holds 16.38% and targets runtime-led professional or off-grid use, with greater travel and weight constraints.",
          "Portfolio design should prioritize clear Wh labeling, USB-C PD 3.1, multi-port power allocation and real-time status displays.",
        ],
        chart: {
          title: "2025 Revenue Share by Capacity",
          type: "donut",
          items: [
            { label: "20K–40K mAh", value: 57.94, valueLabel: "57.94%" },
            { label: "Below 20K mAh", value: 25.68, valueLabel: "25.68%" },
            { label: "Above 40K mAh", value: 16.38, valueLabel: "16.38%" },
          ],
        },
      },
      {
        title: "Regional Opportunity & Portfolio Focus",
        summaryPoints: [
          "Asia Pacific is the largest region at 42.44%, followed by North America at 27.42% and Europe at 22.78%.",
          "Lenovo should separate mainstream 65–100W travel products from premium 100W+ multi-device products.",
        ],
        points: [
          "Asia Pacific represented about $1.076B in 2025, supported by manufacturing scale and growing mobile-work demand.",
          "North America and Europe together represent 50.20%, making certification, travel compliance and premium productivity messaging important.",
          "Priority differentiators are sustained laptop output, intelligent power allocation, integrated cables, compact construction and accurate displays.",
        ],
        chart: {
          title: "2025 Revenue Share by Region",
          type: "donut",
          center: "$2.535B",
          legendSide: "left",
          items: [
            { label: "Asia Pacific", value: 42.44, valueLabel: "42.44%" },
            { label: "North America", value: 27.42, valueLabel: "27.42%" },
            { label: "Europe", value: 22.78, valueLabel: "22.78%" },
            { label: "Latin America", value: 4.50, valueLabel: "4.50%" },
            { label: "Middle East & Africa", value: 2.86, valueLabel: "2.86%" },
          ],
        },
      },
    ],
    sources: [
      { title: "PW Consulting – Worldwide Power Bank for Laptop Market 2026", url: "https://pmarketresearch.com/worldwide-power-bank-for-laptop-market-research/" },
    ],
  },
  power_cable: {
    eyebrow: "Global Overview",
    heading: "Global Power Cable TAM Scope",
    subtitle: "Market Direction, Power Capability, Use Case and Channel Summary",
    body: "Power cables are shifting from undifferentiated accessories to performance-critical components. USB-C adoption, laptop common-charger rules and USB PD Extended Power Range make wattage, data rate, E-marker implementation, durability and certified labeling central to product selection.",
    metrics: [
      { label: "USB-C charging cable market", value: "~$6.1B*", note: "2025 modeled baseline" },
      { label: "2030 Forecast", value: "$9.0B", note: "Published market projection" },
      { label: "Maximum USB PD", value: "240W", note: "USB PD 3.1 / EPR" },
      { label: "Certified Cable Marks", value: "60W / 240W", note: "USB-IF power labeling" },
    ],
    trend: {
      eyebrow: "Market Size Trend",
      title: "2025–2030 USB-C Charging Cable Market Size*",
      note: "* Directional planning series modeled backward from the published $9.0B 2030 projection at an implied 8.1% CAGR.",
      items: [
        { label: "2025", value: 6100, valueLabel: "$6.10B*" },
        { label: "2026", value: 6594, valueLabel: "$6.59B*" },
        { label: "2027", value: 7128, valueLabel: "$7.13B*" },
        { label: "2028", value: 7706, valueLabel: "$7.71B*" },
        { label: "2029", value: 8330, valueLabel: "$8.33B*" },
        { label: "2030", value: 9000, valueLabel: "$9.00B" },
      ],
    },
    conclusions: [
      {
        title: "Regional & Regulatory Summary",
        summaryPoints: [
          "USB-C is becoming the default charging interface across mobile and PC ecosystems.",
          "EU common-charger requirements extend to laptops from 28 April 2026.",
        ],
        points: [
          "Europe is the clearest regulation-led adoption market, while Asia remains central to manufacturing scale.",
          "North America and developed Asian markets concentrate demand for premium USB4, high-data-rate and high-power cables.",
          "Regulatory harmonization expands the addressable market but increases the importance of truthful capability labeling.",
        ],
        chart: {
          title: "Strategic Demand Drivers",
          type: "donut",
          center: "Planning Index",
          legendSide: "left",
          showLabels: false,
          items: [
            { label: "USB-C Device Adoption", value: 38, valueLabel: "38 index" },
            { label: "Fast / High-power Charging", value: 30, valueLabel: "30 index" },
            { label: "Replacement & Bundling", value: 20, valueLabel: "20 index" },
            { label: "High-speed Data", value: 12, valueLabel: "12 index" },
          ],
        },
      },
      {
        title: "Product & Technology Summary",
        summaryPoints: [
          "The commercial power tiers are converging around clearly labeled 60W and 240W USB-C cables.",
          "Premium value comes from combining power, data, video, durability and cable-management features.",
        ],
        points: [
          "USB PD 3.1 supports up to 240W through 28V, 36V and 48V Extended Power Range modes.",
          "USB-IF requires compliant USB-C to USB-C cable categories to carry 60W or 240W power markings.",
          "E-marker design, connector temperature, bend life and signal integrity are key quality gates for laptop-class products.",
        ],
        charts: [
          {
            title: "Power Tier Architecture",
            type: "donut",
            center: "Portfolio",
            items: [
              { label: "60W Everyday", value: 45, valueLabel: "Mainstream" },
              { label: "100W Legacy 5A", value: 25, valueLabel: "Installed base" },
              { label: "240W EPR", value: 30, valueLabel: "Growth tier" },
            ],
          },
          {
            title: "Value Proposition",
            type: "donut",
            center: "Planning Mix",
            items: [
              { label: "Power Delivery", value: 40, valueLabel: "40 index" },
              { label: "Durability", value: 25, valueLabel: "25 index" },
              { label: "Data / Video", value: 20, valueLabel: "20 index" },
              { label: "Portability", value: 15, valueLabel: "15 index" },
            ],
          },
        ],
      },
      {
        title: "Channel Summary",
        summaryPoints: [
          "Online comparison makes certified wattage, data rate, length and connector type decisive listing attributes.",
          "OEM bundles and enterprise procurement reward compatibility, traceability and lifecycle reliability.",
        ],
        points: [
          "E-commerce favors a good/better/best architecture organized by wattage, length, construction and data speed.",
          "Retail packaging needs clear 60W/240W and data-rate communication to reduce consumer confusion and returns.",
          "PC OEM and commercial channels can differentiate through validated compatibility, warranty and bundle attach.",
        ],
        chart: {
          title: "Channel Role",
          type: "donut",
          center: "Planning Mix",
          legendSide: "right",
          showLabels: false,
          items: [
            { label: "Online Retail", value: 50, valueLabel: "Primary discovery" },
            { label: "OEM / Commercial", value: 30, valueLabel: "Compatibility-led" },
            { label: "Physical Retail", value: 20, valueLabel: "Immediate replacement" },
          ],
        },
      },
    ],
    sources: [
      { title: "USB-IF – Cables and Connectors", url: "https://usb.org/cable_connector" },
      { title: "USB-IF – USB Power Delivery up to 240W", url: "https://www.usb.org/usb-charger-pd" },
      { title: "European Commission – Common Charger", url: "https://single-market-economy.ec.europa.eu/sectors/electrical-and-electronic-engineering-industries-eei/radio-equipment-directive-red/one-common-charging-solution-all_en" },
      { title: "The Business Research Company – USB-C Charging Cable Market", url: "https://www.thebusinessresearchcompany.com/report/usb-c-charging-cable-global-market-report" },
    ],
  },
};

Object.assign(marketOverviewSupplements.power_cable, {
  heading: "Global Consumer Electronics Charging Cable TAM Scope",
  subtitle: "Connector, Material, Application and High-power Upgrade Summary",
  body: "This analysis covers consumer-electronics charging cables for phones, tablets, laptops, wearables and adjacent devices. USB-C standardization, higher charging power, certified E-Marker designs and demand for durable premium construction are shifting the category from basic replacement accessories toward performance-led products.",
  metrics: [
    { label: "Charging cable market", value: "$4.32B", note: "2025 global estimate" },
    { label: "2035 Forecast", value: "$8.50B", note: "Published global forecast" },
    { label: "2026–2035 CAGR", value: "6.7%", note: "Published forecast" },
    { label: "USB-C Revenue", value: "$2.25B", note: "52.1% of 2025 market" },
  ],
  trend: {
    eyebrow: "Market Size Trend",
    title: "2025–2035 Consumer Electronics Charging Cable Market",
    forecastStartYear: 2026,
    note: "2025, 2026 and 2035 are published values; 2027–2034 follow the published 6.7% CAGR for planning continuity.",
    items: [
      { label: "2025", value: 4320, valueLabel: "$4.32B" },
      { label: "2026", value: 4730, valueLabel: "$4.73B" },
      { label: "2027", value: 5047, valueLabel: "$5.05B" },
      { label: "2028", value: 5385, valueLabel: "$5.39B" },
      { label: "2029", value: 5746, valueLabel: "$5.75B" },
      { label: "2030", value: 6131, valueLabel: "$6.13B" },
      { label: "2031", value: 6542, valueLabel: "$6.54B" },
      { label: "2032", value: 6980, valueLabel: "$6.98B" },
      { label: "2033", value: 7448, valueLabel: "$7.45B" },
      { label: "2034", value: 7947, valueLabel: "$7.95B" },
      { label: "2035", value: 8500, valueLabel: "$8.50B" },
    ],
  },
  conclusions: [
    {
      title: "Connector Migration",
      summaryPoints: [
        "USB-C generated $2.25B in 2025, equal to about 52.1% of the global charging-cable market.",
        "USB-C is projected to reach $6.12B by 2035 as common-charger rules and higher-power devices consolidate demand.",
      ],
      points: [
        "Micro-USB generated $605M in 2025 and is expected to contract as legacy devices age out.",
        "Multi-connector cables retained a 10% share by serving households and travel use cases with mixed device generations.",
        "The remaining connector mix is derived from the published total after deducting disclosed USB-C, Micro-USB and multi-connector values.",
      ],
      chart: {
        title: "2025 Revenue Share by Connector", type: "donut", center: "$4.32B", legendSide: "left",
        items: [
          { label: "USB-C", value: 52.08, valueLabel: "52.08%" },
          { label: "Lightning / Other", value: 23.91, valueLabel: "23.91%" },
          { label: "Micro-USB", value: 14.00, valueLabel: "14.00%" },
          { label: "Multi-Connector", value: 10.00, valueLabel: "10.00%" },
        ],
      },
    },
    {
      title: "Material Premiumization",
      summaryPoints: [
        "Nylon-braided cables generated $1.21B in 2025 and are forecast to grow at 9.4% through 2035.",
        "PVC remained a major volume material at $1.30B, while silicone held a 10% share.",
      ],
      points: [
        "Braided construction supports premium positioning through visible durability and perceived longevity.",
        "TPE balances flexibility and cost for mainstream USB-C assortments; its 2025 share is derived as the remainder of disclosed material values.",
        "High-power Lenovo products should emphasize bend life, connector reinforcement, E-Marker certification and clear 60W/240W labeling.",
      ],
      chart: {
        title: "2025 Revenue Share by Material", type: "donut", center: "$4.32B",
        items: [
          { label: "TPE / Other", value: 31.90, valueLabel: "31.90%" },
          { label: "PVC", value: 30.09, valueLabel: "30.09%" },
          { label: "Nylon Braided", value: 28.01, valueLabel: "28.01%" },
          { label: "Silicone", value: 10.00, valueLabel: "10.00%" },
        ],
      },
    },
    {
      title: "Application & High-power Opportunity",
      summaryPoints: [
        "Smartphones generated $2.25B in 2025, while laptops and tablets are projected to reach $2.72B by 2035.",
        "Laptop and tablet cables are expected to grow at 8.4%, supporting certified 65W–240W product expansion.",
      ],
      points: [
        "Laptop charging has higher performance and compatibility stakes than basic phone-cable replacement demand.",
        "USB PD 3.1 and 240W E-Marker capability create a premium upgrade cycle for gaming, mobile workstation and multi-device users.",
        "The 2025 laptops-and-tablets share is derived from the disclosed total after subtracting smartphones, wearables and other applications.",
      ],
      chart: {
        title: "2025 Revenue Share by Application", type: "donut", center: "$4.32B", legendSide: "right",
        items: [
          { label: "Smartphones", value: 52.08, valueLabel: "52.08%" },
          { label: "Laptops & Tablets", value: 27.93, valueLabel: "27.93%" },
          { label: "Wearables & Hearables", value: 11.99, valueLabel: "11.99%" },
          { label: "Other Devices", value: 8.00, valueLabel: "8.00%" },
        ],
      },
    },
  ],
  sources: [
    { title: "Global Market Insights – Consumer Electronics Charging Cable Market", url: "https://www.gminsights.com/industry-analysis/consumer-electronics-charging-cable-market" },
  ],
});

const categoryViews = {
  market: "Market Analysis",
  competitive: "Competitor Analysis",
  overview: "Category Overview",
  products: "Product List",
};

const marketModules = {
  global: "Global Overview",
  geo: "Country Overview",
  compliance: "Regulatory Compliance",
};

const categoryCountrySupplements = {
  power_bank: {
    heading: "Power Bank Country Market Summary",
    body: "Representative markets are selected from Lenovo's six-market user research and do not mirror the Adapter country list. The comparison focuses on purchase motivation, feature priorities, price and channel behavior.",
    markets: [
      { country: "India", region: "AP", headline: "Online-led growth market", facts: ["Travel motivation: 84%", "Battery capacity: 78%", "Online channel: 64%", "Mean price: $61.39"] },
      { country: "United States", region: "NA", headline: "Premium omnichannel market", facts: ["Travel motivation: 71%", "Fast charging: 57%", "Physical stores: 43%", "Mean price: $87.28"] },
      { country: "DE + UK + SE", region: "EMEA", headline: "Highest observed price level", facts: ["Travel motivation: 79%", "Battery capacity: 71%", "Brand website: 25%", "Mean price: $101.77"] },
      { country: "Saudi Arabia", region: "EMEA", headline: "Multi-device charging market", facts: ["Multi-device motivation: 61%", "Multiple ports: 66%", "Physical stores: 40%", "Mean price: $80.36"] },
      { country: "Japan", region: "AP", headline: "Safety and stable-output market", facts: ["Stable output: 59%", "Battery capacity: 67%", "Online channel: 56%", "Mean price: $87.44"] },
      { country: "Brazil + Mexico", region: "LA", headline: "Portable value market", facts: ["Travel motivation: 81%", "Fast charging: 67%", "Online channel: 58%", "Mean price: $57.10"] },
    ],
  },
  power_cable: {
    heading: "Power Cable Country Market Summary",
    body: "Representative markets are selected by regulatory relevance, PC ecosystem demand and USB-C adoption. Cable planning should localize certification, labeling, length, durability and channel packaging rather than duplicate the Adapter market list.",
    markets: [
      { country: "European Union", region: "EMEA", headline: "Common-charger adoption market", facts: ["Laptop rules: 28 Apr 2026", "USB-C interface priority", "60W / 240W labeling", "CE and packaging compliance"] },
      { country: "United States", region: "NA", headline: "Premium replacement and PC market", facts: ["USB-C laptop installed base", "Retail and e-commerce", "High-power EPR opportunity", "Compatibility and warranty"] },
      { country: "Japan", region: "AP", headline: "Quality and compact-design market", facts: ["Strong safety expectations", "Portable cable formats", "Retail detail discipline", "Stable power and durability"] },
      { country: "China", region: "AP", headline: "Manufacturing and fast-adoption base", facts: ["Large cable supply chain", "USB-C ecosystem scale", "High-power product breadth", "Price-tier competition"] },
    ],
  },
};

const supplementalComplianceReports = {
  adapter: [
    {
      title: "Québec French Product and Packaging Requirements",
      region: "Québec, Canada",
      regionGroup: "NA",
      effectiveDate: "2025-06-01",
      impactWindow: "current",
      summary: "Generic and descriptive elements appearing in a trademark on products or permanently attached media must also appear in French; French-language product and packaging rules apply in Québec.",
      impact: "Review adapter packaging, on-product text, manuals, warranty material and ecommerce assets for Québec French-language compliance.",
      sourceUrl: "https://www.quebec.ca/nouvelles/actualites/details/protection-du-francais-entree-en-vigueur-de-nouvelles-obligations-pour-les-entreprises-et-poursuite-de-la-mise-en-oeuvre-du-devoir-dexemplarite-de-ladministration-63276",
      mapKey: "quebec",
    },
  ],
  power_bank: [
    {
      title: "Québec French Product and Packaging Requirements",
      region: "Québec, Canada",
      regionGroup: "NA",
      effectiveDate: "2025-06-01",
      impactWindow: "current",
      summary: "French-language requirements apply to product, packaging and permanently attached descriptive or generic trademark elements in Québec.",
      impact: "Localize power-bank packaging, battery warnings, capacity and safety claims, manuals and online product content for Québec.",
      sourceUrl: "https://www.quebec.ca/nouvelles/actualites/details/protection-du-francais-entree-en-vigueur-de-nouvelles-obligations-pour-les-entreprises-et-poursuite-de-la-mise-en-oeuvre-du-devoir-dexemplarite-de-ladministration-63276",
      mapKey: "quebec",
    },
    {
      title: "PRC New CCC Requirements for Power Banks",
      region: "People's Republic of China",
      regionGroup: "AP",
      effectiveDate: "2024-08-01",
      impactWindow: "current",
      summary: "Power banks sold, imported or used in business activities in mainland China must hold a valid China Compulsory Certification certificate and display the CCC mark.",
      impact: "Maintain CCC certification, China-market labeling and factory quality controls; plan certificate conversion against the newer GB 47372—2026 implementation timetable.",
      sourceUrl: "https://www.cnca.gov.cn/zwxx/gg/2023/art/2023/art_9b1f71e55d06483d9cbdd35e791a4e60.html",
      mapKey: "prc",
    },
  ],
  power_cable: [
    {
      title: "Québec French Product and Packaging Requirements",
      region: "Québec, Canada",
      regionGroup: "NA",
      effectiveDate: "2025-06-01",
      impactWindow: "current",
      summary: "French-language product and packaging requirements apply in Québec, including relevant generic and descriptive wording.",
      impact: "Localize cable packaging, wattage/data-rate claims, instructions, warranty wording and ecommerce assets for Québec.",
      sourceUrl: "https://www.quebec.ca/nouvelles/actualites/details/protection-du-francais-entree-en-vigueur-de-nouvelles-obligations-pour-les-entreprises-et-poursuite-de-la-mise-en-oeuvre-du-devoir-dexemplarite-de-ladministration-63276",
      mapKey: "quebec",
    },
  ],
};

const powerCableCompetitiveReport = {
  title: "Power Cable Competitive Landscape",
  categoryLens: "Power-cable competition is organized around certified power capability, durability, data performance and ecosystem trust.",
  brands: [
    {
      brand: "Anker", role: "Tier 1 · Global Power Specialist",
      summary: "Anker uses a broad charging ecosystem and strong direct-to-consumer execution to position cables as trusted companions to chargers and power banks.",
      metrics: [{ label: "Position", value: "Premium scale" }, { label: "Core moat", value: "Charging ecosystem" }, { label: "Source", value: "2025 Annual Report" }],
      strategy: ["Build cross-sell across chargers, power banks and cables.", "Use material durability and high-wattage claims to support premium pricing.", "Scale through global ecommerce, owned sites and major retailers."],
      portfolio: ["Everyday USB-C cables", "Braided high-durability cables", "240W laptop-class USB-C cables"],
      pricing: ["Good-better-best ladder based on power, construction and length.", "Bundle and promotional pricing reinforce ecosystem attachment."],
      products: [
        { name: "Anker USB-C to USB-C Cable (240W, Upcycled-Braided)", type: "Power Cable", price: "USD 19.99", positioning: "240W USB-C charging cable with an upcycled braided jacket.", imageUrl: "assets/competitive/cable-anker-a82e2.png", productUrl: "https://www.anker.com/products/a82e2-240w-usb-c-to-usb-c-cable?variant=43795957121174", specs: ["240W", "USB-C to USB-C", "upcycled braid"] },
        { name: "Anker Prime USB-C Cable (240W, Upcycled-Braided)", type: "Power Cable", price: "USD 29.99", positioning: "Prime-series high-durability 240W USB-C charging cable.", imageUrl: "assets/competitive/cable-anker-a88e2.png", productUrl: "https://www.anker.com/products/a88e2-anker-prime-usb-c-cable-3-ft-240w-upcycled-braided?variant=43931966570646", specs: ["240W", "USB-C to USB-C", "Prime series"] }
      ],
    },
    {
      brand: "Belkin", role: "Tier 1 · Ecosystem & Retail Trust",
      summary: "Belkin combines long-standing connectivity expertise, extensive compatibility testing and strong Apple, PC and retail-channel credibility.",
      metrics: [{ label: "Position", value: "Premium trust" }, { label: "Core moat", value: "Testing & retail" }, { label: "Heritage", value: "40+ years" }],
      strategy: ["Lead with compatibility, reliability and certified performance.", "Use Apple and broad device ecosystems to reduce purchase risk.", "Emphasize recycled materials and packaging improvements."],
      portfolio: ["BoostCharge charging cables", "240W braided USB-C cables", "USB-C data and display connectivity"],
      pricing: ["Premium pricing supported by warranty, testing and retail availability.", "Clear wattage, length and connector labeling simplify choice."],
      products: [{ name: "Belkin BoostCharge Braided USB-C to USB-C Cable 240W", type: "Power Cable", price: "US list $15.99", positioning: "Premium 240W braided cable designed for high-power USB-C charging.", imageUrl: "assets/competitive/cable-belkin-240.png", productUrl: "https://www.belkin.com/p/usb-c-to-usb-c-cable-240w/CAB015bt1MBK.html", specs: ["240W", "braided", "USB-C to USB-C"] }],
    },
    {
      brand: "UGREEN", role: "Tier 2 · Performance Value Challenger",
      summary: "UGREEN competes with broad USB-C coverage, aggressive specifications and a value proposition spanning charging, data, display and docking.",
      metrics: [{ label: "Position", value: "Upper-value" }, { label: "Core moat", value: "Breadth & specs" }, { label: "Focus", value: "USB-C ecosystem" }],
      strategy: ["Offer high-spec cables at accessible premium price points.", "Cross-sell with Nexode chargers, hubs and docking products.", "Use ecommerce content to communicate power and data specifications."],
      portfolio: ["100W and 240W USB-C charging cables", "USB4 high-speed cables", "Braided and right-angle form factors"],
      pricing: ["Specification-led value below premium incumbents.", "Frequent ecommerce promotions and multi-pack offers."],
      products: [{ name: "UGREEN 240W PD 3.1 USB-C to USB-C Cable", type: "Power Cable", price: "US list $11.99", positioning: "Official 240W EPR charging cable with USB 2.0 data transfer for laptop and multi-device use.", imageUrl: "assets/competitive/cable-ugreen-240.png", productUrl: "https://us.ugreen.com/products/240w-usb-c-to-usb-c-cable", specs: ["240W PD 3.1", "E-marker", "480Mbps", "braided"] }],
    },
  ],
};

const competitiveCompanyResearch = {
  anker: {
    financialTitle: "2024 Annual Report / ESG financial table",
    financials: [
      "2024 revenue was RMB 24.70bn, up 41.14% year on year; reported sales volume reached 112.12m units.",
      "This is Anker Innovations group data, not standalone charging-brand or category revenue; use it as a scale indicator rather than adapter, power-bank or cable sales.",
      "Read-through: rapid group growth supports global channel and portfolio investment, while category decisions still require product- and channel-level evidence."
    ],
    financialSourceLabel: "Anker investor disclosure",
    financialSourceUrl: "https://www.anker-in.com/investor/information-disclosure?stock=a-share"
  },
  ugreen: {
    financialTitle: "2024 Annual Report (SZSE 301606)",
    financials: [
      "2024 revenue was RMB 6.170bn (+28.46%); net profit attributable to shareholders was RMB 462m (+19.29%).",
      "Charging products generated RMB 2.349bn (+50.87%), 38.08% of revenue, with 36.57% gross margin. The segment includes power banks, cables, chargers, power strips and car chargers.",
      "Overseas revenue was RMB 3.544bn (+46.46%) and online channels contributed 75.06% of total revenue, confirming international ecommerce as a central growth engine."
    ],
    financialSourceLabel: "UGREEN 2024 annual report",
    financialSourceUrl: "https://static.cninfo.com.cn/finalpage/2025-04-24/1223235515.PDF"
  },
  baseus: {
    financialTitle: "Private-company disclosure status",
    financials: [
      "Baseus is privately held and does not publish an audited annual report with brand revenue, profit or category margin comparable to a listed company.",
      "Official materials verify a broad consumer-electronics portfolio and Shenzhen operating base, but not third-party market-share or revenue estimates.",
      "Read-through: assess Baseus through verified assortment, price, marketplace rank, certification and channel evidence; treat unsupported estimates as directional only."
    ],
    financialSourceLabel: "Baseus official company profile",
    financialSourceUrl: "https://www.baseus.com/pages/about-us"
  },
  belkin: {
    financialTitle: "Foxconn subsidiary / no standalone disclosure",
    financials: [
      "Belkin is a wholly owned Foxconn (Hon Hai) subsidiary. Foxconn consolidates it but does not publish standalone Belkin revenue, profit or cable-category financials.",
      "Foxconn group figures must not be presented as Belkin performance; defensible evidence comes from Belkin's portfolio, compatibility testing, retail presence and sustainability disclosures.",
      "Read-through: benchmark Belkin on ecosystem trust, certification, warranty and retail execution rather than unverified brand financial estimates."
    ],
    financialSourceLabel: "Hon Hai annual-report archive",
    financialSourceUrl: "https://www.honhai.com/en-us/investor-relations/financial-information/annual-reports"
  },
  apple: {
    financialTitle: "FY2025 Form 10-K / results release",
    financials: [
      "Apple reported FY2025 revenue of USD 416.2bn. The filing does not disclose charger or cable revenue as a separate category.",
      "Adapter and cable economics are embedded in the wider device-and-accessory ecosystem, so group revenue is evidence of installed-base scale rather than accessory market share.",
      "Read-through: Apple sets reference price, compatibility and design expectations; third-party brands compete through port count, cross-device support and lower price."
    ],
    financialSourceLabel: "Apple FY2025 results and Form 10-K",
    financialSourceUrl: "https://investor.apple.com/investor-relations/sec-filings/default.aspx"
  },
  xiaomi: {
    financialTitle: "2024 Annual Report (HKEX 1810)",
    financials: [
      "2024 group revenue was RMB 365.9bn and group gross margin was 20.9%.",
      "IoT and lifestyle-product revenue reached RMB 104.1bn (+30.0%) with a 20.3% gross margin; power banks sit inside this broad line and are not separately disclosed.",
      "Read-through: Xiaomi can use its device installed base and value-led ecosystem distribution to scale power accessories, but category profitability cannot be inferred from the group figure alone."
    ],
    financialSourceLabel: "Xiaomi 2024 annual report",
    financialSourceUrl: "https://ir.mi.com/system/files-encrypted/nasdaq_kms/assets/2025/04/24/5-27-15/%E8%8B%B1%E6%96%87.pdf"
  }
};

const competitiveCategoryExpansion = {
  adapter: {
    tiers: { anker: 1, apple: 1, belkin: 1, ugreen: 2, baseus: 2 },
    productAdditions: {
      anker: [],
      baseus: [{ name: "Baseus GaN2 USB-C Fast Charger 100W", type: "Adapter", price: "US list $79.99", positioning: "Single-port 100W GaN II charger positioned for laptops and travel.", imageUrl: "assets/competitive/adapter-baseus-100.jpg", productUrl: "https://www.baseus.com/products/gan2-usb-c-fast-charger-100w", specs: ["100W", "USB-C", "GaN II", "QC 5.0"] }],
      ugreen: [{ name: "UGREEN Nexode 300W 5-Port Desktop Charger", type: "Adapter", price: "US list $199.99", positioning: "Desktop flagship designed to power multiple laptops and mobile devices.", imageUrl: "assets/competitive/adapter-ugreen-300.png", productUrl: "https://us.ugreen.com/products/ugreen-300w-desktop-usb-c-gan-charger", specs: ["300W total", "4 USB-C + 1 USB-A", "140W max port", "dual GaN"] }]
    },
    brands: [
      {
        brand: "Belkin", role: "Tier 1 · Ecosystem & Retail Trust",
        summary: "Belkin uses Apple-channel credibility, broad retail distribution and safety-led claims to compete in premium multi-device charging.",
        metrics: [{ label: "Position", value: "Premium trust" }, { label: "Core moat", value: "Retail + testing" }, { label: "Disclosure", value: "Foxconn subsidiary" }],
        strategy: ["Lead with certified compatibility, safety testing and warranty.", "Sell through Apple-adjacent and mass-retail channels.", "Extend recycled-material claims across charging hardware and packaging."],
        portfolio: ["BoostCharge and BoostCharge Pro wall chargers", "Multi-port GaN chargers", "Charging stations and wireless charging"],
        pricing: ["Premium pricing supported by retail trust, warranty and compatibility claims.", "Bundles combine chargers and certified cables to lift basket value."],
        products: [{ name: "Belkin BoostCharge Pro 140W 4-Port GaN Wall Charger", type: "Adapter", price: "Bundle reference $113.98", positioning: "Four-port PD 3.1 GaN charger for laptops, tablets and phones.", imageUrl: "assets/competitive/adapter-belkin-140.jpg", productUrl: "https://www.belkin.com/p/140w-gan-wall-charger-and-240w-usb-c-cable-bundle/SBS021.html", specs: ["140W total", "3 USB-C + 1 USB-A", "PD 3.1", "GaN"] }]
      },
      {
        brand: "Apple", role: "Tier 1 · Device Ecosystem Reference",
        summary: "Apple anchors premium reference pricing and compatibility expectations through first-party accessories tied directly to Mac, iPad and iPhone use cases.",
        metrics: [{ label: "Position", value: "OEM premium" }, { label: "Core moat", value: "Installed base" }, { label: "FY2025 revenue", value: "$416.2bn group" }],
        strategy: ["Optimize first-party compatibility and a minimal SKU architecture.", "Use device launches and fast-charge support to pull accessory demand.", "Protect premium pricing through brand, retail and service integration."],
        portfolio: ["20W to 140W USB-C power adapters", "Dual-port compact adapters", "MagSafe and device-specific charging"],
        pricing: ["Premium list pricing with limited promotional complexity.", "Cable sold separately supports modular accessory attach."],
        products: [{ name: "Apple 140W USB-C Power Adapter", type: "Adapter", price: "US list $99", positioning: "First-party fast charger for MacBook Pro and USB-C devices.", imageUrl: "assets/competitive/adapter-apple-140.jpg", productUrl: "https://www.apple.com/shop/product/mw2m3am/a/140w-usb-c-power-adapter", specs: ["140W", "USB-C", "Mac fast charging", "cable sold separately"] }]
      }
    ]
  },
  power_bank: {
    tiers: { anker: 1, xiaomi: 1, belkin: 1, ugreen: 2, baseus: 2 },
    productAdditions: {
      anker: [],
      baseus: [{ name: "Baseus Blade H1 Power Bank 20K 100W", type: "Power Bank", price: "US list $99.99", positioning: "Slim high-output battery designed for laptop bags and multi-device charging.", imageUrl: "assets/competitive/pb-baseus-h1.jpg", productUrl: "https://www.baseus.com/products/blade-h1-digital-display-power-bank-20000mah-100w", specs: ["20,000mAh", "100W PD", "4-device charging", "digital display"] }],
      ugreen: [{ name: "UGREEN Nexode Power Bank 20K 130W", type: "Power Bank", price: "US list $79.99", positioning: "Integrated-cable power bank balancing laptop output with travel portability.", imageUrl: "assets/competitive/pb-ugreen-130.png", productUrl: "https://us.ugreen.com/products/ugreen-130w-power-bank-20000mah", specs: ["20,000mAh", "130W total", "80W recharge", "built-in cable"] }]
    },
    brands: [
      {
        brand: "Xiaomi", role: "Tier 1 · Ecosystem Scale Player",
        summary: "Xiaomi links value-led power banks to a large smartphone and AIoT installed base, using proprietary fast charging alongside broad USB-C compatibility.",
        metrics: [{ label: "Position", value: "Scale value" }, { label: "IoT revenue", value: "RMB 104.1bn" }, { label: "IoT growth", value: "+30.0%" }],
        strategy: ["Use Xiaomi device compatibility and HyperCharge as differentiation.", "Cover both high-output performance and everyday magnetic formats.", "Scale through Mi retail, ecommerce and authorized distributors."],
        portfolio: ["High-output integrated-cable power banks", "20,000mAh mainstream batteries", "Magnetic and compact everyday formats"],
        pricing: ["Value-led ecosystem pricing below specialist premium brands.", "Portfolio ladders capacity, wired output and magnetic convenience."],
        products: [
          { name: "Xiaomi 165W Power Bank 10000 (Integrated Cable)", type: "Power Bank", price: "Price varies by market", positioning: "Compact performance battery with 120W single-port output and 165W combined output.", imageUrl: "assets/competitive/pb-xiaomi-165.png", productUrl: "https://www.mi.com/global/product/xiaomi-165w-power-bank-10000-integrated-cable/", specs: ["10,000mAh", "165W dual-port", "120W single port", "integrated USB-C"] },
          { name: "Mi 50W Power Bank 20000", type: "Power Bank", price: "Price varies by market", positioning: "Mainstream high-capacity battery for phones, tablets and compatible laptops.", imageUrl: "assets/competitive/pb-xiaomi-50.png", productUrl: "https://www.mi.com/global/product/mi-50w-power-bank-20000/specs/", specs: ["20,000mAh", "50W max", "USB-C + 2 USB-A", "74Wh"] }
        ]
      },
      {
        brand: "Belkin", role: "Tier 1 · Retail Trust Specialist",
        summary: "Belkin prioritizes safe, travel-ready charging, integrated cables and retail confidence over headline output leadership.",
        metrics: [{ label: "Position", value: "Premium mainstream" }, { label: "Core moat", value: "Retail + warranty" }, { label: "Disclosure", value: "No standalone P&L" }],
        strategy: ["Pair simple capacity choices with trusted compatibility and warranty.", "Use integrated cables to reduce travel friction.", "Increase recycled-plastic and plastic-free packaging claims."],
        portfolio: ["10K and 20K BoostCharge batteries", "Integrated-cable power banks", "Magnetic wireless formats"],
        pricing: ["Mainstream-premium pricing anchored by retail availability and warranty.", "Capacity and cable integration create clear price steps."],
        products: [{ name: "Belkin BoostCharge Power Bank 20K with Integrated Cable", type: "Power Bank", price: "US list $49.99", positioning: "Travel-friendly 20K battery with integrated USB-C and three-device charging.", imageUrl: "assets/competitive/pb-belkin-20k.jpg", productUrl: "https://www.belkin.com/p/power-bank-20k-with-integrated-cable/BPB024fqBL.html", specs: ["20,000mAh", "30W PD", "integrated USB-C", "3-device charging"] }]
      }
    ]
  },
  power_cable: {
    tiers: { anker: 1, apple: 1, belkin: 1, ugreen: 2, baseus: 2 },
    productAdditions: {
      anker: [],
      belkin: [{ name: "Belkin Connect Thunderbolt 5 Cable", type: "Power Cable", price: "US list $53.99", positioning: "Certified premium cable combining 240W charging, high-speed data and display support.", imageUrl: "assets/competitive/cable-belkin-tb5.jpg", productUrl: "https://www.belkin.com/p/thunderbolt-5-cable/INZ005fq1MBK.html", specs: ["240W PD", "80/120Gbps", "Thunderbolt 5", "8K support"] }],
      ugreen: [{ name: "UGREEN Nexode 240W USB-C Cable with Display", type: "Power Cable", price: "US list $28.99", positioning: "Charging-first cable with real-time voltage, current and power display.", imageUrl: "assets/competitive/cable-ugreen-display.png", productUrl: "https://us.ugreen.com/products/ugreen-240w-usb-c-cable", specs: ["240W PD 3.1", "touch display", "480Mbps", "E-marker"] }]
    },
    brands: [
      {
        brand: "Apple", role: "Tier 1 · Device Ecosystem Reference",
        summary: "Apple defines first-party reference products for simple high-power charging and high-performance Thunderbolt connectivity.",
        metrics: [{ label: "Position", value: "OEM premium" }, { label: "Core moat", value: "Mac ecosystem" }, { label: "Disclosure", value: "No cable segment" }],
        strategy: ["Use a narrow, clearly specified first-party assortment.", "Separate charging-only and high-bandwidth professional use cases.", "Tie compatibility directly to Mac, iPad and iPhone hardware."],
        portfolio: ["60W and 240W woven charge cables", "Thunderbolt 4 and 5 Pro cables", "USB-C to MagSafe and device-specific cables"],
        pricing: ["Premium pricing supported by first-party compatibility.", "Large price step between charging cable and professional high-bandwidth cable."],
        products: [
          { name: "Apple 240W USB-C Charge Cable (2m)", type: "Power Cable", price: "US list $29", positioning: "Woven charging cable for USB-C devices with USB 2 data rates.", imageUrl: "assets/competitive/cable-apple-240.jpg", productUrl: "https://www.apple.com/shop/product/MYQT3AM/A/240w-usb-c-charge-cable-2-m", specs: ["240W", "2m", "woven", "USB 2 data"] },
          { name: "Apple Thunderbolt 5 Pro Cable (1m)", type: "Power Cable", price: "US list $69", positioning: "Professional cable for data, displays and up to 240W charging.", imageUrl: "assets/competitive/cable-apple-tb5.jpg", productUrl: "https://www.apple.com/shop/product/mdw94am/a/thunderbolt-5-usb-c-pro-cable-1-m", specs: ["240W", "up to 120Gbps", "DisplayPort 2.1", "braided"] }
        ]
      },
      {
        brand: "Baseus", role: "Tier 2 · Design & Value Challenger",
        summary: "Baseus competes through accessible pricing, durable constructions and feature-led cable variants across everyday charging needs.",
        metrics: [{ label: "Position", value: "Design value" }, { label: "Core moat", value: "Assortment speed" }, { label: "Disclosure", value: "Private company" }],
        strategy: ["Use wide length, color and connector coverage to capture ecommerce search demand.", "Pair high-wattage claims with E-marker and durability messaging.", "Cross-sell cables with chargers and power banks."],
        portfolio: ["100W braided USB-C charging cables", "Temperature-controlled FrostCore cables", "Display and retractable cable formats"],
        pricing: ["Accessible price points with frequent direct-store promotions.", "Premium variants add materials, display or temperature-control features."],
        products: [{ name: "Baseus FrostCore USB-C to USB-C Cable 100W", type: "Power Cable", price: "US list $18.99", positioning: "Temperature-controlled 100W cable with reinforced construction.", imageUrl: "assets/competitive/cable-baseus-frost.jpg", productUrl: "https://www.baseus.com/products/frostcore-fast-charging-data-cable-usb-c-to-usb-c-100w", specs: ["100W PD", "E-marker", "smart temperature control", "1.2m / 2m"] }]
      }
    ]
  }
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
    countries: ["USA", "CAN"],
    labels: ["United States", "Canada"],
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
const overviewPalette = ["#d8646a", "#e79a98", "#b95c7d", "#9ecae1", "#7a7d82", "#7d83cf", "#343a40"];
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
    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (["overview", "competitive", "market", "products"].includes(requestedView)) state.categoryView = requestedView;
    window.addEventListener("hashchange", () => {
      syncRouteFromHash();
      render();
    });
    homeButton.addEventListener("click", () => {
      state.homeView = "landing";
      routeTo();
    });
    app.addEventListener("click", handleClick);
    app.addEventListener("change", handleChange);
    app.addEventListener("input", handleInput);
    app.addEventListener("pointerdown", handleAdapterLogoPointerDown);
    app.addEventListener("toggle", (event) => {
      if (event.target.matches(".geo-na-card-disclosure") && event.target.open) {
        requestAnimationFrame(() => drawMarketAnalysis(state.categoryId));
      }
      if (event.target.matches(".period-multi-select")) {
        state.categoryPeriodMenuOpen = event.target.open;
      }
      if (event.target.matches(".category-product-selector, .category-metric-settings, .category-geo-multi-selector, .category-time-multi-selector") && event.target.open) {
        app.querySelectorAll(".category-product-selector[open], .category-metric-settings[open], .category-geo-multi-selector[open], .category-time-multi-selector[open]").forEach((details) => {
          if (details !== event.target) details.open = false;
        });
      }
      if (event.target.matches(".category-geo-multi-selector")) {
        state.categoryTrendGeoMenuOpen = event.target.open;
      }
      if (event.target.matches(".category-time-multi-selector")) {
        if (event.target.matches(".geo-time-selector")) state.categoryGeoTimeMenuOpen = event.target.open;
        else state.categoryTrendPeriodMenuOpen = event.target.open;
      }
      if (event.target.matches(".category-trend-product-selector")) {
        state.categoryTrendProductSelectorOpen = event.target.open;
      }
    }, true);
    topNav.addEventListener("click", handleClick);
    topNav.addEventListener("change", handleChange);
    topNav.addEventListener("toggle", (event) => {
      if (event.target.matches(".global-time-selector")) {
        state.globalTimeMenuOpen = event.target.open;
      }
    }, true);
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
    state.categoryView = "overview";
  } else if (state.categoryId !== previousCategoryId && !state.productId) {
    state.categoryView = "overview";
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
  sourceStatus.textContent = "Power Go Big Business";
}

function renderTopNav() {
  const overallActive = !state.categoryId && state.homeView === "overall" ? "is-active" : "";
  const categoryButtons = `<button class="nav-pill ${overallActive}" type="button" data-action="power-overall">Power Overall</button>` + data.catalog.categories
    .map((category) => {
      const active = state.categoryId === category.id ? "is-active" : "";
      return `<button class="nav-pill ${active}" type="button" data-route-category="${category.id}">${category.label}</button>`;
    })
    .join("");
  const showGlobalTime = state.categoryId || state.homeView === "overall";
  topNav.innerHTML = `
    <div class="top-nav-categories">${categoryButtons}</div>
    ${showGlobalTime ? `<div class="top-nav-status"><div class="top-nav-updated"><small>Updated</small><strong>2026/10/18</strong></div>${renderGlobalTimeSelector()}</div>` : ""}
  `;
}

function renderGlobalTimeSelector() {
  const monthOptions = getPeriodOptions("month");
  const quarterOptions = getPeriodOptions("quarter");
  const yearOptions = getPeriodOptions("year");
  const selected = ensureSelectedCategoryPeriods();
  const selectedSet = new Set(selected);
  const monthSet = new Set(state.selectedCategoryMonths || []);
  const yearSet = new Set(state.selectedCategoryYears || []);
  const activeValues = state.globalTimeTab === "month"
    ? [...monthSet]
    : state.globalTimeTab === "year"
      ? [...yearSet]
      : selected;
  const label = activeValues.length ? `${activeValues.length}` : "0";
  return `
    <details class="category-time-multi-selector global-time-selector" ${state.globalTimeMenuOpen ? "open" : ""}>
      <summary aria-label="Choose global time periods"><span class="time-selector-icon" aria-hidden="true"></span><span>Time</span><small>${label}</small></summary>
      <div class="category-time-multi-menu global-time-menu">
        <nav class="global-time-tabs" aria-label="Time granularity">
          ${[["year", "Year"], ["quarter", "Quarter"], ["month", "Month"]].map(([key, text]) => `<button type="button" data-action="global-time-tab" data-time-tab="${key}" class="${state.globalTimeTab === key ? "is-active" : ""}">${text}</button>`).join("")}
        </nav>
        <section class="global-time-panel ${state.globalTimeTab === "month" ? "is-active" : ""}">
          ${monthOptions.map((month) => `<label><input type="checkbox" data-action="global-time-month" value="${escapeAttr(month)}" ${monthSet.has(month) ? "checked" : ""}><span>${escapeHtml(month)}</span></label>`).join("")}
        </section>
        <section class="global-time-panel ${state.globalTimeTab === "year" ? "is-active" : ""}">
          ${yearOptions.map((year) => `<label><input type="checkbox" data-action="global-time-year" value="${escapeAttr(year)}" ${yearSet.has(year) ? "checked" : ""}><span>${escapeHtml(year)}</span></label>`).join("")}
        </section>
        <section class="global-time-panel ${state.globalTimeTab === "quarter" ? "is-active" : ""}">
          ${quarterOptions.map((period) => `<label><input type="checkbox" data-action="global-time-quarter" value="${escapeAttr(period)}" ${selectedSet.has(period) ? "checked" : ""}><span>${escapeHtml(period)}</span></label>`).join("")}
        </section>
      </div>
    </details>
  `;
}

function renderHome() {
  if (state.homeView === "overall") {
    app.innerHTML = `
      <div class="view-stack power-overall-view">
        <nav class="power-overall-back" aria-label="Power dashboard navigation">
          <button class="ghost-button" type="button" data-action="power-home">← Accessory Power</button>
          <span>Power Overall</span>
        </nav>
        ${renderPowerHomeDashboard()}
      </div>
    `;
    drawPowerHomeDashboard();
    return;
  }

  app.innerHTML = `
    <div class="view-stack home-view">
      ${renderAccessoryPowerHero()}
      ${renderAccessoryPowerKpis()}

      <section class="section-head">
        <div>
          <p class="eyebrow">Product Categories</p>
          <h2>Select a Category</h2>
        </div>
        <p class="metric-definition"><span>Revenue refers to Ship Rev</span><span>Updated 2026/10/18</span></p>
      </section>

      <section class="category-grid">
        ${data.catalog.categories.map((category) => renderCategoryCard(category)).join("")}
      </section>
    </div>
  `;
}

function renderAccessoryPowerHero() {
  const dashboard = data.powerHome;
  return `
    <section class="accessory-power-hero" aria-labelledby="accessory-power-title">
      <img src="assets/hero/accessory-power.png" alt="Lenovo accessory power portfolio with chargers, power banks, cables, and laptops">
      <div class="accessory-power-hero-shade"></div>
      <div class="accessory-power-hero-copy">
        <p class="eyebrow">Lenovo Power Portfolio</p>
        <h1 id="accessory-power-title">Accessories<br>Power</h1>
        <button class="accessory-power-overall-button" type="button" data-action="power-overall">
          Power Overall <span aria-hidden="true">→</span>
        </button>
        <div class="accessory-power-category-links" aria-label="Power product categories">
          ${data.catalog.categories.map((category) => `<button type="button" data-route-category="${category.id}"><span>${escapeHtml(category.label)}</span><span aria-hidden="true">→</span></button>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderAccessoryPowerKpis() {
  const dashboard = data.powerHome;
  const kpis = dashboard?.executiveKpis || [];
  if (!kpis.length) return "";
  const order = ["full-year-revenue", "full-year-standalone", "quarter-revenue", "quarter-standalone"];
  const orderedKpis = [...kpis].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const orderedQuantityKpis = [...(dashboard?.executiveQuantityKpis || [])].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return `
    <section class="accessory-kpi-section" aria-labelledby="accessory-kpi-heading">
      <header>
        <h2 id="accessory-kpi-heading">Revenue Performance</h2>
        <p class="metric-definition"><span>Revenue refers to Ship Rev</span><span>Updated 2026/10/18</span></p>
      </header>
      <div class="accessory-kpi-grid">
        ${orderedKpis.map((item) => renderAccessoryPowerKpi(item, "revenue")).join("")}
      </div>
    </section>
    ${orderedQuantityKpis.length ? `
      <section class="accessory-kpi-section accessory-quantity-kpi-section" aria-labelledby="accessory-quantity-kpi-heading">
        <header>
          <h2 id="accessory-quantity-kpi-heading">Quantity Performance</h2>
          <p class="metric-definition"><span>Quantity refers to Ship Qty</span><span>Updated 2026/10/18</span></p>
        </header>
        <div class="accessory-kpi-grid">
          ${orderedQuantityKpis.map((item) => renderAccessoryPowerKpi(item, "quantity")).join("")}
        </div>
      </section>
    ` : ""}
  `;
}

function renderAccessoryPowerKpi(item, metric = "revenue") {
  const isUp = (item.yoy || 0) >= 0;
  const titles = {
    "full-year-revenue": "Power Total",
    "full-year-standalone": "Standalone w/o DIB",
    "quarter-revenue": "Power Total",
    "quarter-standalone": "Standalone w/o DIB",
  };
  const periodLabel = item.id.startsWith("full-year") ? "FY2627 YTD" : "FY2627 Q2";
  const currentLabel = metric === "quantity" ? fmtExactNumber(item.actual || 0) : `$${formatPowerKpiAmount(item.actualM)}M`;
  const priorLabel = metric === "quantity" ? fmtExactNumber(item.prior || 0) : `$${formatPowerKpiAmount(item.priorActualM)}M`;
  return `
    <article class="accessory-kpi-card ${isUp ? "is-up" : "is-down"}">
      <header>
        <span>${escapeHtml(titles[item.id] || item.label)}</span>
        <div class="accessory-kpi-trend ${isUp ? "is-up" : "is-down"}">
          <strong>${formatSignedPercent(item.yoy)}</strong>
          <span aria-hidden="true">${isUp ? "↑" : "↓"}</span>
        </div>
      </header>
      <div class="accessory-kpi-compare">
        <div>
          <small>${periodLabel}</small>
          <strong>${currentLabel}</strong>
        </div>
        <div>
          <small>${escapeHtml(item.priorPeriod || "Previous")}</small>
          <strong>${priorLabel}</strong>
        </div>
      </div>
    </article>
  `;
}

function renderPowerHomeDashboard() {
  const dashboard = data.powerHome;
  if (!dashboard?.meta) {
    return `<section class="power-home-shell"><div class="plot-fallback">Power dashboard data is unavailable.</div></section>`;
  }
  const activeTimeLabel = state.granularity === "quarter"
    ? selectedCategoryPeriodsLabel(ensureSelectedCategoryPeriods())
    : selectedPeriod();
  return `
    <section class="power-home-shell" aria-label="Power executive performance dashboard">
      <header class="power-home-head">
        <div>
          <h1>Power Overall Performance</h1>
          <p>Charger&nbsp;&nbsp; Power Bank&nbsp;&nbsp; Power Cable</p>
        </div>
        <dl class="power-home-meta">
          <div><dt>Time</dt><dd>${escapeHtml(activeTimeLabel)}</dd></div>
          <div><dt>Unit</dt><dd>M$ Dollar</dd></div>
        </dl>
      </header>

      <div class="power-kpi-grid">
        ${powerOverallKpis().map(renderPowerKpi).join("")}
      </div>

      ${renderPowerOverallCategoryOverview()}
    </section>
  `;
}

function powerOverallKpis() {
  if (!hasActiveGlobalTime()) return [];
  const definitions = [
    { label: "Power", categoryId: null },
    { label: "Charger", categoryId: "adapter" },
    { label: "Power Bank", categoryId: "power_bank" },
    { label: "Power Cable", categoryId: "power_cable" },
  ];
  const selectedKeys = state.granularity === "quarter"
    ? ensureSelectedCategoryPeriods()
    : [selectedPeriod()];
  const matchesSelectedTime = (row, keys) => keys.includes(periodKey(row.date, state.granularity));
  const priorKeys = selectedKeys.map((key) => {
    if (state.granularity === "year") return priorFiscalYear(key);
    if (state.granularity === "quarter") {
      const parsed = parseFiscalPeriodLabel(key);
      return parsed ? `${priorFiscalYear(parsed.fiscalYear)} ${parsed.fiscalQuarter}` : key;
    }
    const match = String(key).match(/^(\d{4})-(\d{2})$/);
    return match ? `${Number(match[1]) - 1}-${match[2]}` : key;
  });
  const periodLabel = selectedKeys.length === 1 ? selectedKeys[0] : selectedCategoryPeriodsLabel(selectedKeys);
  return definitions.map(({ label, categoryId }) => {
    const rows = data.productMetrics.filter((row) => !categoryId || row.categoryId === categoryId);
    const current = rows.filter((row) => matchesSelectedTime(row, selectedKeys))
      .reduce((sum, row) => sum + Number(row.shipRevenue || 0), 0);
    const prior = rows.filter((row) => matchesSelectedTime(row, priorKeys))
      .reduce((sum, row) => sum + Number(row.shipRevenue || 0), 0);
    return {
      label,
      period: periodLabel,
      valueM: current / 1_000_000,
      yoy: prior ? (current - prior) / prior : 0,
    };
  });
}

function renderPowerOverallCategoryOverview() {
  if (!hasActiveGlobalTime()) return `<section class="empty-state"><div><h3>No time selected</h3><p>Select a year, quarter, or month to display data.</p></div></section>`;
  const products = data.catalog.products;
  return `
    <div class="view-stack category-overview-stack power-overall-category-overview">
      <section class="module-block category-performance-content">
        ${renderPerformanceOverview("power_overall", products)}
      </section>
      <section class="module-block">
        <div class="module-head"><span>Overview Module</span><h2>Geo Contribution</h2></div>
        ${renderCategoryGeoContribution("power_overall", products)}
      </section>
    </div>
  `;
}

function renderPowerKpi(item) {
  const isUp = (item.yoy || 0) >= 0;
  const marker = item.modeled ? "*" : "";
  const value = Number.isFinite(item.valueM) ? item.valueM.toFixed(2) : "0.00";
  return `
    <article class="power-kpi-card ${isUp ? "is-up" : "is-down"}">
      <div>
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.period)}</small>
      </div>
      <strong>$${value}M${marker}</strong>
      <p><span aria-hidden="true">${isUp ? "↑" : "↓"}</span> ${formatSignedPercent(item.yoy)} YoY</p>
    </article>
  `;
}

function renderPowerChartCard({ title, subtitle, id, control = "" }) {
  return `
    <article class="power-chart-card">
      <header>
        <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p></div>
        ${control}
      </header>
      <div class="power-plot" id="${escapeAttr(id)}"></div>
    </article>
  `;
}

function renderPowerRankingCard(type) {
  const isModel = type === "model";
  const title = isModel ? "Top Model" : "Top Partner";
  const filters = isModel ? state.homeTopModelFilters : state.homeTopPartnerFilters;
  const prefix = isModel ? "home-model" : "home-partner";
  const rows = isModel ? data.powerHome.topModels : data.powerHome.topPartners;
  const geoValues = isModel ? ["NA", "AP", "LA", "EMEA"] : ["EUROPE", "NA", "META", "AP", "LA"];
  return `
    <article class="power-chart-card power-ranking-card">
      <header>
        <div><h3>${title}</h3><p>${escapeHtml(data.powerHome.meta.period)} · Ship Rev</p></div>
        <details class="power-filter-menu">
          <summary>Choose</summary>
          <div class="power-filter-popover">
            ${renderHomeSelect(`${prefix}-geo`, filters.geo, [["all", "All Geo"], ...geoValues.map((value) => [value, value])], "Geo")}
            ${renderHomeSelect(`${prefix}-segment`, filters.segment, [["all", "All Segment"], ...orderedPowerValues(rows, "segment", ["REL", "SMB", "CON", "OTHERS"]).map((value) => [value, value])], "Segment")}
            ${renderHomeSelect(`${prefix}-dib`, filters.dib, [["all", "All DIB"], ...orderedPowerValues(rows, "dib", isModel ? ["w/o DIB", "DIB Only"] : ["Stand-Alone", "DIB"]).map((value) => [value, value])], "DIB")}
            ${isModel ? renderHomeSelect(`${prefix}-channel`, filters.channel, [["all", "All Channel"], ...orderedPowerValues(rows, "channel", ["Indirect", "Direct", "Ecomm", "Others", "(blank)"]).map((value) => [value, value])], "Channel") : ""}
          </div>
        </details>
      </header>
      <div class="power-plot" id="power-top-${type}"></div>
    </article>
  `;
}

function renderHomeSelect(action, selected, options, label) {
  return `
    <label class="power-inline-select">
      <span>${escapeHtml(label)}</span>
      <select data-action="${escapeAttr(action)}">
        ${options.map(([value, text]) => `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function orderedPowerValues(rows, field, preferred = []) {
  const values = unique(rows.map((row) => row[field]).filter(Boolean));
  return [...preferred.filter((value) => values.includes(value)), ...values.filter((value) => !preferred.includes(value)).sort()];
}

function formatCompactDecimal(value) {
  if (!Number.isFinite(value)) return "0.0";
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

function formatPowerKpiAmount(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function formatSignedPercent(value) {
  if (!Number.isFinite(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function drawPowerHomeDashboard() {
  if (!data.powerHome?.meta) return;
  drawPowerQuarterAttain();
  drawPowerGeoYoy();
  drawPowerRanking("model");
  drawPowerRanking("partner");
  drawPowerWeeklyYoy();
  drawPowerAttainBreakdowns();
  const products = data.catalog.products;
  drawPerformanceRevenueTrend("power_overall", products);
  drawQuarterComparison("power_overall", products);
  drawPerformanceContribution("power_overall", products);
  drawCategoryGeoContribution("power_overall", products);
}

function powerChartLayout(overrides = {}) {
  return {
    margin: { l: 42, r: 14, t: 28, b: 46 },
    font: { family: "Inter, system-ui, sans-serif", size: 11, color: "#283449" },
    legend: { orientation: "h", y: 1.15, x: 0, font: { size: 10 } },
    hovermode: "closest",
    bargap: 0.26,
    ...overrides,
  };
}

function drawPowerQuarterAttain() {
  const scope = data.powerHome.quarterAttain[state.homePowerScope] || data.powerHome.quarterAttain.total;
  const rows = [
    { quarter: "Total", ...scope.total, actualAvailable: true },
    ...scope.quarters,
  ];
  const labels = rows.map((row) => row.quarter);
  const annotations = rows
    .filter((row) => row.actualAvailable && Number.isFinite(row.attain))
    .map((row) => ({
      x: row.quarter,
      y: Math.max(row.targetM, row.actualM) * 1.12,
      text: `<b>${(row.attain * 100).toFixed(0)}%</b>`,
      showarrow: false,
      font: { color: row.attain >= 1 ? "#138a4b" : "#d92d20", size: 11 },
      bgcolor: row.attain >= 1 ? "#e6f6ed" : "#fdebea",
      borderpad: 4,
    }));
  drawPlot("power-quarter-attain", [
    {
      type: "bar",
      name: "FY2627 MT",
      x: labels,
      y: rows.map((row) => row.targetM),
      marker: { color: "#a9d1e7" },
      text: rows.map((row) => `${row.targetM.toFixed(1)}${row.targetModeled ? "*" : ""}`),
      textposition: "outside",
      cliponaxis: false,
      hovertemplate: "%{x}<br>MT: $%{y:.2f}M<extra></extra>",
    },
    {
      type: "bar",
      name: "FY2627 Actual",
      x: labels,
      y: rows.map((row) => row.actualAvailable ? row.actualM : 0),
      marker: { color: "#b45573" },
      text: rows.map((row) => row.actualAvailable ? row.actualM.toFixed(1) : ""),
      textposition: "outside",
      cliponaxis: false,
      hovertemplate: "%{x}<br>Actual: $%{y:.2f}M<extra></extra>",
    },
  ], powerChartLayout({
    barmode: "group",
    annotations,
    yaxis: { title: "M$", rangemode: "tozero", gridcolor: "#edf0f3" },
    xaxis: { tickfont: { size: 11 } },
  }));
}

function drawPowerGeoYoy() {
  const rows = data.powerHome.geoYoy;
  drawPlot("power-geo-yoy", [
    {
      type: "bar",
      name: "FY2526 Q2",
      x: rows.map((row) => row.geo),
      y: rows.map((row) => row.previousM),
      marker: { color: "#6a70d6" },
      text: rows.map((row) => row.previousM.toFixed(1)),
      textposition: "outside",
      cliponaxis: false,
      hovertemplate: "%{x}<br>FY2526 Q2: $%{y:.2f}M<extra></extra>",
    },
    {
      type: "bar",
      name: "FY2627 Q2",
      x: rows.map((row) => row.geo),
      y: rows.map((row) => row.currentM),
      marker: { color: "#9ba6e5" },
      text: rows.map((row) => `${row.currentM.toFixed(1)}<br>${formatSignedPercent(row.yoy)}`),
      textfont: { color: rows.map((row) => row.yoy >= 0 ? "#138a4b" : "#d92d20") },
      textposition: "outside",
      cliponaxis: false,
      hovertemplate: "%{x}<br>FY2627 Q2: $%{y:.2f}M<extra></extra>",
    },
  ], powerChartLayout({
    barmode: "group",
    yaxis: { title: "M$", rangemode: "tozero", gridcolor: "#edf0f3" },
  }));
}

function selectedPowerRankingRows(type) {
  const isModel = type === "model";
  const rows = isModel ? data.powerHome.topModels : data.powerHome.topPartners;
  const filters = isModel ? state.homeTopModelFilters : state.homeTopPartnerFilters;
  const filtered = rows.filter((row) => Object.entries(filters).every(([field, value]) => value === "all" || row[field] === value));
  const grouped = new Map();
  for (const row of filtered) grouped.set(row.name, (grouped.get(row.name) || 0) + row.shipRevenueM);
  return [...grouped.entries()]
    .map(([name, shipRevenueM]) => ({ name, shipRevenueM }))
    .filter((row) => Number.isFinite(row.shipRevenueM) && row.shipRevenueM > 0)
    .sort((a, b) => (b.shipRevenueM - a.shipRevenueM) || a.name.localeCompare(b.name))
    .slice(0, 10);
}

function drawPowerRanking(type) {
  const rows = selectedPowerRankingRows(type).reverse();
  const id = `power-top-${type}`;
  if (!rows.length) {
    drawPlot(id, []);
    return;
  }
  drawPlot(id, [{
    type: "bar",
    orientation: "h",
    x: rows.map((row) => row.shipRevenueM),
    y: rows.map((row) => shortenPowerLabel(row.name, type === "partner" ? 24 : 22)),
    customdata: rows.map((row) => row.name),
    marker: { color: rows.map((_, index) => index === rows.length - 1 ? "#e2231a" : "#e98b85") },
    text: rows.map((row) => `$${row.shipRevenueM.toFixed(2)}M`),
    textposition: "outside",
    cliponaxis: false,
    hovertemplate: "%{customdata}<br>Ship Rev: $%{x:.3f}M<extra></extra>",
  }], powerChartLayout({
    margin: { l: 128, r: 42, t: 8, b: 34 },
    showlegend: false,
    xaxis: { title: "M$", rangemode: "tozero", gridcolor: "#edf0f3" },
    yaxis: { automargin: true, tickfont: { size: 9 } },
  }));
}

function shortenPowerLabel(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function drawPowerWeeklyYoy() {
  const rows = data.powerHome.weeklyYoy;
  drawPlot("power-weekly-yoy", [
    {
      type: "bar",
      name: "FY2526 Q2 ACT",
      x: rows.map((row) => row.week),
      y: rows.map((row) => row.previousM),
      marker: { color: "#a9adb4" },
      hovertemplate: "%{x}<br>FY2526 Q2: $%{y:.2f}M<extra></extra>",
    },
    {
      type: "bar",
      name: "FY2627 Q2",
      x: rows.map((row) => row.week),
      y: rows.map((row) => row.currentM),
      marker: { color: "#a93170" },
      text: rows.map((row) => formatSignedPercent(row.yoy)),
      textfont: { color: rows.map((row) => row.yoy >= 0 ? "#16a05d" : "#d92d20"), size: 9 },
      textposition: "outside",
      cliponaxis: false,
      hovertemplate: "%{x}<br>FY2627 Q2: $%{y:.2f}M<br>YoY: %{text}<extra></extra>",
    },
  ], powerChartLayout({
    barmode: "group",
    margin: { l: 42, r: 10, t: 22, b: 42 },
    yaxis: { title: "M$", rangemode: "tozero", gridcolor: "#edf0f3" },
    xaxis: { tickfont: { size: 9 } },
  }));
}

function drawPowerAttainBreakdowns() {
  const total = data.powerHome.quarterAttain.total.quarters.find((row) => row.quarter === "Q2");
  const previousTotal = data.powerHome.geoYoy.reduce((sum, row) => sum + row.previousM, 0);
  drawPowerAttainChart("power-geo-attain", data.powerHome.geoAttain.map((row) => ({ label: row.geo, ...row })));
  drawPowerAttainChart("power-segment-attain", [
    { label: "Q2 Total", previousM: previousTotal, targetM: total.targetM, currentM: total.actualM, attain: total.attain },
    ...data.powerHome.segmentAttain.map((row) => ({ label: row.segment, ...row })),
  ]);
}

function drawPowerAttainChart(id, rows) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.previousM, row.targetM, row.currentM]).filter(Number.isFinite), 0);
  drawPlot(id, [
    {
      type: "bar",
      name: "FY2526 Q2 ACT",
      x: rows.map((row) => row.label),
      y: rows.map((row) => row.previousM),
      marker: { color: "#7a7d82" },
      hovertemplate: "%{x}<br>Prior: $%{y:.2f}M<extra></extra>",
    },
    {
      type: "bar",
      name: "FY2627 Q2 MT",
      x: rows.map((row) => row.label),
      y: rows.map((row) => row.targetM),
      marker: { color: "#9fcce4" },
      hovertemplate: "%{x}<br>MT: $%{y:.2f}M<extra></extra>",
    },
    {
      type: "bar",
      name: "FY2627 Q2 Actual",
      x: rows.map((row) => row.label),
      y: rows.map((row) => row.currentM),
      marker: { color: "#b45573" },
      text: rows.map((row) => `${(row.attain * 100).toFixed(0)}%`),
      textfont: { color: rows.map((row) => row.attain >= 1 ? "#138a4b" : "#d92d20") },
      textposition: "outside",
      cliponaxis: false,
      hovertemplate: "%{x}<br>Actual: $%{y:.2f}M<br>Attain: %{text}<extra></extra>",
    },
  ], powerChartLayout({
    barmode: "group",
    margin: { l: 42, r: 10, t: 50, b: 44 },
    legend: { orientation: "h", y: 1.17, x: 0, font: { size: 9 } },
    yaxis: { title: "M$", range: [0, maxValue * 1.22], gridcolor: "#edf0f3" },
    xaxis: { tickfont: { size: 10 } },
  }));
}

function renderCategoryCard(category) {
  const rows = data.productMetrics.filter((row) => row.categoryId === category.id);
  const productCount = data.catalog.products.filter((product) => product.categoryId === category.id).length;
  const descriptions = {
    adapter: "65W+ high-power chargers.",
    power_bank: "High-power power bank.",
    power_cable: "High-power cables.",
  };
  const fiscalYearTotal = summarizeCategoryYtd(rows, "FY2627", "Q2");
  const priorFiscalYearTotal = summarizeCategoryYtd(rows, "FY2526", "Q2");
  const quarterTotal = summarizeCategoryPeriod(rows, "FY2627", "Q2");
  const priorQuarterTotal = summarizeCategoryPeriod(rows, "FY2526", "Q2");
  return `
    <button class="category-card" type="button" style="--accent:${category.accent}" data-route-category="${category.id}">
      <header>
        <div>
          <p class="eyebrow">Product Category</p>
          <h2>${escapeHtml(category.label)}</h2>
        </div>
        <span class="tag">${productCount} models</span>
      </header>
      <p>${escapeHtml(descriptions[category.id] || category.description)}</p>
      <div class="category-metrics category-metrics--ship-revenue">
        ${renderCategoryShipRevenue("FY2627 YTD", fiscalYearTotal.shipRevenue, "FY2526 YTD", priorFiscalYearTotal.shipRevenue)}
        ${renderCategoryShipRevenue("FY2627 Q2", quarterTotal.shipRevenue, "FY2526 Q2", priorQuarterTotal.shipRevenue)}
      </div>
    </button>
  `;
}

function summarizeCategoryYtd(rows, fiscalYear, throughQuarter) {
  const quarterLimit = Number(String(throughQuarter).replace(/\D/g, "")) || 4;
  return rows
    .filter((row) => {
      const quarter = Number(String(row.fiscalQuarter).replace(/\D/g, ""));
      return row.fiscalYear === fiscalYear && quarter >= 1 && quarter <= quarterLimit;
    })
    .reduce((summary, row) => {
      summary.orderRevenue += Number(row.orderRevenue || 0);
      summary.shipRevenue += Number(row.shipRevenue || 0);
      summary.orderQty += Number(row.orderQty || 0);
      summary.shipQty += Number(row.shipQty || 0);
      return summary;
    }, { orderRevenue: 0, shipRevenue: 0, orderQty: 0, shipQty: 0 });
}

function renderCategoryShipRevenue(period, value, priorPeriod, priorValue) {
  const hasPrior = priorValue > 0;
  const yoy = hasPrior ? (value - priorValue) / priorValue : null;
  const trendClass = !hasPrior ? "is-new" : yoy >= 0 ? "is-up" : "is-down";
  const trendLabel = !hasPrior ? "New" : `${formatSignedPercent(yoy)} ${yoy >= 0 ? "↑" : "↓"}`;
  return `
    <div class="category-ship-revenue">
      <header>
        <span>Revenue</span>
        <strong class="${trendClass}">${trendLabel}</strong>
      </header>
      <div class="category-ship-values">
        <span><small>${escapeHtml(period)}</small><strong>${formatCategoryRevenueM(value)}</strong></span>
        <span><small>${escapeHtml(priorPeriod)}</small><strong>${formatCategoryRevenueM(priorValue)}</strong></span>
      </div>
    </div>
  `;
}

function summarizeCategoryPeriod(rows, fiscalYear, fiscalQuarter) {
  return rows
    .filter((row) => row.fiscalYear === fiscalYear && row.fiscalQuarter === fiscalQuarter)
    .reduce((summary, row) => {
      summary.orderRevenue += Number(row.orderRevenue || 0);
      summary.shipRevenue += Number(row.shipRevenue || 0);
      summary.orderQty += Number(row.orderQty || 0);
      summary.shipQty += Number(row.shipQty || 0);
      return summary;
    }, { orderRevenue: 0, shipRevenue: 0, orderQty: 0, shipQty: 0 });
}

function renderCategoryMetricComparison(label, current, prior, type) {
  const hasPrior = prior > 0;
  const yoy = hasPrior ? (current - prior) / prior : null;
  const trendClass = !hasPrior ? "is-new" : yoy >= 0 ? "is-up" : "is-down";
  const trendLabel = !hasPrior ? "New" : formatSignedPercent(yoy);
  const formatValue = (value) => type === "revenue" ? formatCategoryRevenueM(value) : fmtExactNumber(value);
  return `
    <div class="category-metric-comparison">
      <header>
        <span>${escapeHtml(label)}</span>
        <strong class="${trendClass}">${trendLabel}${hasPrior ? ` ${yoy >= 0 ? "↑" : "↓"}` : ""}</strong>
      </header>
      <div class="category-metric-values">
        <span><small>FY2627 Q2</small><strong>${formatValue(current)}</strong></span>
        <span><small>FY2526 Q2</small><strong>${formatValue(prior)}</strong></span>
      </div>
    </div>
  `;
}

function formatCategoryRevenueM(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  return fmtExactCurrency(amount);
}

function renderCategory(categoryId) {
  const category = indexes.categories.get(categoryId);
  ensureCategoryFilterState(categoryId);
  app.innerHTML = `
    <div class="view-stack category-page-stack" style="--accent:${category.accent}">
      <section class="page-head">
        <div>
          <p class="eyebrow">Product Category</p>
          <h1>${escapeHtml(category.label)}</h1>
        </div>
        <button class="ghost-button" type="button" data-action="home">← Home</button>
      </section>
      <div class="category-sticky-nav">
        ${renderCategoryTabs()}
      </div>
      ${renderModuleTabs(categoryId)}
      <div id="categoryViewMount"></div>
    </div>
  `;

  const mount = document.querySelector("#categoryViewMount");
  if (state.categoryView === "competitive") {
    mount.innerHTML = renderCompetitiveAnalysis(categoryId);
    drawCompetitiveAnalysis(categoryId);
    bindAdapterCompetitiveInteractions(categoryId);
  } else if (state.categoryView === "overview") {
    mount.innerHTML = renderCategoryOverview(categoryId);
    const overviewProducts = data.catalog.products.filter((product) => product.categoryId === categoryId);
    drawPerformanceRevenueTrend(categoryId, overviewProducts);
    drawQuarterComparison(categoryId, overviewProducts);
    drawPerformanceContribution(categoryId, overviewProducts);
    drawCategoryGeoContribution(categoryId, overviewProducts);
  } else if (state.categoryView === "products") {
    mount.innerHTML = renderProductListPage(categoryId);
  } else {
    state.categoryView = "market";
    mount.innerHTML = renderMarketAnalysis(categoryId);
    drawMarketAnalysis(categoryId);
  }
}

function bindAdapterCompetitiveInteractions(categoryId) {
  if (categoryId !== "adapter") return;
  document.querySelectorAll('[data-action="adapter-brand-cloud"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.adapterCompetitiveBrand = button.dataset.brand;
      render();
    });
  });
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
  const visibleModules = Object.entries(modules).filter(([key]) => key !== "compliance" && !(key === "geo" && ["power_bank", "power_cable"].includes(categoryId)));
  const requested = selectedMarketModule();
  const active = visibleModules.some(([key]) => key === requested) ? requested : "global";
  if (active !== requested) state.marketModule = active;
  return `
    <section class="module-tabs" aria-label="${state.categoryView} modules">
      ${visibleModules
        .map(([key, label]) => `<button class="${active === key ? "is-active" : ""}" type="button" data-action="module-view" data-module="${key}">${escapeHtml(label)}</button>`)
        .join("")}
    </section>
  `;
}

function renderMarketAnalysis(categoryId) {
  const requested = selectedMarketModule();
  const active = requested === "compliance" || (requested === "geo" && ["power_bank", "power_cable"].includes(categoryId)) ? "global" : requested;
  const moduleMarkup = active === "global"
    ? renderGlobalMarketModule(categoryId)
    : active === "geo"
    ? renderGeoOverviewModule(categoryId)
    : active === "compliance"
    ? renderRegulatoryCompliance(categoryId)
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
    return renderSupplementalCountryOverview(categoryId);
  }
  const visibleOverview = categoryId === "adapter" ? {
    ...overview,
    regions: (overview.regions || []).map((region) => region.id === "AP" ? {
      ...region,
      representatives: "Japan | India",
      policyFocus: "PSE (Japan) | BIS CRS (India) | Local labeling",
      characteristics: String(region.characteristics || "").replace(/ and rapid channel expansion in Indonesia/i, ""),
      countryTabs: (region.countryTabs || []).filter((tab) => tab.countryId !== "ID" && tab.id !== "ID"),
    } : region),
    countries: (overview.countries || []).filter((country) => country.id !== "ID"),
  } : overview;
  const selectedRegion = state.geoRegionDetail[categoryId];
  if (selectedRegion) return renderRegionCountryWorkspace(categoryId, visibleOverview, selectedRegion);
  return `
    <section class="module-block">
      <section class="geo-overview-module">
        <div class="geo-region-grid">
          ${(visibleOverview.regions || []).map(renderRegionEntryCard).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderSupplementalCountryOverview(categoryId) {
  const report = categoryCountrySupplements[categoryId];
  if (!report) return `<section class="module-block"><div class="module-head"><span>Country Overview</span><h2>Country Market Summary</h2><p>No country market summary has been configured for this category yet.</p></div></section>`;
  return `
    <section class="module-block supplemental-country-overview">
      <div class="module-head">
        <span>Country Overview</span>
        <h2>${escapeHtml(report.heading)}</h2>
        <p>${escapeHtml(report.body)}</p>
      </div>
      <div class="supplemental-country-grid">
        ${report.markets.map((market, index) => `
          <article class="supplemental-country-card">
            <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(market.region)}</span>
            <h3>${escapeHtml(market.country)}</h3>
            <p>${escapeHtml(market.headline)}</p>
            <ol>${market.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ol>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRegulatoryCompliance(categoryId) {
  const reports = complianceReports(categoryId);
  const current = reports.filter((report) => (report.impactWindow || "current") === "current");
  const future = reports.filter((report) => report.impactWindow === "future");
  const selectedIndex = Math.min(state.selectedComplianceIndex[categoryId] || 0, Math.max(0, reports.length - 1));
  state.selectedComplianceIndex[categoryId] = selectedIndex;
  const selected = reports[selectedIndex];
  const renderItems = (items) => items.length ? items.map((report, index) => `
    <article class="compliance-card">
      <header><span>${String(index + 1).padStart(2, "0")}</span><div><small>${escapeHtml(report.regionGroup || "Global")} · ${escapeHtml(report.region || "")}</small><h3>${escapeHtml(report.title)}</h3></div></header>
      <ol>
        <li><strong>Effective Time</strong><span>${escapeHtml(report.effectiveDate || "Current / monitor")}</span></li>
        <li><strong>Requirement</strong><span>${escapeHtml(report.summary || "")}</span></li>
        <li><strong>Portfolio Impact</strong><span>${escapeHtml(report.impact || "")}</span></li>
      </ol>
      ${report.sourceUrl ? `<a href="${escapeAttr(report.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official source ↗</a>` : ""}
    </article>
  `).join("") : `<div class="policy-empty"><strong>No confirmed item loaded</strong><p>Add an authoritative source when a requirement is confirmed.</p></div>`;
  return `
    <section class="module-block compliance-overview">
      <div class="module-head">
        <span>Regulatory Compliance</span>
        <h2>${escapeHtml(categoryLabel(categoryId))} Regulatory Compliance</h2>
        <p>Requirements are separated from market demand analysis. Each item lists effective timing, the requirement itself and its portfolio impact.</p>
      </div>
      <section class="compliance-map-workspace">
        <div id="complianceWorldMap" class="plot compliance-world-map" aria-label="World map of regulatory locations"></div>
        ${selected ? `
          <article class="compliance-map-detail">
            <span>Selected regulation · ${escapeHtml(selected.regionGroup || "Global")}</span>
            <h3>${escapeHtml(selected.title)}</h3>
            <p>${escapeHtml(selected.region || "")}</p>
            <ol>
              <li><strong>1 · Effective Time</strong><span>${escapeHtml(selected.effectiveDate || "Current / monitor")}</span></li>
              <li><strong>2 · Requirement</strong><span>${escapeHtml(selected.summary || "")}</span></li>
              <li><strong>3 · Portfolio Impact</strong><span>${escapeHtml(selected.impact || "")}</span></li>
            </ol>
            ${selected.sourceUrl ? `<a href="${escapeAttr(selected.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official source ↗</a>` : ""}
          </article>
        ` : ""}
      </section>
      <section class="compliance-group"><header><h3>Current / Effective</h3><span>${current.length} items</span></header><div class="compliance-grid">${renderItems(current)}</div></section>
      <section class="compliance-group"><header><h3>Future / Monitor</h3><span>${future.length} items</span></header><div class="compliance-grid">${renderItems(future)}</div></section>
    </section>
  `;
}

function complianceReports(categoryId) {
  return [...(data.catalog.policyReports?.[categoryId] || []), ...(supplementalComplianceReports[categoryId] || [])];
}

function complianceLocation(report) {
  const key = report.mapKey || `${report.title || ""} ${report.region || ""}`.toLowerCase();
  if (/qu[eé]bec/.test(key)) return { name: "Québec, Canada", lat: 46.8139, lon: -71.2080 };
  if (/prc|china|ccc/.test(key)) return { name: "PRC", lat: 39.9042, lon: 116.4074 };
  if (/california/.test(key)) return { name: "California, USA", lat: 38.5816, lon: -121.4944 };
  if (/mexico/.test(key)) return { name: "Mexico", lat: 19.4326, lon: -99.1332 };
  if (/brazil/.test(key)) return { name: "Brazil", lat: -15.7939, lon: -47.8828 };
  if (/japan/.test(key)) return { name: "Japan", lat: 35.6762, lon: 139.6503 };
  if (/australia/.test(key)) return { name: "Australia / New Zealand", lat: -33.8688, lon: 151.2093 };
  if (/european union|\beu\b/.test(key)) return { name: "European Union", lat: 50.8503, lon: 4.3517 };
  if (/united states|external power|battery charger/.test(key)) return { name: "United States", lat: 38.9072, lon: -77.0369 };
  return { name: report.region || "Global", lat: 20, lon: 0 };
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
        <p><strong>Representative Markets:</strong> ${geoCardValue(region.representatives)}</p>
        <p><strong>Key Compliance:</strong> ${geoCardValue(region.policyFocus)}</p>
      </div>
      <span class="country-card-action" aria-hidden="true">View countries & policy <b>↗</b></span>
    </article>
  `;
}

function renderRegionCountryWorkspace(categoryId, overview, regionId) {
  const region = (overview.regions || []).find((item) => item.id === regionId);
  if (!region) return renderGeoOverviewModuleFallback(regionId);
  const tabs = [...(region.countryTabs || [])];
  const configuredTab = state.geoCountryTab[categoryId];
  const activeTab = tabs.some((tab) => tab.id === configuredTab) ? configuredTab : tabs[0]?.id;
  state.geoCountryTab[categoryId] = activeTab;
  const tab = tabs.find((item) => item.id === activeTab);
  const country = (overview.countries || []).find((item) => item.id === tab?.countryId);
  return `
    <section class="module-block">
      <section class="geo-detail-view region-country-workspace">
        <div class="region-country-toolbar">
          <button class="ghost-button" type="button" data-action="country-back">← Country Overview</button>
        </div>
        <nav class="country-region-tabs" aria-label="${escapeAttr(region.label)} country and policy views">
          ${tabs.map((item) => `<button class="${item.id === activeTab ? "is-active" : ""}" type="button" data-action="country-tab" data-tab-id="${escapeAttr(item.id)}">${escapeHtml(item.label)}</button>`).join("")}
        </nav>
        ${renderRegionCountryPanel(overview, country, tab?.label || country?.label)}
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
        <h3>${escapeHtml(displayLabel)} Charger Market</h3>
        ${renderCountrySummaryList(country.summaryPoints || [])}
      </header>
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
          <h2>${escapeHtml(country.label)} Charger Market</h2>
          ${country.summaryPoints?.length
            ? renderCountrySummaryList(country.summaryPoints)
            : `<p>${escapeHtml(country.summary)}</p>`}
        </header>

        <section class="geo-detail-grid country-detail-grid">
          ${sections.map((section, index) => renderCountryInsightCard(country, section, index)).join("")}
        </section>
      </section>
    </section>
  `;
}

function renderCountrySummaryList(items) {
  return `<ul class="country-summary-list">${items.map((item) => `<li>${countrySummaryPointHtml(item)}</li>`).join("")}</ul>`;
}

function countrySummaryPointHtml(item) {
  const escaped = escapeHtml(item);
  const colonIndex = escaped.indexOf(":");
  const label = colonIndex >= 0 ? `<strong>${escaped.slice(0, colonIndex + 1)}</strong>` : "";
  const body = colonIndex >= 0 ? escaped.slice(colonIndex + 1) : escaped;
  const highlightedBody = body.replace(/\b\d+(?:\.\d+)?(?:%|B|M|W)?(?![\w%])/g, "<strong>$&</strong>");
  return `${label}${highlightedBody}`;
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
  const basisTitle = chart.basisTitle || (marketBased ? "Data basis" : "Research sample");
  const method = marketBased ? "" : (chart.method ?? research.method ?? "");
  const isDonut = chart.type === "donut";
  const legend = `
    <div class="country-chart-legend" aria-label="${escapeAttr(chart.title || "Chart")} legend">
      ${(chart.items || []).map((item, itemIndex) => `
        <span><i style="--legend-color:${escapeAttr(structureChartColor(itemIndex))}"></i><b>${escapeHtml(item.label)}</b><em>${escapeHtml(item.valueLabel || String(item.value))}</em></span>
      `).join("")}
    </div>
  `;
  return `
    <section class="geo-regional-chart country-chart-panel ${isDonut ? "is-donut" : "is-bar"}">
      <div class="country-chart-head">
        <h4>${escapeHtml(chart.title || "")}</h4>
        <small><strong>${basisTitle}</strong> ${escapeHtml(sampleLabel)}</small>
      </div>
      <div class="country-chart-body">
        ${isDonut ? legend : ""}
        <div id="${escapeAttr(chartId)}" class="plot geo-detail-plot"></div>
        ${isDonut ? "" : legend}
      </div>
      ${method ? `<p class="country-chart-method">${method.startsWith("Base:") ? escapeHtml(method) : `<strong>Study context</strong> ${escapeHtml(method)}`}</p>` : ""}
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
  const report = data.catalog.industryBrandReports?.[categoryId] || (categoryId === "power_cable" ? powerCableCompetitiveReport : null);
  if (!report) return null;
  const expansion = competitiveCategoryExpansion[categoryId] || {};
  const enrichBrand = (brand) => {
    const key = idFromText(brand.brand);
    return {
      ...brand,
      ...(competitiveCompanyResearch[key] || {}),
      marketTier: expansion.tiers?.[key] || brand.marketTier || 3,
      products: [...(brand.products || []), ...(expansion.productAdditions?.[key] || [])],
    };
  };
  return {
    ...report,
    brands: [...(report.brands || []).map(enrichBrand), ...(expansion.brands || []).map(enrichBrand)]
      .sort((a, b) => (a.marketTier || 3) - (b.marketTier || 3)),
  };
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
      ${overview.sources?.length ? `
        <footer class="structure-overview-sources">
          <strong>Sources</strong>
          <div>${overview.sources.map((source) => source.url
            ? `<a href="${escapeAttr(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)} ↗</a>`
            : `<span>${escapeHtml(source.title)}${source.note ? ` · ${escapeHtml(source.note)}` : ""}</span>`).join("")}</div>
        </footer>
      ` : ""}
    </section>
  `;
}

function renderStructurePlotPanel(chart, chartId) {
  const legendSide = chart.legendSide === "left" || chart.legendSide === "right" ? chart.legendSide : null;
  const legendTotal = (chart.items || []).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const legendValue = (item) => {
    const label = item.valueLabel || fmtExactNumber(item.value);
    return /%\s*$/.test(label)
      ? label
      : `${label} · ${legendTotal ? ((Number(item.value) || 0) / legendTotal * 100).toFixed(2) : "0.00"}%`;
  };
  const legend = legendSide ? `
    <div class="structure-chart-legend" aria-label="${escapeAttr(chart.title || "Chart")} legend">
      ${(chart.items || []).map((item, index) => `
        <div class="structure-chart-legend-item">
          <i style="--legend-color:${escapeAttr(structureChartColor(index))}"></i>
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(legendValue(item))}</span>
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
  const base = data.catalog.marketStructureReports?.[categoryId] || null;
  const overview = marketOverviewSupplements[categoryId];
  if (!overview) return base;
  return { ...(base || {}), title: base?.title || `${categoryLabel(categoryId)} Market Structure`, overview };
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
  if (categoryId === "adapter" && data.competitorDatabase?.products?.length) return renderAdapterCompetitiveAnalysis();
  if (data.competitorDatabase?.products?.length) return renderCompetitorDatabaseAnalysis(categoryId);
  const report = industryBrandReport(categoryId);
  return `
    <div class="view-stack">
      <section class="competitor-analysis-part">
        ${report?.brands?.length ? `
          <div class="company-profile-grid">${report.brands.map(renderCompanyProfileCard).join("")}</div>
        ` : renderCompanyProfileEmpty(categoryId)}
      </section>
    </div>
  `;
}

function renderAdapterCompetitiveAnalysis() {
  const rows = adapterAnalysisRows();
  const brands = [...new Set(rows.map((row) => row.brand))].sort();
  if (!state.adapterCompetitiveBrand || !brands.includes(state.adapterCompetitiveBrand)) state.adapterCompetitiveBrand = brands[0];
  const selectedProducts = rows.filter((row) => row.brand === state.adapterCompetitiveBrand);
  return `
    <div class="view-stack adapter-competitive-view">
      <section class="adapter-competitive-hero">
        <div class="adapter-competitive-title">
          <p class="eyebrow">Competitor product database</p>
          <h2>Charger Competitive Analysis</h2>
          <div class="adapter-title-kpis"><div><strong>${fmtExactNumber(brands.length)}</strong><span>Brands</span></div><div><strong>${fmtExactNumber(rows.length)}</strong><span>Verified products</span></div></div>
        </div>
        <div class="adapter-logo-wall" aria-label="Brand logo collection">${brands.map((brand) => {
          const logo = adapterBrandLogoPath(brand);
          const website = data.adapterAssets?.brandSites?.[brand] || rows.find((row) => row.brand === brand)?.source_url || "#";
          return `<a href="${escapeAttr(website)}" target="_blank" rel="noreferrer" title="Open ${escapeAttr(brand)} official website">${logo ? `<img src="${escapeAttr(logo)}" alt="${escapeAttr(brand)} logo">` : `<strong>${escapeHtml(brand)}</strong>`}<span>${escapeHtml(brand)}</span></a>`;
        }).join("")}</div>
      </section>

      ${renderAdapterAnalysisModule("power", "Power Contribution", adapterModuleControls("power", ["port", "scenario"]), ["adapterPowerPie", "adapterPowerBrandBar"])}
      ${renderAdapterAnalysisModule("price", "Price Analysis", adapterModuleControls("price", ["port", "scenario"]), ["adapterPriceHeatmap", "adapterPortPriceHeatmap"], ["Power × Price Heatmap", "Port × Price Heatmap"])}
      ${renderAdapterAnalysisModule("port", "Port Contribution", adapterModuleControls("port", ["power", "scenario"]), ["adapterPortPie", "adapterPortBrandBar"])}
      ${renderAdapterAnalysisModule("scenario", "Scenario Analysis", adapterModuleControls("scenario", ["price", "power"]), ["adapterScenarioBrandBar", "adapterScenarioPie"], ["Scenario Mix by Brand", "Selected Brand Scenario Share"])}

      <section class="adapter-brand-cloud-module">
        <header><div><span>05</span><h3>Brand Sample Cloud</h3><p>Select a brand to review matching database samples and official links.</p></div></header>
        <div class="adapter-brand-cloud">${brands.map((brand) => {
          const count = rows.filter((row) => row.brand === brand).length;
          return `<button type="button" data-action="adapter-brand-cloud" data-brand="${escapeAttr(brand)}" class="${brand === state.adapterCompetitiveBrand ? "is-active" : ""}" style="--brand-weight:${Math.min(30, 13 + count * 0.55)}px">${escapeHtml(brand)}<small>${count}</small></button>`;
        }).join("")}</div>
        <div class="adapter-brand-samples"><h4>${escapeHtml(state.adapterCompetitiveBrand)} samples</h4><div>${selectedProducts.map((row) => `<a href="${escapeAttr(row.source_url)}" target="_blank" rel="noreferrer"><span>${competitorProductImageTag(row)}</span><strong>${escapeHtml(row.product_name)}</strong><small>${row.advertised_power_w}W · ${row.resolvedPorts} port${row.resolvedPorts === 1 ? "" : "s"} · ${escapeHtml(row.scenario)}</small></a>`).join("")}</div></div>
      </section>
    </div>
  `;
}

function renderAdapterAnalysisModule(module, title, controls, chartIds, subtitles = []) {
  return `<section class="adapter-module-block" data-adapter-module="${escapeAttr(module)}"><div class="adapter-module-heading"><p>Competitor module</p><h3>${escapeHtml(title)}</h3></div><div class="adapter-analysis-module is-${escapeAttr(module)}"><header>${controls}</header><div class="adapter-analysis-chart-grid ${chartIds.length === 1 ? "is-single" : ""}">${chartIds.map((id, index) => `<article>${subtitles[index] ? `<h4>${escapeHtml(subtitles[index])}</h4>` : ""}<div id="${escapeAttr(id)}" class="plot adapter-analysis-plot"></div></article>`).join("")}</div></div></section>`;
}

const competitorCategoryName = { adapter: "Adapter", power_bank: "Power Bank", power_cable: "Power Cable" };

function competitorNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function competitorPowerBand(categoryId, value) {
  const watts = competitorNumber(value);
  if (watts === null) return "Unknown";
  if (categoryId === "adapter") {
    if (watts <= 69) return "65–69W";
    if (watts <= 99) return "70–99W";
    if (watts <= 139) return "100–139W";
    if (watts <= 199) return "140–199W";
    return "≥200W";
  }
  if (categoryId === "power_cable") {
    if (watts === 60) return "60W";
    if (watts === 100) return "100W";
    if (watts === 140) return "140W";
    if (watts === 240) return "240W";
    return "Other";
  }
  return watts < 100 ? "65–99W" : watts < 140 ? "100–139W" : watts < 200 ? "140–199W" : "≥200W";
}

function competitorCapacityBand(value) {
  const capacity = competitorNumber(value);
  if (capacity === null) return "Unknown";
  if (capacity <= 10000) return "≤10,000";
  if (capacity <= 20000) return "10,001–20,000";
  if (capacity <= 27000) return "20,001–27,000";
  return ">27,000";
}

function competitorPowerBankForm(row) {
  const text = `${row.form_factor || ""} ${row.product_name || ""}`.toLowerCase();
  if (/2-in-1|2 in 1|hybrid/.test(text)) return "2-in-1";
  if (/retract/.test(text)) return "Retractable cable";
  if (/built.?in|integrated/.test(text)) return "Built-in cable";
  return "Standard";
}

function competitorCableLengths(value) {
  const matches = String(value || "").toLowerCase().replace(/ｍ/g, "m").match(/\d+(?:\.\d+)?\s*(?:ft|feet|m|cm)/g) || [];
  return [...new Set(matches.map((token) => {
    const amount = Number.parseFloat(token);
    if (token.includes("cm")) return amount / 100;
    if (token.includes("ft") || token.includes("feet")) return amount * 0.3048;
    return amount;
  }).filter((value) => Number.isFinite(value) && value > 0).map((value) => Math.round(value * 100) / 100))];
}

function competitorCableLengthBand(row) {
  const lengths = competitorCableLengths(row.length_options);
  if (!lengths.length) return "Unknown";
  const value = Math.min(...lengths);
  if (value <= 1) return "≤1m";
  if (value <= 2) return "1.01–2m";
  if (value <= 3) return "2.01–3m";
  return ">3m";
}

function competitorCableProtocol(row) {
  const text = `${row.protocols || ""} ${row.product_name || ""}`.toLowerCase();
  if (/thunderbolt/.test(text)) return "Thunderbolt";
  if (/usb\s?4/.test(text)) return "USB4";
  if (/pd\s?3\.1|charging|charge cable|power/.test(text)) return "Charging cable";
  return "Unknown";
}

function adapterPortCount(row) {
  const direct = competitorNumber(row.total_outputs);
  if (direct !== null && direct > 0) return direct;
  const usbC = competitorNumber(row.usb_c_outputs);
  const usbA = competitorNumber(row.usb_a_outputs);
  if (usbC !== null || usbA !== null) return (usbC || 0) + (usbA || 0);
  const text = `${row.product_name || ""} ${row.evidence_excerpt || ""}`;
  if (row.brand === "Xtorm") {
    if (/65W Fast Travel|67W GaN2/i.test(text)) return 2;
    if (/100W GaN2|140W GaN2/i.test(text)) return 3;
  }
  const patterns = [
    /(?:^|\D)(\d+)\s*[- ]?ports?\b/i,
    /(?:^|\D)(\d+)\s*USB(?:-| )?(?:C|A)?\s*ports?\b/i,
    /(?:^|\D)(\d+)C\s*[+＋]\s*(\d+)(?:A|U)\b/i,
    /(?:C|Type-C)(?:\(TM\))?\s*[×x]\s*(\d+).*?(?:A|USB-A)\s*[×x]\s*(\d+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    return match[2] ? Number(match[1]) + Number(match[2]) : Number(match[1]);
  }
  if (/\b(?:dual|duo)\b/i.test(text)) return 2;
  if (/\b(?:trio|triple)\b/i.test(text)) return 3;
  if (/\bquad\b/i.test(text)) return 4;
  if (/\b(?:single|solo)\b/i.test(text)) return 1;
  if (/\bUSB-C (?:AC |GaN |LC |wall |laptop )?(?:power )?(?:adapter|charger)\b/i.test(row.product_name || "")) return 1;
  return null;
}

function adapterScenario(row) {
  const text = `${row.form_factor || ""} ${row.product_name || ""}`.toLowerCase();
  if (/travel|multi-country|universal adapter/.test(text)) return "Travel";
  if (/desktop|station|inline/.test(text)) return "Desktop";
  if (/retract/.test(text)) return "Retractable";
  if (/slim|flat/.test(text)) return "Slim";
  if (/legacy|4\.5mm|7\.4mm|smart ac/.test(text)) return "OEM / Legacy";
  return "Wall charger";
}

function adapterPriceBand(row) {
  const price = competitorNumber(row.price_min);
  if (price === null) return null;
  if (price < 40) return "<$40";
  if (price < 70) return "$40–69";
  if (price < 100) return "$70–99";
  return "$100+";
}

function adapterAnalysisRows() {
  return (data.competitorDatabase?.products || [])
    .filter((row) => row.category === "Adapter")
    .map((row) => ({ ...row, resolvedPorts: adapterPortCount(row), scenario: adapterScenario(row) }))
    .filter((row) => row.resolvedPorts !== null && row.resolvedPorts > 0);
}

function adapterModuleFilters(module) {
  state.adapterCompetitiveFilters[module] ||= {};
  return state.adapterCompetitiveFilters[module];
}

function adapterFilteredRows(module, options = {}) {
  const filters = adapterModuleFilters(module);
  return adapterAnalysisRows().filter((row) => {
    if (!options.ignoreBrand && filters.brand && filters.brand !== "all" && row.brand !== filters.brand) return false;
    if (filters.port && filters.port !== "all" && String(row.resolvedPorts) !== filters.port) return false;
    if (filters.scenario && filters.scenario !== "all" && row.scenario !== filters.scenario) return false;
    if (filters.power && filters.power !== "all" && competitorPowerBand("adapter", row.advertised_power_w) !== filters.power) return false;
    if (filters.price && filters.price !== "all" && adapterPriceBand(row) !== filters.price) return false;
    return true;
  });
}

function adapterFilterSelect(module, key, label, options, value = "all") {
  return `<label><span>${escapeHtml(label)}</span><select data-action="adapter-competitor-filter" data-module="${escapeAttr(module)}" data-key="${escapeAttr(key)}">${[{ value: "all", label: `All ${label.toLowerCase()}` }, ...options].map((option) => `<option value="${escapeAttr(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
}

function adapterModuleControls(module, keys) {
  const rows = adapterAnalysisRows();
  const filters = adapterModuleFilters(module);
  const options = {
    brand: [...new Set(rows.map((row) => row.brand))].sort().map((value) => ({ value, label: value })),
    form: [...new Set(rows.map((row) => row.form_factor))].sort().map((value) => ({ value, label: value })),
    port: [...new Set(rows.map((row) => row.resolvedPorts))].sort((a, b) => a - b).map((value) => ({ value: String(value), label: `${value} port${value === 1 ? "" : "s"}` })),
    scenario: [...new Set(rows.map((row) => row.scenario))].sort().map((value) => ({ value, label: value })),
    power: ["65–69W", "70–99W", "100–139W", "140–199W", "≥200W"].map((value) => ({ value, label: value })),
    price: ["<$40", "$40–69", "$70–99", "$100+"].map((value) => ({ value, label: value })),
  };
  const labels = { brand: "Brand", form: "Form", port: "Port", scenario: "Form / Scenario", power: "Power", price: "Price" };
  return `<div class="adapter-module-controls">${adapterFilterSelect(module, "brand", labels.brand, options.brand, filters.brand || "all")}${keys.map((key) => adapterFilterSelect(module, key, labels[key], options[key], filters[key] || "all")).join("")}</div>`;
}

function adapterBrandLogoPath(brand) {
  return data.adapterAssets?.brands?.[brand] || null;
}

function adapterProductImage(row) {
  const downloaded = data.adapterAssets?.products?.[row.source_url];
  if (downloaded && !downloaded.includes("-search.") && !downloaded.includes("-page.")) return downloaded;
  const text = `${row.brand} ${row.product_name}`.toLowerCase();
  if (text.includes("anker") && text.includes("160w")) return "assets/competitive/adapter-anker-a2687.png";
  if (text.includes("anker") && text.includes("140w")) return "assets/competitive/adapter-anker-a2697.png";
  if (text.includes("anker") && text.includes("100w")) return "assets/competitive/adapter-anker-a121b.png";
  if (text.includes("ugreen") && text.includes("300w")) return "assets/competitive/adapter-ugreen-300.png";
  if (text.includes("ugreen") && text.includes("160w")) return "assets/competitive/adapter-ugreen-160.png";
  if (text.includes("baseus") && text.includes("100w")) return "assets/competitive/adapter-baseus-100.jpg";
  if (text.includes("baseus") && text.includes("65w")) return "assets/competitive/adapter-baseus-65.jpg";
  if (text.includes("belkin") && text.includes("140w")) return "assets/competitive/adapter-belkin-140.jpg";
  if (text.includes("apple") && text.includes("140w")) return "assets/competitive/adapter-apple-140.jpg";
  return adapterBrandLogoPath(row.brand);
}

function competitorProductImageTag(row, className = "") {
  const logo = adapterBrandLogoPath(row.brand);
  const image = adapterProductImage(row) || logo;
  return `<img${className ? ` class="${escapeAttr(className)}"` : ""} src="${escapeAttr(image)}" data-logo-fallback="${escapeAttr(logo)}" alt="${escapeAttr(row.product_name)}" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.logoFallback">`;
}

function competitorDbRows(categoryId) {
  const category = competitorCategoryName[categoryId];
  const filters = state.competitorDbFilters[categoryId] || {};
  return (data.competitorDatabase?.products || []).filter((row) => {
    if (row.category !== category) return false;
    const pending = /pending/i.test(row.status || "");
    if (categoryId === "power_bank" && pending) return false;
    const bandValue = categoryId === "power_bank" ? competitorCapacityBand(row.capacity_mah) : competitorPowerBand(categoryId, row.advertised_power_w);
    if (filters.band && filters.band !== "all" && bandValue !== filters.band) return false;
    const formValue = categoryId === "power_bank" ? competitorPowerBankForm(row) : (row.form_factor || "Unknown");
    if (filters.form && filters.form !== "all" && formValue !== filters.form) return false;
    if (categoryId === "adapter" && filters.port === "multi" && !(competitorNumber(row.total_outputs) > 1)) return false;
    if (categoryId === "adapter" && filters.port === "single" && competitorNumber(row.total_outputs) !== 1) return false;
    if (categoryId === "power_cable" && filters.length && filters.length !== "all" && competitorCableLengthBand(row) !== filters.length) return false;
    if (categoryId === "power_cable" && filters.protocol && filters.protocol !== "all" && competitorCableProtocol(row) !== filters.protocol) return false;
    return true;
  });
}

function competitorFilterSelect(action, label, value, options) {
  return `<label><span>${escapeHtml(label)}</span><select data-action="${escapeAttr(action)}">${options.map((option) => `<option value="${escapeAttr(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
}

function renderCompetitorDatabaseAnalysis(categoryId) {
  const filters = state.competitorDbFilters[categoryId] || {};
  const rows = competitorDbRows(categoryId);
  const total = (data.competitorDatabase?.products || []).filter((row) => row.category === competitorCategoryName[categoryId]);
  const bands = categoryId === "adapter"
    ? ["65–69W", "70–99W", "100–139W", "140–199W", "≥200W", "Unknown"]
    : categoryId === "power_bank"
      ? ["≤10,000", "10,001–20,000", "20,001–27,000", ">27,000"]
      : ["60W", "100W", "140W", "240W"];
  const brands = new Set(rows.map((row) => row.brand));
  const brandList = [...brands].sort();
  const forms = [...new Set(total.map((row) => categoryId === "power_bank" ? competitorPowerBankForm(row) : (row.form_factor || "Unknown")))].filter((value) => value !== "Unknown").sort();
  return `
    <div class="view-stack competitor-db-view adapter-competitive-view">
      <section class="adapter-competitive-hero">
        <div class="adapter-competitive-title"><p class="eyebrow">Competitor product database</p><h2>${escapeHtml(competitorCategoryName[categoryId])} Competitive Analysis</h2><div class="adapter-title-kpis"><div><strong>${fmtExactNumber(brands.size)}</strong><span>Brands</span></div><div><strong>${fmtExactNumber(rows.length)}</strong><span>Products</span></div></div></div>
        <div class="adapter-logo-wall" aria-label="Brand official websites">${brandList.map((brand) => `<a href="${escapeAttr(data.adapterAssets?.brandSites?.[brand] || rows.find((row) => row.brand === brand)?.source_url || "#")}" target="_blank" rel="noreferrer" title="Open ${escapeAttr(brand)} official website"><img src="${escapeAttr(adapterBrandLogoPath(brand))}" alt="${escapeAttr(brand)} logo"><span>${escapeHtml(brand)}</span></a>`).join("")}</div>
      </section>
      ${categoryId === "power_bank" ? renderPowerBankCompetitorModules(filters, bands, forms, total) : renderCableCompetitorModules(filters, bands, forms, total)}
      ${renderCompetitorProductLibrary(categoryId, rows)}
    </div>
  `;
}

function competitorModuleControls(categoryId, keys, filters, bands, forms, total) {
  const currencies = [...new Set(total.map((row) => row.currency).filter(Boolean))].sort();
  const controls = {
    band: competitorFilterSelect("competitor-db-band", categoryId === "power_bank" ? "Capacity band" : "Power band", filters.band || "all", [{ value: "all", label: "All bands" }, ...bands.map((value) => ({ value, label: value }))]),
    form: competitorFilterSelect("competitor-db-form", "Factor", filters.form || "all", [{ value: "all", label: "All factors" }, ...forms.map((value) => ({ value, label: value }))]),
    length: competitorFilterSelect("competitor-db-length", "Length", filters.length || "all", [{ value: "all", label: "All lengths" }, ...["≤1m", "1.01–2m", "2.01–3m", ">3m"].map((value) => ({ value, label: value }))]),
    verification: competitorFilterSelect("competitor-db-verification", "Verification", filters.verification || "confirmed", [{ value: "confirmed", label: "Confirmed ≥65W" }, { value: "pending", label: "Pending" }, { value: "all", label: "All records" }]),
    currency: competitorFilterSelect("competitor-db-currency", "Currency", filters.currency || "all", [{ value: "all", label: "All currencies" }, ...currencies.map((value) => ({ value, label: value }))]),
  };
  return `<div class="adapter-module-controls"><div class="adapter-fixed-filter"><span>Brand</span><strong>All Brand</strong></div>${keys.map((key) => controls[key]).join("")}</div>`;
}

function renderDbModule(title, controls, charts) {
  return `<section class="adapter-module-block"><div class="adapter-module-heading"><p>Competitor module</p><h3>${escapeHtml(title)}</h3></div><section class="adapter-analysis-module"><header>${controls}</header><div class="adapter-analysis-chart-grid">${charts.map(([id, label]) => `<article><h4>${escapeHtml(label)}</h4><div id="competitorDbChart${id}" class="plot adapter-analysis-plot"></div></article>`).join("")}</div></section></section>`;
}

function renderPowerBankCompetitorModules(filters, bands, forms, total) {
  return [
    renderDbModule("Capacity Contribution", competitorModuleControls("power_bank", ["form"], filters, bands, forms, total), [[1, "Capacity Share"], [2, "Capacity Mix by Brand"]]),
    renderDbModule("Price Analysis", competitorModuleControls("power_bank", ["form"], filters, bands, forms, total), [[3, "Capacity vs Price"], [4, "Single-port Power vs Price"]]),
    renderDbModule("Max Single-port Power Contribution", competitorModuleControls("power_bank", ["band", "form"], filters, bands, forms, total), [[5, "Single-port Power Share"], [6, "Single-port Power Mix by Brand"]]),
    renderDbModule("Factor Contribution", competitorModuleControls("power_bank", ["band"], filters, bands, forms, total), [[7, "Factor Share"], [8, "Factor Mix by Brand"]]),
  ].join("");
}

function renderCableCompetitorModules(filters, bands, forms, total) {
  return [
    renderDbModule("Length Contribution", competitorModuleControls("power_cable", ["form"], filters, bands, forms, total), [[1, "Length Share"], [2, "Length Mix by Brand"]]),
    renderDbModule("Price Analysis", competitorModuleControls("power_cable", ["band", "form"], filters, bands, forms, total), [[3, "Length vs Price"], [4, "Charging Power vs Price"]]),
    renderDbModule("Factor Contribution", competitorModuleControls("power_cable", ["length"], filters, bands, forms, total), [[5, "Factor Share"], [6, "Factor Mix by Brand"]]),
  ].join("");
}

function renderCompetitorProductLibrary(categoryId, rows) {
  const brands = [...new Set(rows.map((row) => row.brand))].sort();
  let selected = state.competitorDbBrand[categoryId];
  if (!brands.includes(selected)) selected = brands[0];
  state.competitorDbBrand[categoryId] = selected;
  const products = rows.filter((row) => row.brand === selected);
  return `<section class="adapter-module-block"><div class="adapter-module-heading"><p>Competitor module</p><h3>Product Library</h3></div><section class="adapter-brand-cloud-module"><header><div><span>05</span><h3>Brand Product Library</h3><p>Select a brand to view product images and official links.</p></div></header><div class="adapter-brand-cloud">${brands.map((brand) => { const count = rows.filter((row) => row.brand === brand).length; return `<button type="button" data-action="competitor-db-brand-cloud" data-brand="${escapeAttr(brand)}" class="${brand === selected ? "is-active" : ""}" style="--brand-weight:${Math.min(30, 13 + count * .45)}px">${escapeHtml(brand)}<small>${count}</small></button>`; }).join("")}</div><div class="adapter-brand-samples"><h4>${escapeHtml(selected)} products</h4><div>${products.map((row) => `<a href="${escapeAttr(row.source_url)}" target="_blank" rel="noreferrer"><span>${competitorProductImageTag(row)}</span><strong>${escapeHtml(row.product_name)}</strong><small>${categoryId === "power_bank" ? `${row.capacity_mah || "—"}mAh · ${row.single_usb_c_output_w || "—"}W single-port` : `${row.advertised_power_w || "—"}W · ${escapeHtml(row.length_options || "Length unknown")}`}</small></a>`).join("")}</div></div></section></section>`;
}

function renderCompetitorModuleGroup(title, chartTitles, chartNumbers) {
  return `<section class="adapter-module-block"><div class="adapter-module-heading"><p>Competitor module</p><h3>${escapeHtml(title)}</h3></div><section class="competitor-db-chart-grid">${chartNumbers.map((number, index) => `<article class="competitor-db-chart-card"><header><h3>${escapeHtml(chartTitles[index])}</h3></header><div id="competitorDbChart${number}" class="plot competitor-db-plot"></div></article>`).join("")}</section></section>`;
}

function renderCompetitorDatabaseTable(categoryId, rows) {
  const cols = categoryId === "adapter"
    ? [["brand", "Brand"], ["product_name", "Product"], ["advertised_power_w", "Nominal W"], ["single_usb_c_output_w", "Single-port W"], ["total_outputs", "Ports"], ["form_factor", "Form"], ["price_min", "Price"]]
    : categoryId === "power_bank"
      ? [["brand", "Brand"], ["product_name", "Product"], ["capacity_mah", "Capacity mAh"], ["advertised_power_w", "Nominal W"], ["single_usb_c_output_w", "Single-port W"], ["form_factor", "Form"], ["price_min", "Price"]]
      : [["brand", "Brand"], ["product_name", "Product"], ["advertised_power_w", "Charging W"], ["length_options", "Length options"], ["form_factor", "Structure"], ["protocols", "Data protocol"], ["price_min", "Price"]];
  return `<div class="competitor-db-table-wrap"><table><thead><tr><th>Image</th>${cols.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}<th>Source</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${competitorProductImageTag(row, "competitor-product-thumb")}</td>${cols.map(([key]) => `<td>${key === "price_min" ? (row[key] == null ? "—" : `${escapeHtml(row.currency || "")} ${Number(row[key]).toFixed(2)}`) : escapeHtml(row[key] == null || row[key] === "" ? "—" : String(row[key]))}</td>`).join("")}<td><a href="${escapeAttr(row.source_url || "#")}" target="_blank" rel="noreferrer">Open ↗</a></td></tr>`).join("")}</tbody></table></div>`;
}

function renderCompetitiveStrategyMap(brands) {
  const tiers = [
    { label: "Tier 1 · Global Leaders & Ecosystem Owners", brands: brands.filter((brand) => brand.marketTier === 1) },
    { label: "Tier 2 · Scale & Value Challengers", brands: brands.filter((brand) => brand.marketTier === 2) },
    { label: "Tier 3 · Focused Specialists", brands: brands.filter((brand) => ![1, 2].includes(brand.marketTier)) },
  ].filter((tier) => tier.brands.length);
  return `
    <section class="competitive-strategy-map" aria-label="Competitive market tiers">
      <header><span>Strategic Map</span><h3>Market Tier Architecture</h3><p>Brand placement combines scale, channel reach, technology leadership and portfolio breadth. Select a logo to jump to that company's section.</p></header>
      <div class="competitive-tier-axis"><span>Higher scale / premium authority</span><span>Focused value / specification competition</span></div>
      ${tiers.map((tier, index) => `
        <div class="competitive-tier-row is-tier-${index + 1}">
          <strong>${escapeHtml(tier.label)}</strong>
          <div>${tier.brands.map((brand) => `<button type="button" data-action="competitive-brand-focus" data-brand="${escapeAttr(idFromText(brand.brand))}"><img src="${escapeAttr(brandLogoPath(brand))}" alt="${escapeAttr(brand.brand)} logo"><span>${escapeHtml(brand.brand)}</span></button>`).join("")}</div>
        </div>
      `).join("")}
    </section>
  `;
}

function renderCompanyProfileCard(brand) {
  const brandId = idFromText(brand.brand);
  return `
    <article class="company-profile-card company-showcase" id="company-${escapeAttr(brandId)}">
      <header class="company-showcase-head">
        <span class="company-title-eyebrow">Brand Name</span>
        <div class="company-title-lockup">
          <img class="company-logo-image" src="${escapeAttr(brandLogoPath(brand))}" alt="${escapeAttr(brand.brand)} logo" loading="lazy">
          <h3>${escapeHtml(brand.brand)}</h3>
        </div>
      </header>
      ${brand.products?.length ? renderCompanyProducts(brand.products) : `<p class="product-meta">No verified product is currently loaded for this company.</p>`}
    </article>
  `;
}

function renderCompanyFinancials(brand) {
  return `
    <section class="company-detail-group company-financial-reading">
      <h4>Financial Report Reading</h4>
      <strong>${escapeHtml(brand.financialTitle || "Disclosure review")}</strong>
      <ul>${brand.financials.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      ${brand.financialSourceUrl ? `<a href="${escapeAttr(brand.financialSourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(brand.financialSourceLabel || "Open primary source")} ↗</a>` : ""}
    </section>
  `;
}

function brandLogoPath(brand) {
  const key = idFromText(brand?.brand);
  return `assets/brands/${["anker", "baseus", "ugreen", "belkin", "apple", "xiaomi"].includes(key) ? key : "generic"}.svg`;
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
    <section class="company-detail-group company-product-showcase">
      <div class="company-product-list">
        ${products.map((product) => `
          <a class="company-product-item" href="${escapeAttr(product.productUrl || product.amazonUrl || "#")}" target="_blank" rel="noreferrer" aria-label="Open ${escapeAttr(product.name)} product page">
            <span class="company-product-image">
              <img src="${escapeAttr(product.imageUrl || "")}" alt="${escapeAttr(product.name)}" loading="lazy">
            </span>
            <span class="company-product-copy">
              <strong>${escapeHtml(product.name)}</strong>
              <em>${escapeHtml(formatCompetitiveUsdPrice(product.price))}</em>
            </span>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function formatCompetitiveUsdPrice(value) {
  const price = String(value || "").trim();
  if (/^USD\s/i.test(price)) return price;
  const usd = price.match(/\$\s?([\d,.]+)/);
  if (usd) return `USD $${usd[1]}`;
  if (/¥|JPY|price varies/i.test(price)) return "USD price varies";
  return price ? `USD ${price}` : "USD price varies";
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
  const visibleProducts = data.catalog.products.filter((product) => product.categoryId === categoryId);
  if (!hasActiveGlobalTime()) {
    return `<div class="view-stack category-overview-stack">${renderCategoryPerformanceHero(categoryId, visibleProducts)}<section class="empty-state"><div><h3>No time selected</h3><p>Select a year, quarter, or month to display data.</p></div></section></div>`;
  }
  return `
    <div class="view-stack category-overview-stack">
      ${renderCategoryPerformanceHero(categoryId, visibleProducts)}
      <section class="module-block category-performance-content">
        ${renderPerformanceOverview(categoryId, visibleProducts)}
      </section>
      <section class="module-block">
        <div class="module-head">
          <span>Overview Module</span>
          <h2>Geo Contribution</h2>
        </div>
        ${renderCategoryGeoContribution(categoryId, visibleProducts)}
      </section>
    </div>
  `;
}

function categoryPerformanceTitle(categoryId) {
  return ({
    adapter: "Charger Performance",
    power_bank: "Power Bank Performance",
    power_cable: "Power Cable Performance",
  })[categoryId] || `${overviewScopeLabel(categoryId)} Performance`;
}

function categoryKpiAmount(rows) {
  return rows.reduce((sum, row) => sum + Number(row.shipRevenue || 0), 0);
}

function categoryKpiTrend(current, comparison) {
  if (!comparison) return current ? { value: 0, text: "New", isUp: true } : { value: 0, text: "0.0%", isUp: true };
  const value = (current - comparison) / Math.abs(comparison);
  return { value, text: formatSignedPercent(value), isUp: value >= 0 };
}

function categoryHeroKpis(categoryId, products) {
  const productIds = new Set(products.map((product) => product.id));
  const rows = data.productMetrics.filter((row) => row.categoryId === categoryId && productIds.has(row.modelId) && rowMatchesActiveDetailPn(row));
  const segment = categoryOverviewSegment(categoryId, "power");
  const scopedRows = rows.filter((row) => rowMatchesCategorySegment(row, segment));
  const years = [...new Set(scopedRows.map((row) => row.fiscalYear).filter(Boolean))].sort((a, b) => periodSortValue(a) - periodSortValue(b));
  const currentYear = years.at(-1) || "FY2627";
  const priorYear = priorFiscalYear(currentYear);
  const selectedQuarterPeriod = state.granularity === "quarter"
    ? ensureSelectedCategoryPeriods().map(parseFiscalPeriodLabel).filter(Boolean).at(-1)
    : null;
  const availableQuarters = [...new Set(scopedRows.filter((row) => row.fiscalYear === currentYear).map((row) => row.fiscalQuarter).filter(Boolean))]
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const cutoffQuarter = selectedQuarterPeriod?.fiscalYear === currentYear
    ? selectedQuarterPeriod.fiscalQuarter
    : availableQuarters.at(-1);
  const cutoffNumber = Number(String(cutoffQuarter || "Q4").slice(1));
  const ytdQuarters = availableQuarters.filter((quarter) => Number(quarter.slice(1)) <= cutoffNumber);
  const ytdCurrent = categoryKpiAmount(scopedRows.filter((row) => row.fiscalYear === currentYear && ytdQuarters.includes(row.fiscalQuarter)));
  const ytdPrior = categoryKpiAmount(scopedRows.filter((row) => row.fiscalYear === priorYear && ytdQuarters.includes(row.fiscalQuarter)));

  const selected = categoryPerformancePeriod(categoryId, products);
  const selectedCurrent = categoryKpiAmount(categoryOverviewRowsForPeriod(categoryId, [...productIds], selected).filter((row) => rowMatchesCategorySegment(row, segment)));
  const selectedPrior = categoryKpiAmount(categoryOverviewRowsForPeriod(categoryId, [...productIds], selected, true).filter((row) => rowMatchesCategorySegment(row, segment)));
  const selectedLabel = selected.label;

  return [
    { label: "Revenue", currentLabel: `${currentYear} YTD`, priorLabel: `${priorYear} YTD`, amount: ytdCurrent, priorAmount: ytdPrior, trend: categoryKpiTrend(ytdCurrent, ytdPrior), suffix: "YoY" },
    { label: "Revenue", currentLabel: selectedLabel, priorLabel: selected.priorLabel, amount: selectedCurrent, priorAmount: selectedPrior, trend: categoryKpiTrend(selectedCurrent, selectedPrior), suffix: "YoY" },
  ];
}

function renderCategoryPerformanceHero(categoryId, products) {
  const hasTime = hasActiveGlobalTime();
  const activeTimeLabel = state.granularity === "quarter"
    ? selectedCategoryPeriodsLabel(ensureSelectedCategoryPeriods())
    : (selectedPeriod() || "No time selected");
  return `
    <section class="category-performance-hero">
      <header class="power-home-head category-performance-hero-head">
        <div><h1>${escapeHtml(categoryPerformanceTitle(categoryId))}</h1></div>
        <dl class="power-home-meta">
          <div><dt>Time</dt><dd>${escapeHtml(activeTimeLabel)}</dd></div>
          <div><dt>Unit</dt><dd>M$ Dollar</dd></div>
        </dl>
      </header>
      <div class="category-performance-kpis">
        ${hasTime ? categoryHeroKpis(categoryId, products).map((item) => `
          <article class="category-comparison-kpi power-kpi-card ${item.trend.isUp ? "is-up" : "is-down"}">
            <header><span>${escapeHtml(item.label)}</span><p><span aria-hidden="true">${item.trend.isUp ? "↑" : "↓"}</span>${escapeHtml(item.trend.text)} ${escapeHtml(item.suffix)}</p></header>
            <div class="category-comparison-values">
              <section><small>${escapeHtml(item.currentLabel)}</small><strong>${formatCategoryRevenueM(item.amount)}</strong></section>
              <section><small>${escapeHtml(item.priorLabel)}</small><strong>${formatCategoryRevenueM(item.priorAmount)}</strong></section>
            </div>
          </article>
        `).join("") : ""}
      </div>
    </section>
  `;
}

function categoryMatchesOverview(row, categoryId) {
  return categoryId === "power_overall" || row.categoryId === categoryId;
}

function rowMatchesActiveDetailPn(row) {
  return !state.productId || state.partNumber === "all" || !state.partNumber || row.partNumber === state.partNumber;
}

function detailPanelPnKey(panel) { return `${state.productId || "none"}:${panel}`; }

function detailEligiblePns(panel) {
  if (!state.productId) return [];
  const segment = categoryOverviewSegment(state.categoryId, panel);
  return unique(data.productMetrics.filter((row) => row.modelId === state.productId && (segment === "all" || row.segment === segment)).map((row) => row.partNumber).filter(Boolean)).sort();
}

function detailSelectedPns(panel) {
  const eligible = detailEligiblePns(panel);
  const stored = state.detailPanelPns[detailPanelPnKey(panel)];
  return Array.isArray(stored) ? eligible.filter((pn) => stored.includes(pn)) : eligible;
}

function detailPnSegment(pn) {
  const scores = { Consumer: 0, Commercial: 0 };
  data.productMetrics
    .filter((row) => row.modelId === state.productId && row.partNumber === pn)
    .forEach((row) => {
      if (!(row.segment in scores)) return;
      scores[row.segment] += Math.abs(Number(row.shipRevenue || 0))
        + Math.abs(Number(row.orderRevenue || 0))
        + Math.abs(Number(row.shipQty || 0))
        + Math.abs(Number(row.orderQty || 0));
    });
  return scores.Consumer >= scores.Commercial ? "Consumer" : "Commercial";
}

function rowMatchesDetailPanelPn(row, panel) {
  if (!state.productId) return true;
  return detailSelectedPns(panel).includes(row.partNumber);
}

function renderDetailPnSelector(panel) {
  const eligible = detailEligiblePns(panel);
  const selected = detailSelectedPns(panel);
  const allSelected = eligible.length > 0 && selected.length === eligible.length;
  const renderGroup = (segment) => {
    const pns = eligible.filter((pn) => detailPnSegment(pn) === segment);
    return `<section class="detail-pn-group"><h4>${segment}</h4>${pns.length ? pns.map((pn) => `<label><input type="checkbox" data-action="detail-pn-select" data-panel="${escapeAttr(panel)}" value="${escapeAttr(pn)}" ${selected.includes(pn) ? "checked" : ""}><span>${escapeHtml(pn)}</span></label>`).join("") : `<p>No PN</p>`}</section>`;
  };
  return `<details class="category-product-selector detail-pn-selector"><summary title="Choose PN" aria-label="Choose PN"><span>PN</span><small>${allSelected ? "All" : `${selected.length}/${eligible.length}`}</small></summary><div class="category-product-menu detail-pn-menu"><button class="category-product-all" type="button" data-action="detail-pn-all" data-panel="${escapeAttr(panel)}" aria-pressed="${allSelected}"><span class="category-product-check ${allSelected ? "is-checked" : ""}" aria-hidden="true"></span><span>All PN</span></button><div class="detail-pn-columns">${renderGroup("Consumer")}${renderGroup("Commercial")}</div></div></details>`;
}

function overviewScopeLabel(categoryId) {
  if (categoryId === "power_overall") return "Power";
  return indexes.categories.get(categoryId)?.label || "Product";
}

function categoryGeoSelectedProductIds(categoryId, products) {
  const availableIds = products.map((product) => product.id);
  const selected = state.categoryGeoProducts[categoryId];
  if (!Array.isArray(selected)) return availableIds;
  return availableIds.filter((productId) => selected.includes(productId));
}

function categoryGeoMetric(categoryId) {
  const field = state.categoryGeoMetric[categoryId] || "shipRevenue";
  return categoryOverviewMetricOptions.some((option) => option.field === field) ? field : "shipRevenue";
}

function categoryGeoSelectedPeriods(categoryId) {
  return ensureSelectedCategoryPeriods();
}

function renderCategoryGeoTimeSelector(categoryId) {
  const quarterOptions = getPeriodOptions("quarter");
  const yearOptions = getPeriodOptions("year");
  const selected = categoryGeoSelectedPeriods(categoryId);
  const label = selected.length === quarterOptions.length ? "All" : `${selected.length}`;
  return `
    <details class="category-time-multi-selector geo-time-selector" ${state.categoryGeoTimeMenuOpen ? "open" : ""}>
      <summary aria-label="Choose geo time periods"><span class="time-selector-icon" aria-hidden="true"></span><span>Time</span><small>${label}</small></summary>
      <div class="category-time-multi-menu geo-time-menu">
        <section><strong>Year</strong>
          ${yearOptions.map((year) => `<label><input type="checkbox" data-action="category-geo-time-year" value="${escapeAttr(year)}" ${["Q1","Q2","Q3","Q4"].every((q) => selected.includes(`${year} ${q}`)) ? "checked" : ""}><span>${escapeHtml(year)}</span></label>`).join("")}
        </section>
        <section><strong>Quarter</strong>
          ${quarterOptions.map((period) => `<label><input type="checkbox" data-action="category-geo-time-quarter" value="${escapeAttr(period)}" ${selected.includes(period) ? "checked" : ""}><span>${escapeHtml(period)}</span></label>`).join("")}
        </section>
      </div>
    </details>
  `;
}

function categoryGeoMetricOption(categoryId) {
  const field = categoryGeoMetric(categoryId);
  return categoryOverviewMetricOptions.find((option) => option.field === field) || categoryOverviewMetricOptions[0];
}

function categoryGeoContributionData(categoryId, products) {
  const productIds = new Set(categoryGeoSelectedProductIds(categoryId, products));
  const selectedPeriods = new Set(categoryGeoSelectedPeriods(categoryId));
  const metric = categoryGeoMetric(categoryId);
  const segment = categoryOverviewSegment(categoryId, "geo");
  const totals = new Map();

  (data.geoMetrics || []).forEach((row) => {
    const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
    if (!categoryMatchesOverview(row, categoryId) || !productIds.has(row.modelId) || !rowMatchesActiveDetailPn(row) || !rowMatchesDetailPanelPn(row, "geo") || !selectedPeriods.has(period) || !rowMatchesCategorySegment(row, segment)) return;
    const geo = row.geo || "Unassigned";
    totals.set(geo, (totals.get(geo) || 0) + Number(row[metric] || 0));
  });

  return [...totals.entries()]
    .map(([geo, value]) => ({ geo, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

function renderCategoryGeoProductSelector(categoryId, products) {
  const selectedIds = categoryGeoSelectedProductIds(categoryId, products);
  const allSelected = !Array.isArray(state.categoryGeoProducts[categoryId]) || selectedIds.length === products.length;
  const groups = overviewProductGroups(categoryId, products);
  return `
    <details class="category-product-selector geo-product-selector">
      <summary title="Choose products" aria-label="Choose products">
        <span class="charger-selector-icon" aria-hidden="true"></span>
        <span>Products</span>
        <small>${allSelected ? "All" : `${selectedIds.length}/${products.length}`}</small>
      </summary>
      <div class="category-product-menu">
        <button class="category-product-all" type="button" data-action="category-geo-product-all" data-category-id="${escapeAttr(categoryId)}" aria-pressed="${allSelected}">
          <span class="category-product-check ${allSelected ? "is-checked" : ""}" aria-hidden="true"></span>
          <span class="category-product-all-icon" aria-hidden="true"></span>
          <span>All products</span>
        </button>
        ${groups.map((group) => `
          <section class="category-product-group">
            <h4>${escapeHtml(group.label)}</h4>
            ${group.products.map((product) => `
              <label>
                <input type="checkbox" data-action="category-geo-product" data-category-id="${escapeAttr(categoryId)}" value="${escapeAttr(product.id)}" ${selectedIds.includes(product.id) ? "checked" : ""}>
                <img src="${escapeAttr(productImageItems(product)[0]?.src || "")}" alt="" loading="lazy">
                <span>${escapeHtml(product.name)}</span>
              </label>
            `).join("")}
          </section>
        `).join("")}
      </div>
    </details>
  `;
}

function renderCategoryGeoMetricSettings(categoryId) {
  const current = categoryGeoMetric(categoryId);
  return `
    <details class="category-metric-settings geo-metric-settings">
      <summary title="Choose metric" aria-label="Choose metric">
        <span class="metric-toggle-icon" aria-hidden="true"><i></i><i></i></span>
      </summary>
      <div class="category-metric-menu">
        ${categoryOverviewMetricOptions.map((option) => `
          <button
            class="${current === option.field ? "is-active" : ""}"
            type="button"
            data-action="category-geo-metric"
            data-category-id="${escapeAttr(categoryId)}"
            data-metric="${escapeAttr(option.field)}"
          >${escapeHtml(option.label)}</button>
        `).join("")}
      </div>
    </details>
  `;
}

function selectedCategoryGeo(categoryId, options) {
  const stored = state.categoryGeoSelected[categoryId];
  if (stored && options.some((item) => item.geo === stored)) return stored;
  const fallback = options[0]?.geo || "Unassigned";
  state.categoryGeoSelected[categoryId] = fallback;
  return fallback;
}

function categoryGeoChartMode(chart) {
  return state.categoryGeoChartModes[chart] || (chart === "geo-share" ? "bar" : "pie");
}

function renderCategoryGeoContribution(categoryId, products) {
  const contribution = categoryGeoContributionData(categoryId, products);
  const selectedGeo = selectedCategoryGeo(categoryId, contribution);
  const periodLabel = selectedCategoryPeriodsLabel(categoryGeoSelectedPeriods(categoryId));
  const metricOption = categoryGeoMetricOption(categoryId);
  const metricName = metricOption.kind === "quantity" ? "Quantity" : "Revenue";
  const geoExpanded = state.expandedTrendChart === "geo-share";
  const countryExpanded = state.expandedTrendChart === "country-share";
  const sharedControls = `
    ${renderCategorySegmentControl(categoryId, "geo")}
    <label class="geo-contribution-select has-geo-icon"><span class="geo-globe-icon" aria-hidden="true"></span><select data-action="category-geo-select" data-category-id="${escapeAttr(categoryId)}">${contribution.map((item) => `<option value="${escapeAttr(item.geo)}" ${item.geo === selectedGeo ? "selected" : ""}>${escapeHtml(displayLocationLabel(item.geo))}</option>`).join("")}</select></label>
    ${state.productId ? renderDetailPnSelector("geo") : renderCategoryGeoProductSelector(categoryId, products)}
    ${renderCategoryGeoMetricSettings(categoryId)}
  `;
  const expandedControls = (chart) => `
    ${renderCategorySegmentControl(categoryId, "geo")}
    ${chart === "geo-share" ? "" : `<label class="geo-contribution-select has-geo-icon"><span class="geo-globe-icon" aria-hidden="true"></span><select data-action="category-geo-select" data-category-id="${escapeAttr(categoryId)}">${contribution.map((item) => `<option value="${escapeAttr(item.geo)}" ${item.geo === selectedGeo ? "selected" : ""}>${escapeHtml(displayLocationLabel(item.geo))}</option>`).join("")}</select></label>`}
    ${state.productId ? renderDetailPnSelector("geo") : renderCategoryGeoProductSelector(categoryId, products)}
    ${renderCategoryGeoMetricSettings(categoryId)}
    <div class="geo-chart-type-toggle" role="group" aria-label="Chart type"><button class="${categoryGeoChartMode(chart) === "pie" ? "is-active" : ""}" type="button" data-action="category-geo-chart-mode" data-chart="${chart}" data-mode="pie">Pie</button><button class="${categoryGeoChartMode(chart) === "bar" ? "is-active" : ""}" type="button" data-action="category-geo-chart-mode" data-chart="${chart}" data-mode="bar">Bar</button></div>
  `;
  return `
    <div class="geo-contribution-grid geo-contribution-grid-unified">
      <article class="geo-contribution-panel geo-contribution-panel-unified geo-contribution-combined">
        <div class="geo-contribution-panel-head">
          <div><span>${escapeHtml(metricOption.label)}</span><h3>Revenue Share by Geo &amp; Countries</h3><p>${escapeHtml(periodLabel)}</p></div>
          <div class="geo-contribution-controls">${sharedControls}</div>
        </div>
        <div class="geo-two-chart-grid">
          <section class="geo-share-card ${geoExpanded ? "is-chart-expanded" : ""}">
            <div class="geo-share-caption"><div><h4>${metricName} Share by Geo</h4></div><div class="geo-contribution-controls">${geoExpanded ? expandedControls("geo-share") : ""}${renderOverviewExpandButton("geo-share", "geo share")}</div></div>
            <div id="categoryGeoContributionPlot" class="plot geo-contribution-plot"></div>
          </section>
          <section class="geo-share-card ${countryExpanded ? "is-chart-expanded" : ""}">
            <div class="geo-share-caption"><div><h4>${escapeHtml(displayLocationLabel(selectedGeo))} Country ${metricName} Share</h4></div><div class="geo-contribution-controls">${countryExpanded ? expandedControls("country-share") : ""}${renderOverviewExpandButton("country-share", "country share")}</div></div>
            <div id="categoryCountryContributionPlot" class="plot geo-contribution-plot"></div>
          </section>
        </div>
      </article>
    </div>
  `;
}

const categoryOverviewMetricOptions = [
  { field: "shipRevenue", label: "Ship Rev", kind: "revenue" },
  { field: "orderRevenue", label: "Order Rev", kind: "revenue" },
  { field: "backlogRevenue", label: "Bklg Rev", kind: "revenue" },
  { field: "shipQty", label: "Ship Qty", kind: "quantity" },
  { field: "orderQty", label: "Order Qty", kind: "quantity" },
  { field: "backlogQty", label: "Bklg Qty", kind: "quantity" },
];

function categoryOverviewMetric(categoryId, panel) {
  return state.categoryOverviewMetrics[`${categoryId}:${panel}`] || "shipRevenue";
}

function categoryOverviewMetricOption(categoryId, panel) {
  const field = categoryOverviewMetric(categoryId, panel);
  return categoryOverviewMetricOptions.find((option) => option.field === field) || categoryOverviewMetricOptions[0];
}

function categoryOverviewSegment(categoryId, panel) {
  const value = state.categoryOverviewSegments[`${categoryId}:${panel}`];
  return ["Consumer", "Commercial"].includes(value) ? value : "all";
}

function rowMatchesCategorySegment(row, segment) {
  return segment === "all" || row.segment === segment;
}

function renderCategorySegmentControl(categoryId, panel) {
  const selected = categoryOverviewSegment(categoryId, panel);
  return `
    <label class="category-segment-control">
      <select
        data-action="category-overview-segment-select"
        data-category-id="${escapeAttr(categoryId)}"
        data-panel="${escapeAttr(panel)}"
        aria-label="Choose segment"
      >
        ${[["all", "All Segment"], ["Consumer", "Consumer"], ["Commercial", "Commercial"]].map(([value, label]) => `<option value="${escapeAttr(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderOverviewExpandButton(chart, label) {
  const expanded = state.expandedTrendChart === chart;
  return `<button class="trend-expand-button" type="button" data-action="trend-chart-expand" data-chart="${escapeAttr(chart)}" aria-label="${expanded ? "Close enlarged chart" : `Enlarge ${escapeAttr(label)} chart`}" title="${expanded ? "Close" : "Enlarge"}"><span aria-hidden="true">${expanded ? "×" : "↗"}</span></button>`;
}

function renderCategoryMetricSettings(categoryId, panel) {
  const current = categoryOverviewMetric(categoryId, panel);
  return `
    <details class="category-metric-settings">
      <summary title="Choose metric" aria-label="Choose metric">
        <span class="metric-toggle-icon" aria-hidden="true"><i></i><i></i></span>
      </summary>
      <div class="category-metric-menu">
        ${categoryOverviewMetricOptions.map((option) => `
          <button
            class="${current === option.field ? "is-active" : ""}"
            type="button"
            data-action="category-overview-metric"
            data-category-id="${escapeAttr(categoryId)}"
            data-panel="${escapeAttr(panel)}"
            data-metric="${escapeAttr(option.field)}"
          >${escapeHtml(option.label)}</button>
        `).join("")}
      </div>
    </details>
  `;
}

function renderPerformanceOverview(categoryId, products) {
  const categoryLabel = overviewScopeLabel(categoryId);
  const period = categoryPerformancePeriod(categoryId, products);
  return `
    <section class="performance-overview">
      <div class="performance-overview-top">
        ${renderPerformanceRevenuePanel(categoryId, products, "power", period)}
        ${renderPerformanceRanking(categoryId, products, "ranking", `${categoryLabel} Ranking`, period)}
      </div>
      <div class="module-head performance-contribution-head">
        <span>Overview Module</span>
        <h2>Time Trend</h2>
      </div>
      <div class="products-contribution-stack">
        <div class="time-trend-grid">
          ${renderQuarterComparisonPanel(categoryId, "trend")}
          ${renderPerformanceRevenueTrendPanel(categoryId, products, "trend")}
        </div>
      </div>
      <div class="module-head performance-contribution-head">
        <span>Overview Module</span>
        <h2>Products Contribution</h2>
      </div>
      <div class="products-contribution-stack">
        ${renderPerformanceContributionPanel(categoryId, products, "contribution", period)}
      </div>
    </section>
  `;
}

function categoryOverviewSelectedProductIds(categoryId, products) {
  const availableIds = products.map((product) => product.id);
  const selected = state.categoryOverviewProducts[categoryId];
  if (!Array.isArray(selected)) return availableIds;
  return availableIds.filter((productId) => selected.includes(productId));
}

function renderCategoryProductSelector(categoryId, products) {
  const selectedIds = categoryOverviewSelectedProductIds(categoryId, products);
  const hasExplicitSelection = Array.isArray(state.categoryOverviewProducts[categoryId]);
  const checkedIds = selectedIds;
  const allSelected = !hasExplicitSelection || selectedIds.length === products.length;
  const groups = overviewProductGroups(categoryId, products);
  return `
    <details class="category-product-selector category-contribution-product-selector">
      <summary title="Choose chargers" aria-label="Choose chargers">
        <span class="charger-selector-icon" aria-hidden="true"></span>
        <span>Products</span>
        <small>${allSelected ? "All" : `${selectedIds.length}/${products.length}`}</small>
      </summary>
      <div class="category-product-menu">
        <button
          class="category-product-all"
          type="button"
          data-action="category-overview-product-all"
          data-category-id="${escapeAttr(categoryId)}"
          aria-pressed="${allSelected}"
        >
          <span class="category-product-check ${allSelected ? "is-checked" : ""}" aria-hidden="true"></span>
          <span class="category-product-all-icon" aria-hidden="true"></span>
          <span>All products</span>
        </button>
        ${groups.map((group) => `
          <section class="category-product-group">
            <h4>${escapeHtml(group.label)}</h4>
            ${group.products.map((product) => `
              <label>
                <input
                  type="checkbox"
                  data-action="category-overview-product"
                  data-category-id="${escapeAttr(categoryId)}"
                  value="${escapeAttr(product.id)}"
                  ${checkedIds.includes(product.id) ? "checked" : ""}
                >
                <img
                  src="${escapeAttr(productImageItems(product)[0]?.src || "")}"
                  alt=""
                  loading="lazy"
                >
                <span>${escapeHtml(product.name)}</span>
              </label>
            `).join("")}
          </section>
        `).join("")}
      </div>
    </details>
  `;
}

function overviewProductGroups(categoryId, products) {
  if (categoryId === "power_overall") {
    return data.catalog.categories.map((category) => ({
      label: category.label,
      products: products.filter((product) => product.categoryId === category.id),
    })).filter((group) => group.products.length);
  }
  return [
    { label: "65W Chargers", products: products.filter((product) => Number(product.attributes?.wattage || 0) < 100) },
    { label: "100W+ Chargers", products: products.filter((product) => Number(product.attributes?.wattage || 0) >= 100) },
  ].filter((group) => group.products.length);
}

function overviewProductsForCategory(categoryId) {
  return categoryId === "power_overall"
    ? data.catalog.products
    : data.catalog.products.filter((product) => product.categoryId === categoryId);
}

function categoryTrendSelectedProductIds(categoryId, products) {
  const availableIds = products.map((product) => product.id);
  const selected = state.categoryTrendProducts[categoryId];
  if (!Array.isArray(selected)) return availableIds;
  return availableIds.filter((productId) => selected.includes(productId));
}

function defaultCategoryTrendPeriods(periods) {
  const start = periods.indexOf("FY2526 Q1");
  return start >= 0 ? periods.slice(start) : periods;
}

function renderQuarterComparisonPanel(categoryId, panel) {
  const option = categoryOverviewMetricOption(categoryId, panel);
  const expanded = state.expandedTrendChart === "quarter";
  return `
    <article class="performance-trend-panel quarter-comparison-panel ${expanded ? "is-chart-expanded" : ""}">
      <header>
        <div><span>${escapeHtml(option.label)}</span><h3>Quarter Comparison <small>YoY</small></h3></div>
        <div class="performance-trend-controls">
          ${expanded ? renderTrendSharedControls(categoryId, overviewProductsForCategory(categoryId), panel, true) : ""}
          ${renderOverviewExpandButton("quarter", "quarter comparison")}
        </div>
      </header>
      <div id="quarterComparisonPlot" class="quarter-comparison-plot" aria-label="FY2526 and FY2627 quarter comparison"></div>
    </article>
  `;
}

function renderTrendSharedControls(categoryId, products, panel, quarterOnly = false) {
  const productIds = new Set(products.map((product) => product.id));
  const geos = [...new Set((data.geoMetrics || []).filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => row.geo || "Unassigned"))].sort();
  const selectedGeos = Array.isArray(state.categoryTrendGeos[categoryId]) ? state.categoryTrendGeos[categoryId] : [];
  const allGeos = selectedGeos.length === 0;
  const availablePeriods = sortedPeriods([...new Set(data.productMetrics.filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => `${row.fiscalYear} ${row.fiscalQuarter}`))]);
  const storedPeriods = state.categoryTrendPeriods[categoryId];
  const selectedPeriods = Array.isArray(storedPeriods) ? availablePeriods.filter((period) => storedPeriods.includes(period)) : defaultCategoryTrendPeriods(availablePeriods);
  const allPeriodsSelected = selectedPeriods.length === availablePeriods.length;
  return `
    ${renderCategorySegmentControl(categoryId, panel)}
    ${quarterOnly ? "" : `<details class="category-time-multi-selector" ${state.categoryTrendPeriodMenuOpen ? "open" : ""}>
      <summary aria-label="Choose comparison periods" title="Choose comparison periods"><span class="time-selector-icon" aria-hidden="true"></span><span>Time</span><small>${selectedPeriods.length === availablePeriods.length ? "All" : `${selectedPeriods.length}/${availablePeriods.length}`}</small></summary>
      <div class="category-time-multi-menu">
        <button type="button" data-action="category-trend-period-all" data-category-id="${escapeAttr(categoryId)}" aria-pressed="${allPeriodsSelected}"><span class="category-product-check ${allPeriodsSelected ? "is-checked" : ""}" aria-hidden="true"></span><span>All periods</span></button>
        ${availablePeriods.map((period) => `<label><input type="checkbox" data-action="category-trend-period" data-category-id="${escapeAttr(categoryId)}" value="${escapeAttr(period)}" ${selectedPeriods.includes(period) ? "checked" : ""}><span>${escapeHtml(period)}</span></label>`).join("")}
      </div>
    </details>`}
    <details class="category-geo-multi-selector" ${state.categoryTrendGeoMenuOpen ? "open" : ""}>
      <summary aria-label="Choose trend geos"><span class="geo-globe-icon" aria-hidden="true"></span><span>${allGeos ? "All Geos" : `${selectedGeos.length} Geos`}</span><small>⌄</small></summary>
      <div class="category-geo-multi-menu">
        <button type="button" data-action="category-trend-geo-all" data-category-id="${escapeAttr(categoryId)}" aria-pressed="${allGeos}"><span class="category-product-check ${allGeos ? "is-checked" : ""}" aria-hidden="true"></span><span>All Geos</span></button>
        ${geos.map((geo) => `<label><input type="checkbox" data-action="category-trend-geo" data-category-id="${escapeAttr(categoryId)}" value="${escapeAttr(geo)}" ${selectedGeos.includes(geo) ? "checked" : ""}><span>${escapeHtml(displayLocationLabel(geo))}</span></label>`).join("")}
      </div>
    </details>
    ${state.productId ? renderDetailPnSelector(panel) : renderCategoryTrendProductSelector(categoryId, products)}
    ${renderCategoryTrendModeControl(categoryId, quarterOnly)}
    ${renderCategoryMetricSettings(categoryId, panel)}
  `;
}

function categoryTrendMode(categoryId) {
  return ["breakdown", "stacked"].includes(state.categoryTrendMode[categoryId]) ? state.categoryTrendMode[categoryId] : "overall";
}

function quarterComparisonStateKey(categoryId) {
  return state.productId ? `${categoryId}:${state.productId}` : categoryId;
}

function quarterComparisonMode(categoryId) {
  const mode = state.quarterComparisonMode[quarterComparisonStateKey(categoryId)];
  return mode === "overall" ? "overall" : "stacked";
}

function renderCategoryTrendModeControl(categoryId, quarterOnly = false) {
  const mode = quarterOnly ? quarterComparisonMode(categoryId) : categoryTrendMode(categoryId);
  const action = quarterOnly ? "quarter-comparison-mode" : "category-trend-mode";
  return `
    <div class="category-trend-mode ${quarterOnly ? "is-quarter-only" : ""}" role="group" aria-label="Trend display mode">
      <button
        class="${mode === "overall" ? "is-active" : ""}"
        type="button"
        data-action="${action}"
        data-category-id="${escapeAttr(categoryId)}"
        data-trend-mode="overall"
        title="Single bars: sum selected products and geos"
        aria-label="Show selected products as summed bars"
        aria-pressed="${mode === "overall"}"
      >
        <span class="trend-mode-icon trend-mode-icon-single-bars" aria-hidden="true"><i></i></span>
        ${quarterOnly ? `<span class="quarter-mode-label">Total</span>` : ""}
      </button>
      <button
        class="${mode === "stacked" ? "is-active" : ""}"
        type="button"
        data-action="${action}"
        data-category-id="${escapeAttr(categoryId)}"
        data-trend-mode="stacked"
        title="Stacked bars: show every selected product"
        aria-label="Show product data as stacked bars"
        aria-pressed="${mode === "stacked"}"
      >
        <span class="trend-mode-icon trend-mode-icon-stacked" aria-hidden="true"><i></i><i></i><i></i></span>
        ${quarterOnly ? `<span class="quarter-mode-label">Layered</span>` : ""}
      </button>
      ${quarterOnly ? "" : `<button
        class="${mode === "breakdown" ? "is-active" : ""}"
        type="button"
        data-action="category-trend-mode"
        data-category-id="${escapeAttr(categoryId)}"
        data-trend-mode="breakdown"
        title="Multiple lines: compare selected products or geos"
        aria-label="Show selected products as multiple lines"
        aria-pressed="${mode === "breakdown"}"
      >
        <span class="trend-mode-icon trend-mode-icon-breakdown" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>`}
    </div>
  `;
}

function renderCategoryTrendProductSelector(categoryId, products) {
  const selectedIds = categoryTrendSelectedProductIds(categoryId, products);
  const hasExplicitSelection = Array.isArray(state.categoryTrendProducts[categoryId]);
  const checkedIds = hasExplicitSelection ? selectedIds : products.map((product) => product.id);
  const allSelected = selectedIds.length === products.length;
  const groups = overviewProductGroups(categoryId, products);
  return `
    <details class="category-product-selector category-trend-product-selector" ${state.categoryTrendProductSelectorOpen ? "open" : ""}>
      <summary title="Choose products" aria-label="Choose products">
        <span class="charger-selector-icon" aria-hidden="true"></span>
        <span>Products</span>
        <small>${allSelected ? "All" : `${selectedIds.length}/${products.length}`}</small>
      </summary>
      <div class="category-product-menu">
        <button
          class="category-product-all"
          type="button"
          data-action="category-trend-product-all"
          data-category-id="${escapeAttr(categoryId)}"
          aria-pressed="${allSelected}"
        >
          <span class="category-product-check ${allSelected ? "is-checked" : ""}" aria-hidden="true"></span>
          <span class="category-product-all-icon" aria-hidden="true"></span>
          <span>All products</span>
        </button>
        ${groups.map((group) => `
          <section class="category-product-group">
            <h4>${escapeHtml(group.label)}</h4>
            ${group.products.map((product) => `
              <label>
                <input
                  type="checkbox"
                  data-action="category-trend-product"
                  data-category-id="${escapeAttr(categoryId)}"
                  value="${escapeAttr(product.id)}"
                  ${checkedIds.includes(product.id) ? "checked" : ""}
                >
                <img
                  src="${escapeAttr(productImageItems(product)[0]?.src || "")}"
                  alt=""
                  loading="lazy"
                >
                <span>${escapeHtml(product.name)}</span>
              </label>
            `).join("")}
          </section>
        `).join("")}
      </div>
    </details>
  `;
}

function renderPerformanceRevenueTrendPanel(categoryId, products, panel) {
  const option = categoryOverviewMetricOption(categoryId, panel);
  const metricTitle = option.kind === "quantity" ? "Quantity" : "Revenue";
  const productIds = new Set(products.map((product) => product.id));
  const geos = [...new Set((data.geoMetrics || []).filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => row.geo || "Unassigned"))].sort();
  const selectedGeos = Array.isArray(state.categoryTrendGeos[categoryId]) ? state.categoryTrendGeos[categoryId] : [];
  const allGeos = selectedGeos.length === 0;
  const availablePeriods = sortedPeriods([...new Set(data.productMetrics.filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => `${row.fiscalYear} ${row.fiscalQuarter}`))]);
  const storedPeriods = state.categoryTrendPeriods[categoryId];
  const selectedPeriods = Array.isArray(storedPeriods) ? availablePeriods.filter((period) => storedPeriods.includes(period)) : defaultCategoryTrendPeriods(availablePeriods);
  const allPeriodsSelected = selectedPeriods.length === availablePeriods.length;
  const selectedProductIds = categoryTrendSelectedProductIds(categoryId, products);
  const selectedProducts = products.filter((product) => selectedProductIds.includes(product.id));
  const trendSeries = state.productId
    ? detailSelectedPns(panel).map((pn) => ({ id: pn, label: pn, matches: (row) => row.partNumber === pn }))
    : selectedProducts.map((product) => ({ id: product.id, label: product.name, matches: (row) => row.modelId === product.id }));
  const rankingRows = (selectedGeos.length ? (data.geoMetrics || []) : data.productMetrics).filter((row) =>
    categoryMatchesOverview(row, categoryId)
    && selectedProductIds.includes(row.modelId)
    && rowMatchesCategorySegment(row, categoryOverviewSegment(categoryId, panel))
    && (selectedGeos.length === 0 || selectedGeos.includes(row.geo || "Unassigned")),
  );
  const rankedSeries = [...trendSeries].sort((a, b) => {
    const total = (item) => rankingRows.filter(item.matches).reduce((sum, row) => sum + Number(row[option.field] || 0), 0);
    return total(b) - total(a);
  });
  const visibleKey = state.productId ? `${categoryId}:${state.productId}` : categoryId;
  const visibleStored = state.categoryTrendVisibleSeries[visibleKey];
  const visibleSeries = Array.isArray(visibleStored) ? trendSeries.filter((item) => visibleStored.includes(item.id)).map((item) => item.id) : (rankedSeries[0] ? [rankedSeries[0].id] : []);
  const showSeriesLegend = categoryTrendMode(categoryId) === "breakdown" && selectedGeos.length <= 1;
  const seriesSegment = (item) => {
    const segmentTotals = ["Consumer", "Commercial"].map((segment) => ({
      segment,
      value: rankingRows.filter((row) => row.segment === segment && item.matches(row)).reduce((sum, row) => sum + Number(row[option.field] || 0), 0),
    }));
    return segmentTotals.sort((a, b) => b.value - a.value)[0]?.segment || "Commercial";
  };
  const renderTrendSeriesOption = (item, index) => `
    <label>
      <input type="checkbox" data-action="trend-series-product" data-category-id="${escapeAttr(categoryId)}" value="${escapeAttr(item.id)}" ${visibleSeries.includes(item.id) ? "checked" : ""}>
      <span class="trend-series-swatch" style="--series-color:${palette[index % palette.length]}"></span>
      <span>${escapeHtml(item.label)}</span>
    </label>
  `;
  const expanded = state.expandedTrendChart === "trend";
  return `
    <article class="performance-trend-panel ${expanded ? "is-chart-expanded" : ""}">
      <header>
        <div>
          <span>${escapeHtml(option.label)}</span>
          <h3>${escapeHtml(overviewScopeLabel(categoryId))} ${metricTitle} Trend <small>w/o DIB</small></h3>
        </div>
        <div class="performance-trend-controls">
          ${renderTrendSharedControls(categoryId, products, panel)}
          ${renderOverviewExpandButton("trend", "revenue trend")}
        </div>
      </header>
      <div class="trend-plot-layout ${showSeriesLegend ? "has-series-filter" : ""}">
      <div id="performanceRevenueTrendPlot" class="performance-revenue-trend-plot" aria-label="${escapeAttr(overviewScopeLabel(categoryId))} ${metricTitle.toLowerCase()} trend"></div>
        ${showSeriesLegend ? `
          <aside class="trend-series-filter" aria-label="Trend product legend">
            <label class="trend-series-all"><input type="checkbox" data-action="trend-series-all" data-category-id="${escapeAttr(categoryId)}" ${visibleSeries.length === trendSeries.length ? "checked" : ""}> <strong>All</strong></label>
            ${state.productId ? `<div class="trend-series-segment-columns">
              ${["Consumer", "Commercial"].map((segment) => `<section><h4>${segment}</h4>${trendSeries.map((item, index) => ({ item, index })).filter(({ item }) => seriesSegment(item) === segment).map(({ item, index }) => renderTrendSeriesOption(item, index)).join("") || `<p>No PN</p>`}</section>`).join("")}
            </div>` : trendSeries.map(renderTrendSeriesOption).join("")}
          </aside>
        ` : ""}
      </div>
    </article>
  `;
}

function parseFiscalPeriodLabel(period) {
  const match = String(period || "").match(/^(FY\d{4})(?:\s+(Q[1-4]))?$/);
  return match ? { fiscalYear: match[1], fiscalQuarter: match[2] || null } : null;
}

function priorFiscalYear(fiscalYear) {
  const match = String(fiscalYear || "").match(/^FY(\d{4})$/);
  if (!match) return fiscalYear;
  return `FY${String(Number(match[1]) - 101).padStart(4, "0")}`;
}

function previousFiscalQuarterPeriod(period) {
  const parsed = parseFiscalPeriodLabel(period);
  if (!parsed?.fiscalQuarter) return null;
  const quarter = Number(parsed.fiscalQuarter.slice(1));
  if (quarter > 1) return `${parsed.fiscalYear} Q${quarter - 1}`;
  return `${priorFiscalYear(parsed.fiscalYear)} Q4`;
}

function availableCategoryQuarters(categoryId, products, fiscalYear) {
  const productIds = new Set(products.map((product) => product.id));
  return [...new Set(data.productMetrics
    .filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId) && row.fiscalYear === fiscalYear)
    .map((row) => row.fiscalQuarter))]
    .filter(Boolean)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

function categoryPerformancePeriod(categoryId, products) {
  if (state.granularity === "month") {
    const dates = state.selectedCategoryMonths || [];
    const date = dates.at(-1);
    const priorDates = dates.map((item) => `${Number(item.slice(0, 4)) - 1}${item.slice(4)}`);
    const currentMeta = date ? fiscalMetaForDate(`${date}-01`) : null;
    const priorMeta = priorDates.at(-1) ? fiscalMetaForDate(`${priorDates.at(-1)}-01`) : null;
    return {
      fiscalYear: currentMeta?.fiscalYear,
      priorYear: priorMeta?.fiscalYear,
      quarters: currentMeta?.fiscalQuarter ? [currentMeta.fiscalQuarter] : [],
      currentDates: dates,
      priorDates,
      label: dates.length === 1 ? dates[0] : `${dates.length} months selected`,
      priorLabel: priorDates.length === 1 ? priorDates[0] : `${priorDates.length} prior-year months`,
    };
  }
  if (state.granularity === "quarter") {
    const selected = ensureSelectedCategoryPeriods();
    const parsed = selected.map(parseFiscalPeriodLabel).filter(Boolean);
    const fiscalYear = parsed.at(-1)?.fiscalYear || parseFiscalPeriodLabel(selectedPeriod())?.fiscalYear;
    const quarters = [...new Set(parsed
      .filter((period) => period.fiscalYear === fiscalYear)
      .map((period) => period.fiscalQuarter))]
      .filter(Boolean)
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    const priorYear = priorFiscalYear(fiscalYear);
    const quarterText = quarters.join(" + ");
    return {
      fiscalYear,
      priorYear,
      quarters,
      currentDates: null,
      priorDates: null,
      label: `${fiscalYear} ${quarterText}`,
      priorLabel: `${priorYear} ${quarterText}`,
    };
  }

  const fiscalYear = (state.selectedCategoryYears || []).at(-1) || selectedPeriod();
  const priorYear = priorFiscalYear(fiscalYear);
  const quarters = availableCategoryQuarters(categoryId, products, fiscalYear);
  const isCompleteYear = ["Q1", "Q2", "Q3", "Q4"].every((quarter) => quarters.includes(quarter));
  return {
    fiscalYear,
    priorYear,
    quarters,
    currentDates: null,
    priorDates: null,
    label: isCompleteYear ? fiscalYear : `${fiscalYear} YTD`,
    priorLabel: isCompleteYear ? priorYear : `${priorYear} YTD`,
  };
}

function categoryOverviewRows(categoryId, productIds, fiscalYear, quarters) {
  return data.productMetrics.filter((row) =>
    categoryMatchesOverview(row, categoryId)
    && productIds.includes(row.modelId)
    && row.fiscalYear === fiscalYear
    && quarters.includes(row.fiscalQuarter),
  );
}

function categoryOverviewRowsForPeriod(categoryId, productIds, period, prior = false, sourceRows = data.productMetrics) {
  const dates = prior ? period.priorDates : period.currentDates;
  if (dates?.length) {
    return sourceRows.filter((row) => categoryMatchesOverview(row, categoryId)
      && productIds.includes(row.modelId)
      && rowMatchesActiveDetailPn(row)
      && dates.includes(row.date.slice(0, 7)));
  }
  const fiscalYear = prior ? period.priorYear : period.fiscalYear;
  return sourceRows.filter((row) => categoryMatchesOverview(row, categoryId)
    && productIds.includes(row.modelId)
    && rowMatchesActiveDetailPn(row)
    && row.fiscalYear === fiscalYear
    && period.quarters.includes(row.fiscalQuarter));
}

function categoryMetricHasData(rows, field) {
  return rows.some((row) =>
    Object.prototype.hasOwnProperty.call(row, field)
    && Number.isFinite(Number(row[field]))
    && Number(row[field]) !== 0,
  );
}

function categoryMetricTotal(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function categoryMetricDisplay(value, available = true, option = categoryOverviewMetricOptions[0]) {
  if (!available) return "blank *";
  return option.kind === "quantity" ? fmtExactNumber(value) : formatCategoryRevenueM(value);
}

function categoryMetricTrend(current, prior, available = true) {
  if (!available) return `<span class="is-blank">blank *</span>`;
  if (!prior) return current ? `<span class="is-new">New</span>` : `<span class="is-flat">0.0%</span>`;
  const change = (current - prior) / Math.abs(prior);
  const trendClass = change >= 0 ? "is-up" : "is-down";
  return `<span class="${trendClass}">${formatSignedPercent(change)} ${change >= 0 ? "↑" : "↓"}</span>`;
}

function renderPerformanceRevenuePanel(categoryId, products, panel, period) {
  const option = categoryOverviewMetricOption(categoryId, panel);
  const metricTitle = option.kind === "quantity" ? "Quantity" : "Revenue";
  const productIds = products.map((product) => product.id);
  const segment = categoryOverviewSegment(categoryId, panel);
  const currentRows = categoryOverviewRowsForPeriod(categoryId, productIds, period).filter((row) => rowMatchesCategorySegment(row, segment));
  const priorRows = categoryOverviewRowsForPeriod(categoryId, productIds, period, true).filter((row) => rowMatchesCategorySegment(row, segment));
  const available = categoryMetricHasData(currentRows, option.field);
  const current = categoryMetricTotal(currentRows, option.field);
  const prior = categoryMetricTotal(priorRows, option.field);
  return `
    <article class="performance-revenue-panel">
      <header>
        <div>
          <span>${escapeHtml(option.label)}</span>
          <h3>${escapeHtml(overviewScopeLabel(categoryId))} ${metricTitle} <small>w/o DIB</small></h3>
        </div>
        <div class="performance-panel-controls">${renderCategorySegmentControl(categoryId, panel)}${renderCategoryMetricSettings(categoryId, panel)}</div>
      </header>
      <div class="performance-comparison-body">
        <div class="performance-period-heading">
          <span>${escapeHtml(period.label)}</span>
          ${categoryMetricTrend(current, prior, available)}
        </div>
        <div class="performance-comparison-values">
          <section>
            <small>Current</small>
            <strong>${categoryMetricDisplay(current, available, option)}</strong>
          </section>
          <section>
            <small>${escapeHtml(period.priorLabel)}</small>
            <strong>${categoryMetricDisplay(prior, available, option)}</strong>
          </section>
        </div>
      </div>
    </article>
  `;
}

function renderPerformanceContributionPanel(categoryId, products, panel, period) {
  const option = categoryOverviewMetricOption(categoryId, panel);
  const metricTitle = option.kind === "quantity" ? "Quantity" : "Revenue";
  const productIds = new Set(products.map((product) => product.id));
  const geos = [...new Set((data.geoMetrics || [])
    .filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId))
    .map((row) => row.geo || "Unassigned"))]
    .sort((a, b) => displayLocationLabel(a).localeCompare(displayLocationLabel(b)));
  const selectedGeo = state.categoryContributionGeo[categoryId] || "all";
  const selectedSegment = categoryOverviewSegment(categoryId, panel);
  return `
    <article class="performance-contribution-panel ${state.expandedTrendChart === "contribution" ? "is-chart-expanded" : ""}">
      <header>
        <div>
          <span>${escapeHtml(option.label)}</span>
          <h3>${escapeHtml(overviewScopeLabel(categoryId))} ${metricTitle} Contribution <small>w/o DIB</small></h3>
          <p>${escapeHtml(period.label)}</p>
        </div>
        <div class="performance-contribution-controls">
          ${renderCategorySegmentControl(categoryId, panel)}
          <label class="performance-contribution-geo-select has-geo-icon">
            <span class="geo-globe-icon" aria-hidden="true"></span>
            <select data-action="category-contribution-geo" data-category-id="${escapeAttr(categoryId)}" aria-label="Contribution Geo">
              <option value="all" ${selectedGeo === "all" ? "selected" : ""}>All Geos</option>
              ${geos.map((geo) => `<option value="${escapeAttr(geo)}" ${selectedGeo === geo ? "selected" : ""}>${escapeHtml(displayLocationLabel(geo))}</option>`).join("")}
            </select>
          </label>
          ${renderCategoryProductSelector(categoryId, products)}
          ${renderCategoryMetricSettings(categoryId, panel)}
          ${renderOverviewExpandButton("contribution", "products contribution")}
        </div>
      </header>
      <div id="performanceContributionPlot" class="performance-contribution-plot" aria-label="${escapeAttr(overviewScopeLabel(categoryId))} ${metricTitle.toLowerCase()} contribution"></div>
    </article>
  `;
}

function productRevenueRanking(categoryId, products, field, period, geo = "all", segment = "all") {
  return products.map((product) => {
    const sourceRows = geo === "all" ? data.productMetrics : (data.geoMetrics || []).filter((row) => (row.geo || "Unassigned") === geo);
    const rowsFor = (prior) => categoryOverviewRowsForPeriod(categoryId, [product.id], period, prior, sourceRows)
      .filter((row) => segment === "all" || row.segment === segment);
    const currentRows = rowsFor(false);
    const priorRows = rowsFor(true);
    return {
      product,
      current: categoryMetricTotal(currentRows, field),
      prior: categoryMetricTotal(priorRows, field),
      available: categoryMetricHasData(currentRows, field),
    };
  })
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return (b.current - a.current) || a.product.name.localeCompare(b.product.name);
    });
}

function renderPerformanceRanking(categoryId, products, panel, title, period) {
  const option = categoryOverviewMetricOption(categoryId, panel);
  const rows = productRevenueRanking(
    categoryId,
    products,
    option.field,
    period,
    state.categoryRankingGeo[categoryId] || "all",
    categoryOverviewSegment(categoryId, panel),
  );
  const productIds = new Set(products.map((product) => product.id));
  const geos = [...new Set((data.geoMetrics || []).filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => row.geo || "Unassigned"))].sort();
  const selectedGeo = state.categoryRankingGeo[categoryId] || "all";
  return `
    <article class="performance-ranking-panel">
      <header>
        <div>
          <h3>${escapeHtml(title)}</h3>
          <span>${escapeHtml(option.label)} · ${escapeHtml(period.label)}</span>
        </div>
        <div class="performance-ranking-controls">
          ${renderCategorySegmentControl(categoryId, panel)}
          <label class="performance-contribution-geo-select has-geo-icon">
            <span class="geo-globe-icon" aria-hidden="true"></span>
            <select data-action="category-ranking-geo" data-category-id="${escapeAttr(categoryId)}" aria-label="Ranking Geo">
              <option value="all" ${selectedGeo === "all" ? "selected" : ""}>All Geos</option>
              ${geos.map((geo) => `<option value="${escapeAttr(geo)}" ${selectedGeo === geo ? "selected" : ""}>${escapeHtml(displayLocationLabel(geo))}</option>`).join("")}
            </select>
          </label>
          ${renderCategoryMetricSettings(categoryId, panel)}
        </div>
      </header>
      <div class="performance-ranking-list" tabindex="0">
        ${rows.length ? rows.map((row, index) => `
          <div
            class="performance-ranking-row"
            role="button"
            tabindex="0"
            data-route-category="${escapeAttr(row.product.categoryId)}"
            data-route-product="${escapeAttr(row.product.id)}"
          >
            <span class="performance-rank">${index + 1}</span>
            <div class="performance-rank-product">
              <strong>${escapeHtml(row.product.name)}</strong>
              <small>vs ${escapeHtml(period.priorLabel)}</small>
            </div>
            <figure class="performance-rank-image">
              <img
                src="${escapeAttr(productImageItems(row.product)[0]?.src || "")}"
                alt="${escapeAttr(row.product.name)}"
                loading="lazy"
              />
            </figure>
            <span class="performance-rank-value">
              <small>${escapeHtml(period.label)}</small>
              <strong>${categoryMetricDisplay(row.current, row.available, option)}</strong>
            </span>
            <span class="performance-rank-value performance-rank-prior">
              <small>${escapeHtml(period.priorLabel)}</small>
              <strong>${categoryMetricDisplay(row.prior, row.available, option)}</strong>
            </span>
            <span class="performance-rank-trend">${categoryMetricTrend(row.current, row.prior, row.available)}</span>
            <button
              class="ghost-button compact-button performance-detail-button"
              type="button"
              data-route-category="${escapeAttr(row.product.categoryId)}"
              data-route-product="${escapeAttr(row.product.id)}"
            >Details</button>
          </div>
        `).join("") : `<div class="performance-ranking-empty">blank *</div>`}
      </div>
    </article>
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
  const query = state.search.trim().toLowerCase();
  const visibleProducts = data.catalog.products.filter((product) =>
    product.categoryId === categoryId
    && (!query || `${product.name} ${product.shortName || ""}`.toLowerCase().includes(query)),
  );
  return `
    <div class="view-stack">
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
  const productRows = data.productMetrics.filter((row) => row.modelId === product.id);
  const fiscalYears = [...new Set(productRows.map((row) => row.fiscalYear).filter(Boolean))].sort((a, b) => periodSortValue(a) - periodSortValue(b));
  const currentYear = fiscalYears.at(-1) || "FY2627";
  const priorYear = priorFiscalYear(currentYear);
  const currentQuarters = [...new Set(productRows.filter((row) => row.fiscalYear === currentYear).map((row) => row.fiscalQuarter).filter(Boolean))];
  const currentSummary = summarizeProductRows(productRows.filter((row) => row.fiscalYear === currentYear && currentQuarters.includes(row.fiscalQuarter)));
  const priorSummary = summarizeProductRows(productRows.filter((row) => row.fiscalYear === priorYear && currentQuarters.includes(row.fiscalQuarter)));
  const images = productImageItems(product);
  const period = categoryPerformancePeriod(product.categoryId, [product]);
  const selectedCurrentRows = hasActiveGlobalTime() ? categoryOverviewRowsForPeriod(product.categoryId, [product.id], period) : [];
  const selectedPriorRows = hasActiveGlobalTime() ? categoryOverviewRowsForPeriod(product.categoryId, [product.id], period, true) : [];
  const kpis = hasActiveGlobalTime() ? [
    { label: "Revenue", currentLabel: `${currentYear} YTD`, priorLabel: `${priorYear} YTD`, current: Number(currentSummary.shipRevenue || 0), prior: Number(priorSummary.shipRevenue || 0) },
    { label: "Revenue", currentLabel: period.label, priorLabel: period.priorLabel, current: categoryKpiAmount(selectedCurrentRows), prior: categoryKpiAmount(selectedPriorRows) },
  ] : [];
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
        </div>
        <div class="product-card-body">
          <h3>${escapeHtml(product.name)}</h3>
          <div class="product-ytd-kpis">
            ${kpis.map((kpi) => `
              <section class="product-ytd-kpi">
                <header><span>${kpi.label}</span>${categoryMetricTrend(kpi.current, kpi.prior, true)}</header>
                <div>
                  <section><small>${escapeHtml(kpi.currentLabel)}</small><strong>${formatCategoryRevenueM(kpi.current)}</strong></section>
                  <section><small>${escapeHtml(kpi.priorLabel)}</small><strong>${formatCategoryRevenueM(kpi.prior)}</strong></section>
                </div>
              </section>
            `).join("")}
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

function displayCountryShortLabel(value) {
  const label = displayLocationLabel(value);
  const aliases = {
    Spain: "ES", Poland: "PL", France: "FR", Germany: "DE", Italy: "IT",
    Netherlands: "NL", Portugal: "PT", Sweden: "SE", Israel: "IL", Slovakia: "SK",
    Czechia: "CZ", Lithuania: "LT", Romania: "RO", Denmark: "DK", Switzerland: "CH",
    Finland: "FI", Belgium: "BE", Hungary: "HU", Ukraine: "UA", Croatia: "HR",
    Greece: "GR", Slovenia: "SI", Bulgaria: "BG", Latvia: "LV", Ireland: "IE",
    "Bosnia and Herzegovina": "BA", Serbia: "RS", Austria: "AT", Georgia: "GE",
    Cyprus: "CY", Azerbaijan: "AZ", Norway: "NO", Kazakhstan: "KZ",
    "North Macedonia": "MK", Estonia: "EE",
  };
  return aliases[label] || label;
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
  const requestedForecastYear = Number(trend.forecastStartYear);
  const forecastStart = years.findIndex((year) => year >= requestedForecastYear);
  const forecastBoundaryIndex = forecastStart > 0 ? forecastStart : Math.min(1, years.length - 1);
  const labelIndexes = new Set([
    Math.max(0, forecastBoundaryIndex - 1),
    forecastBoundaryIndex,
    Math.min(years.length - 1, forecastBoundaryIndex + 1),
    years.length - 1,
  ]);
  const labels = years.map((year, index) => labelIndexes.has(index) ? (items[index].valueLabel || `$${values[index].toFixed(2)}B`).replace("*", "") : "");
  const growthLabelIndexes = new Set([Math.max(1, forecastBoundaryIndex - 1), forecastBoundaryIndex]);
  const growthLabels = years.map((year, index) => growthLabelIndexes.has(index) && Number.isFinite(growth[index]) ? `${growth[index].toFixed(2)}%` : "");
  const finiteGrowth = growth.filter(Number.isFinite);
  const maxValue = Math.max(...values, 1);
  const minGrowth = Math.min(...finiteGrowth, 0);
  const maxGrowth = Math.max(...finiteGrowth, 1);
  const growthPadding = Math.max(0.6, (maxGrowth - minGrowth) * 0.14);
  const forecastBoundary = forecastBoundaryIndex > 0
    ? (years[forecastBoundaryIndex - 1] + years[forecastBoundaryIndex]) / 2
    : years[0] - 0.5;
  const shapes = forecastBoundaryIndex >= 0
    ? [{
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: forecastBoundary,
        x1: years.at(-1) + 0.5,
        y0: 0,
        y1: 1,
        fillcolor: "rgba(226, 35, 26, 0.055)",
        line: { width: 0 },
        layer: "below",
      }, {
        type: "line",
        xref: "x",
        yref: "paper",
        x0: forecastBoundary,
        x1: forecastBoundary,
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
        marker: { color: years.map((year, index) => index < forecastBoundaryIndex ? "#e97d78" : "#efb0aa") },
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
      margin: { l: 58, r: 68, t: 46, b: 54 },
      barmode: "group",
      shapes,
      xaxis: { title: "Year", type: "linear", tickmode: "array", tickvals: years, ticktext: years.map(String), range: [years[0] - 0.5, years.at(-1) + 0.5], dtick: 1 },
      yaxis: { title: "Market Size", ticksuffix: "B", tickprefix: "$", range: [0, maxValue * 1.13] },
      yaxis2: { title: "YoY Growth", ticksuffix: "%", overlaying: "y", side: "right", showgrid: false, zeroline: true, zerolinecolor: "#1f2328", zerolinewidth: 1, range: [minGrowth - growthPadding, maxGrowth + growthPadding] },
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
  const valuesArePercentages = items.every((item) => /%\s*$/.test(String(item.valueLabel || "")));
  const pieDomain = hasSideLegend
    ? { x: chart.legendSide === "right" ? [0.16, 1] : [0.08, 0.92], y: [0.04, 0.96] }
    : { x: [0, 1], y: [0, 1] };
  const centerX = (pieDomain.x[0] + pieDomain.x[1]) / 2;
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
      texttemplate: showLabels ? (valuesArePercentages ? "%{text}" : "%{text}<br>%{percent:.1%}") : "",
      hovertext: hoverText,
      hovertemplate: "%{hovertext}<extra></extra>",
      marker: { colors: items.map((_, index) => structureChartColor(index)), line: { color: "#ffffff", width: 2 } },
      automargin: true,
      textfont: { size: items.length > 6 ? 10 : 12, color: "#1f2328" },
      domain: pieDomain,
    }],
    {
      margin: showLabels ? { l: 96, r: 96, t: 78, b: 62 } : { l: 18, r: 18, t: 16, b: 16 },
      showlegend: false,
      hoverlabel: { bgcolor: "#1f2328", font: { color: "#ffffff" } },
      uniformtext: { minsize: 10, mode: "hide" },
      annotations: chart.center ? [{
        x: centerX,
        y: 0.5,
        xref: "paper",
        yref: "paper",
        text: `<b>${escapeHtml(chart.center)}</b>`,
        showarrow: false,
        align: "center",
        font: { size: 18, color: "#5d6673" },
      }] : [],
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
  if (state.marketModule === "compliance") {
    drawComplianceWorldMap(categoryId);
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

function drawComplianceWorldMap(categoryId) {
  const node = document.getElementById("complianceWorldMap");
  if (!node || !window.Plotly) return;
  const reports = complianceReports(categoryId);
  const duplicateCounts = new Map();
  const locations = reports.map((report) => {
    const location = complianceLocation(report);
    const key = `${location.lat}:${location.lon}`;
    const offset = duplicateCounts.get(key) || 0;
    duplicateCounts.set(key, offset + 1);
    return { ...location, lat: location.lat + offset * 1.4, lon: location.lon + offset * 1.8 };
  });
  const selectedIndex = Math.min(state.selectedComplianceIndex[categoryId] || 0, Math.max(0, reports.length - 1));
  Plotly.react(node, [{
    type: "scattergeo",
    mode: "markers+text",
    lat: locations.map((location) => location.lat),
    lon: locations.map((location) => location.lon),
    text: locations.map((location) => location.name),
    textposition: "top center",
    textfont: { size: 10, color: "#374151" },
    customdata: reports.map((report, index) => [index, report.title, report.effectiveDate || "Current"]),
    marker: {
      size: reports.map((_, index) => index === selectedIndex ? 16 : 11),
      color: reports.map((_, index) => index === selectedIndex ? "#e2231a" : "#718096"),
      line: { color: "#ffffff", width: 1.5 },
      opacity: 0.92,
    },
    hovertemplate: "<b>%{customdata[1]}</b><br>%{text}<br>Effective: %{customdata[2]}<extra>Click for details</extra>",
  }], {
    margin: { l: 0, r: 0, t: 8, b: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    geo: {
      projection: { type: "natural earth" },
      showland: true,
      landcolor: "#eef1f5",
      showocean: true,
      oceancolor: "#fafbfd",
      showcountries: true,
      countrycolor: "#cbd2dc",
      coastlinecolor: "#cbd2dc",
      bgcolor: "rgba(0,0,0,0)",
    },
    showlegend: false,
    hoverlabel: { bgcolor: "#1f2328", font: { color: "#ffffff" } },
  }, { displayModeBar: false, responsive: true });
  node.removeAllListeners?.("plotly_click");
  node.on?.("plotly_click", (event) => {
    const index = Number(event.points?.[0]?.customdata?.[0]);
    if (!Number.isInteger(index)) return;
    state.selectedComplianceIndex[categoryId] = index;
    render();
  });
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
    drawGeoShareDonut(id, items, chart.center || "Share", { externalLegend: true });
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

function drawGeoShareDonut(id, items, center, options = {}) {
  const externalLegend = Boolean(options.externalLegend);
  drawPlot(id, [{
    labels: items.map((item) => item.label),
    values: items.map((item) => Number(item.value) || 0),
    type: "pie",
    hole: 0.58,
    sort: false,
    textinfo: externalLegend ? "none" : "label+percent",
    textposition: externalLegend ? "inside" : "outside",
    texttemplate: externalLegend ? undefined : "%{label}<br>%{percent:.0%}",
    marker: { colors: items.map((_, index) => structureChartColor(index)), line: { color: "#ffffff", width: 2 } },
    hovertemplate: "<b>%{label}</b><br>%{value}%<extra></extra>",
    textfont: { size: 12, color: "#1f2328" },
  }], {
    margin: externalLegend ? { l: 18, r: 18, t: 18, b: 18 } : { l: 62, r: 62, t: 24, b: 20 },
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
  if (categoryId === "adapter" && data.competitorDatabase?.products?.length) {
    drawAdapterCompetitiveAnalysis();
    return;
  }
  if (data.competitorDatabase?.products?.length) {
    drawCompetitorDatabaseAnalysis(categoryId);
    return;
  }
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

function adapterBrandColors(brands) {
  return Object.fromEntries(brands.map((brand, index) => [brand, palette[index % palette.length]]));
}

function drawAdapterCompetitiveAnalysis() {
  const powerRows = adapterFilteredRows("power");
  const powerBands = ["65–69W", "70–99W", "100–139W", "140–199W", "≥200W"];
  const powerCounts = powerBands.map((band) => powerRows.filter((row) => competitorPowerBand("adapter", row.advertised_power_w) === band).length);
  drawPlot("adapterPowerPie", [{ labels: powerBands, values: powerCounts, type: "pie", hole: 0.56, textinfo: "label+percent", textposition: "auto", automargin: true, textfont: { size: 12 }, marker: { colors: overviewPalette } }], { showlegend: false, margin: { l: 52, r: 52, t: 42, b: 42 } });
  const powerBrands = [...new Set(powerRows.map((row) => row.brand))].sort();
  drawPlot("adapterPowerBrandBar", powerBands.map((band, index) => ({ y: powerBrands, x: powerBrands.map((brand) => powerRows.filter((row) => row.brand === brand && competitorPowerBand("adapter", row.advertised_power_w) === band).length), name: band, type: "bar", orientation: "h", marker: { color: overviewPalette[index] } })), { barmode: "stack", margin: { l: 128, r: 28, t: 8, b: 58 }, xaxis: { title: "Products" }, yaxis: { autorange: "reversed" }, legend: { orientation: "h", y: -0.18 } });

  const priceRows = adapterFilteredRows("price").filter((row) => row.currency === "USD" && competitorNumber(row.price_min) !== null);
  const heatPower = ["65–69W", "70–99W", "100–139W", "140–199W", "≥200W"];
  const heatPrice = ["<$40", "$40–69", "$70–99", "$100+"];
  drawPlot("adapterPriceHeatmap", [{ z: heatPower.map((power) => heatPrice.map((price) => priceRows.filter((row) => competitorPowerBand("adapter", row.advertised_power_w) === power && adapterPriceBand(row) === price).length)), x: heatPrice, y: heatPower, type: "heatmap", colorscale: [[0, "#fff5f4"], [1, "#e2231a"]], texttemplate: "%{z}", customdata: heatPower.map((power) => heatPrice.map((price) => priceRows.filter((row) => competitorPowerBand("adapter", row.advertised_power_w) === power && adapterPriceBand(row) === price).map((row) => row.brand).filter((value, index, values) => values.indexOf(value) === index).join(", "))), hovertemplate: "%{y}<br>%{x}: %{z} products<br>%{customdata}<extra></extra>" }], { margin: { l: 92, r: 42, t: 12, b: 58 }, xaxis: { title: "Price band (USD)" }, yaxis: { title: "Power band", autorange: "reversed" } });
  const heatPorts = [...new Set(priceRows.map((row) => row.resolvedPorts))].sort((a, b) => a - b);
  drawPlot("adapterPortPriceHeatmap", [{ z: heatPorts.map((port) => heatPrice.map((price) => priceRows.filter((row) => row.resolvedPorts === port && adapterPriceBand(row) === price).length)), x: heatPrice, y: heatPorts.map((port) => `${port} port${port === 1 ? "" : "s"}`), type: "heatmap", colorscale: [[0, "#fff5f4"], [1, "#e2231a"]], texttemplate: "%{z}", customdata: heatPorts.map((port) => heatPrice.map((price) => priceRows.filter((row) => row.resolvedPorts === port && adapterPriceBand(row) === price).map((row) => row.brand).filter((value, index, values) => values.indexOf(value) === index).join(", "))), hovertemplate: "%{y}<br>%{x}: %{z} products<br>%{customdata}<extra></extra>" }], { margin: { l: 84, r: 42, t: 12, b: 58 }, xaxis: { title: "Price band (USD)" }, yaxis: { title: "Port count", autorange: "reversed", automargin: true } });

  const portRows = adapterFilteredRows("port");
  const ports = [...new Set(portRows.map((row) => row.resolvedPorts))].sort((a, b) => a - b);
  drawPlot("adapterPortPie", [{ labels: ports.map((port) => `${port} port${port === 1 ? "" : "s"}`), values: ports.map((port) => portRows.filter((row) => row.resolvedPorts === port).length), type: "pie", hole: 0.56, textinfo: "label+percent", textposition: "auto", automargin: true, textfont: { size: 12 }, marker: { colors: overviewPalette } }], { showlegend: false, margin: { l: 52, r: 52, t: 42, b: 42 } });
  const portBrands = [...new Set(portRows.map((row) => row.brand))].sort();
  drawPlot("adapterPortBrandBar", ports.map((port, index) => ({ x: portBrands, y: portBrands.map((brand) => portRows.filter((row) => row.brand === brand && row.resolvedPorts === port).length), name: `${port} port${port === 1 ? "" : "s"}`, type: "bar", marker: { color: palette[index % palette.length] } })), { barmode: "stack", xaxis: { title: "Brand", tickangle: -35 }, yaxis: { title: "Products" }, legend: { orientation: "h", y: -0.28 } });

  // Brand selection controls the right-hand detail donut only. The left-hand
  // market comparison intentionally remains the full-brand benchmark.
  const scenarioRows = adapterFilteredRows("scenario", { ignoreBrand: true });
  const scenarios = [...new Set(scenarioRows.map((row) => row.scenario))].sort();
  const scenarioBrands = [...new Set(scenarioRows.map((row) => row.brand))].sort();
  drawPlot("adapterScenarioBrandBar", scenarios.map((scenario, index) => ({ x: scenarioBrands, y: scenarioBrands.map((brand) => scenarioRows.filter((row) => row.brand === brand && row.scenario === scenario).length), name: scenario, type: "bar", marker: { color: palette[index % palette.length] } })), { barmode: "stack", margin: { l: 62, r: 24, t: 24, b: scenarioBrands.length > 10 ? 128 : 92 }, xaxis: { title: "Brand", tickangle: scenarioBrands.length > 10 ? -42 : -28, tickfont: { size: scenarioBrands.length > 14 ? 9 : 11 }, automargin: true }, yaxis: { title: "Products", automargin: true }, legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.32 } });
  const selectedScenarioBrand = adapterModuleFilters("scenario").brand;
  const pieBrand = selectedScenarioBrand && selectedScenarioBrand !== "all" ? selectedScenarioBrand : scenarioBrands[0];
  const scenarioPieRows = scenarioRows.filter((row) => row.brand === pieBrand);
  const pieScenarios = [...new Set(scenarioPieRows.map((row) => row.scenario))].sort();
  drawPlot("adapterScenarioPie", [{ labels: pieScenarios, values: pieScenarios.map((scenario) => scenarioPieRows.filter((row) => row.scenario === scenario).length), type: "pie", hole: 0.56, textinfo: "label+percent", textposition: "auto", automargin: true, textfont: { size: 12 }, marker: { colors: palette }, hovertemplate: `${pieBrand}<br>%{label}: %{value} products (%{percent})<extra></extra>` }], { showlegend: false, margin: { l: 52, r: 52, t: 42, b: 42 }, annotations: [{ text: pieBrand, x: 0.5, y: 0.5, showarrow: false, font: { size: 14, color: "#5c6570" } }] });
}

function competitorCount(rows, getter, value) {
  return rows.filter((row) => getter(row) === value).length;
}

function competitorBrandTraces(rows, xField, yField, extraText) {
  return [...new Set(rows.map((row) => row.brand))].sort().map((brand, index) => {
    const brandRows = rows.filter((row) => row.brand === brand && competitorNumber(row[xField]) !== null && competitorNumber(row[yField]) !== null);
    return {
      x: brandRows.map((row) => Number(row[xField])),
      y: brandRows.map((row) => Number(row[yField])),
      text: brandRows.map((row) => `<b>${row.product_name}</b><br>${extraText(row)}`),
      name: brand,
      type: "scatter",
      mode: "markers",
      marker: { size: 10, color: palette[index % palette.length], opacity: 0.74, line: { color: "#ffffff", width: 1 } },
      hovertemplate: "%{text}<extra>%{fullData.name}</extra>",
    };
  }).filter((trace) => trace.x.length);
}

function drawCompetitorDatabaseAnalysis(categoryId) {
  const rows = competitorDbRows(categoryId);
  const currency = "USD";
  const priceRows = rows.filter((row) => competitorNumber(row.price_min) !== null && row.currency === currency);
  if (categoryId === "adapter") drawAdapterCompetitorDatabase(rows, priceRows, currency);
  else if (categoryId === "power_bank") drawPowerBankCompetitorDatabase(rows, priceRows, currency);
  else drawCableCompetitorDatabase(rows, priceRows, currency);
}

function drawAdapterCompetitorDatabase(rows, priceRows, currency) {
  const bands = ["65–69W", "70–99W", "100–139W", "140–199W", "≥200W", "Unknown"];
  drawPlot("competitorDbChart1", [{ x: bands, y: bands.map((band) => competitorCount(rows, (row) => competitorPowerBand("adapter", row.advertised_power_w), band)), type: "bar", marker: { color: redScale } }], { xaxis: { title: "Nominal power band" }, yaxis: { title: "Products" }, showlegend: false });
  drawPlot("competitorDbChart2", competitorBrandTraces(priceRows, "advertised_power_w", "price_min", (row) => `Nominal: ${row.advertised_power_w ?? "—"}W<br>Single-port: ${row.single_usb_c_output_w ?? "Not confirmed"}W<br>${currency} ${Number(row.price_min).toFixed(2)}`), { xaxis: { title: "Nominal Power (W)" }, yaxis: { title: `Price (${currency})` }, legend: { orientation: "h", y: -0.22 } });
  const portCols = ["1", "2", "3", "4", "5+", "Unknown"];
  const portKey = (row) => competitorNumber(row.total_outputs) !== null ? (Number(row.total_outputs) >= 5 ? "5+" : String(Number(row.total_outputs))) : "Unknown";
  drawPlot("competitorDbChart3", [{ z: bands.map((band) => portCols.map((port) => rows.filter((row) => competitorPowerBand("adapter", row.advertised_power_w) === band && portKey(row) === port).length)), x: portCols, y: bands, type: "heatmap", colorscale: [[0, "#fff5f4"], [1, "#e2231a"]], texttemplate: "%{z}", hovertemplate: "%{y}<br>%{x} ports: %{z}<extra></extra>" }], { xaxis: { title: "Port count" }, yaxis: { title: "Power band", autorange: "reversed" } });
  const brands = [...new Set(rows.map((row) => row.brand))].sort();
  const forms = [...new Set(rows.map((row) => row.form_factor || "Unknown"))].sort();
  drawPlot("competitorDbChart4", forms.map((form, index) => ({ x: brands, y: brands.map((brand) => rows.filter((row) => row.brand === brand && (row.form_factor || "Unknown") === form).length), name: form, type: "bar", marker: { color: palette[index % palette.length] } })), { barmode: "stack", xaxis: { title: "Brand", tickangle: -35 }, yaxis: { title: "Products" }, legend: { orientation: "h", y: -0.32 } });
  drawPlot("competitorDbChart5", competitorBrandTraces(priceRows, "advertised_power_w", "price_min", (row) => `${row.form_factor || "Unknown"} · ${row.total_outputs || "?"} ports<br>${currency} ${Number(row.price_min).toFixed(2)}`), { xaxis: { title: "Nominal Power (W)" }, yaxis: { title: `Price (${currency})` }, legend: { orientation: "h", y: -0.24 } });
}

function drawPowerBankCompetitorDatabase(rows, priceRows, currency) {
  const brands = [...new Set(rows.map((row) => row.brand))].sort();
  const capacityBands = ["≤10,000", "10,001–20,000", "20,001–27,000", ">27,000"];
  const singleBand = (row) => { const w = competitorNumber(row.single_usb_c_output_w); return w === null ? "Unknown" : w < 65 ? "<65W" : w < 100 ? "65–99W" : w < 140 ? "100–139W" : "≥140W"; };
  const singleBands = ["<65W", "65–99W", "100–139W", "≥140W"];
  const forms = ["Standard", "Built-in cable", "Retractable cable", "2-in-1"];
  drawContributionPair(1, 2, rows, brands, capacityBands, (row) => competitorCapacityBand(row.capacity_mah), "Capacity band");
  const priceBands = ["<$40", "$40–69", "$70–99", "$100+"];
  const priceBand = (row) => adapterPriceBand(row);
  drawCountHeatmap(3, priceRows, capacityBands, priceBands, (row) => competitorCapacityBand(row.capacity_mah), priceBand, "Capacity band", `Price (${currency})`);
  drawCountHeatmap(4, priceRows, singleBands, priceBands, singleBand, priceBand, "Max single-port output", `Price (${currency})`);
  drawContributionPair(5, 6, rows, brands, singleBands, singleBand, "Single-port power");
  drawContributionPair(7, 8, rows, brands, forms, competitorPowerBankForm, "Factor");
}

function drawCableCompetitorDatabase(rows, priceRows, currency) {
  const lengthBands = ["≤1m", "1.01–2m", "2.01–3m", ">3m"];
  const powerBands = ["60W", "100W", "140W", "240W"];
  const priceBands = ["<$40", "$40–69", "$70–99", "$100+"];
  const brands = [...new Set(rows.map((row) => row.brand))].sort();
  const forms = [...new Set(rows.map((row) => row.form_factor || "Unknown"))].filter((value) => value !== "Unknown").sort();
  drawContributionPair(1, 2, rows, brands, lengthBands, competitorCableLengthBand, "Length");
  drawCountHeatmap(3, priceRows, lengthBands, priceBands, competitorCableLengthBand, adapterPriceBand, "Length", `Price (${currency})`);
  drawCountHeatmap(4, priceRows, powerBands, priceBands, (row) => competitorPowerBand("power_cable", row.advertised_power_w), adapterPriceBand, "Charging power", `Price (${currency})`);
  drawContributionPair(5, 6, rows, brands, forms, (row) => row.form_factor || "Unknown", "Factor");
}

function drawContributionPair(pieNumber, barNumber, rows, brands, groups, getter, axisTitle) {
  const plotted = groups.map((group) => ({ group, value: rows.filter((row) => getter(row) === group).length })).filter((item) => item.value > 0);
  const plottedTotal = plotted.reduce((sum, item) => sum + item.value, 0);
  const plottedBrands = brands.filter((brand) => plotted.some((item) => rows.some((row) => row.brand === brand && getter(row) === item.group)));
  drawPlot(`competitorDbChart${pieNumber}`, [{ labels: plotted.map((item) => item.group), values: plotted.map((item) => item.value), type: "pie", hole: .56, textinfo: "label+percent", textposition: "auto", automargin: true, textfont: { size: 12 }, marker: { colors: overviewPalette }, hovertemplate: "%{label}: %{value} products (%{percent})<extra></extra>" }], { showlegend: false, margin: { l: 72, r: 72, t: 68, b: 62 }, annotations: [{ text: `${plottedTotal}<br>Products`, x: .5, y: .5, showarrow: false, font: { size: 14, color: "#5c6570" } }] });
  drawPlot(`competitorDbChart${barNumber}`, plotted.map((item, index) => ({ x: plottedBrands, y: plottedBrands.map((brand) => rows.filter((row) => row.brand === brand && getter(row) === item.group).length), name: item.group, type: "bar", marker: { color: palette[index % palette.length] } })), { barmode: "stack", margin: { l: 64, r: 24, t: 40, b: 118 }, xaxis: { title: "Brand", tickangle: -35, automargin: true, tickfont: { size: 10 } }, yaxis: { title: "Products", automargin: true }, legend: { orientation: "h", y: -.34 }, annotations: [], title: { text: axisTitle, font: { size: 12 } } });
}

function drawCountHeatmap(number, rows, xGroups, yGroups, xGetter, yGetter, xTitle, yTitle) {
  drawPlot(`competitorDbChart${number}`, [{ z: yGroups.map((y) => xGroups.map((x) => rows.filter((row) => xGetter(row) === x && yGetter(row) === y).length)), x: xGroups, y: yGroups, type: "heatmap", colorscale: [[0, "#fff5f4"], [1, "#e2231a"]], texttemplate: "%{z}", hovertemplate: `%{x}<br>%{y}: %{z} products<extra></extra>` }], { margin: { l: 82, r: 38, t: 24, b: 78 }, xaxis: { title: xTitle, automargin: true, tickangle: -20 }, yaxis: { title: yTitle, automargin: true, autorange: "reversed" } });
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

function drawPerformanceContribution(categoryId, products) {
  const option = categoryOverviewMetricOption(categoryId, "contribution");
  const period = categoryPerformancePeriod(categoryId, products);
  const selectedIds = categoryOverviewSelectedProductIds(categoryId, products);
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const selectedGeo = state.categoryContributionGeo[categoryId] || "all";
  const selectedSegment = categoryOverviewSegment(categoryId, "contribution");
  const rows = (selectedGeo === "all"
    ? productRevenueRanking(
        categoryId,
        selectedProducts,
        option.field,
        period,
        "all",
        selectedSegment,
      )
    : selectedProducts.map((product) => {
        const geoRows = categoryOverviewRowsForPeriod(categoryId, [product.id], period, false, data.geoMetrics || []).filter((row) =>
          (row.geo || "Unassigned") === selectedGeo
          && (selectedSegment === "all" || row.segment === selectedSegment)
        );
        return {
          product,
          current: categoryMetricTotal(geoRows, option.field),
          prior: 0,
          available: categoryMetricHasData(geoRows, option.field),
        };
      }).sort((a, b) => b.current - a.current)
  ).filter((row) => row.available && row.current > 0);
  const total = rows.reduce((sum, row) => sum + row.current, 0);
  const totalDisplay = categoryMetricDisplay(total, rows.length > 0, option);
  const chartLabels = rows.map((row) => row.product.name);
  const legendLabels = rows.map((row) => `${row.product.name} · ${categoryMetricDisplay(row.current, true, option)}`);
  drawPlot(
    "performanceContributionPlot",
    rows.length
      ? [{
          labels: legendLabels,
          values: rows.map((row) => row.current),
          customdata: rows.map((row) => categoryMetricDisplay(row.current, true, option)),
          type: "pie",
          hole: 0.54,
          sort: false,
          domain: { x: [0.08, 0.43], y: [0.1, 0.9] },
          text: chartLabels,
          textinfo: "none",
          texttemplate: "%{text}<br>%{percent}",
          textposition: "outside",
          textfont: { size: 11, color: "#1f2328" },
          automargin: true,
          hovertemplate: `<b>%{text}</b><br>${escapeHtml(option.label)}: %{customdata}<br>Share: %{percent}<extra></extra>`,
          marker: { colors: rows.map((_, index) => overviewPalette[index % overviewPalette.length]) },
        }]
      : [],
    {
      height: state.expandedTrendChart === "contribution" ? 620 : 286,
      margin: { l: 20, r: 20, t: 10, b: 10 },
      showlegend: true,
      legend: {
        orientation: "v",
        x: 0.62,
        xanchor: "left",
        y: 0.5,
        yanchor: "middle",
        font: { size: 13, color: "#1f2328" },
        itemwidth: 38,
      },
      annotations: rows.length
        ? [{
            x: 0.255,
            y: 0.5,
            xref: "paper",
            yref: "paper",
            text: `<b>${totalDisplay}</b><br>Total`,
            showarrow: false,
            align: "center",
            xanchor: "center",
            yanchor: "middle",
            font: { size: 12, color: "#1f2328" },
          }]
        : [],
    },
  );
}

function drawCategoryGeoContribution(categoryId, products) {
  const contribution = categoryGeoContributionData(categoryId, products);
  const metricOption = categoryGeoMetricOption(categoryId);
  const isQuantity = metricOption.kind === "quantity";
  const metricLabel = metricOption.label;
  const formatMetric = (value) => isQuantity ? fmtExactNumber(value) : formatCategoryRevenueM(value);
  const geoChartMode = categoryGeoChartMode("geo-share");
  const countryChartMode = categoryGeoChartMode("country-share");
  const expandedGeoHeight = Math.max(540, Math.min(760, window.innerHeight - 150));
  const selectedGeo = selectedCategoryGeo(categoryId, contribution);
  const total = contribution.reduce((sum, item) => sum + item.value, 0);
  const colors = contribution.map((_, index) => overviewPalette[index % overviewPalette.length]);
  const topGeos = [...contribution];
  const selectedProductIds = new Set(categoryGeoSelectedProductIds(categoryId, products));
  const fallbackGeos = [...new Set((data.geoMetrics || [])
    .filter((row) => categoryMatchesOverview(row, categoryId) && selectedProductIds.has(row.modelId))
    .map((row) => row.geo || "Unassigned"))]
    .filter((geo) => !topGeos.some((item) => item.geo === geo));
  fallbackGeos.forEach((geo) => topGeos.push({ geo, value: 0 }));

  drawPlot(
    "categoryGeoBarPlot",
    topGeos.length ? [{
      x: topGeos.map((item) => displayLocationLabel(item.geo)),
      y: topGeos.map((item) => item.value),
      type: "bar",
      marker: { color: topGeos.map((_, index) => overviewPalette[index % overviewPalette.length]), opacity: 0.9 },
      text: topGeos.map((item) => formatMetric(item.value)),
      textposition: "outside",
      textfont: { size: 10, color: "#1f2328" },
      cliponaxis: false,
      customdata: topGeos.map((item) => formatMetric(item.value)),
      hovertemplate: `<b>%{x}</b><br>${metricLabel}: %{customdata}<extra></extra>`,
    }] : [],
    {
      height: state.expandedTrendChart === "geo-contribution" ? 540 : 330,
      margin: { l: 62, r: 12, t: 36, b: 58 },
      showlegend: false,
      xaxis: { title: "Geo", automargin: true },
      yaxis: {
        title: metricLabel,
        tickprefix: isQuantity ? "" : "$",
        tickformat: "~s",
        rangemode: "tozero",
        automargin: true,
        range: topGeos.length ? [0, Math.max(...topGeos.map((item) => item.value)) * 1.25] : undefined,
      },
    },
  );

  drawPlot(
    "categoryGeoContributionPlot",
    contribution.length
      ? [geoChartMode === "bar" ? {
          x: contribution.map((item) => displayLocationLabel(item.geo)),
          y: contribution.map((item) => item.value),
          customdata: contribution.map((item) => formatMetric(item.value)),
          type: "bar",
          text: contribution.map((item) => formatMetric(item.value)),
          textposition: "outside",
          cliponaxis: false,
          showlegend: false,
          marker: { color: colors },
          hovertemplate: `<b>%{x}</b><br>${metricLabel}: %{customdata}<extra></extra>`,
        } : {
          labels: contribution.map((item) => displayLocationLabel(item.geo)),
          values: contribution.map((item) => item.value),
          customdata: contribution.map((item) => formatMetric(item.value)),
          type: "pie",
          hole: 0.56,
          sort: false,
          texttemplate: "%{label}<br>%{percent}",
          textposition: "outside",
          textfont: { size: 12, color: "#1f2328" },
          automargin: true,
          hovertemplate: `<b>%{label}</b><br>${metricLabel}: %{customdata}<br>Share: %{percent}<extra></extra>`,
          marker: { colors, line: { color: "#fff", width: 2 } },
        }]
      : [],
    {
      height: state.expandedTrendChart === "geo-share" ? expandedGeoHeight : 330,
      margin: state.expandedTrendChart === "geo-share" ? { l: 54, r: 54, t: geoChartMode === "bar" ? 70 : 20, b: geoChartMode === "bar" ? 70 : 86 } : { l: 44, r: 44, t: geoChartMode === "bar" ? 46 : 12, b: 20 },
      showlegend: state.expandedTrendChart === "geo-share",
      legend: state.expandedTrendChart === "geo-share" ? { orientation: "h", x: 0.5, xanchor: "center", y: -0.08, yanchor: "top" } : undefined,
      xaxis: geoChartMode === "bar" ? { automargin: true } : {},
      yaxis: geoChartMode === "bar" ? { automargin: true, rangemode: "tozero", range: contribution.length ? [0, Math.max(...contribution.map((item) => item.value)) * 1.18] : undefined } : {},
      annotations: contribution.length && geoChartMode === "pie"
        ? [{
            x: 0.5,
            y: 0.5,
            xref: "paper",
            yref: "paper",
            text: `<b>${formatMetric(total)}</b><br>Total`,
            showarrow: false,
            font: { size: 14, color: "#1f2328" },
          }]
        : [],
    },
  );

  const contributionPlot = document.querySelector("#categoryGeoContributionPlot");
  if (contributionPlot?.on) {
    contributionPlot.removeAllListeners?.("plotly_click");
    contributionPlot.on("plotly_click", (event) => {
      const pointIndex = event.points?.[0]?.pointNumber;
      const nextGeo = contribution[pointIndex]?.geo;
      if (!nextGeo || nextGeo === state.categoryGeoSelected[categoryId]) return;
      state.categoryGeoSelected[categoryId] = nextGeo;
      render();
    });
  }

  const productIds = new Set(categoryGeoSelectedProductIds(categoryId, products));
  const selectedPeriods = new Set(categoryGeoSelectedPeriods(categoryId));
  const selectedSegment = categoryOverviewSegment(categoryId, "geo");
  const valuesByCountry = new Map();
  (data.geoMetrics || []).forEach((row) => {
    if (
      !categoryMatchesOverview(row, categoryId)
      || !productIds.has(row.modelId)
      || !rowMatchesActiveDetailPn(row)
      || !rowMatchesDetailPanelPn(row, "geo")
      || (row.geo || "Unassigned") !== selectedGeo
      || !selectedPeriods.has(`${row.fiscalYear} ${row.fiscalQuarter}`)
      || !rowMatchesCategorySegment(row, selectedSegment)
    ) return;
    const country = row.country || "Unassigned";
    valuesByCountry.set(country, (valuesByCountry.get(country) || 0) + Number(row[metricOption.field] || 0));
  });
  const countries = [...valuesByCountry.entries()]
    .map(([country, value]) => ({ country, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const countryTotal = countries.reduce((sum, item) => sum + item.value, 0);
  const denseCountryChart = countries.length > 8;
  const countryExpanded = state.expandedTrendChart === "country-share";
  const countryLabels = countries.map((item) => countryExpanded
    ? displayLocationLabel(item.country)
    : displayCountryShortLabel(item.country));

  drawPlot(
    "categoryCountryContributionPlot",
    countries.length
      ? [countryChartMode === "bar" ? {
          x: countryLabels,
          y: countries.map((item) => item.value),
          customdata: countries.map((item) => formatMetric(item.value)),
          type: "bar",
          text: countries.map((item) => formatMetric(item.value)),
          textposition: "outside",
          cliponaxis: false,
          showlegend: false,
          marker: { color: countries.map((_, index) => overviewPalette[index % overviewPalette.length]) },
          hovertemplate: `<b>%{x}</b><br>${metricLabel}: %{customdata}<extra></extra>`,
        } : {
          labels: countryLabels,
          values: countries.map((item) => item.value),
          customdata: countries.map((item) => formatMetric(item.value)),
          type: "pie",
          hole: denseCountryChart ? 0.46 : 0.56,
          domain: denseCountryChart ? { x: [0.04, 0.96], y: [0.03, 0.97] } : undefined,
          sort: false,
          textinfo: denseCountryChart ? "none" : "label+percent",
          texttemplate: denseCountryChart ? "" : "%{label}<br>%{percent}",
          textposition: "outside",
          automargin: true,
          hovertemplate: `<b>%{label}</b><br>${metricLabel}: %{customdata}<br>Share: %{percent}<extra></extra>`,
          marker: { colors: countries.map((_, index) => overviewPalette[index % overviewPalette.length]), line: { color: "#fff", width: 2 } },
        }]
      : [],
    {
      height: countryExpanded ? expandedGeoHeight : 330,
      margin: countryChartMode === "bar"
        ? { l: 54, r: 36, t: 70, b: denseCountryChart ? 120 : 74 }
        : denseCountryChart ? { l: 12, r: 12, t: 8, b: 8 } : { l: 44, r: 44, t: 12, b: 12 },
      showlegend: false,
      xaxis: countryChartMode === "bar" ? { automargin: true, tickangle: denseCountryChart ? -38 : 0 } : {},
      yaxis: countryChartMode === "bar" ? { automargin: true, rangemode: "tozero", range: countries.length ? [0, Math.max(...countries.map((item) => item.value)) * 1.18] : undefined } : {},
      annotations: countries.length && countryChartMode === "pie" ? [{ x: 0.5, y: 0.5, xref: "paper", yref: "paper", text: `<b>${formatMetric(countryTotal)}</b><br>Total`, showarrow: false }] : [],
    },
  );
}

function drawPerformanceRevenueTrend(categoryId, products) {
  const option = categoryOverviewMetricOption(categoryId, "trend");
  const mode = categoryTrendMode(categoryId);
  const selectedGeos = Array.isArray(state.categoryTrendGeos[categoryId]) ? state.categoryTrendGeos[categoryId] : [];
  const selectedIds = categoryTrendSelectedProductIds(categoryId, products);
  const selectedIdSet = new Set(selectedIds);
  const selectedProducts = products.filter((product) => selectedIdSet.has(product.id));
  const sourceRows = selectedGeos.length === 0 ? data.productMetrics : (data.geoMetrics || []);
  const selectedSegment = categoryOverviewSegment(categoryId, "trend");
  const metricRows = sourceRows.filter((row) =>
    categoryMatchesOverview(row, categoryId)
    && selectedIdSet.has(row.modelId)
    && rowMatchesActiveDetailPn(row)
    && rowMatchesDetailPanelPn(row, "trend")
    && rowMatchesCategorySegment(row, selectedSegment)
    && (selectedGeos.length === 0 || selectedGeos.includes(row.geo || "Unassigned")),
  );
  let comparisonProducts = selectedProducts;
  if (mode === "breakdown" && selectedGeos.length <= 1) {
    const visibleKey = state.productId ? `${categoryId}:${state.productId}` : categoryId;
    const storedVisible = state.categoryTrendVisibleSeries[visibleKey];
    if (Array.isArray(storedVisible)) comparisonProducts = selectedProducts.filter((product) => storedVisible.includes(product.id));
    else {
      const top = [...selectedProducts].sort((a, b) => {
        const total = (product) => metricRows.filter((row) => row.modelId === product.id).reduce((sum, row) => sum + Number(row[option.field] || 0), 0);
        return total(b) - total(a);
      })[0];
      comparisonProducts = top ? [top] : [];
    }
  }
  const availablePeriods = sortedPeriods([...new Set(metricRows.map((row) => `${row.fiscalYear} ${row.fiscalQuarter}`))]);
  const storedPeriods = state.categoryTrendPeriods[categoryId];
  const periods = Array.isArray(storedPeriods) ? availablePeriods.filter((period) => storedPeriods.includes(period)) : defaultCategoryTrendPeriods(availablePeriods);
  let traces = [];
  const isStacked = mode === "stacked";

  if (isStacked) {
    const stackItems = state.productId
      ? unique(metricRows.map((row) => row.partNumber).filter(Boolean)).map((pn) => ({
          id: pn,
          name: pn,
          matches: (row) => row.partNumber === pn,
        }))
      : selectedProducts.map((product) => ({
          id: product.id,
          name: product.shortName || product.name,
          fullName: product.name,
          matches: (row) => row.modelId === product.id,
        }));
    traces = stackItems.map((item, index) => {
      const valuesByPeriod = new Map();
      metricRows.filter(item.matches).forEach((row) => {
        const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
        valuesByPeriod.set(period, (valuesByPeriod.get(period) || 0) + Number(row[option.field] || 0));
      });
      const values = periods.map((period) => valuesByPeriod.get(period) || 0);
      return {
        x: periods,
        y: values,
        type: "bar",
        name: item.name,
        marker: { color: overviewPalette[index % overviewPalette.length], opacity: 0.9 },
        customdata: values.map((value) => categoryMetricDisplay(value, true, option)),
        hovertemplate: `<b>${escapeHtml(item.fullName || item.name)}</b><br>%{x}<br>${escapeHtml(option.label)}: %{customdata}<extra></extra>`,
      };
    }).filter((trace) => trace.y.some((value) => value > 0));
  } else if (selectedGeos.length > 1 && mode === "breakdown") {
    traces = selectedGeos.map((geo, index) => {
      const totals = new Map();
      metricRows.filter((row) => (row.geo || "Unassigned") === geo).forEach((row) => {
        const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
        totals.set(period, (totals.get(period) || 0) + Number(row[option.field] || 0));
      });
      const values = periods.map((period) => totals.get(period) || 0);
      return {
        x: periods,
        y: values,
        type: "scatter",
        mode: "lines+markers",
        name: displayLocationLabel(geo),
        line: { color: overviewPalette[index % overviewPalette.length], width: 2.8 },
        marker: { color: overviewPalette[index % overviewPalette.length], size: 7 },
        customdata: values.map((value) => categoryMetricDisplay(value, true, option)),
        _allValuesByPeriod: totals,
        hovertemplate: `<b>${escapeHtml(displayLocationLabel(geo))}</b><br>%{x}<br>${escapeHtml(option.label)}: %{customdata}<extra></extra>`,
      };
    });
  } else if (mode === "breakdown") {
    const labelPositions = [
      "top left",
      "top center",
      "top right",
      "middle left",
      "middle right",
      "bottom left",
      "bottom right",
    ];
    let comparisonItems = state.productId
      ? unique(metricRows.map((row) => row.partNumber).filter(Boolean)).map((pn) => ({
          id: pn,
          name: pn,
          matches: (row) => row.partNumber === pn,
        }))
      : comparisonProducts.map((product) => ({
          id: product.id,
          name: product.name,
          matches: (row) => row.modelId === product.id,
        }));
    if (state.productId) {
      const visibleKey = `${categoryId}:${state.productId}`;
      const storedVisible = state.categoryTrendVisibleSeries[visibleKey];
      if (Array.isArray(storedVisible)) comparisonItems = comparisonItems.filter((item) => storedVisible.includes(item.id));
      else {
        const top = [...comparisonItems].sort((a, b) => {
          const total = (item) => metricRows.filter(item.matches).reduce((sum, row) => sum + Number(row[option.field] || 0), 0);
          return total(b) - total(a);
        })[0];
        comparisonItems = top ? [top] : [];
      }
    }
    // A PN/product must produce exactly one line even if upstream filters or
    // source rows contain repeated labels.
    comparisonItems = [...new Map(comparisonItems.map((item) => [item.id, item])).values()];
    traces = comparisonItems.map((item, index) => {
      const valuesByPeriod = new Map();
      metricRows
        .filter(item.matches)
        .forEach((row) => {
          const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
          valuesByPeriod.set(period, (valuesByPeriod.get(period) || 0) + Number(row[option.field] || 0));
        });
      const values = periods.map((period) => valuesByPeriod.has(period) ? valuesByPeriod.get(period) : null);
      const displayValues = values.map((value) =>
        value === null || Math.abs(value) < Number.EPSILON
          ? ""
          : categoryMetricDisplay(value, true, option),
      );
      const isDenseBreakdown = comparisonItems.length > 4;
      const dashStyles = ["solid", "dash", "dot", "dashdot", "longdash", "longdashdot", "solid"];
      return {
        x: periods,
        y: values,
        type: "scatter",
        mode: isDenseBreakdown ? "lines+markers" : "lines+markers+text",
        name: item.name,
        line: {
          color: overviewPalette[index % overviewPalette.length],
          width: isDenseBreakdown ? 2.8 : 2.5,
          dash: dashStyles[index % dashStyles.length],
        },
        marker: { color: overviewPalette[index % overviewPalette.length], size: 7 },
        text: isDenseBreakdown ? undefined : displayValues,
        textposition: isDenseBreakdown
          ? undefined
          : periods.map((_, periodIndex) =>
              labelPositions[(index + periodIndex) % labelPositions.length],
            ),
        textfont: { size: 9, color: overviewPalette[index % overviewPalette.length] },
        cliponaxis: false,
        customdata: displayValues,
        _allValuesByPeriod: valuesByPeriod,
        hovertemplate: `<b>${escapeHtml(item.name)}</b><br>%{x}<br>${escapeHtml(option.label)}: %{customdata}<extra></extra>`,
      };
    }).filter((trace) => trace.y.some((value) => value !== null));
  } else {
    const totals = new Map();
    metricRows.forEach((row) => {
      const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
      totals.set(period, (totals.get(period) || 0) + Number(row[option.field] || 0));
    });
    const values = periods.map((period) => totals.get(period) || 0);
    const displayValues = values.map((value) => categoryMetricDisplay(value, true, option));
    traces = periods.length
      ? [{
          x: periods,
          y: values,
          type: "scatter",
          mode: "lines+markers+text",
          name: "Selected products total",
          line: { color: overviewPalette[0], width: 3 },
          marker: { color: overviewPalette[0], size: 7 },
          text: displayValues,
          textposition: "top center",
          textfont: { size: 10, color: "#991b1b" },
          cliponaxis: false,
          customdata: displayValues,
          _allValuesByPeriod: totals,
          hovertemplate: `<b>Selected products total</b><br>%{x}<br>${escapeHtml(option.label)}: %{customdata}<extra></extra>`,
        }]
      : [];
  }

  const useBars = traces.length === 1 && mode === "overall";
  const growthAnnotations = [];
  if (useBars) {
    traces = traces.map((trace, traceIndex) => {
      const valuesByPeriod = new Map();
      metricRows.forEach((row) => {
        const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
        valuesByPeriod.set(period, (valuesByPeriod.get(period) || 0) + Number(row[option.field] || 0));
      });
      trace.x.forEach((period, index) => {
        const priorPeriod = previousFiscalQuarterPeriod(period);
        const current = Number(trace.y[index]);
        const prior = Number(valuesByPeriod.get(priorPeriod));
        if (!prior || !Number.isFinite(current)) return;
        const growth = ((current - prior) / Math.abs(prior)) * 100;
        const positive = growth >= 0;
        const traceCount = traces.length;
        growthAnnotations.push({
          x: period,
          y: current,
          xshift: 0,
          yshift: 30,
          text: `<b>${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%</b>`,
          showarrow: false,
          bgcolor: positive ? "#e5f5e9" : "#fde8e7",
          bordercolor: positive ? "#a8d9b5" : "#efb0ac",
          borderwidth: 1,
          borderpad: 3,
          font: { size: 10, color: positive ? "#087a3e" : "#d92d20" },
        });
      });
      return {
        x: trace.x,
        y: trace.y,
        type: "bar",
        name: trace.name,
        marker: { color: overviewPalette[traceIndex % overviewPalette.length], opacity: 0.9 },
        width: 0.34,
        text: trace.customdata,
        textposition: "outside",
        textfont: { size: 10, color: "#1f2328" },
        cliponaxis: false,
        customdata: trace.customdata,
        hovertemplate: trace.hovertemplate,
      };
    });
  } else if (isStacked) {
    const stackedTotals = new Map();
    metricRows.forEach((row) => {
      const period = `${row.fiscalYear} ${row.fiscalQuarter}`;
      stackedTotals.set(period, (stackedTotals.get(period) || 0) + Number(row[option.field] || 0));
    });
    periods.forEach((period) => {
      const current = Number(stackedTotals.get(period) || 0);
      const prior = Number(stackedTotals.get(previousFiscalQuarterPeriod(period)) || 0);
      if (!prior || !Number.isFinite(current)) return;
      const growth = ((current - prior) / Math.abs(prior)) * 100;
      const positive = growth >= 0;
      growthAnnotations.push({
        x: period,
        y: current,
        yshift: 24,
        text: `<b>${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%</b>`,
        showarrow: false,
        bgcolor: positive ? "#e5f5e9" : "#fde8e7",
        bordercolor: positive ? "#a8d9b5" : "#efb0ac",
        borderwidth: 1,
        borderpad: 3,
        font: { size: 10, color: positive ? "#087a3e" : "#d92d20" },
      });
    });
  } else if (!isStacked) {
    traces = traces.map((trace) => {
      const valuesByPeriod = trace._allValuesByPeriod || new Map(trace.x.map((period, index) => [period, trace.y[index]]));
      const pointData = trace.x.map((period, index) => {
        const value = trace.y[index];
        const prior = Number(valuesByPeriod.get(previousFiscalQuarterPeriod(period)));
        const growth = prior && value !== null ? ((Number(value) - prior) / Math.abs(prior)) * 100 : null;
        const valueLabel = value === null ? "" : categoryMetricDisplay(value, true, option);
        const growthLabel = growth === null ? "" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
        return { valueLabel, growthLabel, growth };
      });
      return {
        ...trace,
        y: pointData.map((item) => item.growth),
        mode: "lines+markers+text",
        text: pointData.map((item) => item.growthLabel),
        textposition: "top center",
        textfont: { size: 9, color: pointData.map((item) => item.growth === null ? "#1f2328" : item.growth >= 0 ? "#087a3e" : "#d92d20") },
        customdata: pointData.map((item) => [item.valueLabel, item.growthLabel || "—"]),
        hovertemplate: `<b>${escapeHtml(trace.name || "Series")}</b><br>%{x}<br>QoQ: %{customdata[1]}<br>${escapeHtml(option.label)}: %{customdata[0]}<extra></extra>`,
      };
    });
  }
  const usesGrowthAxis = !useBars && !isStacked;
  const chartMax = isStacked
    ? Math.max(0, ...periods.map((_, periodIndex) => traces.reduce((sum, trace) => sum + Number(trace.y?.[periodIndex] || 0), 0)))
    : Math.max(0, ...traces.flatMap((trace) => (trace.y || []).filter((value) => Number.isFinite(Number(value))).map(Number)));
  const growthValues = usesGrowthAxis
    ? traces.flatMap((trace) => (trace.y || []).filter((value) => Number.isFinite(Number(value))).map(Number))
    : [];
  const growthMin = growthValues.length ? Math.min(...growthValues) : 0;
  const growthMax = growthValues.length ? Math.max(...growthValues) : 0;
  const growthSpan = Math.max(growthMax - growthMin, Math.max(Math.abs(growthMin), Math.abs(growthMax)) * 0.2, 10);
  const growthRange = growthValues.length ? [growthMin - growthSpan * 0.16, growthMax + growthSpan * 0.22] : undefined;
  const dynamicBarGap = periods.length <= 1 ? 0.68 : periods.length <= 3 ? 0.42 : periods.length <= 8 ? 0.24 : 0.14;
  const externalSeriesFilterVisible = mode === "breakdown" && selectedGeos.length <= 1;
  const visibleKey = state.productId ? `${categoryId}:${state.productId}` : categoryId;
  const availableSeriesIds = state.productId ? detailSelectedPns("trend") : selectedIds;
  const storedVisibleSeries = state.categoryTrendVisibleSeries[visibleKey];
  const allSeriesSelected = externalSeriesFilterVisible
    && Array.isArray(storedVisibleSeries)
    && availableSeriesIds.length > 0
    && availableSeriesIds.every((id) => storedVisibleSeries.includes(id));
  const showPlotLegend = !externalSeriesFilterVisible
    && !allSeriesSelected
    && (isStacked || (traces.length > 1 && Boolean(state.productId)));

  drawPlot(
    "performanceRevenueTrendPlot",
    traces,
    {
      height: state.expandedTrendChart === "trend" ? 620 : (!useBars && mode === "breakdown" ? 340 : 300),
      margin: { l: 78, r: 30, t: 52, b: !useBars && mode === "breakdown" ? 82 : 64 },
      // When All is checked, the external checkbox legend already lists every
      // series; suppress Plotly's duplicate legend beside the chart.
      showlegend: showPlotLegend,
      hovermode: "closest",
      legend: showPlotLegend && traces.length > 1
        ? {
            orientation: "v",
            x: 1.01,
            xanchor: "left",
            y: 1,
            yanchor: "top",
            font: { size: 11, color: "#1f2328" },
            itemsizing: "constant",
            tracegroupgap: 7,
          }
        : undefined,
      xaxis: {
        title: { text: "Fiscal Quarter", standoff: 20 },
        type: "category",
        tickmode: "array",
        tickvals: periods,
        ticktext: periods,
        automargin: true,
        tickangle: mode === "breakdown" ? -32 : 0,
        tickfont: { size: mode === "breakdown" ? 10 : 11 },
        range: periods.length === 1 ? [-1.15, 1.15] : undefined,
      },
      yaxis: {
        title: usesGrowthAxis ? "QoQ Growth Rate" : (option.kind === "quantity" ? option.label : `${option.label} (USD)`),
        ticksuffix: usesGrowthAxis ? "%" : undefined,
        zeroline: usesGrowthAxis,
        zerolinecolor: usesGrowthAxis ? "#9ca3af" : undefined,
        zerolinewidth: usesGrowthAxis ? 1.25 : undefined,
        rangemode: usesGrowthAxis ? "normal" : "tozero",
        automargin: true,
        autorange: usesGrowthAxis ? !growthRange : chartMax <= 0,
        range: usesGrowthAxis ? growthRange : (chartMax > 0 ? [0, chartMax * 1.34] : undefined),
      },
      barmode: isStacked ? "stack" : (useBars ? "group" : undefined),
      bargap: dynamicBarGap,
      bargroupgap: 0.04,
      annotations: growthAnnotations,
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "#ffffff",
        bordercolor: "#d9d4cc",
        font: { color: "#1f2328", size: 12 },
      },
    },
  );
}

function drawQuarterComparison(categoryId, products) {
  const option = categoryOverviewMetricOption(categoryId, "trend");
  const selectedIds = new Set(categoryTrendSelectedProductIds(categoryId, products));
  const selectedProducts = products.filter((product) => selectedIds.has(product.id));
  const selectedGeos = Array.isArray(state.categoryTrendGeos[categoryId]) ? state.categoryTrendGeos[categoryId] : [];
  const source = selectedGeos.length ? (data.geoMetrics || []) : data.productMetrics;
  const selectedSegment = categoryOverviewSegment(categoryId, "trend");
  const quarterExpanded = state.expandedTrendChart === "quarter";
  // Compact cards always use the Figure 1 grouped comparison. Stacking is an
  // expanded-view-only analysis: FY2526 and FY2627 remain side by side, with
  // product (or PN) layers stacked inside Total and each of Q1–Q4.
  const mode = quarterExpanded ? quarterComparisonMode(categoryId) : "overall";
  const rows = source.filter((row) =>
    categoryMatchesOverview(row, categoryId)
    && selectedIds.has(row.modelId)
    && rowMatchesActiveDetailPn(row)
    && rowMatchesDetailPanelPn(row, "trend")
    && (selectedGeos.length === 0 || selectedGeos.includes(row.geo || "Unassigned"))
    && rowMatchesCategorySegment(row, selectedSegment)
    && ["FY2526", "FY2627"].includes(row.fiscalYear),
  );
  const quarters = ["Total", "Q1", "Q2", "Q3", "Q4"];
  const totals = (year) => quarters.map((quarter) => {
    if (quarter === "Total") {
      const matching = rows.filter((row) => row.fiscalYear === year);
      return matching.length ? categoryMetricTotal(matching, option.field) : null;
    }
    const matching = rows.filter((row) => row.fiscalYear === year && row.fiscalQuarter === quarter);
    return matching.length ? categoryMetricTotal(matching, option.field) : null;
  });
  const prior = totals("FY2526");
  const current = totals("FY2627");
  const aggregateMax = Math.max(0, ...prior.filter(Number.isFinite), ...current.filter(Number.isFinite));
  const quarterPlotWidth = document.querySelector("#quarterComparisonPlot")?.clientWidth || window.innerWidth;
  const quarterCompact = !quarterExpanded && quarterPlotWidth < 900;
  const horizontalMargin = quarterExpanded ? 84 : (quarterPlotWidth < 600 ? 54 : 68);
  const quarterPlotHeight = quarterExpanded ? 620 : (quarterPlotWidth < 600 ? 320 : 340);
  const plotAreaWidth = Math.max(280, quarterPlotWidth - (horizontalMargin * 2));
  const quarterBarGap = quarterExpanded ? 0.36 : 0.3;
  // Plotly places the two offset groups at +/- one quarter of the usable
  // category width. Match that center exactly for every YoY annotation.
  const groupedBarOffset = Math.max(14, Math.min(82, (plotAreaWidth / quarters.length) * ((1 - quarterBarGap) / 4)));
  const valueFontSize = quarterExpanded ? 11 : (quarterCompact ? 8 : 9);
  const growthFontSize = quarterExpanded ? 11 : (quarterCompact ? 8 : 9);
  const formatQuarterValue = (value) => {
    if (value === null) return "";
    if (quarterExpanded) return categoryMetricDisplay(value, true, option);
    if (option.kind === "quantity") {
      const absolute = Math.abs(value);
      if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
      if (absolute >= 1_000) return `${(value / 1_000).toFixed(absolute >= 100_000 ? 0 : 1)}K`;
      return fmtExactNumber(value);
    }
    const absolute = Math.abs(value);
    if (absolute >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (absolute >= 1_000) return `$${(value / 1_000).toFixed(absolute >= 100_000 ? 0 : 1)}K`;
    return fmtExactCurrency(value);
  };
  const isMinorCompactValue = (value) => quarterCompact && aggregateMax > 0 && Math.abs(Number(value)) < aggregateMax * 0.01;
  const visibleValue = (value) => value !== null && Number(value) !== 0 && !isMinorCompactValue(value);
  const valueAnnotations = quarters.flatMap((quarter, index) => {
    const priorValue = prior[index];
    const currentValue = current[index];
    const closePair = !quarterExpanded
      && Number(priorValue) > 0
      && Number(currentValue) > 0
      && aggregateMax > 0
      && Math.abs(Number(priorValue) - Number(currentValue)) < aggregateMax * 0.07;
    const priorShift = closePair && Number(priorValue) > Number(currentValue) ? 18 : 3;
    const currentShift = closePair && Number(currentValue) >= Number(priorValue) ? 18 : 3;
    const labels = [];
    if (visibleValue(priorValue)) labels.push({
      x: quarter,
      y: priorValue,
      xshift: -groupedBarOffset,
      yshift: priorShift,
      yanchor: "bottom",
      text: formatQuarterValue(priorValue),
      showarrow: false,
      font: { size: valueFontSize, color: "#1f2328" },
    });
    if (visibleValue(currentValue)) labels.push({
      x: quarter,
      y: currentValue,
      xshift: groupedBarOffset,
      yshift: currentShift,
      yanchor: "bottom",
      text: formatQuarterValue(currentValue),
      showarrow: false,
      font: { size: valueFontSize, color: "#1f2328" },
    });
    return labels;
  });
  const growthAnnotations = current.map((value, index) => {
    if (value === null || !Number(prior[index])) return null;
    const growth = ((value - prior[index]) / Math.abs(prior[index])) * 100;
    const positive = growth >= 0;
    const closePair = !quarterExpanded
      && aggregateMax > 0
      && Math.abs(Number(value) - Number(prior[index])) < aggregateMax * 0.07;
    const currentValueShift = closePair && Number(value) >= Number(prior[index]) ? 18 : 3;
    const growthAnchorValue = Number(value);
    const growthText = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
    const tailoredGrowthFontSize = growthText.length >= 8
      ? Math.max(7, growthFontSize - 1)
      : growthFontSize;
    const growthGap = mode === "stacked"
      ? 6
      : visibleValue(value)
        ? currentValueShift + valueFontSize + (quarterExpanded ? 9 : 7)
        : 4;
    return {
      x: quarterExpanded ? index + 0.18 : quarters[index],
      y: growthAnchorValue,
      xshift: quarterExpanded ? 0 : groupedBarOffset,
      // Keep compact YoY badges immediately above the FY2627 value label.
      // Horizontal year offsets already prevent collisions with FY2526, so
      // an additional same-quarter vertical lift is unnecessary.
      yshift: growthGap,
      xanchor: "center",
      yanchor: "bottom",
      text: `<b>${growthText}</b>`, showarrow: false,
      bgcolor: positive ? "#e5f5e9" : "#fde8e7", bordercolor: positive ? "#a8d9b5" : "#efb0ac",
      borderwidth: 1, borderpad: quarterExpanded ? 3 : 1, font: { size: tailoredGrowthFontSize, color: positive ? "#087a3e" : "#d92d20" },
    };
  }).filter(Boolean);
  const annotations = mode === "stacked" ? growthAnnotations : [...valueAnnotations, ...growthAnnotations];
  const formatValues = (values) => values.map((value) => value === null ? "" : categoryMetricDisplay(value, true, option));
  const productTotals = (productId, year) => quarters.map((quarter) => {
    const matching = rows.filter((row) => row.modelId === productId && row.fiscalYear === year && (quarter === "Total" || row.fiscalQuarter === quarter));
    return matching.length ? categoryMetricTotal(matching, option.field) : 0;
  });
  let allTraces;
  if (mode === "stacked") {
    const stackItems = state.productId
      ? unique(rows.map((row) => row.partNumber || "No PN")).map((pn) => ({
          id: pn,
          name: pn,
          totals: (year) => quarters.map((quarter) => {
            const matching = rows.filter((row) => (row.partNumber || "No PN") === pn && row.fiscalYear === year && (quarter === "Total" || row.fiscalQuarter === quarter));
            return matching.length ? categoryMetricTotal(matching, option.field) : 0;
          }),
        }))
      : selectedProducts.map((product) => ({ id: product.id, name: product.shortName || product.name, totals: (year) => productTotals(product.id, year) }));
    // Use a deeper, muted palette so the expanded PN/product layers remain
    // distinct on large displays without looking washed out.
    const layerColors = ["#a64049", "#315f8a", "#a86420", "#376b50", "#674887", "#913f70", "#39646e", "#67462e", "#505866", "#813631", "#36569b", "#66752f"];
    allTraces = stackItems.flatMap((item, index) => {
      const productPrior = item.totals("FY2526");
      const productCurrent = item.totals("FY2627");
      const layerColor = layerColors[index % layerColors.length];
      const priorX = quarters.map((_, quarterIndex) => quarterIndex - 0.18);
      const currentX = quarters.map((_, quarterIndex) => quarterIndex + 0.18);
      return [
        {
          x: priorX, y: productPrior, type: "bar", width: 0.34,
          name: item.name, legendgroup: item.id, showlegend: false,
          offsetgroup: "FY2526", alignmentgroup: "quarter-comparison",
          marker: { color: layerColor, opacity: 0.72, line: { color: "rgba(255,255,255,.9)", width: 0.8 } },
          customdata: formatValues(productPrior),
          hovertemplate: `<b>${escapeHtml(item.name)}</b><br>FY2526 %{x}<br>${escapeHtml(option.label)}: %{customdata}<extra></extra>`,
        },
        {
          x: currentX, y: productCurrent, type: "bar", width: 0.34,
          name: item.name, legendgroup: item.id, showlegend: true,
          offsetgroup: "FY2627", alignmentgroup: "quarter-comparison",
          marker: { color: layerColor, opacity: 0.96, line: { color: "rgba(255,255,255,.9)", width: 0.8 } },
          customdata: formatValues(productCurrent),
          hovertemplate: `<b>${escapeHtml(item.name)}</b><br>FY2627 %{x}<br>${escapeHtml(option.label)}: %{customdata}<extra></extra>`,
        },
      ];
    });
  } else {
    allTraces = [
      { x: quarters, y: prior, type: "bar", name: "FY2526", marker: { color: overviewPalette[3] }, customdata: formatValues(prior), hovertemplate: `%{x}<br>${escapeHtml(option.label)}: %{customdata}<extra>FY2526</extra>` },
      { x: quarters, y: current, type: "bar", name: "FY2627", marker: { color: overviewPalette[2] }, customdata: formatValues(current), hovertemplate: `%{x}<br>${escapeHtml(option.label)}: %{customdata}<extra>FY2627</extra>` },
    ];
  }
  const maxValue = mode === "stacked"
    ? Math.max(0, ...quarters.map((_, quarterIndex) => Math.max(
        allTraces.filter((trace) => trace.offsetgroup === "FY2526").reduce((sum, trace) => sum + Number(trace.y[quarterIndex] || 0), 0),
        allTraces.filter((trace) => trace.offsetgroup === "FY2627").reduce((sum, trace) => sum + Number(trace.y[quarterIndex] || 0), 0),
      )))
    : Math.max(0, ...allTraces.flatMap((trace) => trace.y.filter(Number.isFinite)));
  drawPlot("quarterComparisonPlot", allTraces, {
    // "stack" + offsetgroup creates two side-by-side year stacks. Using
    // "relative" collapses both fiscal years into one mixed column.
    height: quarterPlotHeight, barmode: mode === "stacked" ? "stack" : "group", bargap: quarterBarGap, bargroupgap: 0.05, annotations,
    margin: { l: horizontalMargin, r: quarterExpanded ? 280 : horizontalMargin, t: quarterExpanded ? 76 : 58, b: quarterExpanded ? 74 : 62 }, showlegend: true,
    legend: quarterExpanded
      ? { orientation: "v", x: 1.02, xanchor: "left", y: 1, yanchor: "top", groupclick: "togglegroup", font: { size: 12 }, title: { text: `${state.productId ? "PN" : "Product"}<br><span style="font-size:10px">Light FY2526 · Solid FY2627</span>` } }
      : { orientation: "h", x: 0.5, xanchor: "center", y: 1.14, yanchor: "bottom", groupclick: "togglegroup", font: { size: 11 } },
    xaxis: { title: { text: "Fiscal Quarter", standoff: quarterExpanded ? 28 : 22, font: { size: quarterExpanded ? 14 : 12 } }, tickfont: { size: quarterExpanded ? 13 : 11 }, tickmode: quarterExpanded ? "array" : undefined, tickvals: quarterExpanded ? [0, 1, 2, 3, 4] : undefined, ticktext: quarterExpanded ? quarters : undefined, automargin: true, range: [-0.58, 4.58] },
    yaxis: { title: { text: option.kind === "quantity" ? option.label : `${option.label} (USD)`, font: { size: quarterExpanded ? 14 : 12 }, standoff: 14 }, tickfont: { size: quarterExpanded ? 12 : 10 }, range: maxValue ? [0, maxValue * (quarterExpanded ? 1.28 : 1.38)] : undefined, rangemode: "tozero", automargin: true },
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
  state.partNumber = "all";
  app.innerHTML = `
    <div class="detail-shell product-overview-detail" style="--accent:${category.accent}">
      <div class="product-detail-toolbar"><button class="ghost-button product-detail-back" type="button" data-route-category="${category.id}" data-route-view="products">← Product List</button></div>
      <section class="product-detail-overview-hero">
        <div class="product-detail-overview-copy">
          <div class="product-detail-title-row"><div><p class="eyebrow">${escapeHtml(category.label)} · Product Detail</p><h1>${escapeHtml(product.name)}</h1></div></div>
          <div class="product-detail-kpis">${categoryHeroKpis(product.categoryId, [product]).map((item) => `<article class="category-comparison-kpi power-kpi-card ${item.trend.isUp ? "is-up" : "is-down"}"><header><span>${escapeHtml(item.label)}</span><p><span aria-hidden="true">${item.trend.isUp ? "↑" : "↓"}</span>${escapeHtml(item.trend.text)} ${escapeHtml(item.suffix)}</p></header><div class="category-comparison-values"><section><small>${escapeHtml(item.currentLabel)}</small><strong>${formatCategoryRevenueM(item.amount)}</strong></section><section><small>${escapeHtml(item.priorLabel)}</small><strong>${formatCategoryRevenueM(item.priorAmount)}</strong></section></div></article>`).join("")}</div>
        </div>
        <div class="product-detail-overview-media">
          <img src="${escapeAttr(productImageItems(product)[0]?.src || "")}" alt="${escapeAttr(product.name)}">
        </div>
      </section>
      <section class="module-block category-performance-content">
        <div class="module-head performance-contribution-head"><span>Overview Module</span><h2>Time Trend</h2></div>
        <div class="time-trend-grid">${renderQuarterComparisonPanel(product.categoryId, "trend")}${renderPerformanceRevenueTrendPanel(product.categoryId, [product], "trend")}</div>
        <div class="module-head performance-contribution-head"><span>Overview Module</span><h2>Product Contribution</h2></div>
        ${renderProductPnContributionPanel(product)}
      </section>
      <section class="module-block"><div class="module-head"><span>Overview Module</span><h2>Geo Contribution</h2></div>${renderCategoryGeoContribution(product.categoryId, [product])}</section>
    </div>
  `;
  drawQuarterComparison(product.categoryId, [product]);
  drawPerformanceRevenueTrend(product.categoryId, [product]);
  drawProductPnContribution(product);
  drawCategoryGeoContribution(product.categoryId, [product]);
}

function renderProductPnContributionPanel(product) {
  const expanded = state.expandedTrendChart === "product-pn-contribution";
  const geos = unique((data.geoMetrics || []).filter((row) => row.modelId === product.id).map((row) => row.geo || "Unassigned")).sort();
  const selectedGeo = state.categoryContributionGeo[product.categoryId] || "all";
  return `<article class="performance-contribution-panel ${expanded ? "is-chart-expanded" : ""}"><header><div><span>Ship Rev</span><h3>${escapeHtml(product.name)} Contribution <small>by PN</small></h3></div><div class="performance-contribution-controls">${renderCategorySegmentControl(product.categoryId, "contribution")}<label class="performance-contribution-geo-select has-geo-icon"><span class="geo-globe-icon" aria-hidden="true"></span><select data-action="category-contribution-geo" data-category-id="${escapeAttr(product.categoryId)}" aria-label="Contribution Geo"><option value="all" ${selectedGeo === "all" ? "selected" : ""}>All Geos</option>${geos.map((geo) => `<option value="${escapeAttr(geo)}" ${selectedGeo === geo ? "selected" : ""}>${escapeHtml(displayLocationLabel(geo))}</option>`).join("")}</select></label>${renderDetailPnSelector("contribution")}${renderCategoryMetricSettings(product.categoryId, "contribution")}${renderOverviewExpandButton("product-pn-contribution", "PN contribution")}</div></header><div class="product-pn-contribution-layout"><div id="productPnContributionPlot" class="performance-contribution-plot"></div><aside id="productPnContributionLegend" class="product-pn-segment-legend" aria-label="PN legend by segment"></aside></div></article>`;
}

function drawProductPnContribution(product) {
  const option = categoryOverviewMetricOption(product.categoryId, "contribution");
  const period = categoryPerformancePeriod(product.categoryId, [product]);
  const segment = categoryOverviewSegment(product.categoryId, "contribution");
  const selectedGeo = state.categoryContributionGeo[product.categoryId] || "all";
  const source = selectedGeo === "all" ? data.productMetrics : (data.geoMetrics || []).filter((row) => (row.geo || "Unassigned") === selectedGeo);
  const rows = categoryOverviewRowsForPeriod(product.categoryId, [product.id], period, false, source).filter((row) => rowMatchesCategorySegment(row, segment) && rowMatchesDetailPanelPn(row, "contribution"));
  const totals = new Map();
  rows.forEach((row) => { const pn = row.partNumber || "Unassigned PN"; totals.set(pn, (totals.get(pn) || 0) + Number(row[option.field] || 0)); });
  const items = [...totals.entries()].map(([pn, value]) => ({ pn, value, segment: detailPnSegment(pn) })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const colors = items.map((_, index) => overviewPalette[index % overviewPalette.length]);
  drawPlot("productPnContributionPlot", items.length ? [{ labels: items.map((item) => item.pn), values: items.map((item) => item.value), type: "pie", hole: 0.54, textinfo: "percent", textposition: "inside", insidetextorientation: "horizontal", marker: { colors }, hovertemplate: `<b>%{label}</b><br>${escapeHtml(option.label)}: %{value:,.2f}<br>%{percent}<extra></extra>` }] : [], { height: expandedPlotHeight("product-pn-contribution", 280), margin: { l: 24, r: 24, t: 12, b: 12 }, showlegend: false, uniformtext: { minsize: 9, mode: "hide" } });
  const legend = document.querySelector("#productPnContributionLegend");
  if (legend) legend.innerHTML = ["Consumer", "Commercial"].map((segment) => `<section><h4>${segment}</h4>${items.filter((item) => item.segment === segment).map((item) => { const index = items.indexOf(item); return `<div><i style="--pn-color:${colors[index]}"></i><span>${escapeHtml(item.pn)}</span></div>`; }).join("") || `<p>No PN</p>`}</section>`).join("");
}

function expandedPlotHeight(chart, fallback) { return state.expandedTrendChart === chart ? 620 : fallback; }

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
    ...layout,
    // Merge axes after the caller layout so chart-specific settings cannot
    // accidentally remove automatic margins and clip long labels or titles.
    xaxis: { automargin: true, gridcolor: "#ece8df", zerolinecolor: "#dedbd2", ...(layout.xaxis || {}) },
    yaxis: { automargin: true, gridcolor: "#ece8df", zerolinecolor: "#dedbd2", ...(layout.yaxis || {}) },
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
  const periodControl = scope === "category" && active === "quarter" && state.categoryView === "overview"
    ? renderCategoryQuarterSelector(options)
    : `
      <select class="period-select" data-action="period-select" data-scope="${scope}" aria-label="${scope} period">
        ${options.map((period) => `<option value="${escapeAttr(period)}" ${period === selected ? "selected" : ""}>${escapeHtml(period)}</option>`).join("")}
      </select>
    `;
  return `
    <div class="time-control">
      <div class="segmented" aria-label="${scope} time granularity">
        ${Object.entries(granularityLabels)
          .map(([key, label]) => `<button type="button" class="${active === key ? "is-active" : ""}" data-action="granularity" data-scope="${scope}" data-granularity="${key}">${label}</button>`)
          .join("")}
      </div>
      ${periodControl}
    </div>
  `;
}

function ensureSelectedCategoryPeriods() {
  const options = getPeriodOptions("quarter");
  const valid = state.selectedCategoryPeriods.filter((period) => options.includes(period));
  state.selectedCategoryPeriods = sortedPeriods(valid);
  if (state.selectedCategoryPeriods.length) {
    state.selectedPeriod.category = state.selectedCategoryPeriods.at(-1);
  } else {
    state.selectedPeriod.category = null;
  }
  return state.selectedCategoryPeriods;
}

function monthsForFiscalQuarter(period) {
  const parsed = parseFiscalPeriodLabel(period);
  if (!parsed?.fiscalQuarter) return [];
  return (data.catalog?.periodMeta || [])
    .filter((item) => item.fiscalYear === parsed.fiscalYear && item.fiscalQuarter === parsed.fiscalQuarter)
    .map((item) => item.monthLabel || item.date?.slice(0, 7))
    .filter(Boolean);
}

function quartersForFiscalYear(fiscalYear) {
  return getPeriodOptions("quarter").filter((period) => parseFiscalPeriodLabel(period)?.fiscalYear === fiscalYear);
}

function monthsForFiscalYear(fiscalYear) {
  return (data.catalog?.periodMeta || [])
    .filter((item) => item.fiscalYear === fiscalYear)
    .map((item) => item.monthLabel || item.date?.slice(0, 7))
    .filter(Boolean);
}

function activeGlobalTimeValues() {
  if (state.granularity === "year") return state.selectedCategoryYears || [];
  if (state.granularity === "month") return state.selectedCategoryMonths || [];
  return ensureSelectedCategoryPeriods();
}

function hasActiveGlobalTime() {
  return activeGlobalTimeValues().length > 0;
}

function selectedCategoryPeriodsLabel(periods) {
  if (!periods.length) return "No time selected";
  const parsed = periods.map(parseFiscalPeriodLabel).filter(Boolean);
  const fiscalYears = [...new Set(parsed.map((period) => period.fiscalYear))];
  if (periods.length === 1) return periods[0];
  if (fiscalYears.length === 1) {
    const quarters = parsed.map((period) => period.fiscalQuarter).filter(Boolean).join(" + ");
    return `${fiscalYears[0]} ${quarters}`;
  }
  return `${periods.length} quarters selected`;
}

function renderCategoryQuarterSelector(options) {
  const selected = ensureSelectedCategoryPeriods();
  const selectedSet = new Set(selected);
  const groups = [...new Set(options.map((period) => parseFiscalPeriodLabel(period)?.fiscalYear).filter(Boolean))].reverse();
  return `
    <details class="period-multi-select" ${state.categoryPeriodMenuOpen ? "open" : ""}>
      <summary aria-label="Choose one or more fiscal quarters">
        <span>${escapeHtml(selectedCategoryPeriodsLabel(selected))}</span>
        <span aria-hidden="true">⌄</span>
      </summary>
      <div class="period-multi-menu">
        ${groups.map((fiscalYear) => `
          <fieldset>
            <legend>${escapeHtml(fiscalYear)}</legend>
            ${options
              .filter((period) => period.startsWith(`${fiscalYear} `))
              .reverse()
              .map((period) => `
                <label>
                  <input
                    type="checkbox"
                    data-action="category-quarter-period"
                    value="${escapeAttr(period)}"
                    ${selectedSet.has(period) ? "checked" : ""}
                  >
                  <span>${escapeHtml(parseFiscalPeriodLabel(period)?.fiscalQuarter || period)}</span>
                </label>
              `).join("")}
          </fieldset>
        `).join("")}
      </div>
    </details>
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
  if (scope === "category") return activeGlobalTimeValues().at(-1) || null;
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

function handleAdapterLogoPointerDown(event) {
  const wall = event.target.closest(".adapter-logo-wall");
  if (!wall || event.button !== 0 || event.target.closest("button, a")) return;
  adapterLogoDrag = { wall, startX: event.clientX, scrollLeft: wall.scrollLeft, moved: false };
  wall.setPointerCapture?.(event.pointerId);
  const move = (moveEvent) => {
    if (!adapterLogoDrag) return;
    const delta = moveEvent.clientX - adapterLogoDrag.startX;
    if (Math.abs(delta) > 5) adapterLogoDrag.moved = true;
    adapterLogoDrag.wall.scrollLeft = adapterLogoDrag.scrollLeft - delta;
  };
  const end = () => {
    adapterLogoDrag = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end, { once: true });
  window.addEventListener("pointercancel", end, { once: true });
}

function selectedOptionValues(select) {
  return Array.from(select.selectedOptions || []).map((option) => option.value);
}

function handleClick(event) {
  const button = event.target.closest("button, [data-route-category][data-route-product]");
  if (!button) return;

  const routeCategory = button.dataset.routeCategory;
  if (routeCategory) {
    state.homeView = "landing";
    if (!button.dataset.routeProduct) state.categoryView = button.dataset.routeView || "overview";
    routeTo(routeCategory, button.dataset.routeProduct);
    return;
  }

  const action = button.dataset.action;
  if (!action) return;

  if (action === "home") {
    state.homeView = "landing";
    routeTo();
  } else if (action === "power-overall") {
    state.homeView = "overall";
    routeTo();
    window.scrollTo({ top: 0, behavior: "instant" });
  } else if (action === "power-home") {
    state.homeView = "landing";
    renderHome();
    window.scrollTo({ top: 0, behavior: "instant" });
  } else if (action === "global-time-tab") {
    state.globalTimeTab = ["year", "quarter", "month"].includes(button.dataset.timeTab) ? button.dataset.timeTab : "quarter";
    state.globalTimeMenuOpen = true;
    render();
  } else if (action === "trend-chart-expand") {
    state.expandedTrendChart = state.expandedTrendChart === button.dataset.chart ? null : button.dataset.chart;
    render();
  } else if (action === "category-geo-chart-mode") {
    state.categoryGeoChartModes[button.dataset.chart] = button.dataset.mode === "bar" ? "bar" : "pie";
    render();
  } else if (action === "detail-pn-all") {
    const panel = button.dataset.panel;
    const key = detailPanelPnKey(panel);
    const eligible = detailEligiblePns(panel);
    const selected = detailSelectedPns(panel);
    state.detailPanelPns[key] = selected.length === eligible.length ? [] : [...eligible];
    render();
  } else if (action === "category-view") {
    state.categoryView = button.dataset.view;
    render();
  } else if (action === "competitor-adapter-core") {
    state.competitorDbFilters.adapter = { ...(state.competitorDbFilters.adapter || {}), band: "100–139W", port: "multi" };
    render();
  } else if (action === "competitor-db-reset") {
    state.competitorDbFilters[state.categoryId] = state.categoryId === "power_bank" ? { verification: "confirmed" } : {};
    render();
  } else if (action === "adapter-brand-cloud") {
    state.adapterCompetitiveBrand = button.dataset.brand;
    render();
  } else if (action === "competitor-db-brand-cloud") {
    state.competitorDbBrand[state.categoryId] = button.dataset.brand;
    render();
  } else if (action === "competitive-brand-focus") {
    const card = document.getElementById(`company-${button.dataset.brand}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    if (scope === "category" && button.dataset.granularity === "quarter") {
      state.selectedCategoryPeriods = state.selectedPeriod.category ? [state.selectedPeriod.category] : [];
    }
    if (scope === "category") state.categoryPeriodMenuOpen = false;
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
  } else if (action === "category-overview-product-all") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const selectedIds = categoryOverviewSelectedProductIds(categoryId, products);
    if (selectedIds.length === products.length) state.categoryOverviewProducts[categoryId] = [];
    else delete state.categoryOverviewProducts[categoryId];
    render();
  } else if (action === "category-geo-product-all") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const selectedIds = categoryGeoSelectedProductIds(categoryId, products);
    if (selectedIds.length === products.length) state.categoryGeoProducts[categoryId] = [];
    else delete state.categoryGeoProducts[categoryId];
    render();
  } else if (action === "category-geo-metric") {
    state.categoryGeoMetric[button.dataset.categoryId || state.categoryId] = button.dataset.metric;
    render();
  } else if (action === "category-trend-product-all") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    state.categoryTrendProductSelectorOpen = true;
    const products = overviewProductsForCategory(categoryId);
    const selectedIds = categoryTrendSelectedProductIds(categoryId, products);
    if (selectedIds.length === products.length) state.categoryTrendProducts[categoryId] = [];
    else delete state.categoryTrendProducts[categoryId];
    render();
  } else if (action === "category-trend-geo-all") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    state.categoryTrendGeos[categoryId] = [];
    state.categoryTrendGeoMenuOpen = true;
    render();
  } else if (action === "category-trend-period-all") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const productIds = new Set(products.map((product) => product.id));
    const available = sortedPeriods([...new Set(data.productMetrics.filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => `${row.fiscalYear} ${row.fiscalQuarter}`))]);
    const current = Array.isArray(state.categoryTrendPeriods[categoryId]) ? state.categoryTrendPeriods[categoryId] : defaultCategoryTrendPeriods(available);
    state.categoryTrendPeriods[categoryId] = current.length === available.length ? [] : [...available];
    state.categoryTrendPeriodMenuOpen = true;
    render();
  } else if (action === "category-overview-metric") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    state.categoryOverviewMetrics[`${categoryId}:${button.dataset.panel}`] = button.dataset.metric;
    render();
  } else if (action === "category-overview-segment") {
    const segment = ["Consumer", "Commercial"].includes(button.dataset.segment) ? button.dataset.segment : "all";
    const categoryId = button.dataset.categoryId || state.categoryId;
    state.categoryOverviewSegments[`${categoryId}:${button.dataset.panel}`] = segment;
    render();
  } else if (action === "category-contribution-segment") {
    state.categoryContributionSegment[state.categoryId] = ["Consumer", "Commercial"].includes(button.dataset.segment) ? button.dataset.segment : "all";
    render();
  } else if (action === "category-trend-mode") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    state.categoryTrendMode[categoryId] = ["breakdown", "stacked"].includes(button.dataset.trendMode) ? button.dataset.trendMode : "overall";
    render();
  } else if (action === "quarter-comparison-mode") {
    const categoryId = button.dataset.categoryId || state.categoryId;
    state.quarterComparisonMode[quarterComparisonStateKey(categoryId)] = button.dataset.trendMode === "stacked" ? "stacked" : "overall";
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
  if (target.dataset.action === "adapter-competitor-filter") {
    const module = target.dataset.module;
    state.adapterCompetitiveFilters[module] ||= {};
    state.adapterCompetitiveFilters[module][target.dataset.key] = target.value;
    render();
    return;
  }
  if (target.dataset.action?.startsWith("competitor-db-")) {
    const key = target.dataset.action.replace("competitor-db-", "");
    state.competitorDbFilters[state.categoryId] ||= {};
    state.competitorDbFilters[state.categoryId][key] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "detail-part-number-select") {
    state.partNumber = target.value || "all";
    render();
    return;
  }
  if (target.dataset.action === "category-overview-segment-select") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    const segment = ["Consumer", "Commercial"].includes(target.value) ? target.value : "all";
    state.categoryOverviewSegments[`${categoryId}:${target.dataset.panel}`] = segment;
    if (state.productId) delete state.detailPanelPns[detailPanelPnKey(target.dataset.panel)];
    render();
    return;
  }
  if (target.dataset.action === "detail-pn-select") {
    const panel = target.dataset.panel;
    const key = detailPanelPnKey(panel);
    const selected = new Set(detailSelectedPns(panel));
    if (target.checked) selected.add(target.value); else selected.delete(target.value);
    state.detailPanelPns[key] = detailEligiblePns(panel).filter((pn) => selected.has(pn));
    render();
    return;
  }
  if (target.dataset.action === "global-time-month") {
    state.granularity = "month";
    state.globalTimeTab = "month";
    const months = new Set(state.selectedCategoryMonths || []);
    if (target.checked) months.add(target.value); else months.delete(target.value);
    state.selectedCategoryMonths = sortedPeriods([...months]);
    state.selectedPeriod.category = state.selectedCategoryMonths.at(-1) || null;
    state.globalTimeMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "global-time-quarter") {
    state.granularity = "quarter";
    state.globalTimeTab = "quarter";
    const current = new Set(ensureSelectedCategoryPeriods());
    if (target.checked) current.add(target.value); else current.delete(target.value);
    state.selectedCategoryPeriods = sortedPeriods([...current]);
    const months = new Set(state.selectedCategoryMonths || []);
    monthsForFiscalQuarter(target.value).forEach((month) => target.checked ? months.add(month) : months.delete(month));
    state.selectedCategoryMonths = sortedPeriods([...months]);
    state.selectedPeriod.category = state.selectedCategoryPeriods.at(-1) || null;
    state.globalTimeMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "global-time-year") {
    state.granularity = "year";
    state.globalTimeTab = "year";
    const years = new Set(state.selectedCategoryYears || []);
    const quarters = new Set(ensureSelectedCategoryPeriods());
    const months = new Set(state.selectedCategoryMonths || []);
    if (target.checked) years.add(target.value); else years.delete(target.value);
    quartersForFiscalYear(target.value).forEach((period) => target.checked ? quarters.add(period) : quarters.delete(period));
    monthsForFiscalYear(target.value).forEach((month) => target.checked ? months.add(month) : months.delete(month));
    state.selectedCategoryYears = sortedPeriods([...years]);
    state.selectedCategoryPeriods = sortedPeriods([...quarters]);
    state.selectedCategoryMonths = sortedPeriods([...months]);
    state.selectedPeriod.category = state.selectedCategoryYears.at(-1) || null;
    state.globalTimeMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "category-geo-time-quarter") {
    const current = new Set(categoryGeoSelectedPeriods(state.categoryId));
    if (target.checked) current.add(target.value); else current.delete(target.value);
    state.categoryGeoPeriods[state.categoryId] = sortedPeriods([...current]);
    state.categoryGeoTimeMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "category-geo-time-year") {
    const current = new Set(categoryGeoSelectedPeriods(state.categoryId));
    ["Q1", "Q2", "Q3", "Q4"].forEach((quarter) => {
      const period = `${target.value} ${quarter}`;
      if (target.checked) current.add(period); else current.delete(period);
    });
    state.categoryGeoPeriods[state.categoryId] = sortedPeriods([...current]);
    state.categoryGeoTimeMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "trend-series-all") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const available = state.productId ? detailSelectedPns("trend") : categoryTrendSelectedProductIds(categoryId, products);
    const visibleKey = state.productId ? `${categoryId}:${state.productId}` : categoryId;
    state.categoryTrendVisibleSeries[visibleKey] = target.checked ? [...available] : [];
    render();
    return;
  }
  if (target.dataset.action === "trend-series-product") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const available = state.productId ? detailSelectedPns("trend") : categoryTrendSelectedProductIds(categoryId, products);
    const visible = [...document.querySelectorAll('input[data-action="trend-series-product"]:checked')].map((input) => input.value);
    const visibleKey = state.productId ? `${categoryId}:${state.productId}` : categoryId;
    state.categoryTrendVisibleSeries[visibleKey] = available.filter((id) => visible.includes(id));
    render();
    return;
  }
  if (target.dataset.action === "category-ranking-geo") {
    state.categoryRankingGeo[target.dataset.categoryId || state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "quarter-comparison-all") {
    state.quarterComparisonYears[state.categoryId] = target.checked ? ["FY2526", "FY2627"] : [];
    render();
    return;
  }
  if (target.dataset.action === "quarter-comparison-year") {
    let selected = state.quarterComparisonYears[state.categoryId] || ["FY2526", "FY2627"];
    selected = target.checked ? [...new Set([...selected, target.value])] : selected.filter((year) => year !== target.value);
    state.quarterComparisonYears[state.categoryId] = selected;
    render();
    return;
  }
  if (target.dataset.action === "category-trend-period") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const productIds = new Set(products.map((product) => product.id));
    const available = sortedPeriods([...new Set(data.productMetrics.filter((row) => categoryMatchesOverview(row, categoryId) && productIds.has(row.modelId)).map((row) => `${row.fiscalYear} ${row.fiscalQuarter}`))]);
    let selected = Array.isArray(state.categoryTrendPeriods[categoryId]) ? [...state.categoryTrendPeriods[categoryId]] : defaultCategoryTrendPeriods(available);
    if (target.checked) selected = [...new Set([...selected, target.value])];
    else if (selected.length > 1) selected = selected.filter((period) => period !== target.value);
    else { target.checked = true; return; }
    state.categoryTrendPeriods[categoryId] = available.filter((period) => selected.includes(period));
    state.categoryTrendPeriodMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "category-trend-geo") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    let selected = Array.isArray(state.categoryTrendGeos[categoryId]) ? [...state.categoryTrendGeos[categoryId]] : [];
    if (target.checked) selected = [...new Set([...selected, target.value])];
    else selected = selected.filter((geo) => geo !== target.value);
    state.categoryTrendGeos[categoryId] = selected;
    state.categoryTrendGeoMenuOpen = true;
    render();
    return;
  }
  if (target.dataset.action === "category-contribution-geo") {
    state.categoryContributionGeo[target.dataset.categoryId || state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "category-geo-product") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const availableIds = products.map((product) => product.id);
    let selectedIds = Array.isArray(state.categoryGeoProducts[categoryId])
      ? [...state.categoryGeoProducts[categoryId]]
      : [...availableIds];
    if (target.checked) selectedIds = [...new Set([...selectedIds, target.value])];
    else selectedIds = selectedIds.filter((productId) => productId !== target.value);
    const validIds = availableIds.filter((productId) => selectedIds.includes(productId));
    if (validIds.length === availableIds.length) delete state.categoryGeoProducts[categoryId];
    else state.categoryGeoProducts[categoryId] = validIds;
    render();
    return;
  }
  if (target.dataset.action === "category-geo-select") {
    state.categoryGeoSelected[target.dataset.categoryId || state.categoryId] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "home-power-scope") {
    state.homePowerScope = target.value;
    render();
    return;
  }
  if (target.dataset.action === "category-overview-product") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    const products = overviewProductsForCategory(categoryId);
    const availableIds = products.map((product) => product.id);
    let selectedIds = Array.isArray(state.categoryOverviewProducts[categoryId])
      ? [...state.categoryOverviewProducts[categoryId]]
      : [...availableIds];
    if (target.checked) {
      selectedIds = [...new Set([...selectedIds, target.value])];
    } else {
      selectedIds = selectedIds.filter((productId) => productId !== target.value);
    }
    const validIds = availableIds.filter((productId) => selectedIds.includes(productId));
    if (validIds.length === availableIds.length) delete state.categoryOverviewProducts[categoryId];
    else state.categoryOverviewProducts[categoryId] = validIds;
    render();
    return;
  }
  if (target.dataset.action === "category-trend-product") {
    const categoryId = target.dataset.categoryId || state.categoryId;
    state.categoryTrendProductSelectorOpen = true;
    const products = overviewProductsForCategory(categoryId);
    const availableIds = products.map((product) => product.id);
    let selectedIds = Array.isArray(state.categoryTrendProducts[categoryId])
      ? [...state.categoryTrendProducts[categoryId]]
      : [...availableIds];
    if (target.checked) {
      selectedIds = [...new Set([...selectedIds, target.value])];
    } else {
      selectedIds = selectedIds.filter((productId) => productId !== target.value);
    }
    const validIds = availableIds.filter((productId) => selectedIds.includes(productId));
    if (validIds.length === availableIds.length) delete state.categoryTrendProducts[categoryId];
    else state.categoryTrendProducts[categoryId] = validIds;
    render();
    return;
  }
  if (target.dataset.action?.startsWith("home-model-")) {
    state.homeTopModelFilters[target.dataset.action.replace("home-model-", "")] = target.value;
    render();
    return;
  }
  if (target.dataset.action?.startsWith("home-partner-")) {
    state.homeTopPartnerFilters[target.dataset.action.replace("home-partner-", "")] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "period-select") {
    state.selectedPeriod[target.dataset.scope] = target.value;
    render();
    return;
  }
  if (target.dataset.action === "category-quarter-period") {
    const selectedPeriodValue = target.value;
    let selected = ensureSelectedCategoryPeriods();
    if (target.checked) {
      if (!selected.includes(selectedPeriodValue)) selected.push(selectedPeriodValue);
    } else {
      selected = selected.filter((period) => period !== selectedPeriodValue);
    }
    state.selectedCategoryPeriods = sortedPeriods(selected);
    const months = new Set(state.selectedCategoryMonths || []);
    monthsForFiscalQuarter(selectedPeriodValue).forEach((month) => target.checked ? months.add(month) : months.delete(month));
    state.selectedCategoryMonths = sortedPeriods([...months]);
    state.selectedPeriod.category = state.selectedCategoryPeriods.at(-1) || null;
    state.categoryPeriodMenuOpen = true;
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
    if (granularity === "month") return fiscal.monthLabel || dateString.slice(0, 7);
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
