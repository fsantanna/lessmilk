# State variables

For each game, every variable of the JavaScript that lives across frames
(fields of `this` in a state, and globals) and what became of it in the
port. Positions, scores, and what is drawn may stay; a variable that only
controls the flow (a timestamp compared with the clock in `update`, a flag
that guards a phase, the current state) should become an `await`, a block,
or a task.

## 1. Run!

| JavaScript | Kind | Port |
|------------|------|------|
| `w`, `h` | constant | `W`, `H` |
| `score` (global) | data, passed from Play to Over through a global | the value that `Play` returns, which `Over` receives as an argument; it is still a global of the port, which `Play` sets, so that the trace reads it in each frame |
| `this.enemyTime` (Play) | control: the time of the next enemy, compared with `game.time.now` in each update | `await Wait(500)` in the loop of the enemies |
| `this.scoreTime` (Play) | control: the time of the next point | `await Wait(1000)` in the loop of the points |
| `this.firstKey` (Play) | control: the label fades once, at the first UP | the sequence `await :update until UP` then `await Motion(...)`, which runs once |
| `this.time` (Over) | control: UP is ignored for 800 ms | `await Wait(800)` before awaiting UP |
| `this.player`, `this.labelScore`, `this.labelKeys` | drawn | locals of `Play` |
| `this.enemies1`, `this.enemies2` (groups of 30, recycled) | data | a pool of tasks, `enemies`: an enemy is a task, which ends when it leaves the world |
| `this.cursor` | input | `keys = Cursor()`, local to each screen |
| `this.hit_s` | a sound, never played | gone |
| `game.state.current` | control: the current state | the main `loop`, `Play` then `Over` |

Control: 4 in the JavaScript (`enemyTime`, `scoreTime`, `firstKey`, and
`time` of Over), 0 in the port. Left in the port for the trace only:
`screen`, which the game never reads.

## 2. Pixel War

| JavaScript | Kind | Port |
|------------|------|------|
| `w`, `h`, `this.playerY` | constant | `W`, `H`, `player_y` |
| `score` (global) | data, shown in Play and Over | `score`, a global of the port too |
| `this.lives`, `this.evolution` (Play) | data | locals of `Play` |
| `this.fireTime` (Play) | control: one fire every 300 ms while UP is down | the loop of the fires: UP, `fire()`, `await Wait(300)` |
| `this.enemyTime`, `this.bulletTime`, `this.bonusTime` (Play) | control: the time of the next enemy, bullet, bonus | three loops, each with its `await Wait(...)` |
| `this.time` (Over) | control: UP is ignored for 800 ms | `await Wait(800)` |
| `this.enemies`, `this.fires`, `this.bonuses`, `this.bullets` | groups of sprites, recycled | `Group`: the same slots, recycled the same way (see below) |
| `this.player`, `this.emitter`, labels | drawn | locals of `Play` |
| `this.cursor` | input | `keys = Cursor()`, in each state |

Control: 5 in the JavaScript, 1 left: `over` in Play, the score at the
moment of the last life, which ends the loop of the overlaps after the rest
of that frame (the original starts Over inside the callback, and the update
goes on).

The groups stay groups of slots. A sprite of Phaser keeps what it had in
its last life (its angle, the size of its body, `inWorld`), and the game
shows it: the first enemy of each slot is born out of the world with
`inWorld` true, from the constructor, and dies at once; a bonus turns from
the angle where its last one stopped. A task per life with a new sprite
would not be the same game.

## 3. Box Jump

| JavaScript | Kind | Port |
|------------|------|------|
| `w`, `h`, `map` | constant | `W`, `H`, `MAP` (`map.atm`) |
| `death` (global) | data: shown in Play and in End | `death`, a global of the port too |
| `this.level` (Play) | data: the level shown | `Box.level` |
| `this.start` (Play) | control: before the first jump, the player does not run | two loops in sequence: the update before the first jump, and after it |
| `this.rotation` (Play) | control: the tween of the last jump, paused when the player starts again | a table `ctl` given to `Motion`, kept in `rotation`, whose `stop` pauses it |
| `player.alive` | control: after a hit, no other hit until the player lands | the same flag: Phaser's `sprite.alive`, which also keeps the body out of the overlaps; set in the update, as in the original |
| `this.player`, `this.line`, `this.cubes`, labels | drawn | locals of `Play`; the cubes are tasks in a pool, aborted when the level changes |
| `this.emitter` | particles | an `Emitter` and its task (`lib/particles.atm`) |
| `this.spaceKey` | input | `keys = Cursor()` |
| `this.hit_s`, `this.jump_s` | sounds | `SND_HIT`, `SND_JUMP` |

Control: 3 in the JavaScript (`start`, `rotation`, `alive`), 2 left in the
port (`rotation`, now a control table rather than a tween, and `alive`, which
the physics reads).

## 8. Save the City

| JavaScript | Kind | Port |
|------------|------|------|
| `w`, `h`, `sentences` | constant | `W`, `H`, `SENTENCES` |
| `this.i` (Play) | data: the next letter to type | `Save.i` |
| `this.level` (Play) | data: the next sentence | `Save.level` |
| `this.score` (Play) | data | `Save.score` |
| `this.dead` (Play) | control: `update` returns at once after the end | the loop of the update ends (`until bomb.y > H - 115`), and the end follows it as a sequence |
| `this.keyReset` (Play) | control: a key fires one letter, and must be up before it fires another | `reset`, the same flag: an edge detector on a level, on a key that changes with `i` (see below) |
| `this.text`, `this.group_text` | drawn | a task per letter, in a pool: it appears, waits for its `:fire`, flies, and dies when it reaches the bomb |
| `this.s` | data: the current sentence | `s` |
| `this.city`, `this.bomb`, `this.tuto` | drawn | locals of `Play` |
| `exp`, `grp`, `dead`, `restart` (locals of `end` and `annimation_ended`) | drawn | locals of `Play`, after the loop |

Control: 2 in the JavaScript, 1 left. `keyReset` stays: the original tests
the key of the current letter in each update, and a key that goes down one
frame after the previous letter fired is not taken (it was still `reset`
from the letter before, with no frame up in between). An `await` of the
key press would take it, and the game would not be the same.
