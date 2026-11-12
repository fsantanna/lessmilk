#!/bin/sh
# Fetches and builds, in ext/ (ignored by git), what the port needs:
#
#   ext/originals     a copy of lessmilk.com (leokaplan/lessmilk): the original
#                     games in www.lessmilk.com/games/<n>/, with the assets of
#                     assets/<n>/ copied next to them, and Phaser
#   ext/student       the first port to Atmos (jessicacoliveira/atmos-lessmilk)
#   ext/ceu-atmos     the Atmos compiler (branch main): ext/ceu-atmos/atmos
#   ext/raylib        raylib 6.2 with env/raylib.patch (the test mode), built
#                     for the platform with no screen:
#                     ext/raylib/build-mem/libraylib.a
#
# It may run again: what is already there is kept, and only rebuilt.

set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)
mkdir -p ext

RAYLIB_TAG=6.2
ORIGINALS_REV=bf5ef89
STUDENT_REV=3e24458

clone () {  # <repo> <dir> [rev]
    if [ ! -d "ext/$2" ]; then
        git clone -q "https://github.com/$1" "ext/$2"
        [ -n "$3" ] && git -C "ext/$2" checkout -q "$3"
    fi
    return 0
}

clone leokaplan/lessmilk             originals $ORIGINALS_REV
clone jessicacoliveira/atmos-lessmilk student   $STUDENT_REV
clone fsantanna/ceu-atmos            ceu-atmos

make -s -C ext/ceu-atmos >/dev/null

if [ ! -d ext/raylib ]; then
    git -c advice.detachedHead=false clone -q --depth 1 --branch $RAYLIB_TAG https://github.com/raysan5/raylib ext/raylib
fi
if ! git -C ext/raylib apply --check --reverse "$ROOT/env/raylib.patch" 2>/dev/null; then
    git -C ext/raylib apply "$ROOT/env/raylib.patch"
fi
mkdir -p ext/raylib/build-mem
make -s -C ext/raylib/src PLATFORM=PLATFORM_MEMORY CUSTOM_CFLAGS=-O2 \
    RAYLIB_RELEASE_PATH="$ROOT/ext/raylib/build-mem" -j4 >/dev/null 2>&1 \
    || { echo "setup: raylib failed to build" >&2; exit 1; }

# the originals load their assets from next to them: the copy of the site
# has them only for games 1 and 2
for n in $(seq 1 12); do
    cp -r assets/$n/. ext/originals/www.lessmilk.com/games/$n/
done

echo "setup: ok"
