# PRD: Turn `jobs` into a Norwegian labour-market site powered by SSB

## Document status
- **Owner:** Ola Turmo
- **Type:** Product Requirements Document
- **Version:** 1.0
- **Date:** 2026-03-16

---

## 1. Summary

Transform the current `jobs` repository from a **US BLS occupation visualizer** into a **Norwegian labour-market visualizer** that is primarily powered by **Statistics Norway (SSB)**.

The new product should preserve the strengths of the current repo:
- a lightweight data pipeline
- a static or mostly static front end
- a visual, explorable interface
- support for custom scoring layers

But it should replace the US-specific scraping workflow with a **Norway-first, API-driven data product** based on **SSB Statbank** and **SSB Klass**.

### Product vision
Create the best lightweight way to explore the Norwegian labour market by occupation, geography, earnings, vacancies, and education using official Norwegian statistics.

### Product name (working)
**Norway Job Market Visualizer**

### Core positioning
This is **not** a live job board in V1. It is a **research and exploration tool** for understanding the Norwegian labour market.

---

## 2. Why this exists

The current repo is tightly coupled to the US Bureau of Labor Statistics Occupational Outlook Handbook:
- data is scraped from BLS pages
- the site language and copy are US-specific
- the metrics are tailored to BLS fields like median pay, job outlook, and education
- the pipeline assumes a static occupation reference set and HTML parsing

That architecture is a good foundation, but for Norway the better approach is to use **official structured datasets** from **SSB**, not scraping.

SSB gives us a more robust and local product because it provides:
- official Norwegian labour-market data
- open APIs without registration
- standardized classifications via Klass
- regional data for counties and municipalities
- occupation, education, wage, and vacancy statistics

---

## 3. Product goals

### Primary goals
1. **Localize the repo to Norway** with Norwegian data, language, geography, and classifications.
2. **Make SSB the source of truth** for the product in V1.
3. Preserve the repo’s existing strength: **interactive occupation visualization**.
4. Ship a product that can be served as a **static or mostly static site**.
5. Remove dependence on HTML scraping for core data ingestion.

### Secondary goals
1. Support **Bokmål-first UI**, with a clean path to Nynorsk and English.
2. Add **county- and municipality-aware views**.
3. Support **custom derived layers** like “AI exposure”, but make them clearly secondary to official SSB data.
4. Make the data build reproducible and easy to rerun.

### Non-goals for V1
1. Full live job-board aggregation.
2. Real-time vacancy search across individual job ads.
3. User accounts or employer dashboards.
4. Paid subscriptions.
5. Complex backend infrastructure if static delivery is sufficient.

---

## 4. Product principles

### 4.1 SSB-first
SSB should be the primary data source for labour-market facts, metrics, and taxonomy in V1.

### 4.2 Official over scraped
Prefer structured APIs and official tables over scraped pages.

### 4.3 Visual first
The core experience should still be a visual interface that makes labour-market exploration intuitive.

### 4.4 Explainable data
Every metric shown in the UI must have a visible source and a plain-language definition.

### 4.5 Keep the repo lightweight
Do not overbuild. Preserve the repo’s simplicity where possible.

---

## 5. Target users

### Primary users
- students exploring careers in Norway
- job seekers comparing occupations and regions
- journalists and researchers
- founders, operators, and policy-adjacent users who want quick labour-market insight

### Secondary users
- teachers and career counselors
- recruiters and hiring teams
- municipalities and local development stakeholders

---

## 6. Product concept

### V1 concept
A Norwegian labour-market visualization site where each tile represents an occupation or occupation group and the user can switch the color layer and grouping.

### Core interactions
- view the labour market as a treemap
- switch grouping between occupation, industry, and geography
- switch metric between wages, employment, vacancies, education profile, and custom overlays
- click into an occupation for detail
- compare regions and occupation groups

### Key difference from the current site
The current site is built around **US occupation pages**.
The new site should be built around **Norwegian statistical indicators**.

---

## 7. Scope

## 7.1 V1 scope
Build a Norway site based mostly on SSB, with:
- occupation-based visual exploration
- county and municipality support where feasible
- SSB-backed metrics
- metadata and classifications from SSB Klass
- static build artifacts for front-end consumption

## 7.2 V1.1 scope
- stronger localization
- more derived comparisons
- trend views over time
- saved views / shareable URLs

## 7.3 V2 scope
Optional supplements outside SSB:
- NAV vacancy feed for live job ads
- richer geography and map-based drilldown
- alerting or personalized dashboards

---

## 8. Data strategy

## 8.1 Source-of-truth hierarchy

### Primary
1. **SSB Statbank** for labour-market tables
2. **SSB Klass API** for classifications and codelists

