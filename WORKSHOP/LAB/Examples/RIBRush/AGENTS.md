# RIBRush Development Guidelines

Project-specific guidance for work under this directory. The repository-root
agent context is left unchanged.

## Active Technologies

- Static HTML5, CSS, and native ECMAScript modules
- Optional, locally vendored and version-pinned Three.js for decorative route feedback
- No framework, bundler, package manager, backend, or persistent storage
- Browser APIs only; no external runtime requests

## Project Structure

```text
src/routing/  Address handling, evaluation, generation, and validation
src/game/     In-memory run state and transitions
src/render/   Optional presentation-only 3D route feedback
src/ui/       Screens, keyboard controls, and feedback
src/audio/    Optional original sound cues
data/         Level definitions and generation constraints
vendor/three/ Locally pinned Three.js runtime files and license notice
tests/        Browser test runner and independent fixtures
```

## Commands

From this directory, preview with:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`; run the browser checks at
`http://127.0.0.1:8000/tests/`.

## Code Style

Keep route evaluation pure and deterministic. Keep UI, timing, scoring, and
audio outside the evaluator. Do not add fallback challenge data or external
runtime dependencies.
