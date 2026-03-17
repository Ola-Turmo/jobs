from __future__ import annotations

from collections import defaultdict
from math import isfinite

from ssb_common import NORMALIZED_DIR, RAW_SSB_DIR, jsonstat_rows, read_json, utc_now_iso, write_json


BASELINE_YEAR = 2019
BASELINE_PERIOD = "2019K4"
MAJOR_OCCUPATIONS = ["1", "2", "3_01-03", "4", "5", "6", "7", "8", "9"]
VACANCY_GROUP_MAP = {
    "01-03": ["01-02", "03"],
    "05-09": ["05-09"],
    "10-33": ["10-33"],
    "35-39": ["35-39"],
    "41-43": ["41-43"],
    "45-47": ["45-47"],
    "49-53": ["49-53"],
    "55-56": ["55-56"],
    "58-63": ["58-63"],
    "64-66": ["64-66"],
    "68": ["68-82"],
    "69-75": ["68-82"],
    "77-82": ["68-82"],
    "84": ["84"],
    "85": ["85"],
    "86": ["86-88"],
    "87": ["86-88"],
    "88": ["86-88"],
    "90-93": ["90-99"],
    "94-96": ["90-99"],
}
AI_ADOPTION_GROUP_MAP = {
    "01-02": ["Total-K"],
    "03": ["Total-K"],
    "05-09": ["Total-K"],
    "10-33": ["10-39"],
    "35-39": ["10-39"],
    "41-43": ["41-43"],
    "45-47": ["45", "46", "47"],
    "49-53": ["49-53"],
    "55-56": ["55-56"],
    "58-63": ["58-63"],
    "64-66": ["64-66", "Total-K"],
    "68-82": ["68-75+77-82+95.1", "68-74+77-82+95.1", "Total-K"],
    "84": ["Total-K"],
    "85": ["Total-K"],
    "86-88": ["Total-K"],
    "90-99": ["68-75+77-82+95.1", "68-74+77-82+95.1", "Total-K"],
}
MAJOR_EXPOSURE_BASE = {
    "1": 74.0,
    "2": 72.0,
    "3_01-03": 63.0,
    "4": 78.0,
    "5": 43.0,
    "6": 18.0,
    "7": 24.0,
    "8": 27.0,
    "9": 14.0,
}
DIGITAL_HINTS = (
    "ikt",
    "data",
    "program",
    "utvik",
    "nettverk",
    "system",
    "regnskap",
    "kontor",
    "saksbehand",
    "rådgiv",
    "analyt",
    "økonomi",
    "administr",
    "markeds",
    "rekrutt",
    "kundeservice",
    "jur",
    "journal",
    "lærer",
    "undervis",
    "designer",
)
PHYSICAL_HINTS = (
    "renhold",
    "rengjør",
    "tømr",
    "snekk",
    "elektrik",
    "rørlegg",
    "sjåfør",
    "fører",
    "maskin",
    "mekanik",
    "anlegg",
    "bygge",
    "jordbruk",
    "bonde",
    "skog",
    "fisk",
    "pleie",
    "omsorg",
    "helsefag",
    "sykeple",
    "barnehage",
    "kokk",
    "servit",
    "operatør",
    "renholder",
    "hjelpearbeid",
)
INTERPERSONAL_HINTS = (
    "kunde",
    "salg",
    "butikk",
    "omsorg",
    "pleie",
    "undervis",
    "leder",
)


def as_year(value: str) -> int:
    return int(value[:4])


def as_period_sort_key(value: str) -> tuple[int, int]:
    if "K" in value:
        year, quarter = value.split("K", 1)
        return int(year), int(quarter)
    return int(value), 0


def safe_pct_change(current: float | None, baseline: float | None) -> float | None:
    if current is None or baseline in (None, 0):
        return None
    return round(((current - baseline) / baseline) * 100, 1)


def clean_number(value: float | int | None) -> float | None:
    if value is None:
        return None
    if not isfinite(value):
        return None
    return float(value)


