# The compiler

What this port found in the compiler `fsantanna/ceu-atmos` (branch `main`,
at `9ec67ec` when these were written), reported to the session that
maintains it. Nothing here blocked the port.

## Questions: semantics the port relies on

1. **The order in which tasks awake on the same event.** The port relies on
   tasks awaking in the order they were spawned: the task `Game`, spawned
   first, does all of a frame of Phaser in its reaction to `:rl.frame`
   before the task that prints the trace, spawned after it. The manual
   does not say it. Is it guaranteed?
2. **A task that starts during an emit does not receive it.** `Motion`
   started in the reaction to `:update` (inside the reaction to
   `:rl.frame`) awaits `:rl.frame` and awakes in the next frame, not in the
   current one; a screen that starts in `:update` first awakes in the
   `:update` of the next frame. This is what Céu does, and what the port
   needs. The manual does not say it either.

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

## Pitfalls met again

6. **A spawn inside an `if` dies with the block** (also in the list of the
   Pingus port). The task of the trace was spawned inside
   `if os.getenv("RL_FRAMES") { spawn {...} }` and printed nothing; it
   tests inside the task now.

## Checks

- The suite runs with `ATMOS_ASAN=1` with no error and no leak
  (`ASAN=1 tst/run.sh`), including 2400 frames of Run! with 8 games.
