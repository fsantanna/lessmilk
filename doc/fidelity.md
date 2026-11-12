# Fidelity

The port must be the same game as the original: the same screens at the
same frames, with the same seed and the same input. This document says how
that is checked, and what differs, game by game.

## How the originals run

- Each original runs in Chromium with no screen, driven by Playwright
  (`tools/original/run.js <n> <file.run> [outdir]`), from the copy of the
  site in `ext/originals` (`tools/setup.sh`), with the assets of `assets/<n>/`
  copied next to it.
- `run.js` writes a page next to the game with the scripts of its
  `index.html` only (not the analytics, the comments, or the rest of the
  site), and `tools/original/harness.js` before Phaser:
    - `Math.random` is a seeded generator (mulberry32, 32 bits of state, a
      double in [0,1) per call). Phaser's own generator (`game.rnd`) is
      seeded from `Date.now()` and `Math.random`, so it is fixed too.
    - The clock (`Date.now`, `performance.now`, and the time given to
      `requestAnimationFrame`) moves only when a frame is stepped:
      frame f runs at `T0 + (f-1) * 1000/60` ms, with `T0 = 1000`.
    - `requestAnimationFrame` only queues; the runner steps one frame of
      Phaser at a time, with no waits.
    - Phaser renders to a 2D canvas (`Phaser.AUTO` becomes `CANVAS`), so
      the canvas can be read back.
- All twelve games start with the states `Boot` (where present) and `Load`.
  While they run, frames run with the clock stopped at `T0` and are not
  counted. Frame 1 is the first frame in the next state; no input can be
  given at frame 1.
- A run is a file with `FRAMES`, `SEED`, `INPUT`, and `SHOTS`, in the
  format of the raylib port (`fsantanna/raylib`), so the same file drives
  the original and the port: `INPUT=f:op,...` applies `op` before frame
  `f`: `dn:KEY` and `up:KEY` (names as raylib: `UP`, `SPACE`, `A`...),
  `mv:X:Y` (mouse, in pixels of the game), `md:B` and `mu:B` (buttons).
  `SHOTS="f ..."` saves `<outdir>/<f>.png` at the end of frame `f`.
- The trace is a line per frame on stdout: the frame, the state of Phaser,
  and what `tools/original/trace/<n>.js` adds for that game.
- `tst/originals.sh` runs `tst/originals/smoke.run` on every original and
  compares with the stored traces: the same seed and input give the same
  trace and the same screens, run after run.

## Findings that hold for all games

- **Not one Phaser.** Games 1 to 9 use Phaser 1.1.3; game 10 uses 1.1.6;
  game 11 uses 2.0.1; game 12 uses 2.0.2. The copy of the site has the four.
- **Screenshots.** Phaser 1 paints the background as the CSS color of the
  canvas, not in it: `run.js` fills it before drawing the canvas on top.
- **Assets.** The copy of the site has assets for games 1 and 2 only; those
  of games 3 to 12 come from the student port (see `assets/README.md`).
  Missing everywhere: the loading bars (they only show while loading), the
  image of game 6 that asks to turn a phone, the tiles image of game 10
  (it draws its walls anyway), and the map of game 11, without which its
  `Play` state fails: game 11 runs only to its menu until the map is
  rebuilt from the student's `map.atm`.
- **Fonts.** The originals ask for Arial; the browser of the container
  draws its own sans font. Text is compared by eye, not pixel by pixel.
