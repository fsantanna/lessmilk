#!/bin/sh
# Builds an Atmos program over env/raylib.atm:
#
#   tools/atmos.sh <file.atm> <out>
#
# with the compiler and the raylib of tools/setup.sh. ASAN=1 builds with the
# address sanitizer.

ROOT=$(cd "$(dirname "$0")/.." && pwd)
RL="$ROOT/ext/raylib"
[ -n "$ASAN" ] && export ATMOS_ASAN=1
ATMOS_HOME="$ROOT/ext/ceu-atmos" \
ATMOS_CFLAGS="${ATMOS_CFLAGS:--O2} -I$RL/src" \
ATMOS_LDFLAGS="$RL/build-mem/libraylib.a -lm -lpthread -ldl" \
    "$ROOT/ext/ceu-atmos/atmos" -o "$2" "$1"