def average_or_none(values: list[float | None]) -> float | None:
    present = [value for value in values if value is not None]
    if not present:
        return None
    return round(sum(present) / len(present), 1)


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def llm_use_proxy(industry_metrics: dict[str, float | None]) -> float | None:
    components = [
        (industry_metrics.get("generative_text_pct"), 0.55),
        (industry_metrics.get("text_analysis_pct"), 0.30),
        (industry_metrics.get("automation_workflow_pct"), 0.15),
    ]
    weighted_sum = 0.0
    weight_sum = 0.0
    for value, weight in components:
        if value is None:
            continue
        weighted_sum += value * weight
        weight_sum += weight
    if not weight_sum:
        return industry_metrics.get("business_ai_use_pct")
    return round(weighted_sum / weight_sum, 1)


def geo_id_from_region(code: str) -> str | None:
    if code in {"0", "0N"}:
        return "NO"
    if len(code) == 2 and code != "99b":
        return code
    return None


def occupation_parent(code: str) -> str | None:
    if code in MAJOR_OCCUPATIONS:
        return None
    if code in {"01", "02", "03"} or code.startswith("3"):
        return "3_01-03"
    if code and code[0] in "12456789":
        return code[0]
    return None


def build_earnings_metrics() -> tuple[dict[str, float], int]:
    raw = read_json(RAW_SSB_DIR / "11418.json")
    rows = jsonstat_rows(raw["dataset"])
    latest_year = max(as_year(row["Tid"]) for row in rows)
    metrics = {}
    for row in rows:
        if as_year(row["Tid"]) != latest_year or row["value"] is None:
            continue
        metrics[row["Yrke"]] = float(row["value"])
    return metrics, latest_year


def build_education_metrics() -> tuple[dict[str, dict], int]:
    raw = read_json(RAW_SSB_DIR / "12849.json")
    rows = jsonstat_rows(raw["dataset"])
    latest_year = max(as_year(row["Tid"]) for row in rows)

    totals: dict[tuple[str, int, str], float] = defaultdict(float)
    for row in rows:
        if len(row["Fagfelt"]) != 1 or row["value"] is None:
            continue
        occupation_id = row["Yrke"]
        year = as_year(row["Tid"])
        totals[(occupation_id, year, row["UtdNivaa"])] += float(row["value"])

    metrics = {}
    all_occupations = {occupation_id for occupation_id, _, _ in totals}
    for occupation_id in all_occupations:
        low = totals.get((occupation_id, latest_year, "1"), 0.0)
        mid = totals.get((occupation_id, latest_year, "2"), 0.0)
        short_higher = totals.get((occupation_id, latest_year, "3"), 0.0)
        long_higher = totals.get((occupation_id, latest_year, "4"), 0.0)
        unknown = totals.get((occupation_id, latest_year, "0+9"), 0.0)
        total = low + mid + short_higher + long_higher + unknown
        if not total:
            continue
        metrics[occupation_id] = {
            "education_share_low": round(low / total, 4),
            "education_share_mid": round(mid / total, 4),
            "education_share_short_higher": round(short_higher / total, 4),
            "education_share_long_higher": round(long_higher / total, 4),
            "education_share_unknown": round(unknown / total, 4),
            "employment_total": total,
        }

    return metrics, latest_year


def build_industry_mix() -> tuple[dict[str, list[dict]], int]:
    raw = read_json(RAW_SSB_DIR / "09789.json")
    rows = jsonstat_rows(raw["dataset"])
    latest_year = max(as_year(row["Tid"]) for row in rows)

    totals: dict[str, float] = defaultdict(float)
    industry_values: dict[tuple[str, str], float] = {}
    industry_labels: dict[str, str] = {}

    for row in rows:
        if as_year(row["Tid"]) != latest_year or row["value"] is None:
            continue
        occupation_id = "3_01-03" if row["Yrke"] == "3" else row["Yrke"]
        if occupation_id not in MAJOR_OCCUPATIONS:
            continue
        industry_id = row["NACE2007"]
        if industry_id == "00-99":
            continue
        value = float(row["value"])
        totals[occupation_id] += value
        industry_values[(occupation_id, industry_id)] = value
        industry_labels[industry_id] = row["NACE2007_label"]

    mix = {}
    for occupation_id in MAJOR_OCCUPATIONS:
        total = totals.get(occupation_id, 0.0)
        if not total:
            mix[occupation_id] = []
            continue
        items = []
        for (occ_id, industry_id), value in industry_values.items():
            if occ_id != occupation_id:
                continue
            items.append(
                {
                    "industry_code": industry_id,
                    "industry_name_nb": industry_labels[industry_id],
                    "employment_share": round(value / total, 4),
                }
            )
        items.sort(key=lambda item: item["employment_share"], reverse=True)
        mix[occupation_id] = items

    return mix, latest_year


