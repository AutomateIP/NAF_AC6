# Internal Contract: 3D Route Feedback

This is an in-process UI contract between the RIBRush game controller and the
optional Three.js presentation layer. It is not a network API.

## Decision event

The controller calls the visual layer only after the existing game resolver
returns `correct` or `wrong`. The event contains:

```text
packetId
selectedNextHopId
selectedRouteIndex
winningRouteId
winningRouteIndex
decisionStatus: "correct" | "wrong"
destination
routes: [{ id, nextHopId, nextHopLabel, networkAddress, prefixLength }, ...]
selectedRoute: { id, nextHopId, nextHopLabel, networkAddress, prefixLength }
winningRoute: { id, nextHopId, nextHopLabel, networkAddress, prefixLength }
ruleCode
explanation
```

The selected route is always the player's choice, including for a wrong
answer. `routes` contains every candidate and both indexes identify the
player's selection and the evaluator's winner. The packet animates through the
topology to the player's selected router. A correct selection turns green with
a check when the packet arrives. For a wrong selection, the selected router
stays neutral during travel, then turns red with a cross when the packet lands;
the winning router also turns green with a check at that point. The scene uses
`decisionStatus` from the existing resolver; it MUST NOT calculate correctness
or alter game state. Missed packets do not create a route-animation event.

## View lifecycle

- The game mounts the decorative canvas in the feedback screen and presents
  the decision event. One renderer is lazily initialized and reused across the
  run; it does not run an animation loop between effects.
- The view displays the event in a decorative canvas; the existing DOM feedback
  remains the accessible source of truth.
- The canvas is hidden from assistive technology, is not focusable, and does
  not intercept pointer or keyboard input.
- The controller stops the active effect when leaving the feedback screen and
  releases the renderer and GPU resources on app teardown or permanent failure.
- Renderer initialization failure or context loss is explicitly reported to
  the controller so it can keep 2D feedback active and show a non-blocking
  notice. Failure MUST NOT be converted into a successful-looking 3D result.
- Reduced-motion mode skips the animated transition and presents the settled
  visual state while existing text feedback remains immediate.

## Runtime resources

Three.js and all 3D runtime assets are loaded from local project files only.
The view releases its renderer, animation frame, listeners, and GPU resources
on disposal. No resource is loaded from a remote origin.
