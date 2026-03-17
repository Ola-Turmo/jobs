from __future__ import annotations

from ssb_common import NORMALIZED_DIR, RAW_KLASS_DIR, RAW_SSB_DIR, read_json, write_json


def clean_region_name(name: str) -> str:
    return name.split(" - ")[0].strip()


def occupation_parent(code: str) -> str | None:
    if code in {"1", "2", "3_01-03", "4", "5", "6", "7", "8", "9"}:
        return None
    if code in {"01", "02", "03"} or code.startswith("3"):
        return "3_01-03"
    if code and code[0] in "12456789":
        return code[0]
    return None


def build_occupations() -> dict:
    table = read_json(RAW_SSB_DIR / "12849.json")
    employment_table = read_json(RAW_SSB_DIR / "11619.json")
    detailed_table = read_json(RAW_SSB_DIR / "11658.json")

    subgroup_var = next(variable for variable in table["metadata"]["variables"] if variable["code"] == "Yrke")
    major_var = next(
        variable for variable in employment_table["metadata"]["variables"] if variable["code"] == "Yrke"
    )

    major_codes = []
    major_labels = {}
    for code, label in zip(major_var["values"], major_var["valueTexts"], strict=True):
        if code in {"0-9", "0b"}:
            continue
        major_codes.append(code)
        major_labels[code] = label

    major_groups = [
        {
            "id": code,
            "styrk_code": code,
            "name_nb": major_labels[code],
            "display_name_nb": major_labels[code],
            "level": 1,
            "parent_code": None,
            "source": "SSB table 11619",
        }
        for code in major_codes
    ]

    subgroups = []
    for code, label in zip(subgroup_var["values"], subgroup_var["valueTexts"], strict=True):
        if code in {"0-9", "0b", "00"}:
            continue
        if len(code) != 2:
            continue
        parent_code = occupation_parent(code)
        if parent_code is None:
            continue
        subgroups.append(
            {
                "id": code,
                "styrk_code": code,
                "name_nb": label,
                "display_name_nb": label,
                "level": 2,
                "parent_code": parent_code,
                "source": "SSB table 12849",
            }
        )

    detailed_var = next(variable for variable in detailed_table["metadata"]["variables"] if variable["code"] == "Yrke")
    detailed_occupations = []
    for code, label in zip(detailed_var["values"], detailed_var["valueTexts"], strict=True):
        if len(code) != 4 or code == "0000":
            continue
        parent_code = code[:2]
        detailed_occupations.append(
            {
                "id": code,
                "styrk_code": code,
                "name_nb": label,
                "display_name_nb": label,
                "level": 4,
                "parent_code": parent_code,
                "major_code": occupation_parent(parent_code),
                "source": "SSB table 11658",
            }
        )

    return {
        "major_groups": major_groups,
        "subgroups": subgroups,
        "detailed_occupations": detailed_occupations,
    }


def build_geographies() -> dict:
    counties_raw = read_json(RAW_KLASS_DIR / "counties.json")
    municipalities_raw = read_json(RAW_KLASS_DIR / "municipalities.json")

    counties = [
        {
            "geo_id": code["code"],
            "type": "county",
            "code": code["code"],
            "name_nb": code["name"],
            "display_name_nb": clean_region_name(code["name"]),
            "parent_code": "NO",
        }
        for code in counties_raw["codes"]["codes"]
        if code["code"] != "99"
    ]
    counties.sort(key=lambda item: item["code"])

    municipalities = [
        {
            "geo_id": code["code"],
            "type": "municipality",
            "code": code["code"],
            "name_nb": code["name"],
            "display_name_nb": clean_region_name(code["name"]),
            "parent_code": code["code"][:2],
        }
        for code in municipalities_raw["codes"]["codes"]
    ]
    municipalities.sort(key=lambda item: item["code"])

    return {
        "country": {
            "geo_id": "NO",
            "type": "country",
            "code": "NO",
            "name_nb": "Norge",
            "display_name_nb": "Norge",
            "parent_code": None,
        },
        "counties": counties,
        "municipalities": municipalities,
    }


def main() -> None:
    occupations = build_occupations()
    geographies = build_geographies()

    write_json(NORMALIZED_DIR / "occupations.json", occupations)
    write_json(NORMALIZED_DIR / "geographies.json", geographies)
    print("Wrote normalized occupation and geography dimensions")


if __name__ == "__main__":
    main()
