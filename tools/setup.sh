#!/bin/sh
# Fetches and builds, in ext/ (ignored by git), what the port needs:
#
#   ext/originals     a copy of lessmilk.com (leokaplan/lessmilk): the original
#                     games in www.lessmilk.com/games/<n>/, and Phaser 1.1.3
#   ext/student       the first port to Atmos (jessicacoliveira/atmos-lessmilk)
#   ext/ceu-atmos     the Atmos compiler (branch main): ext/ceu-atmos/atmos
#
# It may run again: what is already there is kept, and only rebuilt.

set -e
cd "$(dirname "$0")/.."
mkdir -p ext

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

echo "setup: ok"
