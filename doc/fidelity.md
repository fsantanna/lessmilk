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
  counted. Frame 1 is the first frame that starts in the next state; no
  input can be given at frame 1. The assets load asynchronously, so the
  state can change between two frames: the harness records the state in
  which each frame starts (`__ranIn`). Counting from the state seen after a
  frame made Box Jump start one frame off in some runs.
- A run is a file with `FRAMES`, `SEED`, `INPUT`, and `SHOTS`, in the
  format of the raylib port (`ia-atmos/env-ray`), so the same file drives
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

## The port: findings that hold for all games

- **The clock.** Phaser compares and interpolates with `game.time.now`, in
  milliseconds as doubles. The port has the same clock, `eng.now()`, which
  in test mode is computed as the harness computes it (frame f at
  `1000 + (f-1) * 1000/60`), so that tweens give the same numbers, digit by
  digit. The time events of Atmos are integer microseconds (16667 or 16666
  per frame), and are not used to compute positions.
- **Random.** The originals call `Math.random`, which the harness replaces
  by mulberry32; the port has the same generator (`eng.random`), seeded by
  `RL_SEED`. Phaser draws one number when it boots (to seed `game.rnd`),
  before frame 1: a port discards one draw at its start.
- **Easings.** The originals use three: `Linear.None` (35 tweens, and the
  default of all the others), `Bounce.Out` (10), and `Quadratic.In` (1).
  `reasings.h` of raylib has the same formulas, but in 32-bit floats:
  `lib/motion.atm` has them in doubles, as in JavaScript.
- **Text.** The originals ask for Arial, which the browser of the container
  draws with Liberation Sans (`fc-match Arial`). The port draws the same
  font, copied in `lib/fonts/` with its license (SIL OFL 1.1).
- **Fonts, sizes.** raylib scales a TTF so that ascent plus descent is the
  size; the browser, so that the em is. For Liberation Sans the font is
  loaded at `size * 2288/2048`. The line height of a text is measured as
  Chromium measures it for Pixi (ascent, descent, and gap, each rounded:
  the same for 18 sizes from 10 to 80 px). The browser draws a line about
  `0.12 * size` higher than raylib: measured 4 px at 30 px and 2 px at
  20 px in Run!; with the correction, the rows of the text are the same.
  raylib rounds the advance of each glyph to whole pixels at the size it
  loads a font: loaded at 20 px, a sentence of 20 px was 10% narrower than
  in the browser (322 against 358 px). The engine loads each font at about
  180 px and draws it smaller: 356 against 358, and the rows and columns of
  the text of Run! are the same as the original's.
- **The clock between frames.** Phaser sets `game.time.now` when a frame
  starts. The callbacks of keys (`onDown`) and of the mouse run in the DOM
  events, between frames, and see the time of the frame before: a tween
  started there counts from it. `eng.now()` is that clock, set by `Game`
  when a frame starts.

## The code that runs is the minified one

The games load `phaser113.min.js` (and 116, 201, 202) from the site, not
the source of the tag `1.1.3` of Phaser. The minifier reorders some
arithmetic: in `updateMotion`, `(cv - v) * dt * 0.5 * 60` of the source
became `60 * .5 * (cv - v) * dt`, which rounds differently. A gravity of 5
in Man vs Penguins showed it: a velocity two units in the last place apart
after three frames, and a trace line apart after 568 frames. The formulas
that the port copies were checked against the minified file: the tween,
the easings, the generator, `preUpdate`, `postUpdate`, the bounds,
`separate`, `wrap`; only `updateMotion` differs.

## How the port follows a frame of Phaser 1.1.3

`lib/game.atm` emits, in each frame, what `Game.update` of Phaser 1.1.3
does, in its order (read from `ext/phaser/1.1.3/src/core/Game.js`):

1. the time event: `tweens.update` (the tasks of `Motion`);
2. `:pre`: `world.update`: each sprite updates its animation and tests if
   it left the world; then each body takes the position of its sprite and
   moves (`physics_pre`);
3. `:particles`: `particles.update`: the emitters emit;
4. `:update`: `state.update`;
5. `:overlap`: the end of `state.update`, where the games test overlaps;
6. `world.postUpdate`: the sprites follow their bodies (`physics_post`);
7. the render, whose positions the next preUpdate reads (`physics_draw`).

