# Implementation Plan: Three.js Route Feedback Visuals

**Branch**: `002-threejs-route-visuals` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification in `specs/002-threejs-route-visuals/spec.md`

## Summary

Add an optional Three.js router topology that animates a packet from edge
through core to the player's selected next hop. A correct selection turns
green; an incorrect selection turns red while the evaluator's winning router
is also shown green. Keep `src/game/session.js` and the routing evaluator as the
sole authorities for correctness, scoring, pressure, and progression. Preserve
RIBRush's existing 2D controls, accessible result text, and rule explanation.
Vendor the repository's existing Three.js `0.180.0` files into RIBRush so the
project remains an independent static application with no remote runtime
requests or package install.

## Technical Context

**Language/Version**: ECMAScript 2022+ native browser modules, HTML5, CSS
**Primary Dependencies**: Three.js `0.180.0`, vendored locally and pinned; no framework or package manager
**Storage**: None; current in-memory game state is unchanged
**Testing**: Existing dependency-free browser test page plus focused visual-layer tests and manual browser checks
**Target Platform**: Current evergreen desktop browsers; WebGL 2 enables 3D feedback, while the existing 2D game remains playable without it
**Project Type**: Static browser game
**Performance Goals**: Target 60 fps during the brief active route animation on a typical desktop; present the result text immediately and render nothing continuously while idle
**Constraints**: No CDN or remote runtime request, backend, bundler, build step, persistent storage, 3D controls, or changes to route/game rules; honor reduced motion and preserve keyboard/pointer interactions
**Scale/Scope**: One reusable renderer per page, one brief topology animation per valid confirmed decision, and no animation for missed packets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The governing constitution is
[`RIBRush/CONSTITUTION.md`](../../CONSTITUTION.md).

| Principle | Check |
| --- | --- |
| C1 · Route-selection truth | Pass: the 3D layer consumes the existing evaluator's result and does not select or reinterpret routes. |
| C2 · Decisions teach | Pass: the existing DOM explanation and displayed route fields remain available and authoritative. |
| C3 · Pressure never changes correctness | Pass: Three.js affects neither evaluation nor score, lives, pressure, or progression. |
| C4 · Access and visual meaning | Pass: the canvas is decorative and non-focusable; text feedback remains immediate; reduced motion skips travel; result cues are not color-only. |
| C5 · Browser-only | Pass: vendor Three.js locally, keep all runtime files static, and continue without WebGL. |
| C6 · Reviewable rules and content | Pass: the existing pure evaluator remains the only correctness authority; the view accepts a defined decision event. |
| C7 · Done is demonstrated | Pass: verify correct/wrong outcomes, fallback, reduced motion, context loss, keyboard/pointer use, disposal, and zero remote runtime requests. |

No constitution violations are accepted.

## Project Structure

### Documentation (this feature)

```text
specs/002-threejs-route-visuals/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── threejs-feedback.md
```

### Source Code (RIBRush project root)

```text
RIBRush/
├── index.html
├── styles.css
├── src/
│   ├── app.js                         # Pass resolved decisions to the optional view
│   ├── render/
│   │   ├── feedback-event.js          # Pure projection of resolved decision data
│   │   └── route-feedback.js          # Lazy Three.js scene and renderer lifecycle
│   ├── ui/
│   │   └── views.js                   # Decorative canvas host and visible fallback notice
│   ├── game/session.js                # Unchanged decision authority
│   └── routing/                       # Unchanged evaluator and scenario logic
├── vendor/three/
│   ├── three.module.js
│   ├── three.core.js
│   ├── VERSION
│   ├── LICENSE
│   └── SHA256SUMS
├── tests/
│   ├── fixtures.js                    # Event/fallback and existing regression checks
│   └── ...
└── specs/002-threejs-route-visuals/
```

**Structure Decision**: Keep this a single static project. The render module
owns Three.js objects and their cleanup; `app.js` passes already-resolved
decision data; `views.js` retains all controls and accessible text. Copy only
the required core module files into RIBRush rather than referring to the
sibling Per-Hop Works vendor directory, so a RIBRush-only deployment remains
self-contained. Do not modify level data, route evaluation, session behavior,
or add a build system.

## Design and Implementation Sequence

1. **Vendor and isolate the dependency**: Copy the exact `0.180.0` core module
   files already pinned in `PerHopWorks/vendor/three/` into
   `RIBRush/vendor/three/`. Retain the MIT license, version record, and
   checksums. Confirm local module imports work through the existing static
   server before connecting the renderer to game flow.
