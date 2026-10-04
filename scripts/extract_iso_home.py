#!/usr/bin/env python3
"""Build the Power executive-home dataset from the recurring ISO workbook.

The workbook keeps shipment and partner detail in PivotCache XML. This script
reuses the cache decoder in ``extract_iso_power.py`` and writes a small JSON
file that can be loaded directly by the static GitHub Pages dashboard.
"""

from __future__ import annotations

import argparse
import json
import math
import zipfile
from collections import defaultdict
from pathlib import Path

import openpyxl

from extract_iso_power import (
    cache_definition,
    find_cache,
    fiscal_period,
    iter_records,
    normalized,
    to_number,
)


CURRENT_PERIOD = "FY2627'Q2"
PREVIOUS_PERIOD = "FY2526'Q2"
PRIOR_PERIOD = "FY2425'Q2"


def millions(value: float) -> float:
    return value / 1_000_000


def growth(current: float, previous: float) -> float | None:
    return current / previous - 1 if previous else None


def scope_name(value) -> str:
    name = normalized(value)
    if name == "commercial":
        return "commercial"
    if name == "consumer":
        return "consumer"
    return "others"


def aggregate_shipments(archive: zipfile.ZipFile):
    required = {
        "KEY Category", "Fiscal Year", "Fiscal Quarter", "Ship_Rev", "Ship_Qty",
        "Model", "Part Number", "Geo", "Segment", "BU Segment", "DIB",
        "New Channel", "New Biz",
    }
    number, fields, shared = find_cache(archive, required)[0]
    indexes = {name: fields.index(name) for name in fields}

    by_period = defaultdict(float)
    by_period_dib = defaultdict(float)
    by_period_geo = defaultdict(float)
    by_period_segment = defaultdict(float)
    model_buckets = defaultdict(float)

    for row in iter_records(archive, number, shared):
        if normalized(row[indexes["KEY Category"]]) != "power":
            continue
        period = fiscal_period(row[indexes["Fiscal Year"]], row[indexes["Fiscal Quarter"]])
        if not period:
            continue
        revenue = to_number(row[indexes["Ship_Rev"]])
        by_period[period] += revenue
        by_period_dib[(period, str(row[indexes["DIB"]] or "Unassigned"))] += revenue
        by_period_geo[(period, str(row[indexes["Geo"]] or "Unassigned"))] += revenue
        by_period_segment[(period, scope_name(row[indexes["Segment"]]))] += revenue

        if period == CURRENT_PERIOD:
            model = str(row[indexes["Model"]] or row[indexes["Part Number"]] or "Unassigned").strip()
            channel = str(row[indexes["New Channel"]] or "(blank)").strip()
            key = (
                model,
                str(row[indexes["Geo"]] or "Unassigned").strip(),
                str(row[indexes["BU Segment"]] or "OTHERS").strip(),
                str(row[indexes["DIB"]] or "Unassigned").strip(),
                channel,
            )
            model_buckets[key] += revenue

    return {
        "cache": number,
        "by_period": by_period,
        "by_period_dib": by_period_dib,
        "by_period_geo": by_period_geo,
        "by_period_segment": by_period_segment,
        "top_model_rows": [
            {
                "name": key[0],
                "geo": key[1],
                "segment": key[2],
                "dib": key[3],
                "channel": key[4],
                "shipRevenueM": millions(value),
            }
            for key, value in model_buckets.items()
            if key[0] != "Unassigned" and value
        ],
    }


