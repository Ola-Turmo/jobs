from __future__ import annotations

from ssb_common import RAW_SSB_DIR, get_json, px_query, post_json, utc_now_iso, write_json


LANGUAGE = "no"
BASE_URL = f"https://data.ssb.no/api/v0/{LANGUAGE}/table"


def occupation_values(metadata: dict, *, include_two_digit: bool = False) -> list[str]:
    values = next(variable["values"] for variable in metadata["variables"] if variable["code"] == "Yrke")
    allowed_lengths = {1, 7}
    if include_two_digit:
        allowed_lengths.add(2)

    selected = []
    for value in values:
        if value in {"0-9", "0b", "00"}:
            continue
        if len(value) in allowed_lengths:
            selected.append(value)
    return selected


def detailed_occupation_values(metadata: dict) -> list[str]:
    values = next(variable["values"] for variable in metadata["variables"] if variable["code"] == "Yrke")
    return [
        value
        for value in values
        if len(value) == 4 and value not in {"0000"}
    ]


def fetch_table(table_id: str, query: list[dict]) -> None:
    metadata = get_json(f"{BASE_URL}/{table_id}")
    dataset = post_json(
        f"{BASE_URL}/{table_id}/",
        {"query": query, "response": {"format": "json-stat2"}},
    )
    payload = {
        "fetched_at": utc_now_iso(),
        "language": LANGUAGE,
        "table_id": table_id,
        "metadata": metadata,
        "dataset": dataset,
    }
    write_json(RAW_SSB_DIR / f"{table_id}.json", payload)
    print(f"Fetched SSB table {table_id}")


def main() -> None:
    employment_meta = get_json(f"{BASE_URL}/11619")
    earnings_meta = get_json(f"{BASE_URL}/11418")
    education_meta = get_json(f"{BASE_URL}/12849")
    vacancy_meta = get_json(f"{BASE_URL}/14306")
    industry_mix_meta = get_json(f"{BASE_URL}/09789")
    detailed_meta = get_json(f"{BASE_URL}/11658")

    fetch_table(
        "11619",
        [
            {"code": "Region", "selection": px_query(values=["*"], filter_name="all")},
            {"code": "Kjonn", "selection": px_query(values=["0"])},
            {"code": "Alder", "selection": px_query(values=["15-74"])},
            {
                "code": "Yrke",
                "selection": px_query(values=occupation_values(employment_meta)),
            },
            {"code": "ContentsCode", "selection": px_query(values=["Lonnstakere"])},
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )

    fetch_table(
        "11418",
        [
            {"code": "MaaleMetode", "selection": px_query(values=["01"])},
            {
                "code": "Yrke",
                "selection": px_query(values=occupation_values(earnings_meta, include_two_digit=True)),
            },
            {"code": "Sektor", "selection": px_query(values=["ALLE"])},
            {"code": "Kjonn", "selection": px_query(values=["0"])},
            {"code": "AvtaltVanlig", "selection": px_query(values=["0"])},
            {"code": "ContentsCode", "selection": px_query(values=["Manedslonn"])},
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )

    fetch_table(
        "12849",
        [
            {"code": "UtdNivaa", "selection": px_query(values=["*"], filter_name="all")},
            {"code": "Fagfelt", "selection": px_query(values=["*"], filter_name="all")},
            {
                "code": "Yrke",
                "selection": px_query(values=occupation_values(education_meta, include_two_digit=True)),
            },
            {"code": "Alder", "selection": px_query(values=["15-74"])},
            {"code": "ContentsCode", "selection": px_query(values=["Lonnstakere"])},
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )

    fetch_table(
        "14306",
        [
            {"code": "Region", "selection": px_query(values=["*"], filter_name="all")},
            {"code": "NACE2007", "selection": px_query(values=["*"], filter_name="all")},
            {
                "code": "ContentsCode",
                "selection": px_query(values=["LedigeStillinger", "LedigeStillingerPros"]),
            },
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )

    fetch_table(
        "09789",
        [
            {"code": "NACE2007", "selection": px_query(values=["*"], filter_name="all")},
            {"code": "Yrke", "selection": px_query(values=occupation_values(industry_mix_meta))},
            {"code": "ContentsCode", "selection": px_query(values=["Sysselsatte"])},
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )

    fetch_table(
        "11658",
        [
            {"code": "Kjonn", "selection": px_query(values=["0"])},
            {"code": "Alder", "selection": px_query(values=["999D"])},
            {"code": "Yrke", "selection": px_query(values=detailed_occupation_values(detailed_meta))},
            {
                "code": "ContentsCode",
                "selection": px_query(values=["AntArbForhold", "MedianMndLonn"]),
            },
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )

    fetch_table(
        "13265",
        [
            {"code": "SyssGrpIKT", "selection": px_query(values=["00"])},
            {"code": "NACE2007", "selection": px_query(values=["*"], filter_name="all")},
            {
                "code": "ContentsCode",
                "selection": px_query(
                    values=[
                        "BrukarKunstigIntelli",
                        "GenSkriftTale",
                        "TekstAnalyse",
                        "AutoArbFlyt",
                    ]
                ),
            },
            {"code": "Tid", "selection": px_query(values=["*"], filter_name="all")},
        ],
    )


if __name__ == "__main__":
    main()
