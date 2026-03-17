from __future__ import annotations

import itertools
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
RAW_SSB_DIR = DATA_DIR / "raw" / "ssb"
RAW_KLASS_DIR = DATA_DIR / "raw" / "klass"
NORMALIZED_DIR = DATA_DIR / "normalized"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def get_json(url: str, *, params: dict[str, Any] | None = None) -> Any:
    with httpx.Client(timeout=60, follow_redirects=True) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        return json.loads(response.content.decode("utf-8"))


def post_json(url: str, payload: dict[str, Any]) -> Any:
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        response = client.post(url, json=payload)
        response.raise_for_status()
        return json.loads(response.content.decode("utf-8"))


def px_query(*, values: list[str], filter_name: str = "item") -> dict[str, Any]:
    return {"filter": filter_name, "values": values}


def jsonstat_rows(dataset: dict[str, Any]) -> list[dict[str, Any]]:
    ids = dataset["id"]
    sizes = dataset["size"]
    dimensions = dataset["dimension"]
    value_list = dataset["value"]
    rows: list[dict[str, Any]] = []

    value_by_dimension: dict[str, list[str]] = {}
    label_by_dimension: dict[str, dict[str, str]] = {}

    for dim_id in ids:
        category = dimensions[dim_id]["category"]
        index = category["index"]
        ordered_codes = [code for code, _ in sorted(index.items(), key=lambda item: item[1])]
        value_by_dimension[dim_id] = ordered_codes
        label_by_dimension[dim_id] = category.get("label", {})

    for flat_index, coord in enumerate(itertools.product(*(range(size) for size in sizes))):
        row: dict[str, Any] = {"value": value_list[flat_index]}
        for dim_id, pos in zip(ids, coord, strict=True):
            code = value_by_dimension[dim_id][pos]
            row[dim_id] = code
            row[f"{dim_id}_label"] = label_by_dimension[dim_id].get(code, code)
        rows.append(row)

    return rows