def aggregate_weekly(archive: zipfile.ZipFile):
    required = {
        "Key Category", "Fiscal Year", "Fiscal Quarter", "Week", "Ship_Rev", "New Biz",
    }
    number, fields, shared = find_cache(archive, required)[0]
    indexes = {name: fields.index(name) for name in fields}
    values = defaultdict(float)
    for row in iter_records(archive, number, shared):
        if normalized(row[indexes["Key Category"]]) != "power":
            continue
        if normalized(row[indexes["New Biz"]]) != "w/o new biz":
            continue
        period = fiscal_period(row[indexes["Fiscal Year"]], row[indexes["Fiscal Quarter"]])
        if period not in {CURRENT_PERIOD, PREVIOUS_PERIOD}:
            continue
        raw_week = row[indexes["Week"]]
        if isinstance(raw_week, (int, float)) and float(raw_week).is_integer():
            week = f"W{int(raw_week)}"
        else:
            week = str(raw_week or "").strip().upper().replace("WEEK", "W")
            if week and not week.startswith("W"):
                week = f"W{week}"
        values[(period, week)] += to_number(row[indexes["Ship_Rev"]])

    def week_number(label: str) -> int:
        digits = "".join(char for char in label if char.isdigit())
        return int(digits or 0)

    weeks = sorted({key[1] for key in values if key[1]}, key=week_number)
    return {
        "cache": number,
        "rows": [
            {
                "week": week,
                "previousM": millions(values[(PREVIOUS_PERIOD, week)]),
                "currentM": millions(values[(CURRENT_PERIOD, week)]),
                "yoy": growth(values[(CURRENT_PERIOD, week)], values[(PREVIOUS_PERIOD, week)]),
            }
            for week in weeks
        ],
    }


def aggregate_partners(archive: zipfile.ZipFile):
    required = {
        "Key Category", "Fiscal Year", "Fiscal Qtr", "Geo", "BU_Segment", "DIB",
        "Ship Rev", "Partner",
    }
    number, fields, shared = find_cache(archive, required)[0]
    indexes = {name: fields.index(name) for name in fields}
    buckets = defaultdict(float)
    for row in iter_records(archive, number, shared):
        if normalized(row[indexes["Key Category"]]) != "power":
            continue
        period = fiscal_period(row[indexes["Fiscal Year"]], row[indexes["Fiscal Qtr"]])
        if period != CURRENT_PERIOD:
            continue
        partner = str(row[indexes["Partner"]] or "Unassigned").strip()
        if normalized(partner) in {"", "unassigned"}:
            continue
        key = (
            partner,
            str(row[indexes["Geo"]] or "Unassigned").strip(),
            str(row[indexes["BU_Segment"]] or "OTHERS").strip(),
            str(row[indexes["DIB"]] or "Unassigned").strip(),
        )
        buckets[key] += to_number(row[indexes["Ship Rev"]])
    return {
        "cache": number,
        "rows": [
            {
                "name": key[0],
                "geo": key[1],
                "segment": key[2],
                "dib": key[3],
                "shipRevenueM": millions(value),
            }
            for key, value in buckets.items()
            if value
        ],
    }


def q2_targets(workbook_path: Path):
    workbook = openpyxl.load_workbook(workbook_path, data_only=True, read_only=True)
    category_sheet = workbook["8-KeyCategory"]
    target_by_scope = {}
    for row in range(5, category_sheet.max_row + 1):
        geo, category, segment, target = [category_sheet.cell(row, column).value for column in range(62, 66)]
        if geo == "(All)" and category == "Power" and segment in {"(All)", "Commercial", "Consumer"}:
            key = "total" if segment == "(All)" else str(segment).lower()
            target_by_scope[key] = float(target)

    mt_sheet = workbook["#FY26 MT"]
    all_category_targets = {}
    for row in range(1, mt_sheet.max_row + 1):
        quarter = mt_sheet.cell(row, 2).value
        value = mt_sheet.cell(row, 12).value
        if quarter in {"Q1", "Q2", "Q3", "Q4"} and isinstance(value, (int, float)):
            all_category_targets[str(quarter)] = float(value)
    workbook.close()
    if set(target_by_scope) != {"total", "commercial", "consumer"}:
        raise RuntimeError(f"Power Q2 MT targets were not found: {target_by_scope}")
    if set(all_category_targets) != {"Q1", "Q2", "Q3", "Q4"}:
        raise RuntimeError(f"Quarter MT ratios were not found: {all_category_targets}")
    return target_by_scope, all_category_targets


