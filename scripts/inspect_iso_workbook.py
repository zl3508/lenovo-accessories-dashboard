#!/usr/bin/env python3
"""Inspect ISO dashboard workbook structure without modifying the source file."""

from __future__ import annotations

import argparse
import json
import posixpath
import re
import zipfile
from pathlib import PurePosixPath
from xml.etree import ElementTree as ET


NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/package/2006/relationships"
NS_DOC_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def qname(namespace: str, name: str) -> str:
    return f"{{{namespace}}}{name}"


def normalize_target(source_path: str, target: str) -> str:
    base = posixpath.dirname(source_path)
    return posixpath.normpath(posixpath.join(base, target)).lstrip("/")


def read_xml(archive: zipfile.ZipFile, path: str) -> ET.Element:
    return ET.fromstring(archive.read(path))


def read_relationships(archive: zipfile.ZipFile, source_path: str) -> dict[str, dict[str, str]]:
    source = PurePosixPath(source_path)
    rel_path = str(source.parent / "_rels" / f"{source.name}.rels")
    if rel_path not in archive.namelist():
        return {}
    root = read_xml(archive, rel_path)
    output: dict[str, dict[str, str]] = {}
    for rel in root.findall(qname(NS_REL, "Relationship")):
        target = rel.attrib.get("Target", "")
        output[rel.attrib["Id"]] = {
            "type": rel.attrib.get("Type", "").rsplit("/", 1)[-1],
            "target": normalize_target(source_path, target),
        }
    return output


def parse_shared_strings(archive: zipfile.ZipFile) -> tuple[list[str], list[dict[str, object]]]:
    path = "xl/sharedStrings.xml"
    if path not in archive.namelist():
        return [], []
    root = read_xml(archive, path)
    strings: list[str] = []
    power_matches: list[dict[str, object]] = []
    for index, node in enumerate(root.findall(qname(NS_MAIN, "si"))):
        text = "".join(part.text or "" for part in node.iter(qname(NS_MAIN, "t")))
        strings.append(text)
        if re.search(r"power|adapter|charger|bank|cable", text, flags=re.IGNORECASE):
            power_matches.append({"index": index, "text": text})
    return strings, power_matches


def parse_sheet_cells(
    archive: zipfile.ZipFile,
    sheet_path: str,
    shared_strings: list[str],
    max_rows: int = 12,
    max_cols: int = 40,
) -> list[list[object]]:
    root = read_xml(archive, sheet_path)
    output: list[list[object]] = []
    for row in root.findall(f".//{qname(NS_MAIN, 'row')}"):
        row_number = int(row.attrib.get("r", "0"))
        if row_number > max_rows:
            break
        values: list[object] = [None] * max_cols
        for cell in row.findall(qname(NS_MAIN, "c")):
            ref = cell.attrib.get("r", "")
            match = re.match(r"([A-Z]+)", ref)
            if not match:
                continue
            col = 0
            for char in match.group(1):
                col = col * 26 + ord(char) - 64
            col -= 1
            if col >= max_cols:
                continue
            value_node = cell.find(qname(NS_MAIN, "v"))
            formula_node = cell.find(qname(NS_MAIN, "f"))
            cell_type = cell.attrib.get("t")
            value: object = None
            if cell_type == "inlineStr":
                value = "".join(part.text or "" for part in cell.iter(qname(NS_MAIN, "t")))
            elif value_node is not None:
                raw = value_node.text or ""
                if cell_type == "s" and raw.isdigit():
                    idx = int(raw)
                    value = shared_strings[idx] if idx < len(shared_strings) else raw
                else:
                    value = raw
            if formula_node is not None:
                value = {"formula": formula_node.text or "", "cached": value}
            values[col] = value
        if any(value is not None for value in values):
            while values and values[-1] is None:
                values.pop()
            output.append(values)
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook")
    parser.add_argument("--output")
    args = parser.parse_args()

    result: dict[str, object] = {}
    with zipfile.ZipFile(args.workbook) as archive:
        names = set(archive.namelist())
        workbook_path = "xl/workbook.xml"
        workbook = read_xml(archive, workbook_path)
        workbook_rels = read_relationships(archive, workbook_path)
        shared_strings, power_strings = parse_shared_strings(archive)

        sheets: list[dict[str, object]] = []
        for sheet in workbook.findall(f".//{qname(NS_MAIN, 'sheet')}"):
            rel_id = sheet.attrib.get(qname(NS_DOC_REL, "id"), "")
            rel = workbook_rels.get(rel_id, {})
            sheet_path = rel.get("target", "")
            sheet_info: dict[str, object] = {
                "name": sheet.attrib.get("name"),
                "state": sheet.attrib.get("state", "visible"),
                "sheetId": sheet.attrib.get("sheetId"),
                "path": sheet_path,
            }
            if sheet_path in names:
                root = read_xml(archive, sheet_path)
                dimension = root.find(qname(NS_MAIN, "dimension"))
                sheet_rels = read_relationships(archive, sheet_path)
                sheet_info["dimension"] = dimension.attrib.get("ref") if dimension is not None else None
                sheet_info["relationships"] = list(sheet_rels.values())
                sheet_info["sample"] = parse_sheet_cells(archive, sheet_path, shared_strings)
            sheets.append(sheet_info)

        defined_names: list[dict[str, str]] = []
        for node in workbook.findall(f".//{qname(NS_MAIN, 'definedName')}"):
            defined_names.append({
                "name": node.attrib.get("name", ""),
                "localSheetId": node.attrib.get("localSheetId", ""),
                "value": node.text or "",
            })

        pivot_caches: list[dict[str, object]] = []
        for rel_id, rel in workbook_rels.items():
            if rel.get("type") != "pivotCacheDefinition":
                continue
            path = rel["target"]
            root = read_xml(archive, path)
            cache_source = root.find(f".//{qname(NS_MAIN, 'worksheetSource')}")
            fields = [
                field.attrib.get("name", "")
                for field in root.findall(f".//{qname(NS_MAIN, 'cacheField')}")
            ]
            pivot_caches.append({
                "relId": rel_id,
                "path": path,
                "recordCount": root.attrib.get("recordCount"),
                "sourceSheet": cache_source.attrib.get("sheet") if cache_source is not None else None,
                "sourceRef": cache_source.attrib.get("ref") if cache_source is not None else None,
                "sourceName": cache_source.attrib.get("name") if cache_source is not None else None,
                "fields": fields,
            })

        tables: list[dict[str, object]] = []
        for path in sorted(name for name in names if name.startswith("xl/tables/table") and name.endswith(".xml")):
            root = read_xml(archive, path)
            columns = [
                column.attrib.get("name", "")
                for column in root.findall(f".//{qname(NS_MAIN, 'tableColumn')}")
            ]
            tables.append({
                "path": path,
                "name": root.attrib.get("name"),
                "displayName": root.attrib.get("displayName"),
                "ref": root.attrib.get("ref"),
                "columns": columns,
            })

        result = {
            "file": args.workbook,
            "sheetCount": len(sheets),
            "sharedStringCount": len(shared_strings),
            "powerStringMatches": power_strings,
            "sheets": sheets,
            "definedNames": defined_names,
            "pivotCaches": pivot_caches,
            "tables": tables,
        }

    output = json.dumps(result, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as handle:
            handle.write(output)
    else:
        print(output)


if __name__ == "__main__":
    main()
