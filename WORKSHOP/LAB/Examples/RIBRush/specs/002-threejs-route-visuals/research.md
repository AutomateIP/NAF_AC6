# Research: Three.js Route Feedback Visuals

**Date**: 2026-11-17
**Feature**: [spec.md](./spec.md)

## Decisions

### 1. Vendor a repository-pinned Three.js release locally

**Decision**: Use Three.js `0.180.0`, already pinned and checksummed in
`WORKSHOP/LAB/Examples/PerHopWorks/vendor/three/`. Copy only the core module
files needed by RIBRush into its own `vendor/three/` directory, with the
version, checksums, and MIT license notice. Do not import from the sibling
PerHop Works directory at runtime, and do not add a package manager or CDN.

The existing module/core files total about 2.0 MB uncompressed. Include that
cost in the static payload review; the scene is intentionally small and uses
no texture or model downloads.

**Rationale**: RIBRush stays independently deployable as static files. Reusing
the repository's existing pin avoids introducing a second Three.js revision
without a demonstrated need. The package's MIT license requires retaining its
copyright and permission notice in redistributed copies.

**Alternatives considered**: Three.js `0.187.0` is an available newer
release; adopting it is possible but would introduce a second revision in the
repository and is not required for this bounded scene. A runtime CDN import is
rejected because it breaks the project's no-remote-runtime constraint.
Importing PerHop Works' files by relative path is rejected because a
RIBRush-only static deployment would then be incomplete.

### 2. Keep the existing game flow authoritative

**Decision**: Build a presentation-only `DecisionFeedbackEvent` after
`resolveDecision` returns `correct` or `wrong`. Pass every candidate, the
player's selected route, the winning route, resolved result, destination, and
existing explanation to the scene. The scene animates the packet to the
player's selected router. Correct selections turn green; wrong selections turn
red while the evaluator's winning router is shown green. It does not evaluate
routes, apply scoring, or decide correctness. Missed packets do not trigger a
route animation because no route was selected.

**Rationale**: `src/app.js` already resolves the decision before calling
`renderFeedback`, and `src/ui/views.js` already supplies a live text status and
the rule explanation. This establishes a narrow, testable integration point
without changing route logic or keyboard/pointer behavior.

**Alternatives considered**: Moving route selection or answer controls into a
3D scene is rejected; it would expand scope and weaken the existing
keyboard-first interface.

### 3. Treat WebGL as an optional presentation capability

**Decision**: Initialize one renderer lazily when the first valid answer is
confirmed, reuse it for later feedback events, and animate only while an event
is active. Catch and surface failures at this optional-renderer boundary.
Handle a lost WebGL context by stopping the visual effect and continuing with
the existing 2D feedback. Dispose renderer and GPU resources when the app is
torn down or the renderer is permanently unavailable.

**Rationale**: `WebGLRenderer` provides a canvas and a `dispose()` method for
GPU resources. The WebGL capability helper can test WebGL 2, but the renderer
constructor itself can fail; initialization must therefore remain guarded.
Reusing one context avoids repeated renderer creation across the 35-packet
run.

**Alternatives considered**: Recreating the renderer for every packet or
running a permanent animation loop adds unnecessary resource and frame work.
Making WebGL a prerequisite is rejected because this is nonessential feedback.

### 4. Preserve accessible and reduced-motion feedback

**Decision**: Keep the canvas decorative, `aria-hidden`, non-focusable, and
non-interactive. Keep the existing DOM feedback as the complete accessible
result. When `prefers-reduced-motion: reduce` applies, skip packet travel and
render a settled outcome cue immediately. Never use color as the only outcome
signal.

**Rationale**: WCAG's keyboard guidance and status-message guidance support
keeping controls and outcome communication in the DOM. MDN documents reduced
motion as a request to remove, reduce, or replace nonessential motion.

**Alternatives considered**: Making the canvas the sole feedback channel or
moving focus into it would exclude keyboard and assistive-technology users.

### 5. Use explicit-width route geometry and bound rendering work

**Decision**: Use simple mesh geometry for visible route paths (for example,
`TubeGeometry`) rather than relying on `LineBasicMaterial.linewidth` for thick
WebGL lines. Reuse scene objects, cap drawing resolution, render only during
the brief active effect, and suspend animation while the page is hidden.

**Rationale**: Three.js documents that WebGL ignores `LineBasicMaterial` widths
and renders line primitives one pixel wide. `TubeGeometry` follows a 3D curve
with explicit mesh thickness. Reusing one lightweight scene and limiting
animation work makes the visual layer less costly than a permanent render loop.

**Alternatives considered**: A continuously animated scene, high-resolution
textures, downloaded models, and external asset services are unnecessary for
the router-topology feedback effect.

## Sources

- [Three.js installation guide](https://threejs.org/manual/#en/installation)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js WebGL capability helper](https://threejs.org/docs/pages/WebGL.html)
- [Three.js LineBasicMaterial](https://threejs.org/docs/pages/LineBasicMaterial.html)
- [Three.js TubeGeometry](https://threejs.org/docs/pages/TubeGeometry.html)
- [Three.js 0.180.0 version record](../../../PerHopWorks/vendor/three/VERSION)
- [Three.js MIT license text](https://raw.githubusercontent.com/mrdoob/three.js/r180/LICENSE)
- [Three.js npm package](https://www.npmjs.com/package/three)
- [WCAG Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [MDN reduced-motion preference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
- [MDN WebGL context loss event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)
- [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

## Implementation Gates

- Copy and verify only the pinned core module files used by RIBRush; retain
  their MIT notice and record checksums.
- Verify the exact version's browser-module imports work with the existing
  no-build local static-server workflow.
- Treat renderer initialization and context loss as optional-visual failures,
  not game errors. Keep diagnostics visible to developers and a
  non-blocking status visible to players.
- Verify WebGL, unavailable-WebGL, reduced-motion, resize, context-loss, and
  full-run paths before accepting the feature.
