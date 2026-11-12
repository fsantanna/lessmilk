# From the reference Atmos to this compiler

The student's port (`jessicacoliveira/atmos-lessmilk@3e24458`) is written
in the reference Atmos 0.8 over `pico-sdl` 0.7; this port, in the compiler
`fsantanna/ceu-atmos` over raylib. This is what changed in practice, game
by game. The task structure carries over almost as it is; the libraries,
the indexes, and the units change everywhere.

## What changes in every game

| Reference Atmos (student) | This compiler (port) |
|---------------------------|----------------------|
| `require "atmos.env.pico"`, `val pico = require 'pico'` | `include "../../lib/game.atm"`, which includes `env/raylib.atm` |
| a file per task, ending in the task (`Enemy`), loaded with `val Enemy = require "enemy"` | `include "enemy.atm"`: the declarations of the file are visible after it; no value is returned |
| `set ROBOT = [...]` in `consts.atm`: a global made by assignment | `val`: a variable must be declared; `set X = 10` is the error `invalid set : expected mutable variable` |
| indexes from 1: `enemies_layers@1`, `math.random(1, 4)` for one of four | indexes from 0: `IMG_ENEMY@0`; one of four is `eng.rand(4)`, as in the original |
| coordinates in percentages of the window (`[ '%', x=0.5, ... ]`) | pixels, as in the original |
| `pico.output.draw.*` on `:draw`, layers, `pico.push/pop` per screen | `rl.*` and `eng.*` on `:rl.draw`; each screen draws in its own task, which ends with the screen |
| `:key.dn [key=:Up]` events | `rl.key_down('UP')`, polled in `:update`, as the original polls `isDown`, through `Cursor()` |
| `math.random()` of Lua, `math.randomseed()` | `eng.random()`, the generator of the harness, seeded by `RL_SEED` |
| `math.atan(vy, vx)`, the angle of a point in Lua 5.4 | `math.atan2(y, x)`: `math.atan` here takes one argument and ignores a second one, with no error |
| `math.deg` | absent: `* 180 / math.pi` |
| `loop us on :clock` integrating positions (`x += v * dt`) | the same construct exists, but positions come from the clock of Phaser (`eng.now()`), so that they are the same as the original's |

## 1. Run!

- The student's flow carries over: a `loop` of `Play` then the end screen,
  `Play` returning the score; an enemy as a task in a pool, which ends when
  it leaves the screen (`watching until out_of_screen()` there,
  `await :pre until !in_world(spr)` here).
- What the reference port did in its own way, and the port now does as the
  original:
    - the enemies move at a constant velocity from side to side in 3 s;
      here, by a tween of 3000 ms toward the point drawn by the original,
      in `Motion`;
    - the robot moves while a key is held, with the key of the last
      `:key.dn`; here, by the order of the original in each update (LEFT,
      then RIGHT, then UP, then DOWN), as a body with a velocity, which
      stays in the world;
    - the collision is tested by `pico.vs.rect.rect` of every enemy in each
      frame, with `emit @player :dead`; here, as `physics.overlap` of
      Phaser 1.1.3 at the end of the update (`:overlap`), with the bodies a
      frame behind their sprites;
    - the end screen accepts UP at once; the original waits 800 ms, which
      is `await Wait(800)` here.
- The robot was a task of its own (`robot.atm`), which ended on `:dead`;
  here the player is part of `Play`, whose end is the hit: the original has
  no separate life for the player.

## 2. Pixel War

- The student's version is one file (`main.atm`, 345 lines), with a task per
  enemy, fire, bullet, and bonus, each ending when it leaves the screen or
  is hit; the collisions are tested by each task, or by loops over the
  pools.
- The port keeps the groups of the original as slots (`Group`), since what
  a recycled sprite keeps shows in the game (see state.md); the life of an
  enemy is the time its slot exists, not a task. The four timers become
  four loops with `await Wait(...)`, as in her version.
- Her collisions are tested every frame by the tasks; here they are the
  overlaps of Phaser at the end of the update, in their order, with the
  quadtree of the frame.

## 3. Box Jump

- The student's version is one file (`main.atm`, 233 lines), with a task per
  cube, a task per particle (`HitAnimation` and `Particle`), and a block per
  level that pins its own pool of cubes: `loop j in #levels { pin cubes =
  tasks(20) ... }`. The level ends when its block ends, which is the most
  direct form of the lifetime of a level.
- The port keeps the cubes and the particles as tasks, but changes the level
  in the middle of the update, as the original does (`loadLevel` when the
  player passes `w - 60`), since the rest of that update (gravity, the test
  of the fall) runs in the same frame with the new level: `abort cubes` and
  new spawns in the same pool.
- Her jump is `await` of SPACE, a rise and a fall computed from the clock,
  and `await until player.y >= floor_y`; the original's jump is a velocity
  and a gravity of the arcade physics, with `collide` against the line and
  `touching.down`, which the port now has in `lib/physics.atm`.
- Her particles have their own random speeds; here they are those of the
  emitter, from `game.rnd`, so that they are the same as the original's.

## 4. Man vs Penguins

- The student's version (`modular/`, 501 lines) has a task per entity
  (`Man`, `Penguin`, `Coin`), its own collisions with the map
  (`collision.atm`), and a shake of its own.
- The port keeps the physics of the original: bodies with gravity,
  `collide` with the bricks, and the overlaps of Phaser, since the game is
  the jumps and the falls that they give; the penguins are a group of 40
  recycled sprites, and the camera shakes as Phaser's.

## 8. Save the City

- The student's version has a task per letter as well (`letter.atm`), and
  the bomb as a task; the end screen is a separate task (`End(score)`).
  The port keeps the letter as a task, and the end as the rest of `Play`,
  after the loop of the update, as the original does it in the same state.
- Her delays are `await (delay * 1ms)` and then `Motion.linear`; here, the
  delay is part of the tween (`Motion(..., delay)`), since Phaser counts the
  tween from `now + delay` and an `await` starts it a frame later.
- Her letters fly with `Motion.linear` to the bomb; the original's fly with
  a tween of `length * 3` ms, where `length` is the distance to the bottom
  of the screen, which the port keeps.

## 9. I Hate Rabbits

- The student's version (`modular/`, 349 lines) has a task per rabbit,
  which comes in, jumps, and fades, with `await Motion.linear` of its
  radius; the levels are `await until (bad.pub.angle >= 360*i)`, which
  counts the turns of the bad one in an angle that is never wrapped.
- The original wraps the angle (`sprite.angle` is in [-180, 180)) and
  changes the level when it is near 0, with the flag `change_level`: the
  port keeps that test, with the angle wrapped as Phaser wraps it.
- Her jump awaits SPACE inside the rabbit; here, as in the original, SPACE
  picks the first rabbit of the circle that has not jumped, in the event of
  the key, and the rabbit is a slot of a group, as in the original.
