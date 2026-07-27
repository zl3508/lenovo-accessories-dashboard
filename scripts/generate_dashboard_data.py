#!/usr/bin/env python3
"""Generate static JSON data for the Lenovo accessories dashboard.

The script intentionally separates source extraction from the front-end.
Future scheduled jobs can replace the modeled block below with real scraping
or API connectors while preserving the JSON contracts under data/.
"""

from __future__ import annotations

import argparse
import json
import math
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

try:
    import pandas as pd
except Exception:  # pragma: no cover - used only when pandas is unavailable
    pd = None


DEFAULT_SOURCE = "/Users/albert/Desktop/zhenqi_li homework 2/lenovo_wearables_final.xlsx"
DEFAULT_REAL_SOURCE_DIR = "/Users/albert/Desktop/2026.7.13"

CATEGORIES = [
    {
        "id": "adapter",
        "label": "Adapter",
        "labelZh": "Charging Adapters",
        "description": "Wall, desktop, wireless, and 2-in-1 charging adapters.",
        "accent": "#e2231a",
    },
    {
        "id": "power_bank",
        "label": "Power Bank",
        "labelZh": "Portable Power",
        "description": "Portable battery products across daily, travel, and outdoor use.",
        "accent": "#e2231a",
    },
    {
        "id": "power_cable",
        "label": "Power Cable",
        "labelZh": "Charging Cables",
        "description": "USB-C, USB-A, Lightning, high-wattage, and bundled cables.",
        "accent": "#e2231a",
    },
]

FILTERS = {
    "adapter": [
        {"id": "wattageBand", "label": "Wattage", "match": "scalar"},
        {"id": "compatibility", "label": "Compatibility", "match": "scalar"},
        {"id": "powerMode", "label": "Wired / Wireless", "match": "scalar"},
        {"id": "portCountBand", "label": "Ports", "match": "scalar"},
    ],
    "power_bank": [
        {"id": "capacityBand", "label": "Capacity", "match": "scalar"},
        {"id": "outputBand", "label": "Output Power", "match": "scalar"},
        {"id": "compatibility", "label": "Compatibility", "match": "scalar"},
        {"id": "hasCable", "label": "Cable", "match": "scalar"},
    ],
    "power_cable": [
        {"id": "lengthBand", "label": "Length", "match": "scalar"},
        {"id": "powerBand", "label": "Power", "match": "scalar"},
        {"id": "retractable", "label": "Retractable", "match": "scalar"},
    ],
}

FILTER_VALUE_EXCLUSIONS = {
    "features": {"wireless", "dual port"},
}

FILTER_VALUE_ORDER = {
    "adapter": {
        "compatibility": ["mobile", "multi", "laptop"],
        "portCountBand": ["1 port", "2 ports", "3+ ports"],
    },
    "power_bank": {
        "capacityBand": ["Below 10000mAh", "10000-20000mAh", "20000mAh and above"],
        "outputBand": ["65W and below", "65W-100W", "100W and above"],
        "compatibility": ["mobile", "multi", "laptop"],
        "hasCable": ["Yes", "No"],
    },
    "power_cable": {
        "lengthBand": ["Below 1m", "1m to 2m", "Above 2m"],
        "powerBand": ["100W-200W", "200W and above"],
        "retractable": ["Yes", "No"],
    },
}

