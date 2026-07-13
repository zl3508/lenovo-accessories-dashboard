# Lenovo Accessories Dashboard

Static Lenovo accessories dashboard for GitHub Pages.

- Native HTML, CSS, and JavaScript
- Plotly.js chart rendering in the browser
- No backend; the page reads only `data/*.json`
- Python data generation from product Excel exports or fallback modeled data

## Page Structure

- Home: select `Adapter`, `Power Bank`, or `Power Cable`
- Category pages: `Market Analysis`, `Competitor Analysis`, `Category Overview`, and `Product List`
- Category Overview: product summary, data filters, user feedback, and product decision modules
- Product detail pages: `Segment`, `Product`, and `User` dimensions
- Time filters: fiscal quarter and fiscal year, using labels such as `FY2627 Q1`
- Product dimension: all PN or a single part number
- Segment dimension: all, commercial, or consumer

## Current Real Products

Adapters:

- Lenovo Multi-port USB-C 150W Laptop GaN Charger
- Lenovo Multi-port USB-C 100W GaN Charger
- Lenovo 65W Mini USB-C GaN Charger
- Lenovo GaN Nano 65W Adapter

Power banks:

- Lenovo Hybrid 2-in-1 Power Bank 140W (10.2K)
- Lenovo 140W Smart Laptop Power Bank

Cable:

- Lenovo 240W USB-C Retractable Cable

## Data Files

The dashboard reads:

- `catalog.json`: categories, products, PN variants, filters, fiscal periods, and policy reports
- `product_metrics.json`: order revenue, ship revenue, backlog revenue, order quantity, ship quantity, backlog quantity, cost, margin, segment, and PN
- `market_metrics.json`: category market size, Lenovo share, product share, search index, and price index
- `brand_market_metrics.json`: Lenovo and competitor brand sales, share, new launches, and star products
- `supply_chain.json`: component, supplier, price index, lead time, capacity, and supply news
- `consumer_insights.json`: review keywords, sentiment, frequency, and rating
- `metadata.json`: generation time, record counts, source files, and update mode

Detailed field requirements are in [`docs/data_requirements.md`](docs/data_requirements.md).

## Local Run

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

## Update Data

Use the real product Excel exports:

```bash
python3 scripts/generate_dashboard_data.py \
  --source-dir "/Users/albert/Desktop/2026.7.13" \
  --output-dir data
```

If the real source directory is missing, the script falls back to modeled data from the sample workbook path.

## GitHub Pages

The GitHub Pages entry point is:

```text
index.html
```

`.github/workflows/update-dashboard-data.yml` contains a daily update template.