### Secondary
3. Optional derived calculations created by us from SSB data
4. Optional LLM-generated overlays such as AI exposure

### Not in scope for V1 core truth
- BLS
- scraped HTML pages
- Finn.no
- LinkedIn
- Indeed
- NAV job ads as the main product backbone

---

## 8.2 Recommended SSB datasets for V1

The site should be mostly based on a small number of reliable SSB tables that map well to the existing repo’s strengths.

### A. Job vacancies
Use SSB vacancy statistics to represent labour demand at aggregate level.

Recommended examples:
- **Table 14306**: Job vacancies by major industry division and county
- **Table 08771 / 08836**: Job vacancies by major industry division over time

Use cases:
- color by vacancy level
- compare county demand
- show vacancy pressure by sector

### B. Earnings
Use SSB wage data for compensation views.

Recommended examples:
- **Table 11418**: Monthly earnings by occupation
- **Table 11652**: Number of jobs and average monthly basic earnings by county

Use cases:
- color by monthly earnings
- show median/average wage context in occupation detail pages
- compare occupation and region

### C. Employment stock
Use SSB employment data to represent size and stability of occupations.

Recommended examples:
- **Table 12849**: Employed persons by level of education, field of study, occupation, and age
- register-based employment tables for county / municipal views

Use cases:
- tile size by employment
- filters by education level and age
- structural views of Norwegian labour demand vs current employment

### D. Classification and taxonomy
Use SSB Klass to normalize labels and hierarchy.

Recommended uses:
- STYRK occupation codes
- municipality and county codelists
- classification metadata for stable joins

---

## 8.3 V1 source model

### Primary entity in V1
**Occupation group** (STYRK-based where possible)

### Supporting dimensions
- county
- municipality
- industry (SIC/NACE-based where SSB tables provide it)
- education level
- time period

### Why this is the right V1 model
It fits the existing repo architecture better than individual job ads.
It also aligns better with SSB’s strengths, which are aggregate official statistics rather than live posting-level feeds.

---

## 9. Product requirements

## 9.1 Homepage
The homepage should explain clearly that the site is:
- a Norwegian labour-market explorer
- built primarily on SSB data
- intended for exploration, not direct job application

### Requirements
- clear hero title
- short explanation of what each tile means
- visible source attribution
- metric selector
- grouping selector
- geography selector

---

## 9.2 Treemap / main visualization
This remains the signature interaction.

### Requirements
- each rectangle represents an occupation or occupation group
- area maps to a major scale metric, defaulting to employment
- color maps to the selected metric
- hover shows summary stats
- click opens a detail panel or detail page

### Default configuration
- **Area:** employed persons
- **Color:** monthly earnings
- **Grouping:** occupation group
- **Geography:** Norway

### Supported color layers in V1
1. Monthly earnings
2. Job vacancies
3. Vacancy share / labour pressure
4. Education profile
5. Change over time
6. Optional AI exposure layer

---

## 9.3 Detail page for occupation
Each occupation page should give a compact but useful dashboard.

### Requirements
- occupation name
- STYRK code and hierarchy
- current employment
- earnings metric
- vacancy metric
- education profile
- time trend snippet
- county comparison
- methodology and source notes

### Nice-to-have
- “related occupations”
- “best counties for this occupation”
- “similar pay, lower vacancy” comparisons

---

## 9.4 Geography views
Norway-specific geography should be a first-class capability.

### Requirements
- national view
- county filter in V1
- municipality support where data coverage is strong enough

### UX behavior
- changing geography should update both treemap and detail summaries
- labels must use Norwegian county and municipality names
- codes should come from SSB Klass

---

## 9.5 Metric definitions
Every metric in the interface must be defined.

### Requirement
For each visible metric, the site must expose:
- source table
- date / period
- exact label used by the source
- simplified explanation for users

---

## 9.6 Language and localization

### V1
- Bokmål UI
- Norwegian currency formatting
- Norwegian date formatting
- Norwegian county and municipality names

### V1.1
- Nynorsk support
- English explainer mode

---

## 10. User stories

### Student
As a student, I want to compare occupations by wage, education, and demand so I can understand which paths are attractive in Norway.

### Job seeker
As a job seeker, I want to see which counties and occupations have stronger demand so I can target my search.

### Journalist
As a journalist, I want a quick visual overview of Norwegian labour-market structure so I can discover stories.

### Operator / founder
As a founder, I want to understand which occupations are large, well-paid, undersupplied, or concentrated in certain regions.

---

## 11. Functional requirements

## 11.1 Data ingestion
The system must fetch data from SSB APIs and transform it into a compact front-end dataset.

