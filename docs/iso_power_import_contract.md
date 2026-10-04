# ISO Power Import Contract

## Purpose

This contract defines how future ISO dashboard workbooks with the same logical
structure are imported. It deliberately binds to PivotCache field signatures,
not to workbook filenames, sheet names, cache numbers, chart positions, or cell
ranges.

## Authoritative Power Filter

Use an exact, whitespace-trimmed, case-insensitive match:

```text
KEY Category = Power
```

Do not use a free-text search for `power`, and do not use `Category 2` alone.
In the FY2627 Q2 workbook, 188 rows have `Category 2 = POWER` but
`KEY Category = VLH`; these are outside the dashboard's Power key-category
definition and are intentionally excluded.

## Dataset 1: Power Shipments

This is the authoritative dataset for top-line Power performance.

Required source fields:

```text
Country, Part Number, Fiscal Year, Fiscal Quarter,
Ship_Rev, Ship_Qty, Ship_AUR, KEY Category
```

Supported dimensions:

- Time: Fiscal Year, Fiscal Quarter, Quarter, Half Year
- Geography: Geo, New SubGeo, Country
- Customer: Segment, BU Segment, BPC Segment, New Sub-Segment
- Channel: Distribution_channel, New Channel
- Product: Category 1/2/3, Part Number, Model, Description, DIB, New Biz

Measures:

- `Ship_Rev`: shipment revenue
- `Ship_Qty`: shipment quantity
- `Ship_AUR`: shipment average unit revenue
- `calculated_ship_aur = Ship_Rev / Ship_Qty` when quantity is nonzero

The helper fields `Ship_Rev (M)` and `Ship_Qty (K)` must not be treated as
independent measures; recompute display units from the base measures.

## Dataset 2: Power Partner Sales

This current-quarter dataset adds Partner, Sold-to Customer, Partner Type and
related channel dimensions. Filter with `Key Category = Power`.

Use it for partner and customer analysis only. It is a scoped dashboard source
and does not fully reconcile to the authoritative top-line shipment dataset.

## Dataset 3: Power Adoption Rate

Required fields:

```text
GEO, Segment, Category, Quarter, Rate
```

Filter `Category` to `Power` or `< Power > AR`. The grain is:

```text
GEO + Segment + Quarter
```

Never forward-fill a missing quarter. Show the metric as unavailable until the
new workbook includes that period.

## Update Semantics

1. Validate field signatures before reading data.
2. Rebuild from the complete uploaded workbook by default.
3. If an incremental mode is required, replace complete fiscal-quarter
   partitions; do not append individual rows to an existing quarter.
4. Derive `period_key` from Fiscal Year and Fiscal Quarter.
5. Aggregate measures only after applying the exact Power filter.
6. Recompute AUR from aggregated revenue and quantity; never average row AURs.
7. Publish the new snapshot only after all blocking validations pass.

## Blocking Validations

- Required field signatures exist.
- At least one Power row is present.
- Part Number is nonblank on shipment rows.
- Revenue and quantity parse as numbers.
- Row AUR matches revenue divided by quantity within USD 0.01 when quantity is
  nonzero.
- Fiscal period values can be normalized.

Warnings should be raised for new category values, geographies, countries,
missing latest-quarter adoption-rate data, or partner totals that do not
reconcile to the top-line shipment total.

## FY2627 Q2 Baseline

- Source rows in the authoritative shipment cache: 449,559
- Power shipment rows after the exact filter: 42,225
- Unique Power part numbers: 686
- Covered periods: FY2425 Q1 through FY2627 Q2
- Total Ship Revenue: USD 198,626,831.60
- Total Ship Quantity: 5,451,673
- Weighted Ship AUR: USD 36.43
- FY2627 Q2 Ship Revenue: USD 31,482,931.39
- FY2627 Q2 Ship Quantity: 730,162
- FY2627 Q2 weighted Ship AUR: USD 43.12
- Blank Part Number rows: 0
- AUR validation failures: 0

The Power adoption-rate cache currently ends at FY2627 Q1, so FY2627 Q2 Power
AR must be reported as unavailable. The partner cache contains FY2627 Q2 only.

## Scope Limitation

This workbook exposes shipment measures and Power AR. It does not provide
authoritative `Order_Rev`, `Order_Qty`, `Bklg_Rev`, or `Bklg_Qty` fields in the
Power shipment interface. Those metrics require a separate source and must not
be inferred from shipment data.

## Reusable Command

```bash
python3 scripts/extract_iso_power.py \
  "/path/to/new-dashboard.xlsx" \
  --summary-output data/iso_power/latest_summary.json
```

Add `--rows-output /path/to/power_rows.csv` only when normalized row-level data
is needed for downstream processing.

To refresh the Power executive dashboard on the home page, run:

```bash
python3 scripts/extract_iso_home.py \
  "/path/to/new-dashboard.xlsx" \
  --output data/iso_power/home_dashboard.json
```

The home extractor reads the current-quarter Power KPIs, Geo and Segment
attainment, weekly YoY comparison, Top Model rows and Top Partner rows directly
from the workbook's matching PivotCache signatures. It also records the source
filename, data cutoff, fiscal period and display unit in the JSON metadata.

The supplied workbook contains an exact Power MT target for FY2627 Q2 but does
not expose exact Power-only MT targets for Q1, Q3 or Q4. The extractor estimates
those three targets from the workbook's overall category quarter ratios. Every
estimated target is emitted with `targetModeled: true` and is displayed with an
asterisk in the dashboard. Actual shipment revenue, YoY comparisons, weekly
values and the FY2627 Q2 target are not modeled.
