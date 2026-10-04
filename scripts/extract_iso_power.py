#!/usr/bin/env python3
"""Extract and summarize Power records from an ISO dashboard workbook.

The workbook stores its source rows in PivotCache XML rather than a normal
worksheet. This reader identifies caches by their field signature, decodes
their records, and filters Power with an exact category match.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter, defaultdict
from pathlib import Path


NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def qname(tag: str) -> str:
    return f"{{{NS}}}{tag}"


def scalar(node: ET.Element | None):
    if node is None or node.tag == qname("m"):
        return None
    value = node.attrib.get("v")
    if node.tag == qname("n") and value is not None:
        try:
            return float(value)
        except ValueError:
            return value
    if node.tag == qname("b"):
        return value == "1"
    return value


def cache_definition(archive: zipfile.ZipFile, number: int):
    path = f"xl/pivotCache/pivotCacheDefinition{number}.xml"
    root = ET.fromstring(archive.read(path))
    fields = []
    shared = []
    cache_fields = root.find(qname("cacheFields"))
    if cache_fields is None:
        return [], []
    for field in cache_fields.findall(qname("cacheField")):
        fields.append(field.attrib.get("name", ""))
        values = []
        items = field.find(qname("sharedItems"))
        if items is not None:
            values = [scalar(item) for item in list(items)]
        shared.append(values)
    return fields, shared


def iter_records(archive: zipfile.ZipFile, number: int, shared: list[list]):
    path = f"xl/pivotCache/pivotCacheRecords{number}.xml"
    with archive.open(path) as source:
        for _, elem in ET.iterparse(source, events=("end",)):
            if elem.tag != qname("r"):
                continue
            row = []
            for index, item in enumerate(list(elem)):
                if item.tag == qname("x"):
                    value_index = int(item.attrib["v"])
                    value = shared[index][value_index]
                else:
                    value = scalar(item)
                row.append(value)
            while len(row) < len(shared):
                row.append(None)
            yield row
            elem.clear()


def cache_numbers(archive: zipfile.ZipFile):
    pattern = re.compile(r"xl/pivotCache/pivotCacheDefinition(\d+)\.xml$")
    return sorted(
        int(match.group(1))
        for name in archive.namelist()
        if (match := pattern.match(name))
    )


def normalized(value) -> str:
    return str(value or "").strip().casefold()


def find_cache(archive: zipfile.ZipFile, required: set[str]):
    matches = []
    for number in cache_numbers(archive):
        fields, shared = cache_definition(archive, number)
        if required.issubset(set(fields)):
            matches.append((number, fields, shared))
    if not matches:
        raise RuntimeError(f"No PivotCache contains required fields: {sorted(required)}")
    return matches


def safe_sum(values):
    return sum(float(value or 0) for value in values)


def to_number(value) -> float:
    if value in (None, "", "-"):
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def fiscal_period(year, quarter):
    year_text = str(year or "").strip().replace("FY", "")
    quarter_text = str(quarter or "").strip().upper()
    if not year_text or not quarter_text:
        return None
    return f"FY{year_text}'{quarter_text}"


def extract_shipments(archive: zipfile.ZipFile, rows_output: Path | None):
    required = {
        "Country", "Part Number", "Fiscal Year", "Fiscal Quarter",
        "Ship_Rev", "Ship_Qty", "Ship_AUR", "KEY Category",
    }
    number, fields, shared = find_cache(archive, required)[0]
    indexes = {name: fields.index(name) for name in fields}
    export_fields = [
        "Fiscal Year", "Fiscal Quarter", "Quarter", "Half Year", "Geo",
        "New SubGeo", "Country", "Segment", "BU Segment", "BPC Segment",
        "Sub-Segment", "New Sub-Segment", "Distribution_channel", "New Channel",
        "Category 1", "Category 2", "Category 3", "KEY Category", "Part Number",
        "Model", "Description", "DIB", "New Biz", "Ship_Rev", "Ship_Qty", "Ship_AUR",
    ]
    export_fields = [name for name in export_fields if name in indexes]

    period = defaultdict(lambda: {"ship_rev": 0.0, "ship_qty": 0.0, "rows": 0})
    geo_breakdown = defaultdict(lambda: {"ship_rev": 0.0, "ship_qty": 0.0, "rows": 0})
    country_breakdown = defaultdict(lambda: {"ship_rev": 0.0, "ship_qty": 0.0, "rows": 0})
    category_breakdown = defaultdict(lambda: {"ship_rev": 0.0, "ship_qty": 0.0, "rows": 0})
    products = set()
    records = []
    source_rows = 0
    power_rows = 0
    aur_failures = 0
    blank_pn = 0

    for row in iter_records(archive, number, shared):
        source_rows += 1
        if normalized(row[indexes["KEY Category"]]) != "power":
            continue
        power_rows += 1
        data = {name: row[indexes[name]] for name in export_fields}
        rev = to_number(data.get("Ship_Rev"))
        qty = to_number(data.get("Ship_Qty"))
        aur = to_number(data.get("Ship_AUR"))
        period_name = fiscal_period(data.get("Fiscal Year"), data.get("Fiscal Quarter"))
        if period_name:
            period[period_name]["ship_rev"] += rev
            period[period_name]["ship_qty"] += qty
            period[period_name]["rows"] += 1
        category_name = str(data.get("Category 2") or "Unassigned")
        category_breakdown[category_name]["ship_rev"] += rev
        category_breakdown[category_name]["ship_qty"] += qty
        category_breakdown[category_name]["rows"] += 1
        geo_name = str(data.get("Geo") or "Unassigned")
        country_name = str(data.get("Country") or "Unassigned")
        for target, name in ((geo_breakdown, geo_name), (country_breakdown, country_name)):
            target[name]["ship_rev"] += rev
            target[name]["ship_qty"] += qty
            target[name]["rows"] += 1
        pn = str(data.get("Part Number") or "").strip()
        if pn:
            products.add(pn)
        else:
            blank_pn += 1
        expected_aur = rev / qty if qty else 0
        if qty and not math.isclose(aur, expected_aur, rel_tol=1e-6, abs_tol=0.01):
            aur_failures += 1
        if rows_output is not None:
            records.append(data)

    if rows_output is not None:
        rows_output.parent.mkdir(parents=True, exist_ok=True)
        with rows_output.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=export_fields)
            writer.writeheader()
            writer.writerows(records)

    periods = []
    for key in sorted(period):
        value = period[key]
        value["ship_aur"] = value["ship_rev"] / value["ship_qty"] if value["ship_qty"] else None
        periods.append({"period": key, **value})
    return {
        "cache": number,
        "source_rows": source_rows,
        "power_rows": power_rows,
        "power_filter": "KEY Category exact normalized match to 'Power'",
        "fields": fields,
        "export_fields": export_fields,
        "periods": periods,
        "category_2_breakdown": [
            {"category": key, **value}
            for key, value in sorted(
                category_breakdown.items(), key=lambda item: item[1]["ship_rev"], reverse=True
            )
        ],
        "unique_part_numbers": len(products),
        "blank_part_number_rows": blank_pn,
        "ship_aur_validation_failures": aur_failures,
        "geo_breakdown": [
            {"geo": key, **value}
            for key, value in sorted(geo_breakdown.items(), key=lambda item: item[1]["ship_rev"], reverse=True)
        ],
        "top_countries_by_ship_rev": [
            {"country": key, **value}
            for key, value in sorted(
                country_breakdown.items(), key=lambda item: item[1]["ship_rev"], reverse=True
            )[:30]
        ],
    }


def extract_partner_sales(archive: zipfile.ZipFile):
    required = {
        "Fiscal Year", "Fiscal Qtr", "Geo", "Model", "PN", "Ship CA",
        "Ship Rev", "Partner", "SoldtoCustomer", "Key Category",
    }
    number, fields, shared = find_cache(archive, required)[0]
    indexes = {name: fields.index(name) for name in fields}
    rows = 0
    periods = defaultdict(lambda: {"ship_rev": 0.0, "ship_qty": 0.0, "rows": 0})
    partners = Counter()
    customer_types = Counter()
    for row in iter_records(archive, number, shared):
        if normalized(row[indexes["Key Category"]]) != "power":
            continue
        rows += 1
        rev = to_number(row[indexes["Ship Rev"]])
        qty = to_number(row[indexes["Ship CA"]])
        key = fiscal_period(row[indexes["Fiscal Year"]], row[indexes["Fiscal Qtr"]])
        if key:
            periods[key]["ship_rev"] += rev
            periods[key]["ship_qty"] += qty
            periods[key]["rows"] += 1
        partners[str(row[indexes["Partner"]] or "Unassigned")] += 1
        if "SoldtoPartnerType" in indexes:
            customer_types[str(row[indexes["SoldtoPartnerType"]] or "Unassigned")] += 1
    return {
        "cache": number,
        "filter": "Key Category exact normalized match to 'Power'",
        "row_count": rows,
        "fields": fields,
        "periods": [{"period": key, **value} for key, value in sorted(periods.items())],
        "top_partners_by_rows": partners.most_common(20),
        "partner_types_by_rows": customer_types.most_common(),
    }


def extract_adoption(archive: zipfile.ZipFile):
    required = {"GEO", "Segment", "Category", "Quarter", "Rate"}
    number, fields, shared = find_cache(archive, required)[0]
    indexes = {name: fields.index(name) for name in fields}
    rows = []
    for row in iter_records(archive, number, shared):
        if normalized(row[indexes["Category"]]) not in {"power", "< power > ar"}:
            continue
        rows.append({name: row[indexes[name]] for name in fields})
    return {
        "cache": number,
        "filter": "Category exact match to Power / < Power > AR",
        "row_count": len(rows),
        "fields": fields,
        "sample": rows[:20],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--summary-output", type=Path, required=True)
    parser.add_argument("--rows-output", type=Path)
    args = parser.parse_args()

    with zipfile.ZipFile(args.workbook) as archive:
        result = {
            "source_file": args.workbook.name,
            "shipments": extract_shipments(archive, args.rows_output),
            "partner_sales": extract_partner_sales(archive),
            "adoption_rate": extract_adoption(archive),
        }
    args.summary_output.parent.mkdir(parents=True, exist_ok=True)
    args.summary_output.write_text(json.dumps(result, ensure_ascii=False, indent=2, default=list), encoding="utf-8")


if __name__ == "__main__":
    main()