### Requirements
- no core dependence on scraping
- reproducible builds from API calls
- classification joins through Klass
- local caching of raw responses
- deterministic output files

## 11.2 Build artifacts
The system must output compact build artifacts equivalent to the current repo’s `site/data.json` flow.

### Requirements
- one or more generated JSON files under `site/`
- optional CSV snapshots for debugging
- data must be small enough for fast static delivery

## 11.3 Update cadence
### V1
- scheduled rebuild weekly or monthly depending on the source table
- manual rebuild possible locally

### Requirement
Each dataset should include `generated_at` and `source_period`.

---

## 12. Non-functional requirements

### Performance
- initial page load under 3 seconds on desktop for the default view
- site data payload should be aggressively trimmed

### Reliability
- build must fail loudly if a source table schema changes
- stale builds must be detectable in UI metadata

### Accessibility
- keyboard-navigable controls
- readable color palettes
- descriptive text alternatives for charts and visual encodings

### Compliance
- source attribution on every view
- no misleading “live jobs” framing in V1

---

## 13. Proposed information architecture

## Top-level routes
- `/` — overview / treemap
- `/occupation/:id` — occupation detail
- `/county/:id` — county overview
- `/about` — methodology and sources
- `/compare` — optional comparison view

---

## 14. Technical architecture

## 14.1 Architecture direction
Keep the project simple:
- **data build pipeline in Python**
- **static front end** consuming built JSON
- **optional scheduled rebuild** via CI

### Why this fits the repo
The current repository already uses an offline build pipeline that produces static site data. That pattern should remain.

---

## 14.2 Proposed pipeline

### Step 1: Fetch raw source datasets
New scripts should call SSB APIs instead of scraping pages.

Suggested scripts:
- `fetch_ssb_statbank.py`
- `fetch_ssb_klass.py`

### Step 2: Normalize and join
Create normalized occupation, geography, and metric tables.

Suggested scripts:
- `build_dimensions.py`
- `build_metrics.py`

### Step 3: Create front-end payloads
Build compact JSON optimized for the site.

Suggested scripts:
- `build_site_data_no.py`
- `build_site_occupations.py`
- `build_site_geography.py`

### Step 4: Optional derived overlays
Use an LLM only for optional secondary layers.

Suggested script:
- `score_ai_exposure_no.py`

---

## 14.3 Proposed output files

### Core
- `data/occupations.json`
- `data/geographies.json`
- `data/metrics.json`
- `site/data.json`

### Optional split payloads
- `site/occupations.json`
- `site/county-metrics.json`
- `site/metadata.json`

---

## 15. Mapping from the current repo to the new repo

## 15.1 Keep
### `site/index.html`
Keep the basic concept and interaction model, but localize all copy and data wiring.

### `build_site_data.py`
Keep the idea, but rewrite it around SSB-derived inputs.

### `score.py`
Keep only as an optional secondary layer for custom overlays.

---

## 15.2 Replace
### `scrape.py`
Replace with SSB API fetchers.

### `process.py` and `parse_detail.py`
These become unnecessary because V1 should not depend on raw HTML pages.

### `make_csv.py`
Replace with metrics builders driven by SSB tables.

### `occupations.json`
Replace the current BLS occupation list with an SSB/STYRK-based Norwegian occupation dimension.

---

## 15.3 New file structure (proposed)

```text
jobs/
  data/
    raw/
      ssb/
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
  score_ai_exposure_no.py
  README.md
```

---

## 16. Data model

## 16.1 Occupation dimension

Suggested fields:
- `id`
- `styrk_code`
- `name_nb`
- `name_nn` (optional later)
- `level`
- `parent_code`
- `group`
- `display_order`

## 16.2 Geography dimension

Suggested fields:
- `geo_id`
- `type` (`country`, `county`, `municipality`)
- `code`
- `name_nb`
- `parent_code`

## 16.3 Metric fact table

Suggested fields:
- `occupation_id`
- `geo_id`
- `period`
- `employment`
- `monthly_earnings`
- `vacancies`
- `vacancy_share`
- `education_share_low`
- `education_share_mid`
- `education_share_high`
- `source_table_id`
- `updated_at`

---

## 17. UX requirements in detail

## 17.1 Filters
The user should be able to filter by:
- geography
- time period
- occupation group
- industry where relevant
- education level where relevant

## 17.2 Sorting / ranking modules
Support ranked side panels such as:
- highest pay
- highest vacancies
- biggest occupations
- fastest changes over time

## 17.3 Comparison mode
Allow simple side-by-side comparisons:
- occupation vs occupation
- county vs county
- same occupation across counties

---

## 18. Design requirements

### Tone
- clean
- statistical
- not flashy
- trustworthy