What Phaser 1.1.3 does there, and the port copies:

- **Tweens start late.** `TweenManager` adds a new tween after its pass
  over the tweens. A tween started in an update (frame k) first moves in
  frame k+2; started in a create, in frame 2; started by another one that
  ends, in the next frame. `Motion` waits for the next `:rl.frame` before
  it moves.
- **Bodies are one frame behind their sprites.** A body takes the position
  of its sprite from the world transform of Pixi, which the render of the
  last frame computed, and which is a `Float32Array`. A sprite moved by a
  tween collides where it was drawn in the last frame; the position is
  rounded to a 32-bit float.
- **Bodies of rotated sprites are not of the size of their frame.**
  `Sprite.updateCache` takes the scale from that transform,
  `sqrt(a00^2 + a01^2)`, which is not exactly 1 when the sprite is rotated
  (32.0000007 for a frame 32 wide), and `Body.updateBounds` sizes the body
  with it. Without this, a hit in Run! came one frame late.
- **Out of the world.** `outOfBoundsKill` tests the bounds of the sprite
  (its frame, rotated, from the same transform) against the world, with
  `Rectangle.intersects`, which is strict. `phs_bounds` repeats the
  arithmetic of `Sprite.updateBounds` and `getLocalPosition`.
- **Overlap.** `physics.overlap` goes through a quadtree, which never loses
  a pair (a body over two quadrants is tested against all of them), so it
  is the test of the boxes of the live bodies, as `Rectangle.intersects`.
  A body enters the quadtree in its preUpdate: a sprite reset in an update
  collides from the next frame on.
- **States start at once.** `state.start` in 1.1.3 runs the `create` of the
  next state inside the call: Over starts in the frame of the hit, inside
  the update of Play, and its clock (800 ms) starts there.
- **New keys in each state.** `createCursorKeys` makes new `Key` objects,
  which are up until a new `keydown`. A key held from Over into Play is up
  in Play until it is pressed again. In a browser, the repeat of the
  keyboard sends new `keydown` events after about half a second; the
  harness sends none. `Cursor()` in the port counts only the keys pressed
  after it was made.
- **Speed.** A body moves by `velocity * physicsElapsed`, where
  `physicsElapsed` is the time between two frames, in seconds, from the
  clock of Phaser (0 in frame 1). `updateMotion` applies half of the change
  of velocity before the move and half after; gravity is added to the
  velocity in each frame, not scaled by the time (12 a frame in Box Jump).
- **The camera.** A sprite's transform is relative to the camera
  (`f32(x - camera.x)`, in the render), and a body reads its position back
  with the camera of the time it reads it (`camera.x + transform`): when the
  camera shakes, the bodies shift with it. Setting `camera.x` keeps it in
  the bounds of the world and floors it.
- **Input when a state starts.** `World.destroy`, called when a state
  starts, calls `input.reset`: all keys up (`keyboard.isDown`), the
  pointer up, and the camera back at 0. A key or a button held from the
  state before counts only once pressed again: the click that ends the
  last screen of Connected is not a press in the next game. A screen of a
  port calls `input_reset()` when it starts, and reads the keys and the
  pointer with `key_down`, `pointer_down`, or `Cursor`.
- **Traces.** `Number.toFixed` rounds a tie up (3.375 gives "3.38");
  `printf` rounds it to even. `eng.fixed` does as JavaScript.
- **Angles.** A sprite keeps its rotation in radians; `angle` is wrapped to
  [-180, 180) when set and when read, and `postUpdate` sets it again from
  the rotation of the body in each frame. The port keeps the rotation, with
  the same arithmetic (`angle_get`, `angle_set`).
- **Collide.** `physics.collide` of two sprites is `separateX` or else
  `separateY` (only one axis per call), with `OVERLAP_BIAS` 4; it sets
  `touching`, which `preUpdate` clears in each frame.
- **Particles.** The emitter emits in `particles.update`, after the
  sprites and bodies of the frame updated: a new particle neither moves
  nor ages in its first frame. Its speeds and spin come from `game.rnd`,
  Phaser's own generator (`RandomDataGenerator`), which Phaser seeds when it
  boots with one draw of `Math.random`, as a string: the port has the
  generator and `Number.prototype.toString`, checked against the source of
  Phaser in node.