def build_vacancy_metrics() -> tuple[dict[tuple[str, str], dict], str]:
    raw = read_json(RAW_SSB_DIR / "14306.json")
    rows = jsonstat_rows(raw["dataset"])
    latest_quarter = max((row["Tid"] for row in rows), key=as_period_sort_key)

    buckets: dict[tuple[str, str], dict] = defaultdict(
        lambda: {"vacancies": 0.0, "weighted_share_sum": 0.0, "share_weight": 0.0, "industry_name_nb": None}
    )

    for row in rows:
        if row["Tid"] != latest_quarter:
            continue
        geo_id = geo_id_from_region(row["Region"])
        if geo_id is None:
            continue
        detailed_code = row["NACE2007"]
        if detailed_code in {"01-96"} or detailed_code not in VACANCY_GROUP_MAP:
            continue
        for mapped_code in VACANCY_GROUP_MAP[detailed_code]:
            bucket = buckets[(geo_id, mapped_code)]
            bucket["industry_name_nb"] = bucket["industry_name_nb"] or row["NACE2007_label"]
            if row["ContentsCode"] == "LedigeStillinger" and row["value"] is not None:
                bucket["vacancies"] += float(row["value"])
            elif row["ContentsCode"] == "LedigeStillingerPros":
                count = next(
                    (
                        float(candidate["value"])
                        for candidate in rows
                        if candidate["Tid"] == latest_quarter
                        and candidate["Region"] == row["Region"]
                        and candidate["NACE2007"] == detailed_code
                        and candidate["ContentsCode"] == "LedigeStillinger"
                        and candidate["value"] is not None
                    ),
                    0.0,
                )
                if row["value"] is not None and count:
                    bucket["weighted_share_sum"] += float(row["value"]) * count
                    bucket["share_weight"] += count

    metrics = {}
    for key, bucket in buckets.items():
        share = None
        if bucket["share_weight"] > 0:
            share = round(bucket["weighted_share_sum"] / bucket["share_weight"], 2)
        metrics[key] = {
            "vacancies": round(bucket["vacancies"], 1),
            "vacancy_share_pct": share,
            "industry_name_nb": bucket["industry_name_nb"],
        }

    return metrics, latest_quarter


def build_ai_adoption_metrics() -> tuple[dict[str, dict[str, float | None]], int]:
    raw = read_json(RAW_SSB_DIR / "13265.json")
    rows = jsonstat_rows(raw["dataset"])
    latest_year = max(as_year(row["Tid"]) for row in rows)

    raw_metrics: dict[str, dict[str, float | None]] = defaultdict(dict)
    for row in rows:
        if as_year(row["Tid"]) != latest_year or row["SyssGrpIKT"] != "00":
            continue
        raw_metrics[row["NACE2007"]][row["ContentsCode"]] = clean_number(row["value"])

    grouped_metrics: dict[str, dict[str, float | None]] = {}
    for industry_group, source_codes in AI_ADOPTION_GROUP_MAP.items():
        metrics = {
            "business_ai_use_pct": average_or_none(
                [raw_metrics.get(code, {}).get("BrukarKunstigIntelli") for code in source_codes]
            ),
            "generative_text_pct": average_or_none(
                [raw_metrics.get(code, {}).get("GenSkriftTale") for code in source_codes]
            ),
            "text_analysis_pct": average_or_none(
                [raw_metrics.get(code, {}).get("TekstAnalyse") for code in source_codes]
            ),
            "automation_workflow_pct": average_or_none(
                [raw_metrics.get(code, {}).get("AutoArbFlyt") for code in source_codes]
            ),
        }
        metrics["llm_use_proxy_pct"] = llm_use_proxy(metrics)
        grouped_metrics[industry_group] = metrics

    grouped_metrics["fallback"] = {
        "business_ai_use_pct": raw_metrics.get("Total-K", {}).get("BrukarKunstigIntelli"),
        "generative_text_pct": raw_metrics.get("Total-K", {}).get("GenSkriftTale"),
        "text_analysis_pct": raw_metrics.get("Total-K", {}).get("TekstAnalyse"),
        "automation_workflow_pct": raw_metrics.get("Total-K", {}).get("AutoArbFlyt"),
        "llm_use_proxy_pct": llm_use_proxy(raw_metrics.get("Total-K", {})),
    }
    return grouped_metrics, latest_year


