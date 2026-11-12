# env

The raylib environment for Atmos, written by the port of the raylib games,
copied at a fixed commit so that its changes do not break this port:

| File | From | Commit |
|------|------|--------|
| `raylib.atm` | [fsantanna/raylib](https://github.com/fsantanna/raylib) `raylib.atm` | `4360cb2` |
| `raylib.patch` | [fsantanna/raylib](https://github.com/fsantanna/raylib) `tools/raylib.patch` | `4360cb2` |

`raylib.patch` adds a test mode to raylib 6.2 built for its platform with no
screen (`RL_FRAMES`, `RL_SEED`, `RL_INPUT`, `RL_SHOT`). What this port adds
or fixes here is sent back to that repository, so that there is one
environment.
