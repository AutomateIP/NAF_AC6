# Quickstart: Three.js Route Feedback

This plan adds no server, package installation, or build step. Run the existing
static project locally:

```sh
cd WORKSHOP/LAB/Examples/RIBRush
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` and start a run. Use the existing arrow keys and
Enter (or the existing route buttons) to submit both correct and incorrect
choices. Confirm the packet travels from EDGE through CORE to your selected NH
router. A correct selection turns green with a check. For an incorrect
selection, the packet reaches the red router while the winning router is shown
green with a check. Verify that the result agrees with the existing text
explanation and that the 2D controls remain usable. Continue through several
decisions to verify that the renderer is reused and its frame loop stops
between feedback effects.

Run the browser checks at `http://127.0.0.1:8000/tests/`; they cover the
decision-event contract, candidate router list, winning-router index, and
immediate 2D fallback.
Repeat play with reduced motion enabled before a decision and while an
animation is active. Simulate WebGL initialization failure and confirm the
non-blocking notice appears without changing score, controls, or explanation.
Resize the viewport and hide/show the page during an animation to verify
renderer resize and suspension/resume behavior.

Inspect browser network activity during play. Every application and Three.js
resource must be served from localhost; no remote runtime request is allowed.
