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
