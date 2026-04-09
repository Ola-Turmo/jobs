# GEO Audit Report

Date: 19.03.2026
Site: https://turmo.dev/

## Executive Summary

This site is now positioned more clearly for both traditional search and AI-driven retrieval. The main product split is explicit: the top of the page is a Norwegian labor-market analysis based on SSB data, while the lower benchmark section is framed as separate global model benchmarking.

The highest-value GEO fixes applied in this pass were:

- switched canonical, Open Graph, Twitter, sitemap, robots, and `llms.txt` references from the Pages alias to `https://turmo.dev/`
- clarified product boundaries between Norwegian labor-market analysis and global benchmarking
- added a text/table alternative for the main treemap so the core content is easier to parse, cite, and quote
- improved semantic structure around the main content and treemap section

## Working Score

This is a pragmatic score based on the current live structure and content.

| Area | Score | Notes |
|---|---:|---|
| AI citability and answer extraction | 78/100 | Stronger after adding clearer framing and a textual treemap table |
| Brand/entity clarity | 72/100 | Better aligned after title and metadata changes, but brand authority still depends on mentions outside the site |
| Content quality and clarity | 82/100 | Strong explanation of sources and caveats; product split is now clearer |
| Technical SEO foundations | 84/100 | Canonical, OG, Twitter, sitemap, robots, and valid page load confirmed |
| Structured data | 76/100 | Good baseline with `WebSite`, `WebPage`, `Dataset`, and `FAQPage`; could still be expanded further |
| Platform readiness for AI search | 80/100 | `llms.txt` is now more explicit and useful for model-side summarization |

Estimated composite GEO score: **79/100**

## What Was Fixed

### 1. Canonical and sharing URLs

The site was still describing itself with the Pages preview domain in several machine-readable places. That weakens entity consistency and can split citations across domains.

Updated:

- `canonical`
- `hreflang`
- `og:url`
- `twitter:url`
- `og:image`
- `twitter:image`
- JSON-LD `@id`, `url`, and dataset download URL
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `about.html` canonical and social metadata

### 2. Product boundary clarity

Before this pass, the page still risked being summarized as one blended product. That is a GEO problem because AI systems often compress pages aggressively and can merge unrelated parts.

The page now makes this distinction clearer:

- Norwegian labor-market analysis based on SSB data
- separate global benchmark section for front models

### 3. Treemap citability

The treemap is visually strong, but visual-only content is harder for AI systems and screen readers to use precisely.

Added:

- a semantic section around the treemap
- canvas text alternative
- a collapsed text table for the main treemap with the 20 largest occupations

This makes the page easier to cite and summarize in answer engines.

## Current Strengths

- Clear dataset framing and caveats
- Strong FAQ for common interpretation errors
- Good social preview foundation
- Distinct benchmark drawer structure
- Dedicated `llms.txt`

## Remaining Opportunities

These are not required for the page to work, but they would likely improve GEO further.

1. Add stronger entity signals about Ola Turmo

- Add `sameAs` links in JSON-LD to GitHub and any public profile you want associated with the project
- Optionally add an `Organization` or `Person` node as publisher/author

2. Add page-level source citations near the benchmark section

- The benchmark area would benefit from one explicit source block that names the benchmark package and what it is not

3. Add stable deep links to sections

- Section anchors for `#arbeidsmarked`, `#ki`, and `#benchmark` make citations and AI references cleaner

4. Add downloadable structured exports

- A smaller, citation-friendly CSV or JSON export for the “top occupations” table would improve reuse

## Verification Notes

Checked locally after changes:

- page title
- canonical URL
- Open Graph URL
- Twitter URL
- benchmark drawer default state
- generated treemap table rows
- no runtime errors during page load

## Bottom Line

The site is now materially stronger for both SEO and GEO. The biggest improvement is not only metadata quality, but the fact that the page now explains itself more cleanly to both humans and machines.
