# TODO

Everything that is pending in the session that ports the Lessmilk games
(`ia-atmos/ray-lessmilk`): asked and not decided, reported and not
acknowledged, or known and not done. Keep it current: remove an item when
it is settled, add one whenever something is left open, in the same commit
when possible.

The numbers do not change. Numbers that are missing were settled (see the
end).

Last update: 2026-11-14.

## A. Decisions waiting for an answer

Each has the option recommended by this session.

| # | Decision | Recommended |
|---|----------|-------------|
| 2 | `tiles.png` of Dark Blue (game 10) exists in no copy found (the site, the student's port, GitHub). The logic only needs the indices of the tiles | Draw the tiles as plain squares of the colors of the game, from the levels (`levels/*.json`), and say so in `doc/fidelity.md`; compare the screens by eye |
| 3 | `levels/map.json` of The Three Hearts (game 11) exists in no copy found; without it the original does not get past its menu | Rebuild it from the student's `the_three_hearts/map.atm` (tiles and objects), put it next to the original in `ext/` only (not in `assets/`, since it is not Thomas Palef's), and compare the port with that |
| 4 | The harness sends no key repeat: a key held from one state into the next stays up in Phaser until pressed again; in a browser the keyboard would send it again after about half a second | Keep it so (deterministic, and the same in the port, `Cursor`/`key_down`); it is written in `doc/fidelity.md` |

## B. Work known and not done

| # | Work |
|---|------|
| 1 | Fill the Holes (game 5, Phaser 1.1.3): needs the input of Phaser for sprites (`onInputUp` of the topmost sprite, `getLocalUnmodifiedPosition`), `onOutOfBounds` as a signal, `callAll('kill')`, an emitter with several keys (`rnd.pick` when it makes the particles) |
| 2 | Princess Quest (game 6, Phaser 1.1.3); `orientation.png` is missing (only for phones) |
| 3 | Dark Blue (game 10, Phaser 1.1.6): tilemaps of Tiled, collisions with tiles; depends on A2 |
| 4 | The Three Hearts (game 11, Phaser 2.0.1): depends on A3; the loop of a frame and the physics of Phaser 2 differ from 1.1.3 |
| 5 | Crazy Snake (game 12, Phaser 2.0.2): `game.time.events`, bodies read from transforms that include a group that turns and scales, `inCamera`, the order of a frame of Phaser 2 |
| 6 | L6: a launcher for the twelve; `doc/bench.md` (memory, CPU, time of a frame of logic, against the originals in the browser); the table complete |
| 7 | L7: the case study in `doc/`, a pattern per section, from the shortest game that shows it |
| 8 | `doc/games/` for Pixel War, Man vs Penguins, Connected, and I Hate Rabbits (the other documents of these games are done) |
| 9 | `doc/table.md` and `doc/state.md`: the row and the section of Connected (control variables not counted yet) |
| 10 | Copy `raylib.atm` at `0b1aa0f` of `ia-atmos/env-ray`, and use `rl.font_ex` in `lib/engine.atm` in place of its own C for fonts |
| 11 | Run `ASAN=1 tst/run.sh` on the last commits (stopped once for time; the normal suite passes, 22 tests). The suite takes more than 10 minutes with ASAN: run it in the background |
| 12 | Box Jump: no run reaches the screen End (twenty levels); a run that wins would need a schedule of jumps found by search |
| 13 | Consider `await(n, :e)` of the compiler (the nth occurrence of a pattern) where a port counts frames |
| 15 | After the twelve games are identical to their originals: tag the last exact commit `exact`, then relax each port in favor of expressiveness, keeping the intent of the original (decided by the author, see Settled): `await Nms` in place of `Wait`, a task per entity in place of recycled slots, `await`s in place of the flags that stayed, the emulation of 32-bit floats and of the quadtree out of the games (kept in `lib/` for the exact version); the relaxed ports get traces of their own |
| 14 | Connected: try the move as a sequence (`await` of the press, then the updates while pressed, then `await Wait(300)`), in place of the flags `clicked` and `next_time`, keeping the traces |

## C. Reported or decided, and not acknowledged by the author

| # | What |
|---|------|
| 1 | The order of L4 and L5 changed: the games on Phaser 1.1.3 first (I Hate Rabbits, Man vs Penguins, Connected, then Fill the Holes and Princess Quest), the three games on other versions of Phaser last (10, 11, 12) |
| 2 | Of the student's documents, only Run! has an analysis; the other READMEs are a TODO of 6 to 9 lines. The documents of the other games are this session's |
| 3 | The assets of games 3 to 12 come from the student's port (the copy of the site has only games 1 and 2); compared byte by byte where both exist |
| 4 | The easings of `reasings.h` are not used for Motion: they are 32-bit floats, and the traces need the doubles of JavaScript (the formulas are the same) |
| 5 | The code that runs is `phaser113.min.js`, whose minifier reordered `updateMotion`; the other formulas were checked against it |
| 6 | Text: Liberation Sans and Mono for Arial and Courier (SIL OFL, in `lib/fonts/`); the line height and the width are those of Chromium, a vertical correction of `0.12 * size` was measured on two sizes only |
| 7 | A tween whose task is aborted is deleted; Phaser would go on moving the object. No run shows a difference |
| 8 | Connected keeps the best score in memory, not in `localStorage` |
| 9 | Some flags stay where the order inside a frame or of the random draws requires it (Save the City `keyReset`, Man vs Penguins `enemyTime`, I Hate Rabbits `change_level`), and the recycled groups stay as slots; listed in `doc/state.md` |

## D. Older items

None.

## Settled

- Expressiveness over exactness (the author, 2026-11-14): once a port is
  identical to its original, it may relax the constraints of exactness in
  favor of expressiveness, as long as the intent of the original author is
  kept. Order: the five games left are done exact first; then the tag
  `exact` on `main`, and the relaxed ports on top of it, so that the study
  compares the original, the exact port, and the expressive port. Passed
  to the session `ceu-atmos` for the other ports.

- The names (A1): the author renamed the repositories of the organization;
  the documents and scripts now say `ia-atmos/lang` (the compiler),
  `ia-atmos/env-ray` (the binding of raylib, still copied in `env/` at a
  fixed commit, with its patch), and `ia-atmos/ray-lessmilk` (this one).
  The local checkouts in `ext/` and the remote of this repository keep the
  old addresses, which redirect.
- The library: raylib, through `raylib.atm` (the author, through the
  session `ceu-atmos`).
- The assets: copied into `assets/`, with credit to Thomas Palef (the
  author, in this session), although the originals say "do not copy".
- Coordinates in pixels (the author, in this session).
- `lessmilk.com` cannot be reached from the container; the author declined
  a new environment for it; the copy of the site is used.
- The compiler: `math.atan(y, x)`, aborts while iterating a pool (fixed);
  the order of awaking and of an emit and a spawn (guaranteed, in the
  manual); `$x.f` in a native, the message of a pinned escape (as designed).