def theoretical_ai_exposure_pct(
    *,
    occupation_name_nb: str,
    subgroup_name_nb: str | None,
    major_group_id: str,
    monthly_earnings: float | None,
    education_share_short_higher: float | None,
    education_share_long_higher: float | None,
) -> float:
    text = " ".join(filter(None, [occupation_name_nb, subgroup_name_nb])).lower()
    score = MAJOR_EXPOSURE_BASE.get(major_group_id, 40.0)
    score += 18 * ((education_share_short_higher or 0.0) - 0.18)
    score += 26 * ((education_share_long_higher or 0.0) - 0.12)

    if monthly_earnings is not None:
        score += clamp((monthly_earnings - 52000) / 4000, -4.0, 6.0)

    if any(hint in text for hint in DIGITAL_HINTS):
        score += 7.0
    if any(hint in text for hint in PHYSICAL_HINTS):
        score -= 11.0
    elif any(hint in text for hint in INTERPERSONAL_HINTS):
        score -= 3.5

    if "leder" in text or "direktør" in text:
        score += 3.0
    if "butikk" in text or "servit" in text:
        score -= 4.0

    return round(clamp(score, 8.0, 92.0), 1)


def build_detailed_occupation_metrics() -> tuple[dict[str, dict], str]:
    raw = read_json(RAW_SSB_DIR / "11658.json")
    rows = jsonstat_rows(raw["dataset"])
    latest_period = max((row["Tid"] for row in rows), key=as_period_sort_key)

    metrics_by_occ_period: dict[tuple[str, str], dict[str, float]] = defaultdict(dict)
    for row in rows:
        if row["value"] is None:
            continue
        occupation_id = row["Yrke"]
        if len(occupation_id) != 4 or occupation_id == "0000":
            continue
        period = row["Tid"]
        if row["ContentsCode"] == "AntArbForhold":
            metrics_by_occ_period[(occupation_id, period)]["employment"] = float(row["value"])
        elif row["ContentsCode"] == "MedianMndLonn":
            metrics_by_occ_period[(occupation_id, period)]["monthly_earnings"] = float(row["value"])

    results = {}
    for occupation_id in {key[0] for key in metrics_by_occ_period.keys()}:
        current = metrics_by_occ_period.get((occupation_id, latest_period), {})
        baseline = metrics_by_occ_period.get((occupation_id, BASELINE_PERIOD), {})
        results[occupation_id] = {
            "employment": current.get("employment"),
            "monthly_earnings": current.get("monthly_earnings"),
            "employment_change_pct": safe_pct_change(current.get("employment"), baseline.get("employment")),
        }
    return results, latest_period


def build_subgroup_metrics(earnings: dict[str, float], education: dict[str, dict]) -> dict[str, list[dict]]:
    subgroups = read_json(NORMALIZED_DIR / "occupations.json")["subgroups"]
    grouped: dict[str, list[dict]] = defaultdict(list)
    for subgroup in subgroups:
        occupation_id = subgroup["id"]
        parent_code = subgroup["parent_code"]
        education_metrics = education.get(occupation_id, {})
        grouped[parent_code].append(
            {
                "id": occupation_id,
                "name_nb": subgroup["name_nb"],
                "employment": education_metrics.get("employment_total"),
                "monthly_earnings": earnings.get(occupation_id),
                "education_share_short_higher": education_metrics.get("education_share_short_higher"),
                "education_share_long_higher": education_metrics.get("education_share_long_higher"),
            }
        )

    for items in grouped.values():
        items.sort(key=lambda item: item["employment"] or 0, reverse=True)
    return grouped


