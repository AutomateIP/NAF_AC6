# RIBRush

RIBRush is a static browser game for practicing route selection. It includes
seven levels and 35 deterministic IPv4/IPv6 packet scenarios. No package
installation, account, backend, or build step is required.

## Play

- Use Left/Right Arrow to select a next hop and Enter to submit.
- Press Escape to pause or resume. The visible pause button and route buttons
  also work with pointer input.
- Correct routes add 100 points. Wrong or missed packets subtract 50 points,
  cost one of five lives, and increase pressure. A run ends at zero lives.
- Sound is synthesized locally and can be muted. Run state is memory-only;
  refreshing starts a new run.

The first IPv4 level introduces easy longest-prefix, Cisco IOS/IOS XE
administrative-distance, and same-protocol metric decisions. The next three
levels deepen those skills before the final three transfer them to IPv6.
The evaluator applies longest prefix first, then lower AD only for identical
prefixes, then lower metric only when prefix, AD, and protocol match. The
selected AD values are Cisco defaults, not IETF standards or vendor-neutral
values. Each five-packet level deterministically rotates across five reviewed
prefix pools. The four IPv4 levels use 20 different destination /24 blocks in
one run, including private, documentation, and benchmarking address ranges;
these are illustrative route scenarios, not a live routing-table snapshot.
Cisco and IETF citations and the game's simplified eligible-candidate model
are documented in `specs/001-rib-routing-game/research.md`.

## 3D route feedback

Correct and incorrect decisions lazily load the locally vendored Three.js
r180 modules from `vendor/three/` and show a small topology with edge, core,
and candidate next-hop routers. The packet travels to the next hop selected by
the player. A correct selection turns green with a check.
On a wrong answer, the selected router stays neutral while the packet travels;
it turns red on arrival and the winner turns green with a check. The existing
2D status and explanation remain authoritative; missed packets do not create a
route animation.

Three.js is not fetched from a CDN. If WebGL initialization or rendering fails
or the context is lost, the game keeps its normal controls and displays a
non-blocking notice. With reduced motion enabled, the 3D outcome settles
immediately. The canvas is decorative, does not take focus, and does not
intercept input.

## Run locally

From this directory, start the static server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` in a modern browser. Run the browser checks at
`http://127.0.0.1:8000/tests/`; they report discovered, passed, and failed
counts and visibly fail if no fixtures are discovered.

## Validation notes

- The browser fixture page passed all 18 routing, generation, feedback, and
  run-state checks.
- A complete keyboard-only 35-packet browser run reached the seven-level
  summary with 3,500 points and five lives.
- Correct answers turned the selected router green on packet arrival. Wrong
  answers turned the selected router red on arrival and showed the winner green.
  With WebGL disabled, the 2D result and score remained available and the
  fallback notice appeared.
- Reduced motion presented the settled result immediately; enabling reduced
  motion during an animation also stopped the remaining frames. Resizing the
  viewport updated the canvas, and a hidden-page simulation suspended and
  resumed the animation.
- Escape pause/resume, packet timeout penalties, sound mute, and the neutral
  no-selection behavior were checked in-browser.
- At a 320px viewport, the page had no horizontal overflow. Reduced-motion
  mode keeps the CSS packet transition effectively instantaneous.
- Palette contrast was measured against the actual navy and translucent
  surfaces. The minimum measured text contrast was 5.05:1, meeting WCAG AA;
  purple is used only for borders/tinted badges with white label text.
- Browser network inspection observed only local app, module, stylesheet,
  and level-data requests; no external runtime requests were made.
- The required five-person formative network-engineer playtest has not been
  conducted and remains a release criterion.
