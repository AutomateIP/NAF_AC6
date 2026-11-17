# Feature Specification: Three.js Route Feedback Visuals

**Feature Branch**: `002-threejs-route-visuals`
**Created**: 2026-11-17
**Status**: Implemented
**Input**: User request for a 3D router topology where traffic follows the selected route and correct/incorrect routers are clearly indicated.

## User Scenarios & Testing

### User Story 1 - See a route decision resolve (Priority: P1)

As a RIBRush player, after I confirm my answer, I see a small 3D router
topology. The packet follows the next hop I selected. A correct selection turns
that router green; an incorrect selection turns red, while the evaluator's
winning router is shown green as the correction.

**Why this priority**: A topology makes the route-selection result tangible and
shows the correct next hop without changing the routing challenge.

**Independent Test**: Complete correct and incorrect decisions using the
existing controls; verify that the packet reaches the selected router, the
selected router reflects correctness, and a wrong selection also reveals the
winning router in green, while the existing textual result remains
authoritative.

**Acceptance Scenarios**:

1. **Given** a valid routing challenge, **When** I confirm a correct answer,
   **Then** the topology shows the packet travel from the edge router through
   the core to my selected winning next hop, which turns green with a check.
2. **Given** an incorrect answer, **When** the result settles, **Then** the
   packet travels to the router I selected, that router turns red with a cross,
   and the evaluator's winning router is shown green with a check.
3. **Given** either result, **When** the animation is playing, **Then** the
   existing accessible text feedback identifies the result and rule explanation
   without requiring interpretation of the 3D scene.

### User Story 2 - Keep playing with existing accessible controls (Priority: P1)

As a player, I continue to use RIBRush's existing keyboard and pointer controls
and receive immediate, understandable feedback even when 3D rendering is
unavailable or reduced motion is enabled.

**Why this priority**: Three.js is an optional presentation layer; it must not
change route correctness, block play, or reduce accessibility.

**Independent Test**: Play with keyboard and pointer input with WebGL available,
WebGL unavailable, and reduced motion enabled; compare scoring, route outcomes,
and text feedback.

**Acceptance Scenarios**:

1. **Given** WebGL is unavailable or the 3D renderer cannot initialize,
   **When** I confirm a decision, **Then** the game continues with its existing
   2D feedback and exposes a non-blocking notice that 3D visuals are unavailable.
2. **Given** reduced motion is enabled, **When** I confirm a decision,
   **Then** the outcome and accessible text feedback appear immediately without
   a required animated transition.
3. **Given** the 3D scene is active, **When** I use the existing controls,
   **Then** keyboard focus and pointer interactions remain with the existing
   2D interface.

## Edge Cases

- The browser does not support WebGL, or WebGL context creation fails.
- The WebGL context is lost while a run is active.
- The viewport is resized while a result animation is in progress.
- A new decision arrives before the previous visual animation finishes.
- Reduced motion is enabled before or during a run.
- A visual asset or local Three.js module fails to load.

## Requirements

### Functional Requirements

- **FR-001**: The application MUST add Three.js as a locally available,
  version-pinned runtime dependency; gameplay MUST NOT load Three.js or other
  runtime assets from a CDN or remote origin.
- **FR-002**: The 3D feedback layer MUST receive a completed decision result
  from the existing game flow and MUST NOT evaluate routes, choose the correct
  next hop, or change scoring, pressure, or progression.
- **FR-003**: After each valid confirmed decision, the 3D scene MUST show an
  edge router, a core router, and one router for each candidate next hop. The
  packet MUST travel through the topology to the player's selected router.
- **FR-004**: The selected router MUST turn green when correct and red when
  incorrect. An incorrect result MUST also mark the evaluator's winning router
  green. The visual MUST remain consistent with the existing evaluator's result.
- **FR-005**: The existing 2D controls and text feedback MUST remain available
  and authoritative. The 3D scene MUST NOT capture keyboard focus or be the
  only carrier of essential outcome information.
- **FR-006**: When WebGL is unavailable, the 3D renderer fails to initialize,
  or its context is lost, the game MUST continue to support its existing
  gameplay and MUST expose a non-blocking indication that 3D feedback is
  unavailable.
- **FR-007**: When reduced motion is requested, the game MUST present decision
  results without requiring the 3D animation to finish.
- **FR-008**: The 3D renderer MUST respond to viewport changes, suspend
  animation when no feedback is visible, and release its rendering resources
  when the game is torn down or the renderer becomes permanently unavailable.
- **FR-009**: The 3D presentation MUST use the existing RIBRush visual theme
  and MUST NOT rely on color alone to communicate correctness.
- **FR-010**: The browser test page MUST verify that feedback uses the existing
  decision result and selected route, marks the evaluator's winner on incorrect
  answers, and that accessible 2D feedback remains available without WebGL.

### Key Entities

- **Decision feedback event**: A completed player decision and the existing
  evaluator's result, including candidate routes, the selected route, winning
  route, correctness, and existing rule explanation.
- **Router topology**: A presentation-only edge router, core router, candidate
  next-hop routers, and their connecting links; it does not represent or
  modify routing-engine state.
- **Packet animation**: A transient visual response to one decision feedback
  event, including the selected path, winning route, and settled router states.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every valid confirmed decision triggers an animation to the
  player's selected router. Correct selections settle green; incorrect
  selections settle red while the evaluator's winning router is also shown
  green.
- **SC-002**: Existing route outcomes, scores, pressure changes, progression,
  and keyboard/pointer behavior remain unchanged with the 3D layer enabled or
  unavailable.
- **SC-003**: With WebGL unavailable, a player can complete a full run using the
  2D interface and receives the same decision explanations as before.
- **SC-004**: With reduced motion enabled, decision correctness and its text
  explanation are available immediately and do not depend on animation timing.
- **SC-005**: Runtime inspection during play observes no request to a remote
  origin for Three.js, scene assets, or other game resources.
- **SC-006**: The browser checks verify correct/wrong event mapping and the
  non-WebGL feedback path without changing existing routing or session results.

## Assumptions

- The existing RIBRush game and its evaluator remain the source of truth; this
  feature changes presentation only.
- The 3D scene is an illustrative topology of the challenge's candidate next
  hops, not a claim about a real network topology.
- The existing Itential dark palette and current accessibility behavior apply.
- If 3D rendering cannot run, the current 2D experience is the complete
  fallback; no fallback gameplay content is introduced.
- This feature is planned and developed locally. No remote commit or push is
  part of the feature workflow.
