# Norway Job Market Visualizer

This repository is being rebuilt as a Norwegian labour-market explorer powered primarily by official data from [Statistics Norway (SSB)](https://www.ssb.no/en) and the [SSB Klass API](https://data.ssb.no/api/klass/v1/). The goal is a lightweight, mostly static site for exploring occupations, geography, wages, education, and vacancy pressure in Norway.

The project is based on the original [`karpathy/jobs`](https://github.com/karpathy/jobs) repository. The original repo visualized US Bureau of Labor Statistics data; this fork keeps the same spirit and lightweight architecture, but replaces the US/BLS pipeline with a Norway-first, API-driven build based on SSB.

## Scope

V1 is an SSB-first labour-market explorer, not a live job board. The product is intended for research, exploration, journalism, and career discovery.

Core goals:

- use SSB as the primary source of labour-market truth
- preserve the repo's lightweight Python build pipeline
- ship a static frontend with compact generated JSON payloads
- support occupation exploration, county comparisons, wages, employment, education, and vacancy context
- keep optional LLM-derived overlays secondary to official data

## Data model

The practical V1 implementation uses major STYRK occupation groups as the main visual unit because that is the cleanest level where official SSB tables line up across multiple metrics.

Primary dimensions:

- occupation group (major STYRK groups)
- geography (Norway, counties, with room for municipalities later)
- time period

Primary metrics:

- employment
- monthly earnings
- education profile
- employment change over time
- vacancy context derived from SSB vacancy-by-industry tables combined with official occupation-by-industry employment mix

## Source tables

The current implementation is built around a small set of SSB tables and classifications:

- `11619`: employed persons by region and occupation
- `11418`: monthly earnings by occupation
- `12849`: employed persons by education level and occupation
- `09789`: employed persons by industry and occupation
- `14306`: job vacancies by county and industry
- Klass `7`: STYRK occupation classification
- Klass `104`: county classification
- Klass `131`: municipality classification

## Repository shape

The old BLS files are still present as reference material while the migration is underway, but the intended Norway-first structure is:

```text
jobs/
  data/
    raw/
      ssb/
      klass/
    normalized/
  site/
    index.html
    data.json
    metadata.json
  fetch_ssb_statbank.py
  fetch_ssb_klass.py
  build_dimensions.py
  build_metrics.py
  build_site_data_no.py
```

## Build flow

```bash
uv sync

# Fetch official source data and classifications
uv run python fetch_ssb_statbank.py
uv run python fetch_ssb_klass.py

# Build normalized dimensions and metrics
uv run python build_dimensions.py
uv run python build_metrics.py

# Build compact frontend payloads
uv run python build_site_data_no.py

# Serve the static site locally
cd site
python -m http.server 8000
```

## Notes on vacancy data

SSB publishes vacancy data cleanly by industry and county. For V1, vacancy information is presented as an occupation group's vacancy context, derived from official occupation-by-industry employment mix and official vacancy-by-industry statistics. This keeps the build grounded in official data while being transparent that the vacancy layer is a derived indicator rather than a direct occupation-specific SSB table.

## Status

This repository is in active migration from the original US/BLS implementation to the Norwegian SSB-first product described above. Expect some old files to remain temporarily while the new pipeline and frontend replace them.
