# The games, one row each

- **Lines** and **tokens**: of code, counted by `tools/count.py` (no blank
  lines, no comments; in Atmos, no trace). JavaScript: all the files of the
  game in `js/` (states, boot, loading). Atmos: `games/<game>/`, without the
  shared modules of `lib/` (647 lines and 5007 tokens for now), which do
  what Phaser did.
- **Control**: the variables of the JavaScript that only control the flow
  (timestamps compared with the clock, flags, states), and how many are left
  in the port. The list is in [state.md](state.md).
- **Runs**: scripted runs, and whether the port is the same as the original
  on all of their trace lines ([fidelity.md](fidelity.md)).
- **Memory** and **CPU**: in [bench.md](bench.md), once measured.

| # | Game | Phaser | Lines JS | Lines Atmos | Tokens JS | Tokens Atmos | Control JS | Control left | Runs | Same |
|--:|------|--------|---------:|------------:|----------:|-------------:|-----------:|-------------:|-----:|------|
| 1 | Run! | 1.1.3 | 144 | 139 | 1502 | 1014 | 4 | 0 | 3 (3900 frames, 12 games) | yes |
| 3 | Box Jump | 1.1.3 | 185 | 207 | 2746 | 2275 | 3 | 2 | 2 (5400 frames, levels 1 to 4, 56 deaths) | yes |
