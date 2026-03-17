from __future__ import annotations

from pathlib import Path
import json

from ssb_common import NORMALIZED_DIR, read_json, write_json


SITE_DIR = Path(__file__).resolve().parent / "site"


def main() -> None:
    occupations_dim = read_json(NORMALIZED_DIR / "occupations.json")
    metrics = read_json(NORMALIZED_DIR / "metrics.json")

    subgroups = metrics["subgroup_metrics"]
    subgroup_lookup = {item["id"]: item for item in occupations_dim["subgroups"]}
    major_lookup = {item["id"]: item for item in occupations_dim["major_groups"]}

    occupations = []
    for occupation in occupations_dim["detailed_occupations"]:
        occupation_id = occupation["id"]
        national_record = next(
            (record for record in metrics["occupation_metrics"] if record["occupation_id"] == occupation_id),
            None,
        )
        if not national_record:
            continue
        subgroup = subgroup_lookup.get(occupation["parent_code"])
        major = major_lookup.get(occupation["major_code"])
        occupations.append(
            {
                **occupation,
                "category": subgroup["name_nb"] if subgroup else occupation["parent_code"],
                "major_category": major["name_nb"] if major else occupation["major_code"],
                "national": national_record,
                "subgroup_summary": subgroups.get(occupation["parent_code"], [])[:8],
            }
        )

    occupations.sort(key=lambda item: item["national"]["employment"] or 0, reverse=True)

    site_payload = {
        "metadata": {
            "generated_at": metrics["generated_at"],
            "source_periods": metrics["source_periods"],
            "notes": metrics["notes"],
            "sources": metrics["sources"],
            "defaults": {
                "area_metric": "employment",
                "color_metric": "monthly_earnings",
            },
        },
        "occupations": occupations,
        "ai_impact_proxy": metrics.get("ai_impact_proxy"),
    }

    write_json(SITE_DIR / "data.json", site_payload)
    write_json(SITE_DIR / "metadata.json", site_payload["metadata"])
    (SITE_DIR / "data.js").write_text(
        "window.__JOB_SITE_DATA__ = " + json.dumps(site_payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print("Wrote site/data.json, site/data.js, and site/metadata.json")


if __name__ == "__main__":
    main()