PRODUCTS = [
    {
        "id": "adapter_45w_mini",
        "categoryId": "adapter",
        "name": "Lenovo 45W USB-C Mini Adapter",
        "shortName": "45W USB-C Mini",
        "listPrice": 29,
        "baseMonthlyUnits": 8200,
        "costRatio": 0.46,
        "growth": 0.05,
        "attributes": {
            "wattage": 45,
            "wattageBand": "45W and below",
            "features": ["compact", "travel"],
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD"],
            "scenarios": ["daily carry", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_65w_gan",
        "categoryId": "adapter",
        "name": "Lenovo 65W USB-C GaN Adapter",
        "shortName": "65W GaN",
        "listPrice": 49,
        "baseMonthlyUnits": 9100,
        "costRatio": 0.43,
        "growth": 0.08,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["GaN", "compact", "travel"],
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD", "PPS"],
            "scenarios": ["daily carry", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_65w_dual_travel",
        "categoryId": "adapter",
        "name": "Lenovo 65W Dual-Port Travel Adapter",
        "shortName": "65W Dual-Port",
        "listPrice": 59,
        "baseMonthlyUnits": 7600,
        "costRatio": 0.45,
        "growth": 0.11,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["multi-device", "travel", "dual port"],
            "powerMode": "Wired",
            "ports": 2,
            "portCountBand": "2 ports",
            "interfaceProtocols": ["USB-C PD", "PPS"],
            "scenarios": ["travel", "workstation"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_100w_slim",
        "categoryId": "adapter",
        "name": "Lenovo 100W USB-C Slim Adapter",
        "shortName": "100W Slim",
        "listPrice": 79,
        "baseMonthlyUnits": 6100,
        "costRatio": 0.48,
        "growth": 0.09,
        "attributes": {
            "wattage": 100,
            "wattageBand": "100W and above",
            "features": ["high wattage", "compact"],
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD 3.1", "PPS"],
            "scenarios": ["workstation", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_140w_desktop",
        "categoryId": "adapter",
        "name": "Lenovo 140W USB-C Desktop Charger",
        "shortName": "140W Desktop",
        "listPrice": 99,
        "baseMonthlyUnits": 4700,
        "costRatio": 0.50,
        "growth": 0.13,
        "attributes": {
            "wattage": 140,
            "wattageBand": "100W and above",
            "features": ["desktop", "multi-device", "high wattage"],
            "powerMode": "Wired",
            "ports": 4,
            "portCountBand": "3+ ports",
            "interfaceProtocols": ["USB-C PD 3.1", "USB-A QC"],
            "scenarios": ["workstation"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_wireless_dock",
        "categoryId": "adapter",
        "name": "Lenovo 65W Wireless Dock Adapter",
        "shortName": "65W Wireless Dock",
        "listPrice": 89,
        "baseMonthlyUnits": 3600,
        "costRatio": 0.52,
        "growth": 0.16,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["desktop", "wireless", "multi-device"],
            "powerMode": "Wireless",
            "ports": 2,
            "portCountBand": "2 ports",
            "interfaceProtocols": ["Qi2", "USB-C PD"],
            "scenarios": ["workstation", "daily carry"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_bank_2in1",
        "categoryId": "adapter",
        "name": "Lenovo 65W Adapter + Power Bank 2-in-1",
        "shortName": "65W 2-in-1",
        "listPrice": 119,
        "baseMonthlyUnits": 3100,
        "costRatio": 0.55,
        "growth": 0.19,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["2-in-1", "travel", "multi-device"],
            "powerMode": "Wired",
            "ports": 2,
            "portCountBand": "2 ports",
            "interfaceProtocols": ["USB-C PD", "PPS"],
            "scenarios": ["travel", "daily carry"],
            "isTwoInOne": True,
        },
    },
    {
        "id": "bank_5000_pocket",
        "categoryId": "power_bank",
        "name": "Lenovo 5000mAh Pocket Power Bank",
        "shortName": "5000mAh Pocket",
        "listPrice": 29,
        "baseMonthlyUnits": 7200,
        "costRatio": 0.47,
        "growth": 0.04,
        "attributes": {
            "capacityMah": 5000,
            "capacityBand": "5000mAh",
            "outputW": 20,
            "outputBand": "20W and below",
            "features": ["compact", "daily carry"],
            "scenarios": ["daily carry"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_10000_usb_c",
        "categoryId": "power_bank",
        "name": "Lenovo Go USB-C 10000mAh Power Bank",
        "shortName": "10000mAh USB-C",
        "listPrice": 49,
        "baseMonthlyUnits": 8600,
        "costRatio": 0.45,
        "growth": 0.07,
        "attributes": {
            "capacityMah": 10000,
            "capacityBand": "10000mAh",
            "outputW": 30,
            "outputBand": "21W to 64W",
            "features": ["daily carry", "USB-C"],
            "scenarios": ["daily carry", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_10000_magnetic",
        "categoryId": "power_bank",
        "name": "Lenovo 10000mAh Magnetic Power Bank",
        "shortName": "10000mAh Magnetic",
        "listPrice": 59,
        "baseMonthlyUnits": 6800,
        "costRatio": 0.49,
        "growth": 0.15,
        "attributes": {
            "capacityMah": 10000,
            "capacityBand": "10000mAh",
            "outputW": 20,
            "outputBand": "20W and below",
            "features": ["magnetic", "wireless", "daily carry"],
            "scenarios": ["daily carry", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_20000_laptop",
        "categoryId": "power_bank",
        "name": "Lenovo 20000mAh Laptop Power Bank",
        "shortName": "20000mAh Laptop",
        "listPrice": 89,
        "baseMonthlyUnits": 5200,
        "costRatio": 0.51,
        "growth": 0.12,
        "attributes": {
            "capacityMah": 20000,
            "capacityBand": "20000mAh and above",
            "outputW": 65,
            "outputBand": "65W to 99W",
            "features": ["high capacity", "high wattage", "USB-C"],
            "scenarios": ["travel", "workstation"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_27000_travel",
        "categoryId": "power_bank",
        "name": "Lenovo 27000mAh 100W Travel Power Bank",
        "shortName": "27000mAh Travel",
        "listPrice": 129,
        "baseMonthlyUnits": 3500,
        "costRatio": 0.54,
        "growth": 0.18,
        "attributes": {
            "capacityMah": 27000,
            "capacityBand": "20000mAh and above",
            "outputW": 100,
            "outputBand": "100W and above",
            "features": ["high capacity", "high wattage", "travel"],
            "scenarios": ["travel", "outdoor"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_20000_rugged",
        "categoryId": "power_bank",
        "name": "Lenovo 20000mAh Outdoor Rugged Power Bank",
        "shortName": "20000mAh Rugged",
        "listPrice": 99,
        "baseMonthlyUnits": 3300,
        "costRatio": 0.56,
        "growth": 0.10,
        "attributes": {
            "capacityMah": 20000,
            "capacityBand": "20000mAh and above",
            "outputW": 45,
            "outputBand": "21W to 64W",
            "features": ["high capacity", "outdoor", "rugged"],
            "scenarios": ["outdoor", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_adapter_2in1",
        "categoryId": "power_bank",
        "name": "Lenovo 10000mAh Adapter + Power Bank 2-in-1",
        "shortName": "10000mAh 2-in-1",
        "listPrice": 119,
        "baseMonthlyUnits": 3000,
        "costRatio": 0.55,
        "growth": 0.20,
        "attributes": {
            "capacityMah": 10000,
            "capacityBand": "10000mAh",
            "outputW": 65,
            "outputBand": "65W to 99W",
            "features": ["2-in-1", "built-in cable", "travel"],
            "scenarios": ["travel", "daily carry"],
            "isTwoInOne": True,
        },
    },
    {
        "id": "cable_c_to_c_100w_1m",
        "categoryId": "power_cable",
        "name": "Lenovo USB-C to USB-C 100W Cable 1m",
        "shortName": "C-C 100W 1m",
        "listPrice": 19,
        "baseMonthlyUnits": 11800,
        "costRatio": 0.38,
        "growth": 0.05,
        "attributes": {
            "connectors": ["USB-C"],
            "lengthM": 1,
            "lengthBand": "1m",
            "powerW": 100,
            "powerBand": "100W to 199W",
            "features": ["USB-C", "fast charge"],
            "scenarios": ["daily carry", "workstation"],
        },
    },
    {
        "id": "cable_c_to_c_240w_2m",
        "categoryId": "power_cable",
        "name": "Lenovo USB-C to USB-C 240W Cable 2m",
        "shortName": "C-C 240W 2m",
        "listPrice": 29,
        "baseMonthlyUnits": 7400,
        "costRatio": 0.41,
        "growth": 0.12,
        "attributes": {
            "connectors": ["USB-C"],
            "lengthM": 2,
            "lengthBand": "2m and above",
            "powerW": 240,
            "powerBand": "200W and above",
            "features": ["USB-C", "high wattage", "E-marker"],
            "scenarios": ["workstation", "travel"],
        },
    },
    {
        "id": "cable_a_to_c_1m",
        "categoryId": "power_cable",
        "name": "Lenovo USB-A to USB-C Cable 1m",
        "shortName": "A-C 1m",
        "listPrice": 12,
        "baseMonthlyUnits": 9800,
        "costRatio": 0.36,
        "growth": -0.03,
        "attributes": {
            "connectors": ["USB-A", "USB-C"],
            "lengthM": 1,
            "lengthBand": "1m",
            "powerW": 18,
            "powerBand": "60W and below",
            "features": ["USB-A", "USB-C", "value"],
            "scenarios": ["daily carry"],
        },
    },
    {
        "id": "cable_lightning_to_c_1m",
        "categoryId": "power_cable",
        "name": "Lenovo Lightning to USB-C Cable 1m",
        "shortName": "Lightning-C 1m",
        "listPrice": 22,
        "baseMonthlyUnits": 5600,
        "costRatio": 0.43,
        "growth": 0.02,
        "attributes": {
            "connectors": ["Lightning", "USB-C"],
            "lengthM": 1,
            "lengthBand": "1m",
            "powerW": 27,
            "powerBand": "60W and below",
            "features": ["Lightning", "USB-C"],
            "scenarios": ["daily carry", "travel"],
        },
    },
    {
        "id": "cable_c_bundle_2pack",
        "categoryId": "power_cable",
        "name": "Lenovo USB-C Cable Bundle 2-Pack",
        "shortName": "C-C Bundle 2-Pack",
        "listPrice": 24,
        "baseMonthlyUnits": 9000,
        "costRatio": 0.37,
        "growth": 0.10,
        "attributes": {
            "connectors": ["USB-C"],
            "lengthM": 1,
            "lengthBand": "1m",
            "powerW": 100,
            "powerBand": "100W to 199W",
            "features": ["USB-C", "bundle/2-pack", "value"],
            "scenarios": ["daily carry", "workstation"],
        },
    },
    {
        "id": "cable_travel_braided_05m",
        "categoryId": "power_cable",
        "name": "Lenovo Travel Braided USB-C Cable 0.5m",
        "shortName": "Braided C-C 0.5m",
        "listPrice": 16,
        "baseMonthlyUnits": 6800,
        "costRatio": 0.40,
        "growth": 0.09,
        "attributes": {
            "connectors": ["USB-C"],
            "lengthM": 0.5,
            "lengthBand": "Below 1m",
            "powerW": 60,
            "powerBand": "60W and below",
            "features": ["USB-C", "braided", "travel"],
            "scenarios": ["travel", "daily carry"],
        },
    },
]

VARIANT_LIBRARY = {
    "adapter": [
        {"suffix": "graphite", "name": "Graphite Black", "share": 0.45, "price": 1.00, "cost": 1.00},
        {"suffix": "cloud", "name": "Cloud Grey", "share": 0.35, "price": 1.01, "cost": 1.00},
        {"suffix": "travel", "name": "Travel Plug Kit", "share": 0.20, "price": 1.08, "cost": 1.04},
    ],
    "power_bank": [
        {"suffix": "storm", "name": "Storm Grey", "share": 0.42, "price": 1.00, "cost": 1.00},
        {"suffix": "black", "name": "Eclipse Black", "share": 0.38, "price": 1.02, "cost": 1.00},
        {"suffix": "cable", "name": "Built-in Cable Edition", "share": 0.20, "price": 1.10, "cost": 1.06},
    ],
    "power_cable": [
        {"suffix": "black", "name": "Black", "share": 0.48, "price": 1.00, "cost": 1.00},
        {"suffix": "grey", "name": "Grey Braided", "share": 0.34, "price": 1.05, "cost": 1.03},
        {"suffix": "white", "name": "White", "share": 0.18, "price": 0.98, "cost": 0.98},
    ],
}

CONSUMER_KEYWORDS = {
    "adapter": [
        ("charging speed", "Positive", 0.20),
        ("heat", "Negative", 0.13),
        ("port count", "Neutral", 0.12),
        ("compatibility", "Positive", 0.17),
        ("desktop setup", "Positive", 0.10),
        ("travel size", "Positive", 0.16),
        ("price", "Neutral", 0.12),
    ],
    "power_bank": [
        ("capacity", "Positive", 0.18),
        ("output power", "Positive", 0.16),
        ("weight", "Negative", 0.12),
        ("magnetic hold", "Positive", 0.12),
        ("built-in cable", "Positive", 0.12),
        ("travel carry", "Positive", 0.16),
        ("safety", "Neutral", 0.14),
    ],
    "power_cable": [
        ("durability", "Positive", 0.18),
        ("length", "Neutral", 0.14),
        ("fast charge", "Positive", 0.18),
        ("connector fit", "Positive", 0.14),
        ("material", "Positive", 0.12),
        ("data transfer", "Neutral", 0.10),
        ("bundle value", "Positive", 0.14),
    ],
}

SUPPLY_COMPONENTS = {
    "adapter": [
        ("GaN power IC", "Navitas", "APAC", 100.0, 25, 82, "High-wattage GaN demand keeps controller pricing firm."),
        ("USB-C PD controller", "Infineon", "EU", 98.0, 22, 79, "PD 3.1 certification cycles add lead-time pressure."),
        ("Thermal module", "Sunon", "China", 96.0, 18, 76, "Desktop charger thermal components remain stable."),
        ("Magnetic coil", "Luxshare", "China", 102.0, 21, 81, "Wireless modules trend upward with Qi2 adoption."),
    ],
    "power_bank": [
        ("Battery cell", "ATL", "China", 100.0, 28, 84, "High-density cells remain the main cost driver."),
        ("BMS controller", "Texas Instruments", "US", 99.0, 24, 78, "Safety controller availability is stable."),
        ("Magnetic module", "Luxshare", "China", 103.0, 23, 80, "Magnetic assemblies rise with phone accessory attach."),
        ("Casing and rugged shell", "BYD Electronics", "China", 97.0, 20, 75, "Outdoor models use higher-cost casing materials."),
    ],
    "power_cable": [
        ("USB-C connector", "Foxlink", "China", 98.0, 19, 77, "USB-C connector supply remains balanced."),
        ("E-marker chip", "Parade", "APAC", 101.0, 23, 80, "High-wattage cables rely on certified E-marker supply."),
        ("Braided jacket", "Tongda", "China", 96.0, 17, 73, "Braided materials hold steady with mild commodity pressure."),
        ("Lightning connector", "Foxconn", "China", 99.0, 21, 76, "Lightning mix is mature and gradually declining."),
    ],
}

POLICY_REPORTS = {
    "adapter": [
        {
            "title": "EU Common Charger Directive",
            "region": "European Union",
            "regionGroup": "EMEA",
            "impactWindow": "current",
            "effectiveDate": "2026-04-28",
            "source": "European Commission",
            "sourceUrl": "https://single-market-economy.ec.europa.eu/sectors/electrical-and-electronic-engineering-industries-eei/radio-equipment-directive-red/one-common-charging-solution-all_ro",
            "summary": "Laptops enter the EU common-charger scope from 28 April 2026; USB-C and harmonised fast charging are central requirements.",
            "impact": "Raises demand for USB-C PD adapters, high-wattage cables, and clear charger-in-box labeling.",
        },
        {
            "title": "External Power Supplies Standards",
            "region": "United States",
            "regionGroup": "NA",
            "impactWindow": "current",
            "effectiveDate": "2025-05-16",
            "source": "U.S. Department of Energy",
            "sourceUrl": "https://www.energy.gov/eere/buildings/external-power-supplies",
            "summary": "DOE maintains energy conservation standards and test procedures for consumer external power supplies under 10 CFR 430.",
            "impact": "Keeps efficiency, no-load power, certification, and compliance reporting central to adapter portfolio planning.",
        },
        {
            "title": "California Title 20 Appliance Efficiency",
            "region": "California",
            "regionGroup": "NA",
            "impactWindow": "current",
            "effectiveDate": "Current",
            "source": "California Energy Commission",
            "sourceUrl": "https://www.energy.ca.gov/programs-and-topics/topics/energy-efficiency",
            "summary": "California appliance efficiency rules continue to shape external power supply compliance and channel acceptance.",
            "impact": "Retail-ready SKUs need efficiency documentation and region-specific compliance readiness.",
        },
        {
            "title": "Mexico NOM-029-ENER-2017 External Power Supplies",
            "region": "Mexico",
            "regionGroup": "LA",
            "impactWindow": "current",
            "effectiveDate": "2018-04-25",
            "source": "Secretaría de Energía / PLATIICA",
            "sourceUrl": "https://platiica.economia.gob.mx/normalizacion/nom-029-ener-2017/",
            "summary": "NOM-029-ENER-2017 covers energy efficiency limits, test methods, marking, and labeling for external power supplies.",
            "impact": "Adapter SKUs for Mexico need energy-efficiency evidence, label readiness, and test documentation aligned to NOM-029.",
        },
        {
            "title": "Brazil Anatel Charger Conformity Act 5155",
            "region": "Brazil",
            "regionGroup": "LA",
            "impactWindow": "current",
            "effectiveDate": "2024-10-14",
            "source": "Anatel",
            "sourceUrl": "https://informacoes.anatel.gov.br/legislacao/atos-de-certificacao-de-produtos/2024/1947-ato-5155",
            "summary": "Act 5155 updates technical and test procedures for conformity assessment of chargers used with mobile phones.",
            "impact": "Brazil adapter launches need local homologation support, mechanical and thermal safety tests, and certification traceability.",
        },
        {
            "title": "Japan Electrical Appliances and Materials Safety Act",
            "region": "Japan",
            "regionGroup": "AP",
            "impactWindow": "current",
            "effectiveDate": "Current",
            "source": "METI",
            "sourceUrl": "https://www.meti.go.jp/english/policy/economy/consumer/pse/index.html",
            "summary": "Japan's PSE framework covers specified electrical appliances, including AC/DC power supply units, with notification, technical compliance, inspection, and labeling obligations.",
            "impact": "Japan adapter SKUs need PSE labeling readiness, importer responsibility checks, and compliance records before sale.",
        },
        {
            "title": "Australia External Power Supply MEPS",
            "region": "Australia / New Zealand",
            "regionGroup": "AP",
            "impactWindow": "current",
            "effectiveDate": "2014-11-22",
            "source": "Energy Rating",
            "sourceUrl": "https://www.energyrating.gov.au/industry-information/products/external-power-supplies",
            "summary": "Australia regulates covered external power supplies under GEMS requirements, including minimum energy performance standards.",
            "impact": "Single-output adapter families need MEPS applicability checks, efficiency test support, and region-specific compliance documentation.",
        },
        {
            "title": "Australia RCM Marking for Electrical Equipment",
            "region": "Australia / New Zealand",
            "regionGroup": "AP",
            "impactWindow": "future",
            "effectiveDate": "Current",
            "source": "Electrical Equipment Safety System",
            "sourceUrl": "https://www.eess.gov.au/rcm/marking-of-electrical-equipment/",
            "summary": "Electrical equipment offered by registered responsible suppliers must use the Regulatory Compliance Mark where applicable.",
            "impact": "Future AP packaging and product artwork should keep RCM placement, responsible supplier records, and label governance in the launch checklist.",
        },
    ],
    "power_bank": [
        {
            "title": "Battery Charger Energy Conservation Standards",
            "region": "United States",
            "regionGroup": "NA",
            "impactWindow": "current",
            "effectiveDate": "2024-08-28",
            "source": "U.S. Department of Energy",
            "sourceUrl": "https://www.energy.gov/nepa/articles/cx-031678-energy-conservation-standards-battery-chargers",
            "summary": "DOE adopted new and amended standards for battery chargers, including active charge, standby, and off-mode power metrics.",
            "impact": "Power bank designs should emphasize charging efficiency, standby performance, and test-procedure traceability.",
        },
        {
            "title": "EU Common Charger Directive",
            "region": "European Union",
            "regionGroup": "EMEA",
            "impactWindow": "current",
            "effectiveDate": "2024-12-28",
            "source": "European Commission",
            "sourceUrl": "https://single-market-economy.ec.europa.eu/sectors/electrical-and-electronic-engineering-industries-eei/radio-equipment-directive-red/one-common-charging-solution-all_ro",
            "summary": "Portable electronics use USB-C as the common charging solution, with fast-charging harmonisation and charger unbundling.",
            "impact": "Supports USB-C-first power banks and multi-device travel charging use cases.",
        },
        {
            "title": "Brazil Anatel Charger Conformity Act 5155",
            "region": "Brazil",
            "regionGroup": "LA",
            "impactWindow": "current",
            "effectiveDate": "2024-10-14",
            "source": "Anatel",
            "sourceUrl": "https://informacoes.anatel.gov.br/legislacao/atos-de-certificacao-de-produtos/2024/1947-ato-5155",
            "summary": "The Anatel charger conformity requirements include dedicated USB power interfaces used to supply electronic devices.",
            "impact": "Power-bank portfolios with phone-charging USB output claims should validate Brazil certification scope and test evidence before launch.",
        },
        {
            "title": "Japan Electrical Appliances and Materials Safety Act",
            "region": "Japan",
            "regionGroup": "AP",
            "impactWindow": "current",
            "effectiveDate": "Current",
            "source": "METI",
            "sourceUrl": "https://www.meti.go.jp/english/policy/economy/consumer/pse/index.html",
            "summary": "The PSE framework covers regulated electrical appliances and secondary batteries, with sale restrictions for products without required labeling.",
            "impact": "Power-bank launches in Japan need PSE applicability review, importer notification discipline, and battery safety documentation.",
        },
        {
            "title": "Australia RCM Marking for Electrical Equipment",
            "region": "Australia / New Zealand",
            "regionGroup": "AP",
            "impactWindow": "future",
            "effectiveDate": "Current",
            "source": "Electrical Equipment Safety System",
            "sourceUrl": "https://www.eess.gov.au/rcm/marking-of-electrical-equipment/",
            "summary": "The RCM is used to show covered electrical equipment is linked to a responsible supplier.",
            "impact": "Future AP power-bank packaging should reserve label space and supplier traceability fields early in artwork development.",
        },
    ],
    "power_cable": [
        {
            "title": "EU Common Charger Directive",
            "region": "European Union",
            "regionGroup": "EMEA",
            "impactWindow": "current",
            "effectiveDate": "2026-04-28",
            "source": "European Commission",
            "sourceUrl": "https://single-market-economy.ec.europa.eu/sectors/electrical-and-electronic-engineering-industries-eei/radio-equipment-directive-red/one-common-charging-solution-all_ro",
            "summary": "USB-C charging and fast-charging interoperability increase the importance of certified cables for laptops and portable devices.",
            "impact": "Creates pull for 100W and 240W USB-C cables with clear power labeling and E-marker support.",
        },
        {
            "title": "USB-C Packaging and Charging Disclosure",
            "region": "European Union",
            "regionGroup": "EMEA",
            "impactWindow": "current",
            "effectiveDate": "2024-12-28",
            "source": "European Parliament",
            "sourceUrl": "https://www.europarl.europa.eu/pdfs/news/expert/2024/12/press_release/20241218IPR26026/20241218IPR26026_en.pdf",
            "summary": "Manufacturers must provide clearer information on charging characteristics and whether a charger is included.",
            "impact": "Cable SKUs benefit from stronger power-rating, PD, and compatibility claims at shelf and ecommerce touchpoints.",
        },
        {
            "title": "Japan Electrical Appliances and Materials Safety Act",
            "region": "Japan",
            "regionGroup": "AP",
            "impactWindow": "future",
            "effectiveDate": "Current",
            "source": "METI",
            "sourceUrl": "https://www.meti.go.jp/english/policy/economy/consumer/pse/index.html",
            "summary": "Japan's electrical safety framework includes specified categories such as extension power supply cords and sale restrictions tied to required labeling.",
            "impact": "Future AP cable planning should screen product scope early, especially for power cords, high-power assemblies, and bundled charging kits.",
        },
        {
            "title": "Brazil Anatel Charger Conformity Act 5155",
            "region": "Brazil",
            "regionGroup": "LA",
            "impactWindow": "future",
            "effectiveDate": "2024-10-14",
            "source": "Anatel",
            "sourceUrl": "https://informacoes.anatel.gov.br/legislacao/atos-de-certificacao-de-produtos/2024/1947-ato-5155",
            "summary": "Anatel charger conformity requirements reference dedicated USB power interfaces and test criteria for mobile charging accessories.",
            "impact": "Future LA cable bundles should validate whether included charging accessories trigger local homologation evidence or packaging claims review.",
        },
    ],
}

INDUSTRY_BRAND_REPORTS = {
    "adapter": {
        "title": "Adapter Industry Trends by Brand",
        "categoryLens": "Brand-led reading for adapter planning. The reports show that adapter competition is more exposed to PC and phone OEMs, while third-party brands win in fast charging, compact form factor, multi-port use, and channel execution.",
        "source": "Sources: Lenovo PC Options Industry Analysis - Power Category Report, pp.12-26; Ipsos PC Accessories User Research - Power Adapters, pp.20, 22, 39, 43. Industry report figures are estimates from expert interviews and desk research.",
        "brands": [
            {
                "brand": "Anker",
                "role": "Benchmark Brand",
                "summary": "Anker uses a mid-to-high-end position, a broad charging portfolio, and localized channels to build a defensible channel moat. In adapter, its advantage is strongest where users value fast charging, compact design, and multi-device compatibility, but OEM accessory brands remain tough competitors.",
                "metrics": [
                    {"label": "Positioning", "value": "Mid-to-high end"},
                    {"label": "Channel model", "value": "Direct in USA / Japan"},
                    {"label": "US adapter", "value": "17-18% share"},
                ],
                "strategy": [
                    "Product planning is organized by series and use case: high-end Prime, convenience-led Nano, entry Zolo, and wireless MagGo. Adapter planning benefits from the same portfolio discipline even when consumers compare by wattage and port count.",
                    "The direct-sale model in the USA and Japan lets Anker manage Amazon, Rakuten, independent sites, and large KA accounts directly; other regions rely more on country agents to expand offline and localized retail coverage.",
                    "Localization teams are treated as a strategic asset. The report highlights Anker's early market entry, consumer demand insight, and deep channel coverage as its main current competitive advantages."
                ],
                "portfolio": [
                    "Prime is positioned as high-end and technology-led. It is used to reinforce Anker's premium image and can support higher-power charging scenarios.",
                    "Nano is positioned mid-end and convenience-led, matching demand for compact, reliable, and durable charging products.",
                    "Zolo gives Anker an entry-level lane, while MagGo supports the mid/high-end wireless portfolio and wider multi-device ecosystem."
                ],
                "pricing": [
                    "Headquarters sets benchmark prices from market competition and consumer research; local regions adjust prices based on cost, targets, and channel conditions.",
                    "Power-category margins are affected by tariffs and logistics. The report states overall margins are maintained above 30%, and some developed markets can reach 40-50%.",
                    "Promotions are centered on major retail events such as Black Friday, Prime Day, Obon Festival, Bulan puasa, and Double 11, with online discounts and offline gifts or membership-linked promotions."
                ],
                "countries": [
                    {
                        "market": "USA",
                        "model": "Direct-sale market",
                        "metrics": [
                            {"label": "Adapter revenue", "value": "RMB 1.5B"},
                            {"label": "Market share", "value": "17-18%"},
                            {"label": "Growth", "value": "10%"}
                        ],
                        "strategy": [
                            "Amazon is the core online channel. The report shows online at 60-70% and offline at 30-40%, with Amazon carrying most online sales.",
                            "Large KA accounts receive customized product or packaging support, dedicated fulfillment, and after-sales support. This helps Anker protect national coverage and service quality."
                        ],
                        "implication": "For Lenovo adapter, the USA battle is less about generic wattage and more about KA-ready SKUs, fast charging proof, compactness, and channel-specific packaging."
                    },
                    {
                        "market": "Japan",
                        "model": "Direct-sale market",
                        "metrics": [
                            {"label": "Adapter revenue", "value": "RMB 0.7B"},
                            {"label": "Market share", "value": "18%"},
                            {"label": "Mainstream power", "value": "45-100W"}
                        ],
                        "strategy": [
                            "Japan is Anker's second-largest market, but local brands are strong. The report notes Cheero and Elecom as important pricing references.",
                            "Anker expands from online into offline through Rakuten, KA cooperation, telecom operators, and local distributors; the Japan local team was planned to grow from 8 people to 13 in 2025."
                        ],
                        "implication": "Japan adapter positioning should stress compact design, trusted safety, and localized retail execution rather than only lower price."
                    },
                    {
                        "market": "Indonesia",
                        "model": "Country agent market",
                        "metrics": [
                            {"label": "Power category", "value": "RMB 1.0B"},
                            {"label": "Growth", "value": "About 40%"},
                            {"label": "Share", "value": "50-60%"}
                        ],
                        "strategy": [
                            "Anker strategically avoids the ultra-low-end segment and focuses on middle/high-end price bands. Country agents control many local retail and ecommerce relationships.",
                            "Offline retail is decentralized, so Anker uses national agents to reduce channel cost and improve local channel coverage."
                        ],
                        "implication": "Adapter offers in Indonesia should avoid pure low-end competition and be framed around reliability, fast charging, and value at selected price points."
                    },
                    {
                        "market": "UK",
                        "model": "Agent-led expansion",
                        "metrics": [
                            {"label": "Adapter scale", "value": "30% of UK PB revenue"},
                            {"label": "Online share", "value": "70%"},
                            {"label": "Growth", "value": "Slower than PB"}
                        ],
                        "strategy": [
                            "The UK is currently Amazon-led online, while future growth depends on offline channels such as independent retail, supermarkets, home appliance chains, cell phone channels, and dealers.",
                            "The report says Anker has no separate adapter series in the UK yet, because consumers prefer products with wider application coverage."
                        ],
                        "implication": "UK adapter planning should connect with laptop, travel, and multi-device scenarios instead of standing alone as a narrow accessory line."
                    }
                ]
            },
            {
                "brand": "Baseus",
                "role": "Value Challenger",
                "summary": "The report mentions Baseus as one of the Chinese charging brands prioritizing Japan, and as part of the low-price competitive set in Indonesia.",
                "metrics": [
                    {"label": "Japan role", "value": "Core strategic market"},
                    {"label": "Indonesia band", "value": "$30-80"},
                    {"label": "Positioning", "value": "Value and design"}
                ],
                "notes": [
                    "In Japan, Baseus is grouped with Anker and UGREEN as global Chinese players expanding presence, while local Japanese brands still hold strong positions.",
                    "In Indonesia, the $30-80 range is described as the core price area for Baseus and UGREEN, attracting users through cost-effectiveness and design innovation."
                ]
            },
            {
                "brand": "UGREEN",
                "role": "Value Challenger",
                "summary": "UGREEN appears in the reports as a Chinese charging accessory player competing in Japan and in Indonesia's value-oriented price bands.",
                "metrics": [
                    {"label": "Japan role", "value": "Core strategic market"},
                    {"label": "Indonesia band", "value": "$30-80"},
                    {"label": "Adapter survey", "value": "2% total owners"}
                ],
                "notes": [
                    "The adapter user research appendix lists UGREEN at 2% total brand ownership among power adapter owners, with a higher 9% signal in SA.",
                    "For Lenovo, UGREEN is most useful as a value-positioning benchmark, especially where price sensitivity and design-led differentiation matter."
                ]
            }
        ],
    },
    "power_bank": {
        "title": "Power Bank Industry Trends by Brand",
        "categoryLens": "Brand-led reading for power bank planning. The reports show power bank demand is shaped by capacity, fast charging, multi-device use, travel portability, and strong online/offline channel execution.",
        "source": "Sources: Lenovo PC Options Industry Analysis - Power Category Report, pp.12-26; Ipsos PC Accessories User Research - Power Bank, pp.18, 20, 22, 24, 26-30. Industry report figures are estimates from expert interviews and desk research.",
        "brands": [
            {
                "brand": "Anker",
                "role": "Benchmark Brand",
                "summary": "Anker is the clearest benchmark in power bank. It combines a series-based product system, strong direct channels in developed markets, and country-agent expansion elsewhere. The reports repeatedly identify Anker as the most popular power bank brand in user research markets.",
                "metrics": [
                    {"label": "USA share", "value": "30%"},
                    {"label": "Japan share", "value": "27%"},
                    {"label": "Indonesia share", "value": "50-60%"}
                ],
                "strategy": [
                    "Anker plans power banks through distinct product lineages: Prime for high-end technology, Nano for convenient mid-end charging, Zolo for entry coverage, and MagGo for mid/high-end wireless use cases.",
                    "Because power bank volume and price are highly linear, consumers tend to compare by capacity and price band. Anker uses series, capacity, and channel execution together rather than relying on one product story.",
                    "User research identifies travel portability, large capacity, and simultaneous multi-device charging as the core purchase motivations for laptop power banks."
                ],
                "portfolio": [
                    "Prime supports premium and high-capacity propositions, especially above 10,000mAh.",
                    "Nano covers convenience-led products up to 20,000mAh and supports compact everyday charging.",
                    "MagGo supports wireless and ecosystem-based scenarios up to 10,000mAh, while laptop-focused power banks create space for high-wattage PC use."
                ],
                "pricing": [
                    "The pricing model starts with headquarters benchmark pricing, then adjusts locally for cost, sales targets, competitive benchmarking, and channel conditions.",
                    "In the USA, Anker's power category gross margin is reported around 42%; in Japan, power bank gross margin is reported around 53%; Indonesia is lower at about 30% due to the country-agent model and consumption level.",
                    "Promotion intensity varies by market: Black Friday and Prime Day in the USA, Prime Day and Obon in Japan, Bulan puasa and Double 11 in Indonesia, and a strong promotional calendar in the UK."
                ],
                "countries": [
                    {
                        "market": "USA",
                        "model": "Direct-sale market",
                        "metrics": [
                            {"label": "PB revenue", "value": "RMB 4.5B"},
                            {"label": "Market share", "value": "30%"},
                            {"label": "Growth", "value": "15-16%"}
                        ],
                        "strategy": [
                            "The USA is Anker's largest single market. The report shows mainstream power bank capacity at 5,000-12,000mAh with 52% share, while 12,000-20,000mAh accounts for 25%.",
                            "The interface structure is led by Type-C plus Lightning multi-interface designs, with multiple-port and single-port demand both present."
                        ],
                        "implication": "Lenovo power banks should emphasize laptop-ready capacity, fast charging, and multi-port compatibility while staying KA-ready for Amazon and large retailers."
                    },
                    {
                        "market": "Japan",
                        "model": "Direct-sale market",
                        "metrics": [
                            {"label": "PB revenue", "value": "About RMB 1.0B"},
                            {"label": "Market share", "value": "27%"},
                            {"label": "Growth", "value": "About 30%"}
                        ],
                        "strategy": [
                            "Japan is Anker's second-largest market and is still growing quickly, but local brands shape design and pricing expectations.",
                            "The report highlights 5,000-12,000mAh as the mainstream capacity band at 50%, and Type-C plus Lightning multi-interface products at 62%."
                        ],
                        "implication": "Japan power bank offers should localize form factor, safety, and design language while protecting higher-margin capacity bands."
                    },
                    {
                        "market": "Indonesia",
                        "model": "Country agent market",
                        "metrics": [
                            {"label": "PB/category revenue", "value": "About RMB 1.0B"},
                            {"label": "Market share", "value": "50-60%"},
                            {"label": "Growth", "value": "About 40%"}
                        ],
                        "strategy": [
                            "Anker focuses the core revenue market at $80-200 and keeps a presence in the $30-80 volume band, while strategically abandoning ultra-low-end products under $30.",
                            "Shopee, Tokopedia, and TikTok Shop play different ecommerce roles, while local agents help control fragmented offline KA, branded stores, and small retail channels."
                        ],
                        "implication": "A Lenovo power bank launch should separate value-band SKUs from higher-power laptop SKUs, with country-agent channel playbooks and clear promotional timing."
                    },
                    {
                        "market": "UK",
                        "model": "Amazon-led now, offline later",
                        "metrics": [
                            {"label": "PB revenue", "value": "RMB 0.3B"},
                            {"label": "Market share", "value": "60%"},
                            {"label": "Growth", "value": "About 10%"}
                        ],
                        "strategy": [
                            "The UK power bank business is high-value because consumers accept new technologies and pay more for high-power, multi-scenario PC power banks.",
                            "Anker currently focuses online through Amazon, while future expansion depends on agent-managed offline channels such as independent retail, supermarkets, home-appliance chains, and cell-phone channels."
                        ],
                        "implication": "UK power banks should prioritize high-power laptop use, large capacity, wireless or multi-device scenarios, and promotional plans tied to Amazon and retail membership systems."
                    }
                ]
            },
            {
                "brand": "Baseus",
                "role": "Value Challenger",
                "summary": "Baseus is referenced as a Chinese charging brand active in Japan and as a value competitor in Indonesia's $30-80 price band.",
                "metrics": [
                    {"label": "Japan role", "value": "Core strategic market"},
                    {"label": "Indonesia band", "value": "$30-80"},
                    {"label": "Consumer hook", "value": "Value and design"}
                ],
                "notes": [
                    "The industry report groups Baseus with Anker and UGREEN as Chinese players that prioritize Japan, but it also notes strong domestic Japanese competitors.",
                    "In Indonesia, Baseus is tied to the cost-effectiveness and design-innovation competitive set in the low-price range."
                ]
            },
            {
                "brand": "UGREEN",
                "role": "Value Challenger",
                "summary": "UGREEN is positioned in the reports as another Chinese charging accessory brand competing through value-led price bands and Japan expansion.",
                "metrics": [
                    {"label": "Japan role", "value": "Core strategic market"},
                    {"label": "Indonesia band", "value": "$30-80"},
                    {"label": "Focus", "value": "Value segment"}
                ],
                "notes": [
                    "UGREEN is mentioned alongside Baseus in Indonesia's $30-80 power-bank price range.",
                    "For Lenovo, UGREEN is a useful benchmark for price-band pressure, especially in price-sensitive markets where Anker stays away from ultra-low-end competition."
                ]
            }
        ],
    },
}

ANKER_COUNTRY_STRATEGY_FLOWS = {
    "USA": [
        {"label": "Amazon Core", "detail": "60-70% online"},
        {"label": "KA Customization", "detail": "packaging / SKU"},
        {"label": "48h Fulfillment", "detail": "dedicated KA support"},
        {"label": "Event Lift", "detail": "Prime Day + Black Friday"},
    ],
    "Japan": [
        {"label": "Rakuten + Amazon", "detail": "online duopoly"},
        {"label": "Offline Build", "detail": "KA + operators"},
        {"label": "Local Team", "detail": "8 to 13 people"},
        {"label": "Seasonal Push", "detail": "Prime Day + Obon"},
    ],
    "Indonesia": [
        {"label": "Country Agent", "detail": "fragmented retail"},
        {"label": "Price Guardrail", "detail": "exit <$30"},
        {"label": "Value Band", "detail": "$30-80 traffic"},
        {"label": "TikTok Growth", "detail": "fast ecommerce lift"},
    ],
    "UK": [
        {"label": "Amazon First", "detail": "~70% online"},
        {"label": "Promo Calendar", "detail": "60% annual revenue"},
        {"label": "Offline Agents", "detail": "retail + telecom"},
        {"label": "Scenario Bundle", "detail": "travel + laptop"},
    ],
}

ANKER_COUNTRY_COMPACT_COPY = {
    "USA": [
        "Direct sales are anchored by Amazon and large KA accounts.",
        "Demand is activated through Prime Day, Black Friday, customized packaging, and service execution.",
    ],
    "Japan": [
        "Online starts with Rakuten and Amazon, then expands into KA, telecom, and local distributors.",
        "Pricing is benchmarked against Cheero and Elecom, so compactness, safety, and trust matter.",
    ],
    "Indonesia": [
        "The country-agent model lowers channel cost in a fragmented retail market.",
        "Anker avoids ultra-low-end products and keeps volume in the $30-80 value band plus $80-200 core revenue band.",
    ],
    "UK": [
        "Amazon leads now; offline growth depends on agents and national retail coverage.",
        "The product story is broader use coverage: laptop, travel, high power, and multi-device scenarios.",
    ],
}

ANKER_BRAND_FLOW_DECKS = [
    {
        "title": "Strategy Signals",
        "cards": [
            {
                "eyebrow": "Brand Positioning",
                "heading": "Mid-to-high-end moat",
                "kpis": ["Early entry", "Demand insight", "Channel depth"],
                "steps": [
                    {"label": "Mid-high end", "detail": "premium trust"},
                    {"label": "Rich matrix", "detail": "multi-scenario"},
                    {"label": "Localization", "detail": "local teams"},
                    {"label": "Channel moat", "detail": "full coverage"},
                ],
            },
            {
                "eyebrow": "Channel Model",
                "heading": "Direct in USA / Japan",
                "kpis": ["Amazon", "Rakuten", "Large KA"],
                "steps": [
                    {"label": "Brand stores", "detail": "Amazon / Rakuten"},
                    {"label": "Independent site", "detail": "direct sales"},
                    {"label": "Offline KA", "detail": "direct supply"},
                    {"label": "Small agents", "detail": "sinking market"},
                ],
            },
            {
                "eyebrow": "Expansion Model",
                "heading": "Agents for other regions",
                "kpis": ["1 agent / country", "Distributors", "Retail stores"],
                "steps": [
                    {"label": "Country agent", "detail": "annual mandate"},
                    {"label": "Distributor", "detail": "large channels"},
                    {"label": "Retail stores", "detail": "local reach"},
                    {"label": "Holiday activity", "detail": "local execution"},
                ],
            },
        ],
    },
    {
        "title": "Portfolio Planning",
        "cards": [
            {
                "eyebrow": "Prime Series",
                "heading": "High-end technology",
                "kpis": [">10,000mAh PB", "premium charging", "innovation proof"],
                "steps": [
                    {"label": "Top tech", "detail": "Anker innovation"},
                    {"label": "High capacity", "detail": ">10,000mAh"},
                    {"label": "Quality", "detail": "premium experience"},
                ],
            },
            {
                "eyebrow": "Nano Series",
                "heading": "Mid-end convenience",
                "kpis": ["compact", "reliable", "up to 20,000mAh PB"],
                "steps": [
                    {"label": "Convenience", "detail": "portable form"},
                    {"label": "Durability", "detail": "reliable charge"},
                    {"label": "Everyday use", "detail": "mid-end users"},
                ],
            },
            {
                "eyebrow": "Zolo + MagGo",
                "heading": "Entry + wireless lanes",
                "kpis": ["entry coverage", "wireless", "ecosystem"],
                "steps": [
                    {"label": "Zolo", "detail": "entry level"},
                    {"label": "MagGo", "detail": "mid/high wireless"},
                    {"label": "Scenario fit", "detail": "phone + laptop"},
                ],
            },
        ],
    },
    {
        "title": "Pricing and Promotion",
        "cards": [
            {
                "eyebrow": "Pricing Model",
                "heading": "HQ benchmark to local price",
                "kpis": ["cost", "competition", "sales target"],
                "steps": [
                    {"label": "HQ benchmark", "detail": "market + research"},
                    {"label": "Region adjust", "detail": "cost + target"},
                    {"label": "Channel terms", "detail": "KA / agent"},
                    {"label": "Dynamic promo", "detail": "holiday events"},
                ],
            },
            {
                "eyebrow": "Margin Guardrail",
                "heading": "30%+ overall margin",
                "kpis": ["developed markets 40-50%", "tariff / logistics impact"],
                "steps": [
                    {"label": "IC / PCB", "detail": "core cost"},
                    {"label": "Production", "detail": "allocation"},
                    {"label": "R&D / logistics", "detail": "regional gap"},
                    {"label": "Gross margin", "detail": "30%+"},
                ],
            },
            {
                "eyebrow": "Promotion Calendar",
                "heading": "Events by country",
                "kpis": ["Black Friday", "Prime Day", "Bulan puasa / Double 11"],
                "steps": [
                    {"label": "Online", "detail": "direct discount"},
                    {"label": "Offline", "detail": "gifts / member points"},
                    {"label": "Life cycle", "detail": "core vs circulation SKU"},
                ],
            },
        ],
    },
]

BRAND_SIGNAL_FLOW_DECKS = {
    "Baseus": [
        {
            "title": "Market Signals",
            "cards": [
                {
                    "eyebrow": "Japan",
                    "heading": "Core strategic market",
                    "kpis": ["global Chinese player", "local brands strong"],
                    "steps": [
                        {"label": "Enter Japan", "detail": "priority market"},
                        {"label": "Compete locally", "detail": "Cheero / Elecom context"},
                        {"label": "Win on value", "detail": "design + price"},
                    ],
                },
                {
                    "eyebrow": "Indonesia",
                    "heading": "$30-80 value band",
                    "kpis": ["cost-effective", "design innovation"],
                    "steps": [
                        {"label": "Value traffic", "detail": "$30-80"},
                        {"label": "Design hook", "detail": "visual differentiation"},
                        {"label": "Price pressure", "detail": "Anker avoids ultra-low"},
                    ],
                },
            ],
        }
    ],
    "UGREEN": [
        {
            "title": "Market Signals",
            "cards": [
                {
                    "eyebrow": "Japan",
                    "heading": "Core strategic market",
                    "kpis": ["Chinese accessory player", "local competition"],
                    "steps": [
                        {"label": "Japan push", "detail": "priority market"},
                        {"label": "Value position", "detail": "price-performance"},
                        {"label": "Accessory range", "detail": "charging portfolio"},
                    ],
                },
                {
                    "eyebrow": "Indonesia",
                    "heading": "$30-80 pressure band",
                    "kpis": ["value segment", "cost-effective"],
                    "steps": [
                        {"label": "Value range", "detail": "$30-80"},
                        {"label": "Design + utility", "detail": "traffic driver"},
                        {"label": "Lenovo benchmark", "detail": "price pressure"},
                    ],
                },
            ],
        }
    ],
}

ANKER_COUNTRY_FLOW_SECTIONS = {
    "USA": [
        {
            "eyebrow": "Market and Product",
            "heading": "Largest single market",
            "kpis": ["PB RMB 4.5B / 30%", "Adapter RMB 1.5B / 17-18%", "60-80W adapter 72%"],
            "steps": [
                {"label": "Power bank", "detail": "personalized demand"},
                {"label": "Adapter", "detail": "OEM competition"},
                {"label": "Mainstream", "detail": "5K-12K mAh / 60-80W"},
            ],
        },
        {
            "eyebrow": "Channel",
            "heading": "Amazon + large KA",
            "kpis": ["60-70% online", "30-40% offline", "Amazon core"],
            "steps": [
                {"label": "Amazon", "detail": "core online"},
                {"label": "Walmart / KA", "detail": "offline coverage"},
                {"label": "Custom SKU", "detail": "models / packaging"},
                {"label": "48h fulfillment", "detail": "KA support"},
            ],
        },
        {
            "eyebrow": "Pricing and Promo",
            "heading": "Holiday-cycle activation",
            "kpis": ["GM about 42%", "Black Friday 2 weeks", "Prime Day 1 week"],
            "steps": [
                {"label": "KA agreement", "detail": "price norms"},
                {"label": "Black Friday", "detail": "+28% sales lift"},
                {"label": "Prime Day", "detail": "average lift"},
                {"label": "Other events", "detail": "1 week"},
            ],
        },
    ],
    "Japan": [
        {
            "eyebrow": "Market and Product",
            "heading": "Second-largest market",
            "kpis": ["PB about RMB 1B / 27%", "Adapter RMB 0.7B / 18%", "45-100W mainstream"],
            "steps": [
                {"label": "Local brands", "detail": "Cheero / CIO / SONY"},
                {"label": "PB capacity", "detail": "5K-12K mAh 50%"},
                {"label": "Adapter power", "detail": "45-100W 78-80%"},
            ],
        },
        {
            "eyebrow": "Channel",
            "heading": "Online to offline path",
            "kpis": ["60% online", "40% offline", "team 8 to 13"],
            "steps": [
                {"label": "Rakuten + Amazon", "detail": "duopoly"},
                {"label": "Rakuten offline", "detail": "traffic diversion"},
                {"label": "Telecom", "detail": "operator channel"},
                {"label": "Distributors", "detail": "sinking market"},
            ],
        },
        {
            "eyebrow": "Pricing and Promo",
            "heading": "Compete with local brands",
            "kpis": ["GM about 45%", "PB GM about 53%", "35-40 promo days"],
            "steps": [
                {"label": "Price test", "detail": "711 / KA"},
                {"label": "Prime Day", "detail": "core week"},
                {"label": "Obon", "detail": "core week"},
                {"label": "New launch", "detail": "711 / JUSCO"},
            ],
        },
    ],
    "Indonesia": [
        {
            "eyebrow": "Market and Product",
            "heading": "Star growth market",
            "kpis": ["Revenue about RMB 1B", "Growth about 40%", "Share 50-60%"],
            "steps": [
                {"label": "$200+", "detail": "Apple high-end users"},
                {"label": "$80-200", "detail": "55-60% core revenue"},
                {"label": "$30-80", "detail": "value traffic"},
                {"label": "<$30", "detail": "strategic exit"},
            ],
        },
        {
            "eyebrow": "Channel",
            "heading": "Country agent model",
            "kpis": ["60% online", "40% offline", "local KA fragmented"],
            "steps": [
                {"label": "Country agent", "detail": "cost reduction"},
                {"label": "Shopee", "detail": "main channel"},
                {"label": "Tokopedia", "detail": "support channel"},
                {"label": "TikTok", "detail": "100-200% growth"},
            ],
        },
        {
            "eyebrow": "Pricing and Promo",
            "heading": "Agent-led rebate control",
            "kpis": ["GM about 30%", "Bulan puasa 1 month", "Double 11 1 month"],
            "steps": [
                {"label": "Agent rebate", "detail": "local discretion"},
                {"label": "Online", "detail": "10-20% discount"},
                {"label": "Flash deal", "detail": "up to 50% MSRP"},
                {"label": "Offline", "detail": "stable price + gifts"},
            ],
        },
    ],
    "UK": [
        {
            "eyebrow": "Market and Product",
            "heading": "Power bank-led market",
            "kpis": ["PB RMB 0.3B / 60%", "Growth about 10%", "Adapter 30% of PB revenue"],
            "steps": [
                {"label": "Laptop PB", "detail": "PC scenario"},
                {"label": "MagGo", "detail": "wireless line"},
                {"label": "25K / 165W", "detail": "high-end product"},
                {"label": "No adapter series", "detail": "broader use preferred"},
            ],
        },
        {
            "eyebrow": "Channel",
            "heading": "Amazon now, offline later",
            "kpis": ["70% online", "30% offline", "offline via agents"],
            "steps": [
                {"label": "Amazon", "detail": "core revenue"},
                {"label": "Independent retail", "detail": "Argos / Currys"},
                {"label": "Supermarket", "detail": "Tesco / Sainsbury's"},
                {"label": "Telecom", "detail": "Vodafone / dealers"},
            ],
        },
        {
            "eyebrow": "Pricing and Promo",
            "heading": "Promotion drives revenue",
            "kpis": ["GM about 50%", "60% annual revenue from promo", "Black Friday up to 50% off"],
            "steps": [
                {"label": "Membership", "detail": "points promotion"},
                {"label": "Black Friday", "detail": "biggest discount"},
                {"label": "Prime Day", "detail": "Amazon node"},
                {"label": "Summer / New Year", "detail": "event activity"},
            ],
        },
    ],
}

INDUSTRY_PRODUCT_SHOWCASE = {
    "adapter": {
        "Anker": [
            {
                "name": "Anker 747 Charger (GaNPrime 150W)",
                "type": "Adapter",
                "price": "JP list ¥14,990",
                "positioning": "High-power 4-port GaNPrime charger for laptop and multi-device users.",
                "imageUrl": "https://www.ankerjapan.com/cdn/shop/products/2341main.jpg?v=1662598573&width=900",
                "productUrl": "https://www.ankerjapan.com/products/a2340",
                "amazonUrl": "https://www.amazon.co.jp/dp/B09W9B6H61",
                "specs": ["150W", "4 ports", "3 USB-C + 1 USB-A", "GaNPrime"],
            }
        ],
        "Baseus": [
            {
                "name": "Baseus GaN2 3 Ports Fast Charger 65W",
                "type": "Adapter",
                "price": "US list $36.99",
                "positioning": "Value GaN charger with compact 3-port design and travel-friendly positioning.",
                "imageUrl": "https://www.baseus.com/cdn/shop/products/Baseus_GaN2_3_Ports_Fast_Charger_65W_Black_1_front_side_1200x.jpg?v=1667904127",
                "productUrl": "https://www.baseus.com/products/gan2-3-ports-fast-charger-65w",
                "amazonUrl": "https://www.amazon.com/s?k=Baseus+GaN2+3+Ports+Fast+Charger+65W",
                "specs": ["65W", "3 ports", "2 USB-C + 1 USB-A", "GaN"],
            }
        ],
        "UGREEN": [
            {
                "name": "UGREEN Nexode Pro 160W 5-Port USB-C Charger",
                "type": "Adapter",
                "price": "US promo $65 / list $89.99",
                "positioning": "Premium desktop-style multi-port charger with display and 160W total output.",
                "imageUrl": "https://us.ugreen.com/cdn/shop/files/ugreen-nexode-pro-160w-5-port-usb-c-charger-2292664.png?v=1782182893&width=1600",
                "productUrl": "https://us.ugreen.com/products/ugreen-nexode-pro-160w-usb-c-charger",
                "amazonUrl": "https://www.amazon.com/s?k=UGREEN+Nexode+Pro+160W+5-Port+USB-C+Charger",
                "specs": ["160W", "5 ports", "touch display", "foldable plug"],
            }
        ],
    },
    "power_bank": {
        "Anker": [
            {
                "name": "Anker Prime Power Bank (27K, 250W)",
                "type": "Power Bank",
                "price": "US MSRP around $179.99",
                "positioning": "Premium 27,650mAh power bank for multi-device laptop and mobile fast charging.",
                "imageUrl": "https://cdn.shopify.com/s/files/1/0493/9834/9974/files/Rectangle1_885945a5-b5d8-439f-bc99-54bf72715ff4.png?v=1762766510&width=1600",
                "productUrl": "https://www.anker.com/products/a1340-250w-power-bank",
                "amazonUrl": "https://www.amazon.com/dp/B0BYP2F3SG",
                "specs": ["27,650mAh", "250W max", "2 USB-C + 1 USB-A", "smart app"],
            }
        ],
        "Baseus": [
            {
                "name": "Baseus Blade Laptop Power Bank 100W 20000mAh",
                "type": "Power Bank",
                "price": "US sale $69.99 / list $129.99",
                "positioning": "Slim laptop power bank positioned around portability, value, and 100W PD.",
                "imageUrl": "https://www.baseus.com/cdn/shop/products/Baseus_Blade_Laptop_Power_Bank_100W_20000mAh_1_front_side_1200x.jpg?v=1699274864",
                "productUrl": "https://www.baseus.com/products/blade-laptop-power-bank-100w-20000mah",
                "amazonUrl": "https://www.amazon.com/s?k=Baseus+Blade+Laptop+Power+Bank+100W+20000mAh",
                "specs": ["20,000mAh", "100W PD", "4-device charging", "status display"],
            }
        ],
        "UGREEN": [
            {
                "name": "UGREEN 145W 25000mAh 3-Port Power Bank",
                "type": "Power Bank",
                "price": "US promo $69.99 / list $109.99",
                "positioning": "High-capacity laptop power bank with 140W USB-C output and smart display.",
                "imageUrl": "https://us.ugreen.com/cdn/shop/files/ugreen-145w-25000mah-for-laptop-3-ports-power-bank-421788.png?v=1720669107&width=1600",
                "productUrl": "https://us.ugreen.com/products/ugreen-145w-power-bank-for-laptop",
                "amazonUrl": "https://www.amazon.com/s?k=UGREEN+145W+25000mAh+3-Port+Power+Bank",
                "specs": ["25,000mAh", "145W total", "3 ports", "smart display"],
            }
        ],
    },
}


def enrich_industry_brand_reports(reports: dict[str, Any]) -> dict[str, Any]:
    for category_id, report in reports.items():
        showcase_by_brand = INDUSTRY_PRODUCT_SHOWCASE.get(category_id, {})
        for brand in report.get("brands", []):
            products = showcase_by_brand.get(brand.get("brand"))
            if products:
                brand["products"] = products
            if brand.get("brand") == "Anker":
                brand["flowDecks"] = ANKER_BRAND_FLOW_DECKS
                for country in brand.get("countries", []):
                    market = country.get("market")
                    flow = ANKER_COUNTRY_STRATEGY_FLOWS.get(market)
                    if flow:
                        country["flow"] = flow
                    flow_sections = ANKER_COUNTRY_FLOW_SECTIONS.get(market)
                    if flow_sections:
                        country["flowSections"] = flow_sections
                    compact_copy = ANKER_COUNTRY_COMPACT_COPY.get(market)
                    if compact_copy:
                        country["strategy"] = compact_copy
            elif brand.get("brand") in BRAND_SIGNAL_FLOW_DECKS:
                brand["flowDecks"] = BRAND_SIGNAL_FLOW_DECKS[brand["brand"]]
                brand["notes"] = []
    return reports


INDUSTRY_BRAND_REPORTS = enrich_industry_brand_reports(INDUSTRY_BRAND_REPORTS)

MARKET_STRUCTURE_REPORTS = {
    "adapter": {
        "title": "Power Adapter Country Market Structure",
        "source": "Ipsos PC Accessories User Research - Power Adapters, pp.4, 6, 26-32; Lenovo PC Options Industry Analysis - Power Category Report, pp.15, 18, 21, 24, 29-32.",
        "markets": [
            {"code": "DE+UK+SE", "label": "DE + UK + SE", "sample": 295, "buyerBase": 135, "featureBase": 130, "selfPurchased": 46, "meanPrice": 77.05, "motivationConvenience": 35, "motivationTravel": 24, "motivationMultiDevice": 27, "motivationFastCharging": 13, "featureFastCharging": 58, "featureMultiPort": 56, "featureProtection": 52, "featureStableOutput": 62, "channelOnline": 32, "channelPhysical": 35, "channelBrandWebsite": 33, "note": "Stable power output is the strongest feature signal at 62%; official brand website reaches 33%."},
            {"code": "SA", "label": "SA", "sample": 320, "buyerBase": 193, "featureBase": 159, "selfPurchased": 60, "meanPrice": 75.76, "motivationConvenience": 41, "motivationTravel": 43, "motivationMultiDevice": 35, "motivationFastCharging": 35, "featureFastCharging": 56, "featureMultiPort": 68, "featureProtection": 63, "featureStableOutput": 38, "channelOnline": 32, "channelPhysical": 41, "channelBrandWebsite": 26, "note": "Original adapter not supporting fast charging is an important motivation at 35%; physical store is 41%."},
            {"code": "US", "label": "US", "sample": 354, "buyerBase": 242, "featureBase": 156, "selfPurchased": 68, "meanPrice": 65.18, "motivationConvenience": 34, "motivationTravel": 34, "motivationMultiDevice": 27, "motivationFastCharging": 20, "featureFastCharging": 53, "featureMultiPort": 56, "featureProtection": 53, "featureStableOutput": 51, "channelOnline": 29, "channelPhysical": 41, "channelBrandWebsite": 30, "note": "Highest self-purchased rate in the adapter survey at 68%; physical store is 41%."},
            {"code": "IN", "label": "IN", "sample": 262, "buyerBase": 159, "featureBase": 183, "selfPurchased": 61, "meanPrice": 41.10, "motivationConvenience": 48, "motivationTravel": 44, "motivationMultiDevice": 45, "motivationFastCharging": 26, "featureFastCharging": 79, "featureMultiPort": 64, "featureProtection": 58, "featureStableOutput": 56, "channelOnline": 53, "channelPhysical": 29, "channelBrandWebsite": 18, "note": "Fast charging is the clearest feature signal at 79%; online e-commerce is 53%."},
            {"code": "JP", "label": "JP", "sample": 378, "buyerBase": 218, "featureBase": 187, "selfPurchased": 58, "meanPrice": 35.04, "motivationConvenience": 49, "motivationTravel": 42, "motivationMultiDevice": 32, "motivationFastCharging": 24, "featureFastCharging": 49, "featureMultiPort": 52, "featureProtection": 58, "featureStableOutput": 56, "channelOnline": 47, "channelPhysical": 33, "channelBrandWebsite": 20, "note": "Convenient use in different locations is 49%; online e-commerce is 47%."},
            {"code": "BR+MEX", "label": "BR + MEX", "sample": 223, "buyerBase": 140, "featureBase": 116, "selfPurchased": 63, "meanPrice": 36.45, "motivationConvenience": 38, "motivationTravel": 44, "motivationMultiDevice": 34, "motivationFastCharging": 11, "featureFastCharging": 66, "featureMultiPort": 59, "featureProtection": 60, "featureStableOutput": 47, "channelOnline": 48, "channelPhysical": 31, "channelBrandWebsite": 21, "note": "Travel or mobile work motivation is 44%; fast-charging feature consideration is 66%."},
        ],
        "demandMetrics": [
            {"field": "featureFastCharging", "label": "Fast charging"},
            {"field": "featureMultiPort", "label": "Multi-port compatibility"},
            {"field": "featureProtection", "label": "Intelligent protection"},
        ],
        "channelMetrics": [
            {"field": "channelOnline", "label": "Online e-commerce"},
            {"field": "channelPhysical", "label": "Physical store"},
            {"field": "channelBrandWebsite", "label": "Official brand website"},
        ],
        "industryCountries": [
            {"country": "USA", "headline": "Adapter category faces PC / phone OEM competition.", "metrics": "Adapter sales revenue 1.5 billion; market share 17-18%; growth 10%; 60-80W accounts for 72%.", "sourcePage": "Industry report p.15"},
            {"country": "Japan", "headline": "Local brands are strong and price pressure is high.", "metrics": "Adapter sales revenue 0.7 billion; market share 18%; 45-100W is mainstream at 78-80%; 100-240W is 15%.", "sourcePage": "Industry report p.18"},
            {"country": "Indonesia", "headline": "Power category is highly price sensitive.", "metrics": "Anker Indonesia power category sales revenue is about 1 billion; growth about 40%; market share about 50-60%.", "sourcePage": "Industry report p.21"},
            {"country": "UK", "headline": "Adapter revenue is smaller than power bank revenue.", "metrics": "Anker adapter revenue in the UK is 30% of UK power bank revenue; report notes slower growth and no separate series yet.", "sourcePage": "Industry report p.24"},
        ],
    },
    "power_bank": {
        "title": "Power Bank Country Market Structure",
        "source": "Ipsos PC Accessories User Research - Power Bank, pp.4, 6, 26-33; Lenovo PC Options Industry Analysis - Power Category Report, pp.15, 18, 21, 24, 29-32.",
        "markets": [
            {"code": "DE+UK+SE", "label": "DE + UK + SE", "sample": 274, "buyerBase": 120, "featureBase": 143, "selfPurchased": 45, "meanPrice": 101.77, "motivationTravel": 79, "motivationCapacity": 38, "motivationMultiDevice": 38, "motivationFastCharging": 15, "featureBatteryCapacity": 71, "featureFastCharging": 50, "featureMultiPort": 52, "featurePowerRange": 48, "featureStableOutput": 48, "channelOnline": 51, "channelPhysical": 24, "channelBrandWebsite": 25, "note": "Highest mean purchase price at $101.77; official brand website reaches 25%."},
            {"code": "SA", "label": "SA", "sample": 360, "buyerBase": 181, "featureBase": 213, "selfPurchased": 55, "meanPrice": 80.36, "motivationTravel": 74, "motivationCapacity": 57, "motivationMultiDevice": 61, "motivationFastCharging": 27, "featureBatteryCapacity": 56, "featureFastCharging": 53, "featureMultiPort": 66, "featurePowerRange": 55, "featureStableOutput": 43, "channelOnline": 42, "channelPhysical": 40, "channelBrandWebsite": 18, "note": "Multi-device charging motivation is 61%; physical store is 40%."},
            {"code": "US", "label": "US", "sample": 257, "buyerBase": 137, "featureBase": 149, "selfPurchased": 56, "meanPrice": 87.28, "motivationTravel": 71, "motivationCapacity": 49, "motivationMultiDevice": 39, "motivationFastCharging": 18, "featureBatteryCapacity": 70, "featureFastCharging": 57, "featureMultiPort": 53, "featurePowerRange": 58, "featureStableOutput": 58, "channelOnline": 40, "channelPhysical": 43, "channelBrandWebsite": 17, "note": "Physical store is the top channel at 43%; mean purchase price is $87.28."},
            {"code": "IN", "label": "IN", "sample": 362, "buyerBase": 235, "featureBase": 272, "selfPurchased": 66, "meanPrice": 61.39, "motivationTravel": 84, "motivationCapacity": 53, "motivationMultiDevice": 53, "motivationFastCharging": 26, "featureBatteryCapacity": 78, "featureFastCharging": 74, "featureMultiPort": 62, "featurePowerRange": 63, "featureStableOutput": 55, "channelOnline": 64, "channelPhysical": 23, "channelBrandWebsite": 12, "note": "Highest self-purchased rate at 66%; online e-commerce is 64%."},
            {"code": "JP", "label": "JP", "sample": 242, "buyerBase": 118, "featureBase": 140, "selfPurchased": 48, "meanPrice": 87.44, "motivationTravel": 69, "motivationCapacity": 39, "motivationMultiDevice": 36, "motivationFastCharging": 27, "featureBatteryCapacity": 67, "featureFastCharging": 43, "featureMultiPort": 48, "featurePowerRange": 39, "featureStableOutput": 59, "channelOnline": 56, "channelPhysical": 32, "channelBrandWebsite": 12, "note": "Stable output is 59%; safety certification is a Top 3 factor in the report."},
            {"code": "BR+MEX", "label": "BR + MEX", "sample": 311, "buyerBase": 177, "featureBase": 196, "selfPurchased": 56, "meanPrice": 57.10, "motivationTravel": 81, "motivationCapacity": 47, "motivationMultiDevice": 50, "motivationFastCharging": 12, "featureBatteryCapacity": 72, "featureFastCharging": 67, "featureMultiPort": 57, "featurePowerRange": 39, "featureStableOutput": 50, "channelOnline": 58, "channelPhysical": 33, "channelBrandWebsite": 9, "note": "Convenient travel / portable charging is 81%; mean purchase price is $57.10."},
        ],
        "demandMetrics": [
            {"field": "featureBatteryCapacity", "label": "Battery capacity"},
            {"field": "featureFastCharging", "label": "Fast charging"},
            {"field": "featureMultiPort", "label": "Multiple ports"},
        ],
        "channelMetrics": [
            {"field": "channelOnline", "label": "Online e-commerce"},
            {"field": "channelPhysical", "label": "Physical store"},
            {"field": "channelBrandWebsite", "label": "Official brand website"},
        ],
        "industryCountries": [
            {"country": "USA", "headline": "Largest single Anker market with strong power bank layout.", "metrics": "Power bank sales revenue 4.5 billion; market share 30%; growth 15-16%; 5000-12000mAh is 52%.", "sourcePage": "Industry report p.15"},
            {"country": "Japan", "headline": "Second largest Anker market with fierce local competition.", "metrics": "Power bank sales revenue about 1 billion; market share 27%; growth about 30%; 5000-12000mAh is 50%.", "sourcePage": "Industry report p.18"},
            {"country": "Indonesia", "headline": "Star growth market focused on middle-high price ranges.", "metrics": "Sales revenue about 1 billion; growth about 40%; market share about 50-60%; $80-200 mid price range contributes 55-60%.", "sourcePage": "Industry report p.21"},
            {"country": "UK", "headline": "High share market where high-power PC power banks perform well.", "metrics": "Power bank sales revenue 0.3 billion; market share 60%; growth about 10%; UK star products priced GBP69.99 and GBP79.99.", "sourcePage": "Industry report p.24"},
        ],
    },
}


COMPETITOR_PRODUCTS = [
    {
        "id": "anker_150w_max_us_amazon",
        "categoryId": "adapter",
        "lenovoProductId": "adapter_multi_port_150w_gan",
        "countryCode": "US",
        "country": "United States",
        "region": "North America",
        "platform": "Amazon US",
        "brand": "Anker",
        "asin": "B09W2PNLX7",
        "parentAsin": "B0BYVW51MK",
        "productName": "Anker 150W Max USB C Charger Block",
        "title": "Anker 150W Max USB C Charger Block, 4-Port Compact Foldable GaN Charger for MacBook Pro/Air, iPhone 17/16 and More Series, Dell and More",
        "productUrl": "https://www.amazon.com/dp/B09W2PNLX7",
        "brandUrl": "https://www.amazon.com/stores/Anker/page/D24FDA17-DECF-46BB-AF47-AF4647D2B1F8?lp_asin=B09W2PNLX7&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
        "image": "assets/competitors/anker-150w-max-us.jpg",
        "sourceImageUrl": "https://images-na.ssl-images-amazon.com/images/I/615zdmA76OL._AC_US600_.jpg",
        "specs": {
            "wattageW": 150,
            "totalPorts": 4,
            "connectorType": "USB C; USB",
            "color": "Black",
            "amperage": "5 Amps",
            "inputVoltage": "240 Volts",
            "specialFeature": "Fast Charging, Travel",
            "includedComponents": "Anker 747 Charger (GaNPrime 150W), silicone stabilizer, welcome guide, 24-month warranty, customer service",
            "compatibleDevices": "MacBook Pro/Air, Dell XPS, ThinkPad, HP Spectre, Google Pixelbook, Microsoft Surface Book, iPad, iPhone",
        },
        "metrics": {
            "rsp": 99.99,
            "price": 99.99,
            "primePrice": None,
            "aur": 99.99,
            "monthlyUnits": 369,
            "unitsMomGrowth": -0.33,
            "unitsYoyGrowth": -0.8258,
            "monthlyRevenue": 36896,
            "childUnits": 100,
            "childRevenue": 9999,
            "variantCount": 1,
            "mainCategory": "Cell Phones & Accessories",
            "mainBsr": 18999,
            "mainBsrGrowth": -5552,
            "mainBsrGrowthRate": -0.41,
            "subCategory": "Cell Phone Wall Chargers",
            "subBsr": 986,
            "qnaCount": 133,
            "reviewCount": 2272,
            "monthlyNewReviews": 17,
            "rating": 4.5,
            "reviewRate": 0.0461,
            "fbaFee": 5.03,
            "grossMargin": 0.87,
            "lqs": 10.0,
            "sellerCount": 2,
            "buyBoxSeller": "AnkerDirect",
            "buyBoxType": "FBA",
            "sellerLocation": "US",
            "launchDate": "2022-06-30",
            "daysOnMarket": 1480,
            "deliveryMethod": "FBA",
            "productWeight": "0.51 pounds / 231.33 g",
            "productSize": "2.6 x 1.2 x 2.4 inches / 6.60 x 3.05 x 6.10 cm",
            "packageWeight": "0.84 pounds / 381.02 g",
            "packageSize": "7.1 x 6.3 x 1.9 inches / 18.03 x 16.00 x 4.83 cm",
        },
        "tags": ["4-port", "GaNPrime", "Amazon's Choice", "FBA", "High review count"],
        "source": {
            "sourceFile": "Product-US-20260720.xlsx",
            "sourceSheet": "US-竞品分析(1)",
            "dataProvider": "SellerSprite",
            "sourceDate": "2026-07-20",
            "notes": "Ratings, reviews, Q&A, variants, seller data and recent listing metrics are from the latest update date in SellerSprite export notes.",
        },
        "dataConfidence": "observed_marketplace_export",
    },
    {
        "id": "anker_140w_4port_us_amazon",
        "categoryId": "adapter",
        "lenovoProductId": "adapter_multi_port_150w_gan",
        "countryCode": "US",
        "country": "United States",
        "region": "North America",
        "platform": "Amazon US",
        "brand": "Anker",
        "asin": "B0DFCH3C4W",
        "parentAsin": "B0DSFRVXPB",
        "productName": "Anker 140W 4-Port GaN MacBook Charger",
        "title": "Anker 140W 4-Port GaN MacBook Charger, USB C Charger Block with Display | Fast Charger USB C Power Adapter with Touch Controls for Macbook,iPad,iPhone 17/16 Series (Include 5FT Cable,Non-Battery)",
        "productUrl": "https://www.amazon.com/dp/B0DFCH3C4W",
        "brandUrl": "https://www.amazon.com/stores/Anker/page/D24FDA17-DECF-46BB-AF47-AF4647D2B1F8?lp_asin=B0DFCH3C4W&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
        "image": "assets/competitors/anker-140w-4port-us.jpg",
        "sourceImageUrl": "https://images-na.ssl-images-amazon.com/images/I/71TNYvW23mL._AC_US600_.jpg",
        "specs": {
            "wattageW": 140,
            "totalPorts": 4,
            "connectorType": "USB",
            "color": "Dark Gray",
            "amperage": "16 A",
            "inputVoltage": "240 volts",
            "specialFeature": "Fast Charging",
            "includedComponents": "1 adapter, 1 USB cable, 1 user manual",
            "compatibleDevices": "iPhone 16 / 15 / 14 / 13 / 12 / SE Series, Samsung S24 / S23 Series, Google Pixel 8 / 7, HP Chromebook 14, MacBook Air / Pro Series, Steam Deck, DJI Mavic 3, AirPods and more",
        },
        "metrics": {
            "rsp": 79.99,
            "price": 79.99,
            "primePrice": 79.99,
            "aur": 79.99,
            "monthlyUnits": 12311,
            "unitsMomGrowth": 0.9228,
            "unitsYoyGrowth": 1.131,
            "monthlyRevenue": 984756,
            "childUnits": 10000,
            "childRevenue": 899900,
            "variantCount": 2,
            "mainCategory": "Cell Phones & Accessories",
            "mainBsr": 529,
            "mainBsrGrowth": -38,
            "mainBsrGrowthRate": -0.07,
            "subCategory": "Cell Phone Wall Chargers",
            "subBsr": 88,
            "qnaCount": 0,
            "reviewCount": 3201,
            "monthlyNewReviews": 194,
            "rating": 4.4,
            "reviewRate": 0.0158,
            "fbaFee": 5.03,
            "grossMargin": 0.86,
            "lqs": 10.0,
            "sellerCount": 2,
            "buyBoxSeller": "AnkerDirect",
            "buyBoxType": "FBA",
            "sellerLocation": "US",
            "launchDate": "2024-09-09",
            "daysOnMarket": 679,
            "deliveryMethod": "FBA",
            "productWeight": "0.64 pounds / 290.30 g",
            "productSize": "2.7 x 2.7 x 1.4 inches / 6.86 x 6.86 x 3.56 cm",
            "packageWeight": "0.86 pounds / 390.09 g",
            "packageSize": "5.2 x 4 x 1.7 inches / 13.21 x 10.16 x 4.32 cm",
        },
        "tags": ["4-port", "140W", "Display", "Touch controls", "Amazon's Choice", "Includes 5FT cable"],
        "source": {
            "sourceFile": "Product-US-20260720 (1).xlsx",
            "sourceSheet": "US-竞品分析(1)",
            "dataProvider": "SellerSprite",
            "sourceDate": "2026-07-20",
            "notes": "Ratings, reviews, Q&A, variants, seller data and recent listing metrics are from the latest update date in SellerSprite export notes.",
        },
        "dataConfidence": "observed_marketplace_export",
    },
]


COMPETITOR_BRANDS = {
    "adapter": [
        {
            "brand": "Anker",
            "shareWeight": 0.30,
            "aur": 54,
            "starProduct": "Anker 737 GaNPrime",
            "heroFeature": "GaN multi-port fast charging",
            "growth": 0.13,
            "launches": {2: "Nano USB-C 45W", 8: "Prime 100W GaN Charger"},
        },
        {
            "brand": "Belkin",
            "shareWeight": 0.18,
            "aur": 49,
            "starProduct": "BoostCharge Pro 65W",
            "heroFeature": "retail channel coverage",
            "growth": 0.06,
            "launches": {5: "BoostCharge Pro 4-Port"},
        },
        {
            "brand": "Apple",
            "shareWeight": 0.16,
            "aur": 59,
            "starProduct": "35W Dual USB-C Adapter",
            "heroFeature": "ecosystem attach",
            "growth": 0.02,
            "launches": {9: "Compact Dual USB-C refresh"},
        },
        {
            "brand": "Ugreen",
            "shareWeight": 0.14,
            "aur": 39,
            "starProduct": "Nexode 100W",
            "heroFeature": "price-performance",
            "growth": 0.16,
            "launches": {6: "Nexode RG 65W"},
        },
        {
            "brand": "Samsung",
            "shareWeight": 0.10,
            "aur": 34,
            "starProduct": "45W Super Fast Charger",
            "heroFeature": "phone bundle attach",
            "growth": 0.04,
            "launches": {10: "45W PD Adapter refresh"},
        },
    ],
    "power_bank": [
        {
            "brand": "Anker",
            "shareWeight": 0.28,
            "aur": 79,
            "starProduct": "Anker Prime 20K",
            "heroFeature": "high wattage travel power",
            "growth": 0.14,
            "launches": {3: "MagGo Qi2 10K", 8: "Prime 27K 250W"},
        },
        {
            "brand": "Baseus",
            "shareWeight": 0.20,
            "aur": 55,
            "starProduct": "Blade 100W",
            "heroFeature": "slim laptop power bank",
            "growth": 0.11,
            "launches": {5: "Blade HD 100W"},
        },
        {
            "brand": "Belkin",
            "shareWeight": 0.14,
            "aur": 49,
            "starProduct": "BoostCharge 10K",
            "heroFeature": "retail distribution",
            "growth": 0.05,
            "launches": {9: "BoostCharge Hybrid 10K"},
        },
        {
            "brand": "Ugreen",
            "shareWeight": 0.16,
            "aur": 69,
            "starProduct": "145W 25K Power Bank",
            "heroFeature": "high capacity value",
            "growth": 0.17,
            "launches": {6: "Nexode 20K 130W"},
        },
        {
            "brand": "Samsung",
            "shareWeight": 0.10,
            "aur": 45,
            "starProduct": "Wireless Battery Pack 10K",
            "heroFeature": "Galaxy ecosystem",
            "growth": 0.03,
            "launches": {10: "Super Fast Battery Pack refresh"},
        },
    ],
    "power_cable": [
        {
            "brand": "Anker",
            "shareWeight": 0.24,
            "aur": 18,
            "starProduct": "PowerLine III USB-C",
            "heroFeature": "durability and fast charge",
            "growth": 0.09,
            "launches": {4: "Prime 240W USB-C Cable"},
        },
        {
            "brand": "Belkin",
            "shareWeight": 0.18,
            "aur": 19,
            "starProduct": "BoostCharge Braided USB-C",
            "heroFeature": "certified premium cables",
            "growth": 0.05,
            "launches": {8: "Connect USB-C 240W Cable"},
        },
        {
            "brand": "Apple",
            "shareWeight": 0.16,
            "aur": 29,
            "starProduct": "USB-C Charge Cable 2m",
            "heroFeature": "ecosystem replacement demand",
            "growth": 0.02,
            "launches": {6: "Braided USB-C Cable refresh"},
        },
        {
            "brand": "Ugreen",
            "shareWeight": 0.18,
            "aur": 14,
            "starProduct": "USB-C 100W Braided",
            "heroFeature": "value bundle",
            "growth": 0.12,
            "launches": {2: "2-Pack 100W Cable"},
        },
        {
            "brand": "Amazon Basics",
            "shareWeight": 0.12,
            "aur": 10,
            "starProduct": "USB-C 60W Cable",
            "heroFeature": "low-price volume",
            "growth": 0.04,
            "launches": {10: "USB-C 240W Cable"},
        },
    ],
}


def stable_wave(key: str, idx: int, amplitude: float = 1.0) -> float:
    seed = sum((i + 1) * ord(ch) for i, ch in enumerate(key))
    return math.sin((seed % 31 + 3) * (idx + 1) * 0.173) * amplitude


def month_sequence_from_source(source: Path | None) -> tuple[list[str], list[float], dict[str, Any]]:
    fallback_months = [
        "2025-03-01",
        "2025-04-01",
        "2025-05-01",
        "2025-06-01",
        "2025-07-01",
        "2025-08-01",
        "2025-09-01",
        "2025-10-01",
        "2025-11-01",
        "2025-12-01",
        "2026-01-01",
        "2026-02-01",
        "2026-03-01",
    ]
    fallback_seasonality = [0.88, 0.92, 0.96, 0.99, 1.02, 1.06, 1.03, 1.00, 1.14, 1.18, 0.95, 0.91, 0.98]
    meta = {
        "sourceFile": str(source) if source else None,
        "sourceMode": "modeled",
        "sourceNotes": "Modeled accessories data fitted to the workbook's monthly structure.",
    }

    if not source or not source.exists() or pd is None:
        return fallback_months, fallback_seasonality, meta

    try:
        df = pd.read_excel(source, sheet_name="Lenovo_Product")
        df["Date"] = pd.to_datetime(df["Date"])
        grouped = df.groupby("Date", as_index=False)["Units_Shipped_Net"].sum().sort_values("Date")
        months = [d.strftime("%Y-%m-01") for d in grouped["Date"]]
        mean_units = grouped["Units_Shipped_Net"].mean()
        seasonality = (grouped["Units_Shipped_Net"] / mean_units).clip(0.78, 1.22).round(4).tolist()
        meta.update(
            {
                "sourceMode": "sample_fitted",
                "sourceDateRange": [months[0], months[-1]],
                "sourceRows": int(len(df)),
                "sourceNotes": "Accessories data is fitted from the provided wearable workbook's monthly rhythm and metric schema.",
            }
        )
        return months, seasonality, meta
    except Exception as exc:
        meta["sourceWarning"] = f"Could not read source workbook: {exc}"
        return fallback_months, fallback_seasonality, meta


def category_lookup() -> dict[str, dict[str, Any]]:
    return {category["id"]: category for category in CATEGORIES}


def product_lookup() -> dict[str, dict[str, Any]]:
    return {product["id"]: product for product in PRODUCTS}


def variant_rows(product: dict[str, Any]) -> list[dict[str, Any]]:
    variants = []
    for base in VARIANT_LIBRARY[product["categoryId"]]:
        variants.append(
            {
                "id": f"{product['id']}_{base['suffix']}",
                "modelId": product["id"],
                "categoryId": product["categoryId"],
                "name": base["name"],
                "share": base["share"],
                "priceMultiplier": base["price"],
                "costMultiplier": base["cost"],
            }
        )
    return variants


def build_catalog(months: list[str], source_meta: dict[str, Any]) -> dict[str, Any]:
    catalog_products = []
    all_variants = []
    for product in PRODUCTS:
        product_variants = variant_rows(product)
        all_variants.extend(product_variants)
        p = {k: v for k, v in product.items() if k not in {"baseMonthlyUnits", "costRatio", "growth"}}
        p["variants"] = [v["id"] for v in product_variants]
        p["tags"] = [value for value in product["attributes"].get("features", []) if value not in FILTER_VALUE_EXCLUSIONS["features"]][:3]
        catalog_products.append(p)

    filter_values: dict[str, dict[str, list[Any]]] = {}
    for category in CATEGORIES:
        category_id = category["id"]
        filter_values[category_id] = {}
        category_products = [p for p in PRODUCTS if p["categoryId"] == category_id]
        for config in FILTERS[category_id]:
            values = []
            for product in category_products:
                raw = product["attributes"].get(config["id"])
                if isinstance(raw, list):
                    values.extend([value for value in raw if value not in FILTER_VALUE_EXCLUSIONS.get(config["id"], set())])
                elif raw is not None:
                    values.append(raw)
            unique_values = []
            for value in values:
                if value not in unique_values:
                    unique_values.append(value)
            filter_values[category_id][config["id"]] = unique_values

    return {
        "generatedAt": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "periods": months,
        "categories": CATEGORIES,
        "filters": FILTERS,
        "filterValues": filter_values,
        "policyReports": POLICY_REPORTS,
        "industryBrandReports": INDUSTRY_BRAND_REPORTS,
        "marketStructureReports": MARKET_STRUCTURE_REPORTS,
        "products": catalog_products,
        "variants": all_variants,
        "futureCategorySlots": ["Docking", "Wireless Charger", "Smart Accessories"],
        "source": source_meta,
    }


def build_product_metrics(months: list[str], seasonality: list[float]) -> list[dict[str, Any]]:
    rows = []
    for product in PRODUCTS:
        variants = variant_rows(product)
        for month_idx, month in enumerate(months):
            season = seasonality[month_idx % len(seasonality)]
            trend = 1 + product["growth"] * (month_idx / max(1, len(months) - 1))
            event_lift = 1.08 if month[5:7] in {"11", "12"} else 1.0
            for variant in variants:
                noise = 1 + stable_wave(product["id"] + variant["id"], month_idx, 0.045)
                units_gross = int(round(product["baseMonthlyUnits"] * variant["share"] * season * trend * event_lift * noise))
                return_base = 0.026
                if product["categoryId"] == "power_bank":
                    return_base += 0.006
                if product["categoryId"] == "power_cable":
                    return_base -= 0.004
                if product["attributes"].get("isTwoInOne"):
                    return_base += 0.004
                return_rate = max(0.012, return_base + stable_wave(product["id"], month_idx, 0.006))
                units_returned = int(round(units_gross * return_rate))
                units_net = units_gross - units_returned
                promo = -0.035 if month[5:7] in {"11", "12"} else 0.0
                aur = product["listPrice"] * variant["priceMultiplier"] * (1 + promo + stable_wave(variant["id"], month_idx, 0.012))
                revenue_gross = units_gross * aur
                refund_amount = units_returned * aur * 0.94
                revenue_net = revenue_gross - refund_amount
                supply_pressure = 1 + 0.012 * month_idx + stable_wave(product["categoryId"], month_idx, 0.015)
                unit_cost = product["listPrice"] * product["costRatio"] * variant["costMultiplier"] * supply_pressure
                return_cost = units_returned * unit_cost * 0.16
                gross_profit = revenue_net - units_net * unit_cost - return_cost
                margin = gross_profit / revenue_net if revenue_net else 0
                conversion = 0.026 + min(0.018, product["listPrice"] / 10000) + stable_wave(product["id"], month_idx, 0.003)
                rows.append(
                    {
                        "date": month,
                        "year": int(month[:4]),
                        "month": int(month[5:7]),
                        "categoryId": product["categoryId"],
                        "modelId": product["id"],
                        "variantId": variant["id"],
                        "variantName": variant["name"],
                        "unitsGross": units_gross,
                        "unitsReturned": units_returned,
                        "unitsNet": units_net,
                        "returnRate": round(units_returned / units_gross if units_gross else 0, 4),
                        "revenueGross": round(revenue_gross),
                        "refundAmount": round(refund_amount),
                        "revenueNet": round(revenue_net),
                        "aur": round(aur, 2),
                        "unitCost": round(unit_cost, 2),
                        "returnCost": round(return_cost, 2),
                        "grossProfit": round(gross_profit),
                        "margin": round(margin, 4),
                        "inventorySellThrough": round(min(0.96, 0.68 + season * 0.12 + stable_wave(product["id"], month_idx, 0.03)), 4),
                        "conversionRate": round(max(0.012, conversion), 4),
                        "stockoutDays": max(0, int(round(1.8 + season * 2 + stable_wave(product["id"], month_idx, 1.4)))),
                        "dataConfidence": "modeled",
                    }
                )
    return rows


def build_market_metrics(product_metrics: list[dict[str, Any]], months: list[str]) -> list[dict[str, Any]]:
    rows = []
    base_share = {"adapter": 0.118, "power_bank": 0.092, "power_cable": 0.075}
    products = product_lookup()
    grouped: dict[tuple[str, str, str], dict[str, float]] = {}
    for row in product_metrics:
        key = (row["date"], row["categoryId"], row["modelId"])
        bucket = grouped.setdefault(key, {"units": 0, "revenue": 0, "profit": 0})
        bucket["units"] += row["unitsNet"]
        bucket["revenue"] += row["revenueNet"]
        bucket["profit"] += row["grossProfit"]

    for category in CATEGORIES:
        category_id = category["id"]
        for month_idx, month in enumerate(months):
            product_units = {
                model_id: values["units"]
                for (date, cat, model_id), values in grouped.items()
                if date == month and cat == category_id
            }
            lenovo_units = sum(product_units.values())
            share = base_share[category_id] + stable_wave(category_id, month_idx, 0.01) + 0.004 * (month_idx / max(1, len(months) - 1))
            total_market_units = max(1, int(round(lenovo_units / max(0.03, share))))
            ranked = sorted(product_units.items(), key=lambda item: item[1], reverse=True)
            ranks = {model_id: rank + 1 for rank, (model_id, _) in enumerate(ranked)}
            for model_id, units in product_units.items():
                values = grouped[(month, category_id, model_id)]
                product = products[model_id]
                category_aur = values["revenue"] / values["units"] if values["units"] else product["listPrice"]
                rows.append(
                    {
                        "date": month,
                        "year": int(month[:4]),
                        "month": int(month[5:7]),
                        "categoryId": category_id,
                        "modelId": model_id,
                        "totalMarketUnits": total_market_units,
                        "lenovoCategoryUnits": int(lenovo_units),
                        "lenovoCategoryShare": round(lenovo_units / total_market_units, 4),
                        "modelMarketShare": round(units / total_market_units, 4),
                        "modelRevenueShareWithinLenovo": round(values["revenue"] / max(1, sum(v["revenue"] for (d, c, _), v in grouped.items() if d == month and c == category_id)), 4),
                        "marketRankInLenovo": ranks[model_id],
                        "categoryAUR": round(category_aur * (0.94 + stable_wave(category_id + model_id, month_idx, 0.025)), 2),
                        "searchIndex": round(50 + 28 * units / max(1, max(product_units.values())) + stable_wave(model_id, month_idx, 4), 1),
                        "competitivePriceIndex": round((category_aur / product["listPrice"]) * 100, 1),
                        "dataConfidence": "modeled",
                    }
                )
    return rows


def build_brand_market_metrics(
    product_metrics: list[dict[str, Any]], market_metrics: list[dict[str, Any]], months: list[str]
) -> list[dict[str, Any]]:
    rows = []
    lenovo_grouped: dict[tuple[str, str], dict[str, float]] = {}
    for row in product_metrics:
        key = (row["date"], row["categoryId"])
        bucket = lenovo_grouped.setdefault(key, {"units": 0, "revenue": 0, "profit": 0})
        bucket["units"] += row["unitsNet"]
        bucket["revenue"] += row["revenueNet"]
        bucket["profit"] += row["grossProfit"]

    market_lookup: dict[tuple[str, str], dict[str, Any]] = {}
    for row in market_metrics:
        market_lookup.setdefault((row["date"], row["categoryId"]), row)

    lenovo_launches = {
        ("adapter", 0): "Lenovo GaN Nano 65W Adapter",
        ("adapter", 1): "Lenovo Multi-port USB-C 150W Laptop GaN Charger",
        ("power_bank", 0): "Lenovo 140W Smart Laptop Power Bank",
        ("power_bank", 1): "Lenovo Hybrid 2-in-1 Power Bank 140W (10.2K)",
        ("power_cable", 0): "Lenovo 240W USB-C Retractable Cable",
    }

    for category in CATEGORIES:
        category_id = category["id"]
        competitors = COMPETITOR_BRANDS[category_id]
        competitor_weight_total = sum(brand["shareWeight"] for brand in competitors)
        category_products = [product for product in PRODUCTS if product["categoryId"] == category_id]
        for month_idx, month in enumerate(months):
            market = market_lookup[(month, category_id)]
            total_market_units = market["totalMarketUnits"]
            lenovo = lenovo_grouped[(month, category_id)]
            lenovo_units = int(lenovo["units"])
            lenovo_share = lenovo_units / total_market_units
            lenovo_star = max(
                category_products,
                key=lambda product: sum(
                    row["unitsNet"]
                    for row in product_metrics
                    if row["date"] == month and row["modelId"] == product["id"]
                ),
            )
            rows.append(
                {
                    "date": month,
                    "year": int(month[:4]),
                    "month": int(month[5:7]),
                    "categoryId": category_id,
                    "brand": "Lenovo",
                    "brandUnits": lenovo_units,
                    "brandRevenue": round(lenovo["revenue"]),
                    "marketShare": round(lenovo_share, 4),
                    "avgAUR": round(lenovo["revenue"] / max(1, lenovo_units), 2),
                    "newProductLaunch": lenovo_launches.get((category_id, month_idx)),
                    "starProduct": lenovo_star["name"],
                    "heroFeature": "portfolio breadth and ThinkPad attach",
                    "channelSignal": round(70 + stable_wave("Lenovo" + category_id, month_idx, 5), 1),
                    "isLenovo": True,
                    "dataConfidence": "modeled",
                }
            )

            remaining_units = max(0, total_market_units - lenovo_units)
            raw_competitors = []
            for brand in competitors:
                share_weight = brand["shareWeight"] / competitor_weight_total
                trend = 1 + brand["growth"] * (month_idx / max(1, len(months) - 1))
                noise = 1 + stable_wave(category_id + brand["brand"], month_idx, 0.04)
                raw_units = max(1, remaining_units * share_weight * trend * noise)
                raw_competitors.append((brand, share_weight, raw_units))

            raw_total = sum(item[2] for item in raw_competitors)
            for brand, share_weight, raw_units in raw_competitors:
                units = int(round(raw_units / raw_total * remaining_units))
                avg_aur = brand["aur"] * (1 + stable_wave(brand["brand"] + category_id, month_idx, 0.018))
                rows.append(
                    {
                        "date": month,
                        "year": int(month[:4]),
                        "month": int(month[5:7]),
                        "categoryId": category_id,
                        "brand": brand["brand"],
                        "brandUnits": units,
                        "brandRevenue": round(units * avg_aur),
                        "marketShare": round(units / total_market_units, 4),
                        "avgAUR": round(avg_aur, 2),
                        "newProductLaunch": brand["launches"].get(month_idx),
                        "starProduct": brand["starProduct"],
                        "heroFeature": brand["heroFeature"],
                        "channelSignal": round(58 + 100 * share_weight + stable_wave(brand["brand"], month_idx, 5), 1),
                        "isLenovo": False,
                        "dataConfidence": "modeled",
                    }
                )
    return rows


def related_models(category_id: str, component: str) -> list[str]:
    related = []
    for product in PRODUCTS:
        if product["categoryId"] != category_id:
            continue
        attrs = product["attributes"]
        features = set(attrs.get("features", []))
        connectors = set(attrs.get("connectors", []))
        if component in {"USB-C PD controller", "USB-C connector"}:
            related.append(product["id"])
        elif component == "GaN power IC" and ("GaN" in features or attrs.get("wattage", 0) >= 100):
            related.append(product["id"])
        elif component == "Thermal module" and ("desktop" in features or attrs.get("wattage", 0) >= 100):
            related.append(product["id"])
        elif component == "Magnetic coil" and ("wireless" in features or "magnetic" in features):
            related.append(product["id"])
        elif component == "Battery cell" and category_id == "power_bank":
            related.append(product["id"])
        elif component == "BMS controller" and category_id == "power_bank":
            related.append(product["id"])
        elif component == "Magnetic module" and "magnetic" in features:
            related.append(product["id"])
        elif component == "Casing and rugged shell" and ("outdoor" in features or "rugged" in features):
            related.append(product["id"])
        elif component == "E-marker chip" and attrs.get("powerW", 0) >= 100:
            related.append(product["id"])
        elif component == "Braided jacket" and "braided" in features:
            related.append(product["id"])
        elif component == "Lightning connector" and "Lightning" in connectors:
            related.append(product["id"])
    return related


REAL_PRODUCT_SPECS = [
    {
        "id": "adapter_multi_port_150w_gan",
        "categoryId": "adapter",
        "sourceFile": "Lenovo Multi-port USB-C 150W Laptop GaN Charger.xlsx",
        "name": "Lenovo Multi-port USB-C 150W Laptop GaN Charger",
        "shortName": "150W Laptop GaN",
        "image": "assets/products/adapter-multi-port-150w-gan.webp",
        "listPrice": 89.99,
        "costRatio": 0.52,
        "attributes": {
            "wattage": 150,
            "wattageBand": "100W and above",
            "features": ["GaN", "multi-port", "laptop"],
            "compatibility": "laptop",
            "powerMode": "Wired",
            "ports": 3,
            "portCountBand": "3+ ports",
            "interfaceProtocols": ["USB-C PD 3.1"],
            "scenarios": ["laptop", "commercial"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_multi_port_100w_gan",
        "categoryId": "adapter",
        "sourceFile": "Lenovo Multi-port USB-C 100W GaN Charger.xlsx",
        "name": "Lenovo Multi-port USB-C 100W GaN Charger",
        "shortName": "100W Multi-port",
        "image": "assets/products/adapter-multi-port-100w-gan-black.avif",
        "images": [
            {"label": "Black", "src": "assets/products/adapter-multi-port-100w-gan-black.avif"},
            {"label": "White", "src": "assets/products/adapter-multi-port-100w-gan-white.avif"},
        ],
        "listPrice": 74.99,
        "costRatio": 0.50,
        "attributes": {
            "wattage": 100,
            "wattageBand": "100W and above",
            "features": ["GaN", "multi-port"],
            "compatibility": "multi",
            "powerMode": "Wired",
            "ports": 3,
            "portCountBand": "3+ ports",
            "interfaceProtocols": ["USB-C PD 3.1", "PPS"],
            "scenarios": ["multi-device", "consumer"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_65w_usbc_ac_travel",
        "categoryId": "adapter",
        "sourceFile": "Lenovo 65W USB-C AC Travel Adapter.xlsx",
        "name": "Lenovo 65W USB-C AC Travel Adapter",
        "shortName": "65W AC Travel",
        "image": "assets/products/adapter-65w-usbc-ac-travel.avif",
        "listPrice": 49.99,
        "costRatio": 0.46,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["USB-C", "travel", "AC"],
            "compatibility": "laptop",
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD"],
            "scenarios": ["travel", "commercial"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_65w_usbc_wall",
        "categoryId": "adapter",
        "sourceFile": "Lenovo 65W USB-C Wall Adapter.xlsx",
        "name": "Lenovo 65W USB-C Wall Adapter",
        "shortName": "65W USB-C Wall",
        "image": "assets/products/adapter-65w-usbc-wall.avif",
        "listPrice": 29.99,
        "costRatio": 0.46,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["USB-C", "wall", "compact"],
            "compatibility": "mobile",
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD"],
            "scenarios": ["daily carry", "consumer"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_65w_mini_gan",
        "categoryId": "adapter",
        "sourceFile": "Lenovo 65W Mini USB-C GaN Charger.xlsx",
        "name": "Lenovo 65W Mini USB-C GaN Charger",
        "shortName": "65W Mini GaN",
        "image": "assets/products/adapter-65w-mini-gan.avif",
        "listPrice": 34.99,
        "costRatio": 0.46,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["GaN", "mini", "USB-C"],
            "compatibility": "mobile",
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD", "PPS"],
            "scenarios": ["mobile", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_gan_nano_65w",
        "categoryId": "adapter",
        "sourceFile": "Lenovo GaN Nano 65W Adapter.xlsx",
        "name": "Lenovo GaN Nano 65W Adapter",
        "shortName": "65W GaN Nano",
        "image": "assets/products/adapter-gan-nano-65w.avif",
        "listPrice": 49.99,
        "costRatio": 0.46,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["GaN", "nano", "laptop"],
            "compatibility": "laptop",
            "powerMode": "Wired",
            "ports": 1,
            "portCountBand": "1 port",
            "interfaceProtocols": ["USB-C PD"],
            "scenarios": ["laptop", "commercial"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "adapter_dual_usbc_65w_gan",
        "categoryId": "adapter",
        "sourceFile": "Lenovo Dual USB-C 65W GaN Charger.xlsx",
        "name": "Lenovo Dual USB-C 65W GaN Charger",
        "shortName": "65W Dual USB-C",
        "image": "assets/products/adapter-dual-usbc-65w-gan-black.avif",
        "images": [
            {"label": "Black", "src": "assets/products/adapter-dual-usbc-65w-gan-black.avif"},
            {"label": "White", "src": "assets/products/adapter-dual-usbc-65w-gan-white.avif"},
        ],
        "listPrice": 59.99,
        "costRatio": 0.48,
        "attributes": {
            "wattage": 65,
            "wattageBand": "45W to 99W",
            "features": ["GaN", "dual USB-C", "multi-port"],
            "compatibility": "multi",
            "powerMode": "Wired",
            "ports": 2,
            "portCountBand": "2 ports",
            "interfaceProtocols": ["USB-C PD", "PPS"],
            "scenarios": ["multi-device", "consumer"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "bank_hybrid_2in1_140w_10200",
        "categoryId": "power_bank",
        "sourceFile": "Lenovo Hybrid 2-in-1 Power Bank 140W (10.2K).xlsx",
        "name": "Lenovo Hybrid 2-in-1 Power Bank 140W (10.2K)",
        "shortName": "Hybrid 140W 10.2K",
        "image": "assets/products/bank-hybrid-2in1-140w-10200.png",
        "listPrice": 99,
        "costRatio": 0.58,
        "attributes": {
            "capacityMah": 10200,
            "capacityBand": "10000-20000mAh",
            "outputW": 140,
            "outputBand": "100W and above",
            "features": ["2-in-1", "hybrid", "high wattage"],
            "compatibility": "laptop",
            "hasCable": "No",
            "scenarios": ["laptop", "travel"],
            "isTwoInOne": True,
        },
    },
    {
        "id": "bank_140w_smart_laptop",
        "categoryId": "power_bank",
        "sourceFile": "Lenovo 140W Smart Laptop Power Bank.xlsx",
        "name": "Lenovo 140W Smart Laptop Power Bank",
        "shortName": "140W Smart Power Bank",
        "image": "assets/products/bank-140w-smart-laptop.png",
        "listPrice": 119,
        "costRatio": 0.56,
        "attributes": {
            "capacityMah": 20000,
            "capacityBand": "20000mAh and above",
            "outputW": 140,
            "outputBand": "100W and above",
            "features": ["smart display", "high wattage", "laptop"],
            "compatibility": "laptop",
            "hasCable": "No",
            "scenarios": ["laptop", "travel"],
            "isTwoInOne": False,
        },
    },
    {
        "id": "cable_240w_usb_c_retractable",
        "categoryId": "power_cable",
        "sourceFile": "Lenovo 240W USB-C Retractable Cable.xlsx",
        "name": "Lenovo 240W USB-C Retractable Cable",
        "shortName": "240W Retractable Cable",
        "image": "assets/products/cable-240w-usb-c-retractable-black.avif",
        "images": [
            {"label": "Black", "src": "assets/products/cable-240w-usb-c-retractable-black.avif"},
            {"label": "White", "src": "assets/products/cable-240w-usb-c-retractable-white.avif"},
        ],
        "listPrice": 24,
        "costRatio": 0.42,
        "attributes": {
            "connectors": ["USB-C"],
            "lengthM": 1.0,
            "lengthBand": "1m to 2m",
            "powerW": 240,
            "powerBand": "200W and above",
            "features": ["USB-C", "retractable", "240W"],
            "retractable": "Yes",
            "scenarios": ["travel", "laptop"],
        },
    },
]


def safe_id(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in str(value)).strip("_")


def fiscal_date(fiscal_year: str, fiscal_quarter: str) -> str:
    start_year = 2000 + int(str(fiscal_year)[2:4])
    quarter = int(str(fiscal_quarter).replace("Q", ""))
    if quarter == 1:
        return f"{start_year}-04-01"
    if quarter == 2:
        return f"{start_year}-07-01"
    if quarter == 3:
        return f"{start_year}-10-01"
    return f"{start_year + 1}-01-01"


def fiscal_sort_value(fiscal_year: str, fiscal_quarter: str) -> int:
    return int(str(fiscal_year).replace("FY", "")) * 10 + int(str(fiscal_quarter).replace("Q", ""))


def clean_cell(value: Any) -> str:
    if pd is not None and pd.isna(value):
        return ""
    text = str(value or "").strip()
    return "" if text.lower() == "nan" else text


def infer_geo_from_country(country: str) -> str:
    normalized = country.strip().lower()
    if not normalized:
        return ""
    north_america = {
        "canada",
        "united states",
        "united states of america",
        "usa",
        "us",
    }
    latin_america = {
        "argentina",
        "brazil",
        "chile",
        "colombia",
        "mexico",
        "peru",
    }
    europe = {
        "austria",
        "belgium",
        "france",
        "germany",
        "italy",
        "netherlands",
        "poland",
        "spain",
        "sweden",
        "switzerland",
        "united kingdom",
    }
    ap = {
        "australia",
        "china",
        "hong kong",
        "india",
        "japan",
        "korea",
        "new zealand",
        "singapore",
        "taiwan",
        "thailand",
    }
    meta = {
        "israel",
        "saudi arabia",
        "south africa",
        "turkey",
        "united arab emirates",
    }
    if normalized in north_america:
        return "NA"
    if normalized in latin_america:
        return "LA"
    if normalized in europe:
        return "EUROPE"
    if normalized in ap:
        return "AP"
    if normalized in meta:
        return "META"
    return ""


def real_source_available(source_dir: Path) -> bool:
    if pd is None or not source_dir.exists():
        return False
    return all((source_dir / spec["sourceFile"]).exists() for spec in REAL_PRODUCT_SPECS)


def read_real_sales(source_dir: Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    files_read = []
    numeric_fields = ["Order_Rev", "Ship_Rev", "Bklg_Rev", "Order_Qty", "Ship_Qty", "Bklg_Qty", "Ship_AUR"]
    for spec in REAL_PRODUCT_SPECS:
        path = source_dir / spec["sourceFile"]
        df = pd.read_excel(path, sheet_name="Export", engine="openpyxl")
        df = df[df["Fiscal Year"].astype(str).str.startswith("FY", na=False)].copy()
        for field in numeric_fields:
            if field not in df:
                df[field] = 0
            df[field] = pd.to_numeric(df[field], errors="coerce").fillna(0)
        files_read.append(path.name)
        for record in df.to_dict(orient="records"):
            fiscal_year = str(record["Fiscal Year"])
            fiscal_quarter = str(record["Fiscal Quarter"])
            country = clean_cell(record.get("Country"))
            geo = clean_cell(record.get("Geo")) or infer_geo_from_country(country)
            rows.append(
                {
                    "date": fiscal_date(fiscal_year, fiscal_quarter),
                    "fiscalYear": fiscal_year,
                    "fiscalQuarter": fiscal_quarter,
                    "modelId": spec["id"],
                    "categoryId": spec["categoryId"],
                    "partNumber": clean_cell(record["Part Number"]),
                    "sourceModel": clean_cell(record.get("Model")) or spec["name"],
                    "segment": (clean_cell(record.get("Segment")) or "Consumer").title(),
                    "geo": geo,
                    "country": country,
                    "orderRevenue": float(record["Order_Rev"]),
                    "shipRevenue": float(record["Ship_Rev"]),
                    "backlogRevenue": float(record["Bklg_Rev"]),
                    "orderQty": float(record["Order_Qty"]),
                    "shipQty": float(record["Ship_Qty"]),
                    "backlogQty": float(record["Bklg_Qty"]),
                    "shipAUR": float(record["Ship_AUR"]),
                }
            )
    meta = {
        "sourceDir": str(source_dir),
        "sourceFiles": files_read,
        "sourceMode": "real_product_excel",
        "sourceRows": len(rows),
        "sourceNotes": "Real product sell-in/order data loaded from Lenovo accessory product workbooks.",
    }
    return rows, meta


def build_real_periods(sales_rows: list[dict[str, Any]]) -> tuple[list[str], list[dict[str, Any]]]:
    period_map = {}
    for row in sales_rows:
        key = (row["fiscalYear"], row["fiscalQuarter"])
        period_map[key] = row["date"]
    ordered = sorted(period_map.items(), key=lambda item: fiscal_sort_value(item[0][0], item[0][1]))
    periods = [date for (_, date) in ordered]
    period_meta = [
        {
            "date": date,
            "fiscalYear": fy,
            "fiscalQuarter": fq,
            "quarterLabel": f"{fy} {fq}",
            "yearLabel": fy,
            "sortIndex": fiscal_sort_value(fy, fq),
        }
        for (fy, fq), date in ordered
    ]
    return periods, period_meta


def build_real_products_and_variants(sales_rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    variants_by_model: dict[str, list[str]] = {}
    for row in sales_rows:
        variants_by_model.setdefault(row["modelId"], [])
        if row["partNumber"] not in variants_by_model[row["modelId"]]:
            variants_by_model[row["modelId"]].append(row["partNumber"])

    products = []
    variants = []
    for spec in REAL_PRODUCT_SPECS:
        part_numbers = sorted(variants_by_model.get(spec["id"], []))
        variant_ids = []
        for pn in part_numbers:
            variant_id = f"{spec['id']}_{safe_id(pn)}"
            variant_ids.append(variant_id)
            variants.append(
                {
                    "id": variant_id,
                    "modelId": spec["id"],
                    "categoryId": spec["categoryId"],
                    "name": pn,
                    "partNumber": pn,
                    "share": 0,
                    "priceMultiplier": 1,
                    "costMultiplier": 1,
                }
            )
        product = {k: v for k, v in spec.items() if k not in {"sourceFile", "costRatio"}}
        product["variants"] = variant_ids
        product["partNumbers"] = part_numbers
        product["tags"] = [product["attributes"].get("compatibility") or product["attributes"].get("retractable"), *product["attributes"].get("features", [])][:3]
        products.append(product)
    return products, variants


def build_real_catalog(periods: list[str], period_meta: list[dict[str, Any]], source_meta: dict[str, Any], products: list[dict[str, Any]], variants: list[dict[str, Any]]) -> dict[str, Any]:
    filter_values: dict[str, dict[str, list[Any]]] = {}
    for category in CATEGORIES:
        category_id = category["id"]
        filter_values[category_id] = {}
        category_products = [p for p in products if p["categoryId"] == category_id]
        for config in FILTERS[category_id]:
            values = []
            for product in category_products:
                raw = product["attributes"].get(config["id"])
                if isinstance(raw, list):
                    values.extend(raw)
                elif raw is not None:
                    values.append(raw)
            explicit_values = FILTER_VALUE_ORDER.get(category_id, {}).get(config["id"])
            filter_values[category_id][config["id"]] = explicit_values or list(dict.fromkeys(values))

    return {
        "generatedAt": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "periods": periods,
        "periodMeta": period_meta,
        "categories": CATEGORIES,
        "filters": FILTERS,
        "filterValues": filter_values,
        "policyReports": POLICY_REPORTS,
        "industryBrandReports": INDUSTRY_BRAND_REPORTS,
        "marketStructureReports": MARKET_STRUCTURE_REPORTS,
        "products": products,
        "variants": variants,
        "futureCategorySlots": ["Docking", "Wireless Charger", "Smart Accessories"],
        "source": source_meta,
    }


def build_real_product_metrics(sales_rows: list[dict[str, Any]], periods: list[str], products: list[dict[str, Any]], variants: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, str, str], dict[str, Any]] = {}
    for row in sales_rows:
        key = (row["date"], row["modelId"], row["partNumber"], row["segment"])
        bucket = grouped.setdefault(
            key,
            {
                "orderRevenue": 0.0,
                "shipRevenue": 0.0,
                "backlogRevenue": 0.0,
                "orderQty": 0.0,
                "shipQty": 0.0,
                "backlogQty": 0.0,
                "countries": set(),
                "geos": set(),
                "fiscalYear": row["fiscalYear"],
                "fiscalQuarter": row["fiscalQuarter"],
            },
        )
        bucket["orderRevenue"] += row["orderRevenue"]
        bucket["shipRevenue"] += row["shipRevenue"]
        bucket["backlogRevenue"] += row["backlogRevenue"]
        bucket["orderQty"] += row["orderQty"]
        bucket["shipQty"] += row["shipQty"]
        bucket["backlogQty"] += row["backlogQty"]
        if row["country"]:
            bucket["countries"].add(row["country"])
        if row["geo"]:
            bucket["geos"].add(row["geo"])

    product_lookup_local = {product["id"]: product for product in products}
    cost_ratio = {spec["id"]: spec["costRatio"] for spec in REAL_PRODUCT_SPECS}
    variant_lookup_local = {variant["id"]: variant for variant in variants}
    variant_by_model_pn = {(variant["modelId"], variant["partNumber"]): variant for variant in variants}
    period_meta_by_date = {date: next((row for row in sales_rows if row["date"] == date), None) for date in periods}

    rows = []
    for product in products:
        for pn in product["partNumbers"]:
            variant = variant_by_model_pn[(product["id"], pn)]
            for date in periods:
                fiscal_source = period_meta_by_date.get(date)
                if not fiscal_source:
                    continue
                for segment in ["Commercial", "Consumer"]:
                    bucket = grouped.get((date, product["id"], pn, segment), {})
                    order_qty = int(round(bucket.get("orderQty", 0)))
                    ship_qty = int(round(bucket.get("shipQty", 0)))
                    backlog_qty = int(round(bucket.get("backlogQty", 0)))
                    order_revenue = float(bucket.get("orderRevenue", 0))
                    ship_revenue = float(bucket.get("shipRevenue", 0))
                    backlog_revenue = float(bucket.get("backlogRevenue", 0))
                    aur = order_revenue / order_qty if order_qty else product["listPrice"]
                    unit_cost = aur * cost_ratio[product["id"]]
                    gross_profit = order_revenue - order_qty * unit_cost
                    rows.append(
                        {
                            "date": date,
                            "year": int(date[:4]),
                            "month": int(date[5:7]),
                            "fiscalYear": fiscal_source["fiscalYear"],
                            "fiscalQuarter": fiscal_source["fiscalQuarter"],
                            "categoryId": product["categoryId"],
                            "modelId": product["id"],
                            "variantId": variant["id"],
                            "variantName": variant_lookup_local[variant["id"]]["name"],
                            "partNumber": pn,
                            "segment": segment,
                            "geo": ", ".join(sorted(bucket.get("geos", []))),
                            "countryCount": len(bucket.get("countries", [])),
                            "unitsGross": order_qty,
                            "unitsReturned": 0,
                            "unitsNet": order_qty,
                            "returnRate": 0,
                            "revenueGross": round(order_revenue, 2),
                            "refundAmount": 0,
                            "revenueNet": round(order_revenue, 2),
                            "orderRevenue": round(order_revenue, 2),
                            "shipRevenue": round(ship_revenue, 2),
                            "backlogRevenue": round(backlog_revenue, 2),
                            "orderQty": order_qty,
                            "shipQty": ship_qty,
                            "backlogQty": backlog_qty,
                            "aur": round(aur, 2),
                            "unitCost": round(unit_cost, 2),
                            "returnCost": 0,
                            "grossProfit": round(gross_profit, 2),
                            "margin": round(gross_profit / order_revenue if order_revenue else 0, 4),
                            "inventorySellThrough": round(ship_qty / order_qty if order_qty else 0, 4),
                            "conversionRate": 0,
                            "stockoutDays": 1 if backlog_qty or backlog_revenue else 0,
                            "dataConfidence": "observed",
                        }
                    )
    return rows


def build_real_geo_metrics(sales_rows: list[dict[str, Any]], products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    product_lookup_local = {product["id"]: product for product in products}
    grouped: dict[tuple[str, str, str, str, str, str], dict[str, Any]] = {}
    for row in sales_rows:
        geo = row["geo"] or "Unassigned"
        key = (row["date"], row["modelId"], row["partNumber"], row["segment"], geo, row["country"])
        bucket = grouped.setdefault(
            key,
            {
                "orderRevenue": 0.0,
                "shipRevenue": 0.0,
                "backlogRevenue": 0.0,
                "orderQty": 0.0,
                "shipQty": 0.0,
                "backlogQty": 0.0,
                "fiscalYear": row["fiscalYear"],
                "fiscalQuarter": row["fiscalQuarter"],
            },
        )
        bucket["orderRevenue"] += row["orderRevenue"]
        bucket["shipRevenue"] += row["shipRevenue"]
        bucket["backlogRevenue"] += row["backlogRevenue"]
        bucket["orderQty"] += row["orderQty"]
        bucket["shipQty"] += row["shipQty"]
        bucket["backlogQty"] += row["backlogQty"]

    rows = []
    for (date, model_id, part_number, segment, geo, country), bucket in grouped.items():
        product = product_lookup_local[model_id]
        rows.append(
            {
                "date": date,
                "year": int(date[:4]),
                "month": int(date[5:7]),
                "fiscalYear": bucket["fiscalYear"],
                "fiscalQuarter": bucket["fiscalQuarter"],
                "categoryId": product["categoryId"],
                "modelId": model_id,
                "partNumber": part_number,
                "segment": segment,
                "geo": geo,
                "country": country,
                "orderRevenue": round(bucket["orderRevenue"], 2),
                "shipRevenue": round(bucket["shipRevenue"], 2),
                "backlogRevenue": round(bucket["backlogRevenue"], 2),
                "orderQty": int(round(bucket["orderQty"])),
                "shipQty": int(round(bucket["shipQty"])),
                "backlogQty": int(round(bucket["backlogQty"])),
                "dataConfidence": "observed",
            }
        )
    return sorted(rows, key=lambda row: (row["date"], row["categoryId"], row["modelId"], row["geo"], row["partNumber"], row["segment"], row["country"]))


def build_modeled_geo_metrics(product_metrics: list[dict[str, Any]]) -> list[dict[str, Any]]:
    geos = ["AP", "EUROPE", "LA", "META"]
    rows = []
    for row in product_metrics:
        weights = [0.31, 0.34, 0.18, 0.17]
        for geo, weight in zip(geos, weights):
            rows.append(
                {
                    "date": row["date"],
                    "year": row["year"],
                    "month": row["month"],
                    "fiscalYear": row.get("fiscalYear"),
                    "fiscalQuarter": row.get("fiscalQuarter"),
                    "categoryId": row["categoryId"],
                    "modelId": row["modelId"],
                    "partNumber": row.get("partNumber") or row.get("variantName"),
                    "segment": row.get("segment") or "Consumer",
                    "geo": geo,
                    "country": "",
                    "orderRevenue": round((row.get("orderRevenue") or row.get("revenueNet") or 0) * weight, 2),
                    "shipRevenue": round((row.get("shipRevenue") or row.get("revenueNet") or 0) * weight, 2),
                    "backlogRevenue": round((row.get("backlogRevenue") or 0) * weight, 2),
                    "orderQty": int(round((row.get("orderQty") or row.get("unitsNet") or 0) * weight)),
                    "shipQty": int(round((row.get("shipQty") or row.get("unitsNet") or 0) * weight)),
                    "backlogQty": int(round((row.get("backlogQty") or 0) * weight)),
                    "dataConfidence": "modeled",
                }
            )
    return rows


def seasonality_from_real_metrics(product_metrics: list[dict[str, Any]], periods: list[str]) -> list[float]:
    totals = [sum(row["unitsNet"] for row in product_metrics if row["date"] == period) for period in periods]
    mean_units = sum(totals) / len(totals) if totals else 1
    return [max(0.65, min(1.35, total / mean_units if mean_units else 1)) for total in totals]


def build_real_dashboard(source_dir: Path, output_dir: Path) -> dict[str, Any]:
    global PRODUCTS
    sales_rows, source_meta = read_real_sales(source_dir)
    periods, period_meta = build_real_periods(sales_rows)
    products, variants = build_real_products_and_variants(sales_rows)
    PRODUCTS = products
    product_metrics = build_real_product_metrics(sales_rows, periods, products, variants)
    geo_metrics = build_real_geo_metrics(sales_rows, products)
    seasonality = seasonality_from_real_metrics(product_metrics, periods)
    catalog = build_real_catalog(periods, period_meta, source_meta, products, variants)
    market_metrics = build_market_metrics(product_metrics, periods)
    brand_market_metrics = build_brand_market_metrics(product_metrics, market_metrics, periods)
    supply_chain = build_supply_chain(periods, seasonality)
    consumer_insights = build_consumer_insights(product_metrics, periods)
    metadata = {
        "generatedAt": catalog["generatedAt"],
        "records": {
            "catalogProducts": len(catalog["products"]),
            "variants": len(catalog["variants"]),
            "productMetrics": len(product_metrics),
            "geoMetrics": len(geo_metrics),
            "marketMetrics": len(market_metrics),
            "brandMarketMetrics": len(brand_market_metrics),
            "competitorProducts": len(COMPETITOR_PRODUCTS),
            "supplyChain": len(supply_chain),
            "consumerInsights": len(consumer_insights),
        },
        "source": source_meta,
        "updatePattern": "Static JSON generated by Python from real product Excel files; GitHub Pages serves HTML/CSS/JS only.",
    }
    write_json(output_dir, "catalog.json", catalog)
    write_json(output_dir, "product_metrics.json", product_metrics)
    write_json(output_dir, "geo_metrics.json", geo_metrics)
    write_json(output_dir, "market_metrics.json", market_metrics)
    write_json(output_dir, "brand_market_metrics.json", brand_market_metrics)
    write_json(output_dir, "competitor_products.json", COMPETITOR_PRODUCTS)
    write_json(output_dir, "supply_chain.json", supply_chain)
    write_json(output_dir, "consumer_insights.json", consumer_insights)
    write_json(output_dir, "metadata.json", metadata)
    return metadata


def build_supply_chain(months: list[str], seasonality: list[float]) -> list[dict[str, Any]]:
    rows = []
    previous_index: dict[tuple[str, str], float] = {}
    launches = {
        ("adapter", 5): ("Lenovo 140W USB-C Desktop Charger", 99),
        ("adapter", 8): ("Lenovo 65W Adapter + Power Bank 2-in-1", 119),
        ("power_bank", 6): ("Lenovo 27000mAh 100W Travel Power Bank", 129),
        ("power_bank", 9): ("Lenovo 10000mAh Magnetic Power Bank", 59),
        ("power_cable", 7): ("Lenovo USB-C Cable Bundle 2-Pack", 24),
        ("power_cable", 10): ("Lenovo USB-C to USB-C 240W Cable 2m", 29),
    }
    for category_id, components in SUPPLY_COMPONENTS.items():
        for month_idx, month in enumerate(months):
            for component, supplier, region, base_index, base_lead, base_capacity, news in components:
                pressure = seasonality[month_idx % len(seasonality)]
                price_index = base_index + month_idx * 0.75 + stable_wave(component, month_idx, 1.8) + (pressure - 1) * 4
                prev = previous_index.get((category_id, component), price_index)
                previous_index[(category_id, component)] = price_index
                lead = int(round(base_lead + (pressure - 1) * 6 + stable_wave(category_id + component, month_idx, 2.2)))
                utilization = min(95, max(60, base_capacity + (pressure - 1) * 12 + stable_wave(component + supplier, month_idx, 3.5)))
                launch_name, launch_price = launches.get((category_id, month_idx), (None, None))
                rows.append(
                    {
                        "date": month,
                        "year": int(month[:4]),
                        "month": int(month[5:7]),
                        "categoryId": category_id,
                        "componentType": component,
                        "supplier": supplier,
                        "supplierRegion": region,
                        "priceIndex": round(price_index, 2),
                        "priceChangePct": round((price_index - prev) / prev if prev else 0, 4),
                        "leadTimeDays": max(8, lead),
                        "capacityUtilization": round(utilization, 1),
                        "newProductLaunch": launch_name,
                        "launchPrice": launch_price,
                        "newsSummary": news,
                        "impactLevel": int(max(1, min(5, round(2 + (price_index - 96) / 4 + (lead - base_lead) / 8)))),
                        "relatedModelIds": related_models(category_id, component),
                        "dataConfidence": "modeled",
                    }
                )
    return rows


def build_consumer_insights(product_metrics: list[dict[str, Any]], months: list[str]) -> list[dict[str, Any]]:
    model_month_units: dict[tuple[str, str], int] = {}
    for row in product_metrics:
        key = (row["date"], row["modelId"])
        model_month_units[key] = model_month_units.get(key, 0) + row["unitsNet"]

    products = product_lookup()
    rows = []
    for product in PRODUCTS:
        keywords = CONSUMER_KEYWORDS[product["categoryId"]]
        for month_idx, month in enumerate(months):
            units = model_month_units.get((month, product["id"]), 0)
            total_reviews = max(60, int(round(units * (0.055 + stable_wave(product["id"], month_idx, 0.007)))))
            rating_base = 4.28
            if product["categoryId"] == "power_cable":
                rating_base += 0.08
            if product["attributes"].get("isTwoInOne"):
                rating_base -= 0.05
            avg_rating = min(4.8, max(3.7, rating_base + stable_wave(product["id"], month_idx, 0.10)))
            for keyword, sentiment, weight in keywords:
                modifier = 1 + stable_wave(product["id"] + keyword, month_idx, 0.18)
                if keyword == "magnetic hold" and "magnetic" not in product["attributes"].get("features", []):
                    modifier *= 0.32
                if keyword == "built-in cable" and "built-in cable" not in product["attributes"].get("features", []):
                    modifier *= 0.35
                if keyword in {"desktop setup", "port count"} and product["attributes"].get("ports", 1) == 1:
                    modifier *= 0.55
                frequency = max(1, int(round(total_reviews * weight * modifier)))
                rows.append(
                    {
                        "date": month,
                        "year": int(month[:4]),
                        "month": int(month[5:7]),
                        "categoryId": product["categoryId"],
                        "modelId": product["id"],
                        "keyword": keyword,
                        "sentiment": sentiment,
                        "frequency": frequency,
                        "totalReviews": total_reviews,
                        "relativeFreq": round(frequency / total_reviews, 4),
                        "avgRating": round(avg_rating, 2),
                        "dataConfidence": "modeled",
                    }
                )
    return rows


def write_json(output_dir: Path, name: str, payload: Any) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / name).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-xlsx", default=DEFAULT_SOURCE, help="Optional sample workbook used for month cadence.")
    parser.add_argument("--source-dir", default=DEFAULT_REAL_SOURCE_DIR, help="Directory containing real product Excel exports.")
    parser.add_argument("--output-dir", default="data", help="Directory for static JSON outputs.")
    parser.add_argument("--allow-modeled-fallback", action="store_true", help="Allow generating the legacy modeled demo dataset when real product Excel files are unavailable.")
    args = parser.parse_args()

    source = Path(args.source_xlsx).expanduser() if args.source_xlsx else None
    source_dir = Path(args.source_dir).expanduser() if args.source_dir else None
    output_dir = Path(args.output_dir)

    if source_dir and real_source_available(source_dir):
        metadata = build_real_dashboard(source_dir, output_dir)
        print(json.dumps(metadata, ensure_ascii=False, indent=2))
        return

    if not args.allow_modeled_fallback:
        missing = []
        if source_dir and source_dir.exists():
            missing = [spec["sourceFile"] for spec in REAL_PRODUCT_SPECS if not (source_dir / spec["sourceFile"]).exists()]
        reason = f"missing files: {', '.join(missing)}" if missing else f"source directory unavailable: {source_dir}"
        raise SystemExit(
            "Real product Excel files were not found, so static JSON was not regenerated. "
            f"{reason}. Pass --allow-modeled-fallback only when you intentionally want the legacy modeled demo dataset."
        )

    months, seasonality, source_meta = month_sequence_from_source(source)

    catalog = build_catalog(months, source_meta)
    product_metrics = build_product_metrics(months, seasonality)
    geo_metrics = build_modeled_geo_metrics(product_metrics)
    market_metrics = build_market_metrics(product_metrics, months)
    brand_market_metrics = build_brand_market_metrics(product_metrics, market_metrics, months)
    supply_chain = build_supply_chain(months, seasonality)
    consumer_insights = build_consumer_insights(product_metrics, months)
    metadata = {
        "generatedAt": catalog["generatedAt"],
        "records": {
            "catalogProducts": len(catalog["products"]),
            "variants": len(catalog["variants"]),
            "productMetrics": len(product_metrics),
            "geoMetrics": len(geo_metrics),
            "marketMetrics": len(market_metrics),
            "brandMarketMetrics": len(brand_market_metrics),
            "competitorProducts": len(COMPETITOR_PRODUCTS),
            "supplyChain": len(supply_chain),
            "consumerInsights": len(consumer_insights),
        },
        "source": source_meta,
        "updatePattern": "Static JSON generated by Python; GitHub Pages serves HTML/CSS/JS only.",
    }

    write_json(output_dir, "catalog.json", catalog)
    write_json(output_dir, "product_metrics.json", product_metrics)
    write_json(output_dir, "geo_metrics.json", geo_metrics)
    write_json(output_dir, "market_metrics.json", market_metrics)
    write_json(output_dir, "brand_market_metrics.json", brand_market_metrics)
    write_json(output_dir, "competitor_products.json", COMPETITOR_PRODUCTS)
    write_json(output_dir, "supply_chain.json", supply_chain)
    write_json(output_dir, "consumer_insights.json", consumer_insights)
    write_json(output_dir, "metadata.json", metadata)
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
