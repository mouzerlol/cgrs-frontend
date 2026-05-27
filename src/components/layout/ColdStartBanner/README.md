# ColdStartBanner

Replaces the desktop nav row whenever the API is unresponsive, so visitors see
a deliberate, branded "we'll be right back" beat instead of a nav-shaped gap.

## Detection model (always-on probe)

```
┌─ ON MOUNT (any non-excluded community-side route) ───────────────────────┐
│                                                                          │
│   enter `grace` phase                                                    │
│       │                                                                  │
│       │  fire GET /health  (cheap, no auth, no DB)                       │
│       │                                                                  │
│       │  at +250ms:                                                      │
│       │    if /health resolved successfully → drop straight to `idle`.   │
│       │    otherwise (slow, failed, refused) → enter `waiting`.          │
│       │                                                                  │
│       │  banner is mounted in `waiting`, `prolonged`, `timedOut`,        │
│       │  and `resolved`.                                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ MID-SESSION FALLBACK ───────────────────────────────────────────────────┐
│                                                                          │
│   useRequestWatcher() observes React Query state.                        │
│   If any tracked query is "fetching" for > 3.5s after the initial probe  │
│   passed, the banner is mounted via the same state machine.              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

The 250ms grace eliminates the false-positive flash for warm-server cases.
The always-on probe covers every API-unresponsive cause uniformly: scheduled
scale-to-zero, scheduler failure, manual container stop in dev, real outage.

## Design QA pin

Append `?_cs=force` to any community-side URL to pin the banner open without
touching the API. Useful for tweaking styling. The probe is intentionally NOT
fired in this mode, so design sessions do not generate API traffic.

## State machine

```
   idle ───► grace ────────► waiting ───────► prolonged ───────► timedOut
                │                │                │                │
                │ /health        │ /health        │ /health        │ retry()
                │ within 250ms   │ after 250ms    │ after 10s      │
                ▼                ▼                ▼                ▼
              idle            resolved         resolved         grace
                              │                │
                              │ +900ms hold    │ +900ms hold
                              ▼                ▼
                            idle             idle
```

## Orchestration timing

```
t=0    t=0.25s     t=2.5s                                  t=10s              t=20s
│         │           │                                       │                  │
│ grace   │  waiting  │   waiting (read steady-state)         │  prolonged       │  timedOut
│         │           │                                       │                  │
│ ┌── stripe ──────────────────────────────────────────────►  │  pauses at 100%  │  amber
│ └── type-in completes ──┘                                   │  dims to sage    │  + retry/help
│         │                                                   │                  │
└─────────┴───────────────────────────────────────────────────┴──────────────────┘
```

If `/health` resolves at any point during waiting/prolonged/timedOut, the banner
transitions to `resolved`: stripe rapid-completes (300ms), prose swaps to
"Awake. Good morning.", banner holds for 600ms, then unmounts.

## A11y contract

- Prose row carries `role="status"` + `aria-live="polite"`.
- The stripe and the typing cursor are `aria-hidden`.
- An off-screen `SrAnnouncer` fires one message per phase entry:
  - waiting: "Our server is waking up. About ten seconds. Link: why this happens."
  - resolved: "The server is awake. Navigation is now available."
  - timedOut: "Our server isn't waking up. Retry or let us know."
- On first mount, focus moves to the Why link *only if* the previous focus was
  on `document.body` (typical when Navigation just unmounted). Otherwise the
  banner does not steal focus.
- All animations honour `prefers-reduced-motion`: type-in is skipped (full
  prose appears immediately), the stripe renders static at 30% opacity, and the
  global CSS rule in `globals.css` further clamps transition-duration to
  0.01ms.

## Configuration

The banner is gated by `NEXT_PUBLIC_COLD_START_BANNER_ENABLED`. The sleep
window is set via `NEXT_PUBLIC_SLEEP_WINDOW_START_HOUR` and
`NEXT_PUBLIC_SLEEP_WINDOW_END_HOUR` (defaults: 23 and 6). The values mirror
`cloud_run_scale_up_cron` / `cloud_run_scale_down_cron` in
`cgrs-iac/environments/<env>/<env>.tfvars` — keep them in sync.

The cgrs-iac stack exposes these as outputs (`cloud_run_sleep_window`) so a
deploy pipeline can derive the env vars from the IaC rather than hand-keep
them aligned.
