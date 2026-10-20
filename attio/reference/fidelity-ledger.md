# Attio homepage fidelity ledger

Captured on 2026-10-20 with REA `capture_browser_scenario`. The live source was `https://attio.com/`; local renders came from `http://127.0.0.1:4174/`. Screenshots use light color mode, normal motion, and clean browser storage. Desktop captures are 1440 × 1000 and mobile captures are 430 × 932.

## Comparison points

| Area | Reference evidence | Local render evidence | Result |
| --- | --- | --- | --- |
| Announcement bar and navigation | `ev_c7a43cf53e55fda9b41a9b8470f22cd9aa55ca3e58b2e374de38993cd9206957` | `ev_279d06f5038faa2504bfd06333fcb3724267938cfc180163b29a28fe9a5816d1` | Same bar, logo, nav labels, button sizes, borders, and spacing. Non-home links go to the live Attio routes. |
| Hero copy and first viewport | Same desktop reference above | Same local render above | Headline, body, CTAs, hero whitespace, background tint, product-preview frame, and cookie notice match. Mobile shows the live email field and “Send me a demo” variant. |
| Type and palette | Desktop and mobile source screenshots | Desktop and mobile local screenshots | Original site CSS and font assets are served locally; the Inter display/body and muted gray-blue text render consistently. |
| Pipeline showcase | `ev_c6ef42764594a92be40534018de98c10cdbde5b0c6b7a97774269a23b65d15e7` | `ev_094166cab8db75a00220f12152efeec6b1163a5b830108746f49fab2519c7fae` | Sticky feature rail, heading, company table, and email composer align. |
| Sales and forecast showcases | `ev_363f407f22af5c668c0b82ff24c9994cee61b5dcd9d78cf272931f1501654e49`; `ev_8870a9fb0307a1c43406bde7a620e9bc71bf291c527c26a8f6c7ac8f1673033d` | `ev_02161eba1128b6a779a8ec5323df71447d3b70d2067a6434633d4e4e02af2681`; `ev_6deee273b1eb5fb8cfd7cb23adad5dce0ddaa6e09c93bd67aff2e12c16270eb1` | Kanban layout, column colors, board data, SQL query card, and active rail state match. |
| Retention showcase | `ev_4289eb09d97ec5282cd10c9037f6e377efe603e8d3586b4bfe9ff6977114a063` | `ev_27e4a22ca97ab097eb45825570c816534d313e43504721939a1a3286205c785b` | Chart panels, risk summary, rail state, and copy match. |
| Responsive layout and menus | `ev_7675d476276479b5681e0dcb20a118f5387c82b0492a06972d93a8cebddbfd5f` | `ev_a9e1a70eb8f9680380526180d62dbf4cfada31fbaff293260a46024d23b1702b`; desktop menu `ev_5295f917c7b1291447159cd1af41a02ff870f7c70a7378c40c90864f5156f54e`; mobile menu `ev_11778f509270a7a81af75861d4bf2eaadfe4d9b6b8670ea18cc14c1f88627e4b` | 430 px mobile hero and menu, plus the desktop mega-menu, rendered and opened successfully. |

## Copy and motion

The above-the-fold copy matches at both checked viewport sizes: announcement, navigation, hero label, headline, supporting sentence, CTAs, and cookie notice. The full captured page contains the platform sections, customer proof, quote, scale metrics, customer stories, changelog, newsletter, final CTA, and footer. The same page scripts and lazy-loaded chunks drive the original product-preview motion and menus; no screenshot is used as the page UI.

The product preview advances animated transcript and deal details, so two captures can show different lines while retaining the same layout and motion. This is the reference's time-dependent content, not a local styling difference. Desktop and mobile captures were inspected with `view_image`; no fixable visual mismatches remain in the homepage snapshot.

## Snapshot scope

The homepage and 635 first-party assets are mirrored locally by `npm run mirror:attio`. Other Attio routes are not copied; their links navigate to the live site. Rerun the mirror command to capture later public-page changes.
