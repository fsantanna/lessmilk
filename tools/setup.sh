#!/bin/sh
# Fetches and builds, in ext/ (ignored by git), what the port needs:
#
#   ext/originals     a copy of lessmilk.com (leokaplan/lessmilk): the original
#                     games in www.lessmilk.com/games/<n>/, with the assets of
#                     assets/<n>/ copied next to them, and Phaser
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

# the originals load their assets from next to them: the copy of the site
# has them only for games 1 and 2
for n in $(seq 1 12); do
    cp -r assets/$n/. ext/originals/www.lessmilk.com/games/$n/
done

echo "setup: ok"