### Visual style
- preserve the current research-tool feel
- improve readability for Norwegian labels and long names
- use a color system that works with accessibility constraints

### Copy rules
- no US terminology
- no references to BLS
- avoid calling vacancy aggregates “open jobs” unless the source metric is explicitly vacancies

---

## 19. SEO and discoverability

### Goals
- rank for Norwegian labour-market exploration terms
- make detail pages indexable
- allow sharable deep links for occupations and counties

### Requirements
- unique title and meta description per detail page
- structured data optional later

---

## 20. Analytics and success metrics

### Product KPIs
- visits to occupation pages
- interaction rate with metric switches
- geography filter usage
- average session depth
- percentage of sessions with at least one detail-page click

### Data quality KPIs
- successful build rate
- stale dataset rate
- schema drift incidents
- time to rebuild after source changes

---

## 21. Rollout plan

## Phase 0 — repo adaptation
Goal: make the codebase ready for Norwegian data.

Deliverables:
- remove BLS-centric copy
- add SSB source modules
- define dimensions and metrics
- update README

## Phase 1 — SSB core MVP
Goal: ship a useful Norway site powered mostly by SSB.

Deliverables:
- occupation hierarchy
- employment layer
- earnings layer
- vacancy layer
- county filter
- methodology page

## Phase 2 — better exploration
Deliverables:
- trend views
- comparison pages
- municipality support where feasible
- Nynorsk support

## Phase 3 — optional supplements
Deliverables:
- NAV-powered live vacancy module
- advanced scoring overlays
- alerting and saved views

---

## 22. Risks

### Risk 1: Source mismatch across tables
Different SSB tables may use different granularities for occupation, geography, and period.

**Mitigation:**
Design a canonical join model early and support “not available” gracefully.

### Risk 2: Over-promising on live jobs
Users may assume the site shows real-time vacancies or individual postings.

**Mitigation:**
Frame V1 as a labour-market explorer, not a live job board.

### Risk 3: Payload bloat
If too many slices are precomputed, `site/data.json` may become too large.

**Mitigation:**
Ship only the most common views in V1 and split payloads if needed.

### Risk 4: Taxonomy complexity
Norwegian classification systems may be harder to present cleanly than BLS categories.

**Mitigation:**
Use a simplified display hierarchy on top of official codes.

---

## 23. Open questions

1. Which STYRK level should be the default visual unit in V1?
2. Should the home page default to occupation grouping or industry grouping?
3. How much municipality support is feasible without hurting performance?
4. Should AI exposure be shown in V1 or saved for V1.1?
5. Do we want English as a full UI language or only a translated methodology page?

---

## 24. Recommended V1 decision

### Recommendation
Build **an SSB-first occupation explorer**, not a live Norwegian job board.

### Why
This choice:
- matches the current repo’s architecture
- avoids scraping and partner dependency
- uses official Norwegian data
- is easier to ship reliably
- creates a clear base for future NAV integration

---

## 25. Acceptance criteria for V1

The PRD is fulfilled when:

1. The site no longer depends on BLS data.
2. The site uses SSB as the primary source of labour-market truth.
3. The homepage and default view work for Norway.
4. Users can explore occupations by employment, wages, and vacancies.
5. County filtering works.
6. The build produces static JSON artifacts for the front end.
7. Every displayed metric is attributable to an SSB source.

---

## 26. Implementation checklist

### Product
- [ ] Rewrite positioning and copy for Norway
- [ ] Define V1 metric set
- [ ] Define default occupation hierarchy
- [ ] Define county UX

### Data
- [ ] Select final SSB tables for V1
- [ ] Implement Statbank fetcher
- [ ] Implement Klass fetcher
- [ ] Build normalized dimensions
- [ ] Build metric joins
- [ ] Add source metadata layer

### Front end
- [ ] Localize homepage
- [ ] Update treemap labels and tooltips
- [ ] Add geography selector
- [ ] Add methodology page
- [ ] Add detail page template

### Engineering
- [ ] Remove BLS scraping dependency from default path
- [ ] Add scheduled data rebuild
- [ ] Add schema validation
- [ ] Add stale-data indicator

---

## 27. Final recommendation to build

Start with the smallest coherent version:
- occupation treemap
- employment as area
- earnings and vacancies as color layers
- county filtering
- SSB-backed metadata page

This will give you a clean, credible Norwegian product quickly, while preserving the spirit of the original repo.

---

## 28. Reference source set for implementation

Suggested implementation anchors:
- SSB Public APIs
- SSB Statbank
- SSB Klass API
- SSB vacancy tables
- SSB earnings tables
- SSB employment tables

Use these as the basis for engineering design, table selection, and source validation.
