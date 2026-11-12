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
| `score` (global) | data, passed from Play to Over through a global | the value that `Play` returns, which `Over` receives |
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