def build_dashboard(workbook_path: Path):
    with zipfile.ZipFile(workbook_path) as archive:
        shipments = aggregate_shipments(archive)
        weekly = aggregate_weekly(archive)
        partners = aggregate_partners(archive)

    targets, quarter_scale = q2_targets(workbook_path)
    by_period = shipments["by_period"]
    by_period_dib = shipments["by_period_dib"]
    by_geo = shipments["by_period_geo"]
    by_segment = shipments["by_period_segment"]

    def standalone(period):
        return sum(
            value for (candidate, dib), value in by_period_dib.items()
            if candidate == period and normalized(dib) == "w/o dib"
        )

    kpis = []
    for label, period, comparison, value in (
        ("Revenue", PREVIOUS_PERIOD, PRIOR_PERIOD, by_period[PREVIOUS_PERIOD]),
        ("Standalone w/o DIB", PREVIOUS_PERIOD, PRIOR_PERIOD, standalone(PREVIOUS_PERIOD)),
        ("Revenue", CURRENT_PERIOD, PREVIOUS_PERIOD, by_period[CURRENT_PERIOD]),
        ("Standalone w/o DIB", CURRENT_PERIOD, PREVIOUS_PERIOD, standalone(CURRENT_PERIOD)),
    ):
        previous_value = by_period[comparison] if label == "Revenue" else standalone(comparison)
        kpis.append({
            "label": label,
            "period": period.replace("'", " "),
            "valueM": millions(value),
            "yoy": growth(value, previous_value),
            "modeled": False,
        })

    quarter_attain = {}
    for scope in ("total", "commercial", "consumer"):
        q2_target = targets[scope]
        quarters = []
        for quarter in ("Q1", "Q2", "Q3", "Q4"):
            modeled = quarter != "Q2"
            target = q2_target * quarter_scale[quarter] / quarter_scale["Q2"] if modeled else q2_target
            actual = (
                millions(by_period[f"FY2627'{quarter}"])
                if scope == "total"
                else millions(by_segment[(f"FY2627'{quarter}", scope)])
            )
            quarters.append({
                "quarter": quarter,
                "targetM": target,
                "actualM": actual,
                "attain": actual / target if target else None,
                "targetModeled": modeled,
                "actualAvailable": actual > 0,
            })
        annual_target = sum(item["targetM"] for item in quarters)
        ytd_actual = sum(item["actualM"] for item in quarters)
        quarter_attain[scope] = {
            "total": {
                "targetM": annual_target,
                "actualM": ytd_actual,
                "attain": ytd_actual / annual_target if annual_target else None,
                "targetModeled": True,
            },
            "quarters": quarters,
        }

    current_ytd_periods = ("FY2627'Q1", CURRENT_PERIOD)
    previous_ytd_periods = ("FY2526'Q1", PREVIOUS_PERIOD)

    def period_total(periods):
        return sum(by_period[period] for period in periods)

    def standalone_total(periods):
        return sum(standalone(period) for period in periods)

    current_ytd_revenue = period_total(current_ytd_periods)
    previous_ytd_revenue = period_total(previous_ytd_periods)
    current_ytd_standalone = standalone_total(current_ytd_periods)
    previous_ytd_standalone = standalone_total(previous_ytd_periods)
    current_quarter_revenue = by_period[CURRENT_PERIOD]
    previous_quarter_revenue = by_period[PREVIOUS_PERIOD]
    current_quarter_standalone = standalone(CURRENT_PERIOD)
    previous_quarter_standalone = standalone(PREVIOUS_PERIOD)

    executive_kpis = [
        {
            "id": "full-year-revenue",
            "label": "Full-year Revenue Attainment",
            "period": "FY2627 YTD",
            "actualM": millions(current_ytd_revenue),
            "targetM": quarter_attain["total"]["total"]["targetM"],
            "attain": quarter_attain["total"]["total"]["attain"],
            "targetModeled": True,
            "priorActualM": millions(previous_ytd_revenue),
            "priorPeriod": "FY2526 YTD",
            "yoy": growth(current_ytd_revenue, previous_ytd_revenue),
        },
        {
            "id": "full-year-standalone",
            "label": "Full-year Standalone w/o DIB",
            "period": "FY2627 YTD",
            "actualM": millions(current_ytd_standalone),
            "targetM": None,
            "attain": None,
            "targetModeled": False,
            "priorActualM": millions(previous_ytd_standalone),
            "priorPeriod": "FY2526 YTD",
            "yoy": growth(current_ytd_standalone, previous_ytd_standalone),
        },
        {
            "id": "quarter-revenue",
            "label": "Current-quarter Revenue Attainment",
            "period": "FY2627 Q2",
            "actualM": millions(current_quarter_revenue),
            "targetM": targets["total"],
            "attain": millions(current_quarter_revenue) / targets["total"] if targets["total"] else None,
            "targetModeled": False,
            "priorActualM": millions(previous_quarter_revenue),
            "priorPeriod": "FY2526 Q2",
            "yoy": growth(current_quarter_revenue, previous_quarter_revenue),
        },
        {
            "id": "quarter-standalone",
            "label": "Current-quarter Standalone w/o DIB",
            "period": "FY2627 Q2",
            "actualM": millions(current_quarter_standalone),
            "targetM": None,
            "attain": None,
            "targetModeled": False,
            "priorActualM": millions(previous_quarter_standalone),
            "priorPeriod": "FY2526 Q2",
            "yoy": growth(current_quarter_standalone, previous_quarter_standalone),
        },
    ]

    geo_rows = []
    for geo in ("NA", "EMEA", "AP", "LA"):
        previous = by_geo[(PREVIOUS_PERIOD, geo)]
        current = by_geo[(CURRENT_PERIOD, geo)]
        geo_rows.append({
            "geo": geo,
            "previousM": millions(previous),
            "currentM": millions(current),
            "yoy": growth(current, previous),
            "targetM": targets["total"] if geo == "TOTAL" else None,
        })

    geo_target_map = {"EMEA": 10.7, "AP": 5.0, "NA": 11.1, "LA": 0.5}
    geo_attain = []
    for geo in ("EMEA", "AP", "NA", "LA"):
        current = millions(by_geo[(CURRENT_PERIOD, geo)])
        target = geo_target_map[geo]
        geo_attain.append({
            "geo": geo,
            "previousM": millions(by_geo[(PREVIOUS_PERIOD, geo)]),
            "targetM": target,
            "currentM": current,
            "attain": current / target if target else None,
        })

    segment_attain = []
    for scope, label in (("commercial", "Commercial"), ("consumer", "Consumer")):
        current = millions(by_segment[(CURRENT_PERIOD, scope)])
        target = targets[scope]
        segment_attain.append({
            "segment": label,
            "previousM": millions(by_segment[(PREVIOUS_PERIOD, scope)]),
            "targetM": target,
            "currentM": current,
            "attain": current / target if target else None,
        })

    return {
        "meta": {
            "sourceFile": workbook_path.name,
            "dataCutoff": "2026/9/28",
            "period": "FY2627 Q2",
            "unit": "M$ (Ship Rev)",
            "scope": "Power",
            "newBusiness": "w/o New Biz",
            "powerFilter": "KEY Category exact normalized match to Power",
            "caches": {
                "shipments": shipments["cache"],
                "weekly": weekly["cache"],
                "partners": partners["cache"],
            },
        },
        "kpis": kpis,
        "executiveKpis": executive_kpis,
        "quarterAttain": quarter_attain,
        "geoYoy": geo_rows,
        "topModels": shipments["top_model_rows"],
        "topPartners": partners["rows"],
        "weeklyYoy": weekly["rows"],
        "geoAttain": geo_attain,
        "segmentAttain": segment_attain,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = build_dashboard(args.workbook)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
