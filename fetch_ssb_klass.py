from __future__ import annotations

from datetime import date

from ssb_common import RAW_KLASS_DIR, get_json, utc_now_iso, write_json


BASE_URL = "https://data.ssb.no/api/klass/v1/classifications"
LANGUAGE = "nb"
SNAPSHOT_DATE = date.today().isoformat()

CLASSIFICATIONS = {
    "occupations": 7,
    "counties": 104,
    "municipalities": 131,
}


def fetch_classification(name: str, classification_id: int) -> None:
    metadata = get_json(f"{BASE_URL}/{classification_id}")
    codes = get_json(
        f"{BASE_URL}/{classification_id}/codesAt",
        params={"date": SNAPSHOT_DATE, "language": LANGUAGE},
    )
    payload = {
        "fetched_at": utc_now_iso(),
        "classification_id": classification_id,
        "language": LANGUAGE,
        "snapshot_date": SNAPSHOT_DATE,
        "metadata": metadata,
        "codes": codes,
    }
    write_json(RAW_KLASS_DIR / f"{name}.json", payload)
    print(f"Fetched Klass classification {classification_id} ({name})")


def main() -> None:
    for name, classification_id in CLASSIFICATIONS.items():
        fetch_classification(name, classification_id)


if __name__ == "__main__":
    main()
