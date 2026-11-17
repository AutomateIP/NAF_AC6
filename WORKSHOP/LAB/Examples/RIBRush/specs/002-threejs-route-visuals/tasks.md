# Tasks: Three.js Route Feedback Visuals

**Input**: Design documents in `specs/002-threejs-route-visuals/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/threejs-feedback.md`

## Phase 1: Setup

**Purpose**: Add the locally pinned renderer dependency without changing the app.

- [X] T001 Copy the Three.js 0.180.0 core modules into `vendor/three/`, retain `LICENSE`, write `VERSION`, and record checksums for the copied files in `SHA256SUMS`.

## Phase 2: Foundational

**Purpose**: Establish and test the pure boundary shared by both user stories.

- [X] T002 Add browser fixtures in `tests/fixtures.js` for correct/wrong decision-event projection and the locally pinned Three.js revision; verify the new event tests fail before implementation.
- [X] T003 Implement the immutable `createDecisionFeedbackEvent` projection in `src/render/feedback-event.js`, using the resolver's status and preserving the player's selected route without recomputing correctness.

**Checkpoint**: Vendor files import locally, and the decision event contract passes browser checks.

## Phase 3: User Story 1 - See a route decision resolve (Priority: P1)

**Goal**: Show the router topology and animate the packet to the player's selected next hop after a confirmed decision.

**Independent Test**: Complete correct and incorrect decisions; confirm the packet follows the selected route, correct/wrong states are green/red, and an incorrect answer also shows the winning router green.

- [X] T004 [US1] Add browser fixtures in `tests/fixtures.js` verifying the feedback view retains its accessible outcome/explanation and provides a decorative scene host.
- [X] T005 [P] [US1] Implement edge, core, candidate next-hop routers, topology links, packet animation, and green/red outcome states in `src/render/route-feedback.js`.
- [X] T006 [P] [US1] Add a non-interactive, `aria-hidden` scene host and responsive Itential-dark styling in `src/ui/views.js` and `styles.css`.
- [X] T007 [US1] Integrate the event projection and lazy reusable renderer into `src/app.js`; present only resolved correct/wrong decisions and keep the existing feedback screen authoritative.

**Checkpoint**: The packet follows the player's selected route; the selected router's state matches correctness, and the game evaluator and session logic remain unchanged.

## Phase 4: User Story 2 - Keep playing with accessible fallbacks (Priority: P1)

**Goal**: Preserve complete 2D gameplay if WebGL is unavailable and honor reduced-motion preferences.

**Independent Test**: With WebGL unavailable and with reduced motion enabled, complete decisions using existing controls and confirm immediate, unchanged text feedback and game state.

- [X] T008 [US2] Add browser fixtures in `tests/fixtures.js` for the non-WebGL feedback notice and immediate 2D outcome availability.
- [X] T009 [US2] Handle dynamic-import/renderer failures and WebGL context loss in `src/app.js` and `src/render/route-feedback.js`, exposing a non-blocking notice through `src/ui/views.js`.
- [X] T010 [US2] Implement reduced-motion settling, resize handling, hidden-page suspension, and renderer/resource cleanup in `src/render/route-feedback.js` and `src/app.js`.

**Checkpoint**: WebGL failure cannot interrupt play; motion preferences, keyboard focus, and existing pointer controls remain respected.

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Document and verify the completed visual layer.

- [X] T011 Document local Three.js assets, 3D feedback, and fallback behavior in `README.md` and `specs/002-threejs-route-visuals/quickstart.md`.
- [X] T012 Run the browser checks in `tests/index.html`, verify correct and wrong packet destinations and router states, complete the reduced-motion, WebGL-unavailable, resize, and full-run checks, then record results in `README.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on T001; T003 depends on the failing event fixtures in T002.
- **User Story 1 (Phase 3)**: Depends on the foundational event contract. T005 and T006 can proceed in parallel after T004; T007 integrates both.
- **User Story 2 (Phase 4)**: Depends on the integrated feedback view from Phase 3. T009 precedes lifecycle hardening in T010.
- **Polish (Phase 5)**: Depends on both user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after the foundational phase; implements the visible winning-path router topology.
- **US2 (P1)**: Follows US1 because fallback, motion, and lifecycle behavior harden the integrated renderer; it does not change routing or game state.

### Parallel Opportunities

- T005 (Three.js scene) and T006 (DOM host and CSS) touch separate files and can be implemented in parallel after T004.
- Other tasks are sequential because they modify a shared file or depend on the preceding interface.

## Parallel Example: User Story 1

```text
Task: T005 Implement the Three.js route scene in src/render/route-feedback.js
Task: T006 Add the decorative scene host in src/ui/views.js and styles.css
```

## Implementation Strategy

1. Copy and validate the local Three.js dependency.
2. Test and implement the pure feedback-event contract.
3. Deliver User Story 1 as the MVP: a router topology that animates to the player's selected next hop while preserving the evaluator's winning route and existing DOM feedback.
4. Deliver User Story 2: WebGL fallback, reduced motion, resize, and resource lifecycle.
5. Run the existing browser suite and the documented manual acceptance checks; record actual results.