## 1. Run!

The same as the original on its three runs, line by line (`tst/run/`):

| Run | Frames | Seed | Input | Games |
|-----|-------:|-----:|-------|------:|
| `play` | 900 | 7 | the four arrows, a hit, UP before 800 ms (ignored), UP after, a second and a third game | 3 |
| `idle` | 600 | 1 | none | 1 |
| `random` | 2400 | 5 | arrows pressed at random (Python's generator, seed 11) | 8 |

Trace: frame, state, score; in Play, the player (x, y), and the enemies
alive: their number, and the sums of their x and of their y.

The screens of `play` (frames 1, 60, 300, 464, 600, 700), side by side
(`tools/compare.sh run play`): the sprites are at the same pixels; the
rows of the text are the same; the glyphs are drawn by another rasterizer.

What is not compared:

- The order in which the enemies are drawn: Phaser draws the group of the
  first kind, then the other, each in the order of its slots, which are
  recycled; the port draws them in the order of its pool. It shows only
  where two enemies cross.
- The sound (no device in the container).

- **Tweens: delays, relative values, chains.** `delay` places the start of
  a tween in its own timeline (`startTime = now + delay`): `Motion` takes it
  as an argument, since an `await` before it would start the tween in a
  later frame. A value given as a string (`"-20"`) is relative to the value
  at the start. A chain (`.to().to()`) starts the next tween in the pass of
  the tweens, so it first moves in the next frame: an `await Motion` after
  another does the same.
- **Buttons.** A button calls its callback when the mouse is released over
  it, in the DOM event, before the next frame: the state it starts runs its
  first update in that frame. The port awaits `:rl.mouse.up`, which comes
  before `:rl.frame` in the frame of the input.

## 2. Pixel War

The same as the original on its two runs, line by line (`tst/pixel_war/`):

| Run | Frames | Seed | Input | Games |
|-----|-------:|-----:|-------|------:|
| `play` | 2400 | 4 | UP held to fire, released now and then, LEFT and RIGHT at random (Python's generator, seed 2) | 3 |
| `dodge` | 3600 | 8 | UP held, pressed again every 300 frames, short moves at random (seed 17) | 6 |

Trace: frame, state, score; in Play, the lives, the evolution, the player
(x, y), the enemies alive (how many, the sums of x and of y), and how many
fires, bullets, bonuses, and particles exist.

What it took, besides the rest of this document:

- **Groups.** The four groups are slots, recycled with
  `getFirstExists(false)`, each sprite keeping its state from life to life
  (`Group` in `lib/physics.atm`). The first enemy of each slot dies in the
  frame after it is born: `inWorld` comes true from the constructor, and the
  enemy is born out of the world.
- **The order of the overlaps.** `overlap(fires, enemies)` goes through the
  fires in the order of their slots and, for each, through the enemies in
  the order of the quadtree; a fire killed by a hit still hits the other
  enemies it overlaps in that frame. The emitter goes to the last one.
- **The last life.** Over starts inside the callback of the hit, with the
  score of that moment; the rest of the update of Play still runs, and a
  fire that hits an enemy in that frame still adds to the score (seen in
  `dodge`: Over shows 10, the score is 20).
- **A key that fires every 300 ms.** The time is tested in the same update
  as the key: after `await Wait(300)`, the port tests UP at once, and only
  awaits it if it is up.

## 3. Box Jump

The same as the original on its two runs, line by line (`tst/box_jump/`):

| Run | Frames | Seed | Input | Reaches |
|-----|-------:|-----:|-------|---------|
| `periodic` | 1800 | 1 | SPACE for 3 frames every 40 frames | level 2, 19 deaths |
| `random` | 3600 | 9 | SPACE at random (Python's generator, seed 3) | level 4, 37 deaths |

Trace: frame, state, level, deaths; in Play, the player (x, y, angle,
velocity), if it touches down, if it is alive, the cubes alive, and the
particles that exist.

What is not compared:

- The screen `End`: no run gets through the twenty levels.
- The angle of a particle that Phaser recycles: `reset` does not reset its
  rotation, so a recycled particle starts at the angle where it died; in
  the port each particle starts at 0. It shows only in the screens, for
  the 300 ms of a burst; the trace does not have particles' angles.
- A rotation of an earlier jump that is still running when the player
  starts again: Phaser pauses only the last one, and so does the port, but
  no run has two jumps 700 ms apart with a death in between.

## 4. Man vs Penguins

The same as the original on its two runs, line by line
(`tst/man_penguins/`):

| Run | Frames | Seed | Input |
|-----|-------:|-----:|-------|
| `play` | 3600 | 5 | UP on the menu; the arrows at random, overlapping (Python's generator, seed 4) |
| `jumpy` | 4800 | 11 | many jumps, and LEFT and RIGHT at random (seed 14) |

Trace: frame, state; in Play, the score, the best score, the man (x, y,
velocity, alive, the count of the jump), the penguins that exist (how many,
alive, sums of x and y), the coin (x, y), and the camera (x, y).

What it took: `collide` of a sprite with a group, and of a group with a
group, in the order of the quadtree; the world wider than the screen
(`setBounds(-50, -50, 800, 800)`); flipped sprites, whose `width` is
negative in Phaser and whose body is not; the corners of the bounds
(`bottomRight.y < topRight.y + 10` decides a jump on a penguin); the camera;
and the arithmetic of the minified `updateMotion`.

## 8. Save the City

The same as the original on its two runs, line by line
(`tst/save_the_city/`):

| Run | Frames | Seed | Input | Reaches |
|-----|-------:|-----:|-------|---------|
| `type` | 982 | 1 | two sentences and a part of the third, a letter every 4 frames; the click on the button; a part of the first sentence again | the city gone, a restart |
| `fast` | 1180 | 2 | four sentences typed at random (Python's generator, seed 5): keys a frame apart, wrong keys | the city gone |

Trace: frame, state, the sentence, the letter, the score, the bomb (y,
velocity), if the city is gone, the letters alive, the alpha of the
tutorial, and the frame of the city.

The text is drawn in Liberation Mono for Courier, as the browser does; the
line heights are measured the same.

What the original does, and the port keeps: while the second letter of
the first sentence is the next one, each update starts a new tween of the
alpha of the tutorial (`if (this.level == 1 && this.i == 1)`), so a few of
them run at once, the last one winning.

## 9. I Hate Rabbits

The same as the original on its two runs, line by line
(`tst/i_hate_rabbits/`):

| Run | Frames | Seed | Input | Games |
|-----|-------:|-----:|-------|------:|
| `play` | 3500 | 3 | SPACE on the menu, then at random (Python's generator, seed 9) | 2 |
| `fast` | 5700 | 6 | SPACE very often (seed 21), also while the rabbits come in | 3 |

Trace: frame, state, score, level, best score; in Play, the angle of the
bad one, and the rabbits alive (how many, the sums of x, y, and alpha).

The jumps are callbacks of SPACE (`onDown`), in the event of the key: the
port awaits `:rl.key.dn`, which comes before the frame, and draws the vowel
of the jump from `Math.random` there, as the original.

The text that pulses (a tween of the scale of a text) is drawn larger by
raylib, where Pixi scales the picture of the text: the same size, drawn
differently.

## 7. Connected

The same as the original on its two runs, line by line (`tst/connected/`):

| Run | Frames | Seed | Input | Games |
|-----|-------:|-----:|-------|------:|
| `play` | 5277 | 2 | the two dots of the menu; paths of 1 to 4 steps from a dot at random (Python's generator, seed 7) | 1 (8 moves) |
| `pairs` | 7756 | 12 | pairs of neighbor dots at random (seed 70), until the 20 moves, the end, a click | 2 |

Trace: frame, state, score; in Play, the moves, the dots selected, the
type of the move, the width of the bar, and the dots alive (how many, the
sums of their frames, of their y, and of their scale).

What it took: the pointer polled in each update (`activePointer.isDown`,
`Rectangle.contains` of a body, with its edges); a tween of `width`, which
Phaser turns into a scale; the reset of the input when a state starts
(above); the emitter of End, which emits every 200 ms for ever. The best
score is kept in `localStorage` by the original; the port keeps it in
memory (each run of the harness starts with an empty storage, so the runs
are the same).
