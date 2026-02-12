# CGRS Issue Priority Rubric

## Priority Levels

### P1 — Critical (Fix Immediately)
**Criteria:** Any ONE of:
- Security vulnerability (leaked secrets, injection vectors, missing auth)
- Broken functionality visible to users (404s, JS errors, data loss)
- Compliance/legal risk (leaked PII, missing required policies)
- SEO: Site completely unindexable or blocked from crawlers

**SLA:** Fix within current sprint / same day
**Examples:** Leaked API keys in client bundles, broken navigation links, meta tags in wrong DOM location

---

### P2 — High (Fix This Week)
**Criteria:** Any ONE of:
- Performance: >100KB unnecessary bundle size impact
- SEO errors affecting indexing (missing sitemap, duplicate titles on all pages)
- Accessibility errors (WCAG 2.1 AA failures: missing labels, broken ARIA)
- Security warnings (missing CSP, no clickjacking protection)
- Architectural: Wrong component boundaries causing cascading issues

**SLA:** Fix within 1 week
**Examples:** No dynamic imports for 140KB Leaflet, all 28 pages sharing same title, barrel files bloating bundles

---

### P3 — Medium (Fix This Month)
**Criteria:** Any ONE of:
- Performance: <100KB impact, re-render optimizations
- SEO warnings (short descriptions, thin content, missing og:image)
- Content quality issues (keyword density, word count)
- Code quality (missing memoization, unnecessary client components)
- UX improvements (heading hierarchy, image lazy loading)

**SLA:** Fix within 1 month / next sprint
**Examples:** Missing useMemo on homepage computations, pages as client components that could be server, image dimensions causing CLS

---

### P4 — Low (Backlog)
**Criteria:**
- Informational notices and best practice polish
- Micro-optimizations (<10KB impact)
- Edge-case UX improvements
- Future-proofing / architectural nice-to-haves

**SLA:** As time permits
**Examples:** content-visibility for long lists, preconnect hints, SVG precision reduction

---

## Scoring Formula

Each issue scores based on:
1. **Severity** (error=3, warning=2, notice=1) × **Reach** (all pages=3, multiple=2, single=1)
2. Cross-reference with squirrelscan rule rank (1-10)
3. Bundle size impact (KB saved)
4. User-facing vs developer-facing

**Final priority = max(severity_score, category_override)**

Category overrides:
- Security errors → always P1
- Leaked secrets → always P1
- Broken links (internal) → always P1
- Bundle >100KB impact → always P2
- WCAG AA failures → always P2
- Missing sitemap/robots → always P2
