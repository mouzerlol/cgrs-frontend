# cgrs-frontend

## Anchors and scroll targets must clear the fixed chrome

The site chrome — the header plus the beta marquee — is `position: fixed` at
`z-[1000]` (`src/components/layout/SiteChromeBar.tsx`), so the document scrolls
*underneath* it. Anything the browser scrolls to the top of the viewport lands
behind it and reads as having scrolled too far.

**Rule: every jump target carries `scroll-anchor`** (defined in
`src/app/globals.css`, `@layer utilities`):

```css
.scroll-anchor { scroll-margin-top: calc(var(--chrome-offset, 72px) + 1rem); }
```

A jump target is anything reached by:

- a fragment link (`href="#replies"`, `id` on the destination),
- `scrollIntoView()`,
- `window.scrollTo()` / `scrollTop` (add the offset to the computed Y yourself —
  `scroll-margin-top` does not apply to these),
- router hash navigation.

Apply it to the element that receives the scroll, not its wrapper.

### Never hard-code the offset

`scroll-mt-24` (96px) is the mistake this rule exists to stop: the real chrome is
**117px** (81px header + 36px marquee), so the destination sat 21px behind the
marquee. Any literal is wrong the moment the header's height, the marquee's
presence, or the breakpoint changes.

The height is published as CSS variables by `<SiteChromeBar />` and re-measured
on resize:

- `--chrome-offset` — the measured height, **0 when the mobile chrome retracts on
  scroll-down**. Use this for scroll targets: when the chrome is gone the
  clearance is not wanted.
- `--chrome-height` — always the real height. Use this for sticky sub-bars that
  ride *with* the chrome and hide alongside it (`PageBreadcrumbBar`, the account
  layout's mobile tab strip).

Both default to `calc(72px + var(--site-banner-height))` in `globals.css` so the
pre-hydration value already matches what the measurement will find.

### The same rule for any new overlaying chrome

If you add a sticky or fixed bar that content scrolls under, it must publish its
height as a CSS variable measured from the element itself, and the scroll offset
must be derived from that variable — never from a number copied out of a
screenshot.

### Checking it

The offset is only correct if it exceeds the chrome. To verify in the browser:

```js
getComputedStyle(document.querySelector('#replies')).scrollMarginTop  // e.g. "133px"
document.querySelector('[data-site-chrome]').getBoundingClientRect().height  // 117
```

The first must be greater than the second.