def main() -> None:
    occupations_dimension = read_json(NORMALIZED_DIR / "occupations.json")
    detailed_lookup = {item["id"]: item for item in occupations_dimension["detailed_occupations"]}
    subgroup_lookup = {item["id"]: item for item in occupations_dimension["subgroups"]}
    major_lookup = {item["id"]: item for item in occupations_dimension["major_groups"]}

    detailed_metrics, detailed_period = build_detailed_occupation_metrics()
    earnings, _ = build_earnings_metrics()
    education, education_year = build_education_metrics()
    industry_mix, industry_year = build_industry_mix()
    vacancy_by_geo_industry, vacancy_period = build_vacancy_metrics()
    ai_adoption_by_industry, ai_adoption_year = build_ai_adoption_metrics()
    subgroup_metrics = build_subgroup_metrics(earnings, education)

    records = []
    category_rollups: dict[str, dict] = defaultdict(
        lambda: {
            "employment": 0.0,
            "theoretical_sum": 0.0,
            "observed_sum": 0.0,
            "industry_sum": 0.0,
            "items": [],
        }
    )
    for occupation_id, occupation_metrics in detailed_metrics.items():
        occ = detailed_lookup.get(occupation_id)
        if not occ:
            continue

        subgroup_code = occ["parent_code"]
        major_code = occ["major_code"]
        subgroup = subgroup_lookup.get(subgroup_code)
        major = major_lookup.get(major_code)
        mix = industry_mix.get(major_code, [])

        vacancy_context_share = 0.0
        vacancy_context_volume = 0.0
        known_share = 0.0
        ai_known_share = 0.0
        ai_use_proxy_weighted = 0.0
        dominant_industries = []
        for item in mix:
            vacancy = vacancy_by_geo_industry.get(("NO", item["industry_code"]))
            ai_metrics = ai_adoption_by_industry.get(item["industry_code"], ai_adoption_by_industry["fallback"])
            if not vacancy:
                vacancy = {"vacancy_share_pct": None, "vacancies": 0.0}
            share = item["employment_share"]
            if vacancy["vacancy_share_pct"] is not None:
                vacancy_context_share += share * vacancy["vacancy_share_pct"]
                known_share += share
            vacancy_context_volume += share * vacancy["vacancies"]
            if ai_metrics["llm_use_proxy_pct"] is not None:
                ai_use_proxy_weighted += share * ai_metrics["llm_use_proxy_pct"]
                ai_known_share += share
            dominant_industries.append(
                {
                    "industry_code": item["industry_code"],
                    "industry_name_nb": item["industry_name_nb"],
                    "employment_share": item["employment_share"],
                    "vacancy_share_pct": vacancy["vacancy_share_pct"],
                    "ai_use_proxy_pct": ai_metrics["llm_use_proxy_pct"],
                }
            )

        education_metrics = education.get(subgroup_code, {})
        theoretical_exposure = theoretical_ai_exposure_pct(
            occupation_name_nb=occ["name_nb"],
            subgroup_name_nb=subgroup["name_nb"] if subgroup else None,
            major_group_id=major_code,
            monthly_earnings=clean_number(occupation_metrics["monthly_earnings"]),
            education_share_short_higher=education_metrics.get("education_share_short_higher"),
            education_share_long_higher=education_metrics.get("education_share_long_higher"),
        )
        industry_ai_proxy = round(ai_use_proxy_weighted / ai_known_share, 1) if ai_known_share else None
        observed_use_proxy = None
        if industry_ai_proxy is not None:
            observed_use_proxy = round(
                min(
                    theoretical_exposure - 1.0,
                    theoretical_exposure * (0.12 + 0.88 * (industry_ai_proxy / 100.0)),
                ),
                1,
            )
        record = {
            "geo_id": "NO",
            "occupation_id": occupation_id,
            "occupation_name_nb": occ["name_nb"],
            "occupation_group_id": subgroup_code,
            "occupation_group_name_nb": subgroup["name_nb"] if subgroup else None,
            "major_group_id": major_code,
            "major_group_name_nb": major["name_nb"] if major else None,
            "employment": clean_number(occupation_metrics["employment"]),
            "employment_change_pct": occupation_metrics["employment_change_pct"],
            "monthly_earnings": clean_number(occupation_metrics["monthly_earnings"]),
            "education_share_low": education_metrics.get("education_share_low"),
            "education_share_mid": education_metrics.get("education_share_mid"),
            "education_share_short_higher": education_metrics.get("education_share_short_higher"),
            "education_share_long_higher": education_metrics.get("education_share_long_higher"),
            "education_share_unknown": education_metrics.get("education_share_unknown"),
            "vacancy_context_share_pct": round(vacancy_context_share / known_share, 2) if known_share else None,
            "vacancy_context_volume": round(vacancy_context_volume, 1) if vacancy_context_volume else None,
            "theoretical_ai_exposure_pct": theoretical_exposure,
            "observed_ai_use_proxy_pct": observed_use_proxy,
            "industry_ai_use_proxy_pct": industry_ai_proxy,
            "dominant_industries": dominant_industries[:4],
        }
        if record["employment"]:
            records.append(record)
            rollup = category_rollups[major_code]
            rollup["employment"] += record["employment"]
            rollup["theoretical_sum"] += record["employment"] * record["theoretical_ai_exposure_pct"]
            rollup["observed_sum"] += record["employment"] * (record["observed_ai_use_proxy_pct"] or 0.0)
            rollup["industry_sum"] += record["employment"] * (record["industry_ai_use_proxy_pct"] or 0.0)
            rollup["items"].append(
                {
                    "occupation_id": occupation_id,
                    "name_nb": occ["name_nb"],
                    "employment": record["employment"],
                    "theoretical_ai_exposure_pct": record["theoretical_ai_exposure_pct"],
                    "observed_ai_use_proxy_pct": record["observed_ai_use_proxy_pct"],
                }
            )

    total_employment = sum(record["employment"] or 0.0 for record in records)
    ai_impact_categories = []
    for major_code, rollup in category_rollups.items():
        major = major_lookup.get(major_code)
        employment = rollup["employment"]
        if not employment:
            continue
        top_items = sorted(rollup["items"], key=lambda item: item["employment"], reverse=True)[:3]
        theoretical_value = round(rollup["theoretical_sum"] / employment, 1)
        observed_value = round(rollup["observed_sum"] / employment, 1)
        industry_value = round(rollup["industry_sum"] / employment, 1)
        ai_impact_categories.append(
            {
                "id": major_code,
                "label_nb": major["name_nb"] if major else major_code,
                "employment": round(employment),
                "employment_share": round(employment / total_employment, 4) if total_employment else None,
                "theoretical_ai_exposure_pct": theoretical_value,
                "observed_ai_use_proxy_pct": observed_value,
                "industry_ai_use_proxy_pct": industry_value,
                "gap_pct_points": round(theoretical_value - observed_value, 1),
                "top_occupations_nb": top_items,
            }
        )

    ai_impact_categories.sort(key=lambda item: item["theoretical_ai_exposure_pct"], reverse=True)

    payload = {
        "generated_at": utc_now_iso(),
        "source_periods": {
            "employment_period": detailed_period,
            "employment_year": as_year(detailed_period),
            "earnings_year": as_year(detailed_period),
            "education_year": education_year,
            "industry_mix_year": industry_year,
            "vacancy_period": vacancy_period,
            "ai_adoption_year": ai_adoption_year,
            "employment_change_baseline_year": BASELINE_YEAR,
        },
        "notes": [
            "Vacancy context is a derived indicator built from official SSB vacancy-by-industry data and official occupation-by-industry employment mix.",
            "This build uses detailed 4-digit occupations nationally so the treemap behaves more like the original jobs visualizer.",
            "Education profile is inherited from the nearest SSB occupation-parent level with official education data.",
            "The AI impact section is a Norwegian proxy inspired by Anthropic's labor market impacts work: theoretical exposure is heuristic at occupation level, while observed use is proxied from SSB's enterprise AI-by-industry survey.",
        ],
        "sources": [
            {"table_id": "11658", "label": "Antall jobber og median månedslønn etter yrke"},
            {"table_id": "12849", "label": "Sysselsatte etter utdanningsnivå og yrke"},
            {"table_id": "09789", "label": "Sysselsatte etter næring og yrke"},
            {"table_id": "14306", "label": "Ledige stillinger etter fylke og næring"},
            {"table_id": "13265", "label": "Bruk av kunstig intelligens-teknologi etter næring"},
        ],
        "occupation_metrics": records,
        "subgroup_metrics": subgroup_metrics,
        "ai_impact_proxy": {
            "categories": ai_impact_categories,
            "method_note_nb": "Teoretisk eksponering er en yrkesbasert LLM-proxy. Observerbar bruk er en SSB-proxy basert på næringsmiks og andelen virksomheter som bruker generativ språk-AI, tekstanalyse og AI-basert arbeidsflyt.",
            "source_table_id": "13265",
            "source_year": ai_adoption_year,
        },
    }

    write_json(NORMALIZED_DIR / "metrics.json", payload)
    print("Wrote normalized metrics")


if __name__ == "__main__":
    main()
