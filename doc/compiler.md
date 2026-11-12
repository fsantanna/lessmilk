# The compiler

What this port found in the compiler `fsantanna/ceu-atmos` (branch `main`,
at `9ec67ec` when these were written), reported to the session that
maintains it. Nothing here blocked the port.

## Semantics the port relies on

1. **The order in which tasks awake on the same event.** The tasks in a
   pool (or nested in a task) awake before the body of the task that holds
   them: in a test (`tst/lang/order.atm`),
   a task in the pool of `E` received an event before the body of `E`. Box
   Jump depends on it: a task spawned by `Play` and awaiting `:update`
   awoke before the body of `Play`, which did `collide` in the same
   `:update`, and so read `touching.down` before it was set. The port now
   keeps the steps that depend on each other in one task, in order, and
   uses the phases of `lib/game.atm` (`:pre`, `:particles`, `:update`,
   `:overlap`) between tasks. The manual does not say this order. Is it
   guaranteed?
2. **A task that starts during an emit does not receive it.** Checked
   (`tst/lang/order.atm`): a
   task spawned in a pool during an emit of `:X` awoke on the next `:X`
   only. The port relies on it (`Motion`, the particles). The manual does
   not say it.

## Friction

3. **`$x` in a native literal is a variable only.** `` `f($img.id)` `` fails
   in the C compiler (`'AVal' has no member named 'id'`), not in Atmos:
   the field must go through a local first (`val id = img.id`). An error
   from Atmos, or `$img.id` read as a field, would help.
4. **A native literal in single back quotes may not span lines.** The
   error is `unterminated native` at the line of its start, which is right;
   the long calls of the engine use one line each, or a block in triple
   back quotes.
5. **A table cannot refer to itself in its constructor.** In
   `val eng = [ f = func () { eng.x } ]`, `eng` is not declared in the
   body of `f` (as in Lua with `local`). The engine declares the constant
   before the table. Not a bug; noted because the student's modules did it
   in the reference Atmos with globals.

6. **`math.atan(y, x)` ignores its second argument.** `math.atan(1, 2)` is
   `0.785...` (the angle of 1), with no error; in Lua 5.4, which the manual
   follows for `math`, it is the angle of the point `(2, 1)`, `0.4636...`.
   The student's code used it so. `math.atan2(y, x)` is right. Either
   accept the second argument as Lua does, or reject it.

7. **Aborting the tasks of a pool while iterating over it skips some.**
   `loop _, t in ts { abort t }` over a pool of two tasks aborted the first
   (`tst/lang/pool.atm`)
   only: the second was skipped, as when an element is removed from a list
   that is being iterated. `abort ts` aborts all of them, and the pool can
   be used again (Box Jump does this between levels). An error, or an
   iteration that tolerates the removal, would help.
8. **A pinned task cannot go in a variable that a function captures.**
   `set rotation = spawn @rotations Motion(...)` inside a `val func`, with
   `rotation` a `var` of the enclosing task, is `invalid escape : pinned
   value` at run time. Box Jump keeps a control table in the variable
   instead (`Motion` takes `ctl`, whose `stop` pauses it). The rule is in
   the manual; the message could name the variable.

## Pitfalls met again

9. **A spawn inside an `if` dies with the block** (also in the list of the
   Pingus port). The task of the trace was spawned inside
   `if os.getenv("RL_FRAMES") { spawn {...} }` and printed nothing; it
   tests inside the task now.

## Checks

- Run! built with `ATMOS_ASAN=1` runs its three runs (3900 frames, 12
  games) with no error and no leak, and the same traces. `ASAN=1
  tst/run.sh` fails when a run exits with an error.
