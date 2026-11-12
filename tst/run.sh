#!/bin/sh
# Runs the tests of the port with no screen. Needs tools/setup.sh first.
#
#   tst/run.sh            all tests
#   ASAN=1 tst/run.sh     with the address sanitizer
#
# The originals in the browser have their own test: tst/originals.sh.

cd "$(dirname "$0")/.."
ROOT=$(pwd)
OUT="$ROOT/out/tst"
mkdir -p "$OUT"
FAIL=0

ok ()   { echo "ok   $1"; }
fail () { echo "FAIL $1"; FAIL=1; }

# the environment
tools/atmos.sh tst/env/hello.atm "$OUT/hello" || fail "hello (build)"
(cd "$OUT" && RL_FRAMES=70 RL_SHOT=2:hello.png ./hello 2>/dev/null) > "$OUT/hello.out"
if diff -u tst/env/hello.out "$OUT/hello.out" && cmp -s tst/env/hello.png "$OUT/hello.png"; then
    ok hello
else
    fail hello
fi

# the engine: random, images, text (run from the root, as the games)
tools/atmos.sh tst/env/engine.atm "$OUT/engine" || fail "engine (build)"
RL_FRAMES=2 RL_SHOT=1:"$OUT/engine.png" "$OUT/engine" 2>/dev/null > "$OUT/engine.out"
if diff -u tst/env/engine.out "$OUT/engine.out" && cmp -s tst/env/engine.png "$OUT/engine.png"; then
    ok engine
else
    fail engine
fi

exit $FAIL
