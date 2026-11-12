# The Lessmilk games in Atmos

A port of the twelve games of Thomas Palef's challenge "12 games in 12 weeks"
([lessmilk.com][lessmilk], 2014, JavaScript over Phaser 1.1.3) to
[Atmos][atmos], over [raylib][raylib], through the environment `raylib.atm` of
[fsantanna/raylib][rlatm].

The goal is a study: every state of Phaser, every tween chained by callbacks,
every comparison with the clock in `update`, and every flag becomes a task, an
`await`, or a block. The port must stay the same game: the same screens at the
same frames, with the same seed and the same input.

[lessmilk]: http://www.lessmilk.com/12games
[atmos]:    https://github.com/fsantanna/ceu-atmos
[raylib]:   https://github.com/raysan5/raylib
[rlatm]:    https://github.com/fsantanna/raylib

## Credits

- **The games**, their code, images, and sounds, are by
  [Thomas Palef](https://twitter.com/thomaspalef) (lessmilk.com, 2014).
  The images and sounds in `assets/` are his, copied from a copy of the site
  kept in [leokaplan/lessmilk](https://github.com/leokaplan/lessmilk); they are
  not covered by the license of this repository.
- **The first port to Atmos**, from which this one starts (its task structure,
  its modules `motion.atm` and `particles.atm`, and its analysis of each game),
  is by Jéssica Oliveira:
  [jessicacoliveira/atmos-lessmilk](https://github.com/jessicacoliveira/atmos-lessmilk)
  (commit `3e24458`), over the reference Atmos and `pico-sdl`.

| # | Game |
|---|------|
| 1 | Run! |
| 2 | Pixel War |
| 3 | Box Jump |
| 4 | Man vs Penguins |
| 5 | Fill the Holes |
| 6 | Princess Quest |
| 7 | Connected |
| 8 | Save the City |
| 9 | I Hate Rabbits |
| 10 | Dark Blue |
| 11 | The Three Hearts |
| 12 | Crazy Snake |

## Build, run, test

```sh
tools/setup.sh                              # ext/: the compiler, raylib, the originals
tools/atmos.sh games/run/main.atm out/run   # builds a game
out/run                                     # plays it, from the root of the repository
tst/run.sh                                  # the tests, with no screen (ASAN=1 too)
tools/compare.sh run play                   # a run on the original and on the port
```

The originals run in Chromium with no screen, stepped by hand
(`tools/original/`, with Playwright), so that a run of the port and of the
original can be compared line by line. See [doc/fidelity.md](doc/fidelity.md).

## State

| # | Game | Port | Same as the original |
|--:|------|------|----------------------|
| 1 | Run! | `games/run` | yes, 3 runs |
| 3 | Box Jump | `games/box_jump` | yes, 2 runs |
| 8 | Save the City | `games/save_the_city` | yes, 2 runs |

Documents: [table](doc/table.md), [state variables](doc/state.md),
[fidelity](doc/fidelity.md), [compiler](doc/compiler.md),
[from the reference Atmos](doc/from-reference.md), and one per game in
[doc/games/](doc/games/).

## License

The code of the port is under the MIT license (see [LICENSE](LICENSE)).
The assets in `assets/` are Thomas Palef's (see Credits).