2. **Implement the presentation module**: Add `src/render/route-feedback.js`.
   Load it lazily at the first correct/wrong result; guard module loading and
   renderer construction so optional 3D failure is reported without stopping
   the game. Show edge/core routers, one candidate router per next hop, and
   explicit-width connecting links. Animate the packet along the selected
   path; settle it green if correct or red if wrong, and show the winning
   router green on incorrect answers.
3. **Define the integration boundary**: Add a pure event projection in
   `src/render/feedback-event.js`, built from the already-resolved decision,
   scenario, and evaluation. Pass `decisionStatus` from `resolveDecision`; do
   not recalculate it in the scene. Do not animate timeout/missed packets.
4. **Preserve feedback UX**: Add a non-interactive, `aria-hidden` canvas host
   to the feedback view. Keep the existing DOM result, live status, winning
   route, and rule explanation unchanged. Show a non-blocking notice if 3D is
   unavailable. Keep keyboard focus and pointer handling in the 2D controls.
5. **Bound lifecycle and motion**: Reuse one renderer across the run; render
   only while an effect is active and stop when it settles or the page is
   hidden. Resize with its host, cap drawing resolution, respond to context
   loss, and release GPU/listener/frame resources on teardown or permanent
   failure. When reduced motion is enabled, skip packet travel and render the
   settled state immediately.
6. **Verify the full experience**: Add focused browser checks for event/result
   agreement and renderer lifecycle, then run all current browser checks.
   Manually test both answer outcomes, WebGL-disabled fallback, reduced motion,
   resize, context loss, keyboard/pointer input, full-run behavior, and network
   activity.

Each step can be tested locally. A renderer failure must not block game
progression, and a 3D result must never become the only explanation of a route
decision.

## Verification Strategy

- **Decision boundary**: Browser checks verify events carry all candidates,
  the selected route, the winning route, and the existing resolver result.
  Verify the scene animates to the player's selected route, colors that
  router by correctness, and reveals the evaluator's winner on wrong answers.
  Verify route evaluation and session scoring remain unchanged.
- **Accessible behavior**: Confirm existing live text contains the outcome and
  rule explanation; canvas is not focusable or interactive; keyboard and
  pointer controls remain usable. Enable reduced motion and confirm feedback
  does not wait for animation.
- **Fallback behavior**: Make WebGL unavailable and separately simulate
  renderer initialization failure and context loss. Confirm a visible,
  non-blocking notice and full 2D play remain. Verify errors are available in
  developer diagnostics rather than silently treated as success.
- **Lifecycle and performance**: Resize the feedback host; confirm the canvas
  fits it. Confirm the frame loop stops after the effect and while the page is
  hidden, then verify resources are disposed on teardown. Check that the
  animation meets the 60 fps target on a typical desktop.
- **Regression and offline**: Run all tests at `/tests/`, complete a run with
  the 3D layer active, and inspect browser network activity for zero requests
  to remote origins.

## Interfaces and Agent Context

There is no network API. The new internal UI contract is documented in
[`contracts/threejs-feedback.md`](./contracts/threejs-feedback.md). The decision
event is passed only after the existing game resolver has completed.

The generic `update-agent-context.sh codex` script targets the repository-root
`AGENTS.md`, which is outside the RIBRush project scope and contains other
project guidance. The scoped technology and project-structure update is
therefore recorded in [`RIBRush/AGENTS.md`](../../AGENTS.md) instead.

## Constitution Check (Post-Design)

| Principle | Result |
| --- | --- |
| C1 · Route-selection truth | Pass: geometry is presentation-only; the event carries evaluator results without recomputation. |
| C2 · Decisions teach | Pass: the existing accessible rule explanation remains complete and authoritative. |
| C3 · Pressure never changes correctness | Pass: animation cannot change timing, scoring, lives, pressure, or state transitions. |
| C4 · Access and visual meaning | Pass: decorative canvas, 2D controls, immediate DOM feedback, reduced-motion behavior, and non-color outcome cues are specified. |
| C5 · Browser-only | Pass: pinned local vendor files; no runtime network dependency; WebGL-unavailable play remains supported. |
| C6 · Reviewable rules and content | Pass: one decision event boundary and one evaluator; no change to generated scenarios or route rules. |
| C7 · Done is demonstrated | Pass: automated browser checks and manual fallback/accessibility/network checks are specified. |

No design change weakens a RIBRush principle.

## Complexity Tracking

The only new runtime library is Three.js, specifically requested for 3D route
feedback. Its use is limited to one lazy, reusable renderer and a brief
presentation effect. A CSS-only effect would be simpler but would not meet the
requested 3D scope; all core game behavior remains independent of the library.
