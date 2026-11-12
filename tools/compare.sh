#!/bin/sh
# Runs a run on the original (in the browser) and on the port, and compares
# their traces line by line; the screens of SHOTS are saved side by side.
#
#   tools/compare.sh <game> <run>       e.g. tools/compare.sh run play
#
# <game> is a directory of games/ and of tst/; its number is in tst/<game>/N.
# Results in out/compare/<game>/<run>/: orig.out, port.out, side-<f>.png.

set -e
cd "$(dirname "$0")/.."
g=$1; r=$2
n=$(cat tst/$g/N)
O=out/compare/$g/$r
rm -rf $O; mkdir -p $O/orig $O/port
FRAMES=600; SEED=1; INPUT=; SHOTS=
. tst/$g/$r.run

node tools/original/run.js $n tst/$g/$r.run $O/orig > $O/orig.out 2> $O/orig.err

tools/atmos.sh games/$g/main.atm out/$g
shots=$(for f in $SHOTS; do printf "%s:$O/port/%s.png," $f $f; done)
RL_FRAMES=$FRAMES RL_SEED=$SEED RL_INPUT=$INPUT RL_SHOT=${shots%,} out/$g > $O/port.out 2> $O/port.err

python3 - "$O" $SHOTS <<'PY'
import sys
from PIL import Image
o = sys.argv[1]
for f in sys.argv[2:]:
    a = Image.open(f"{o}/orig/{f}.png").convert('RGB')
    b = Image.open(f"{o}/port/{f}.png").convert('RGB')
    s = Image.new('RGB', (a.width + b.width + 10, max(a.height, b.height)), 'gray')
    s.paste(a, (0, 0)); s.paste(b, (a.width + 10, 0))
    s.save(f"{o}/side-{f}.png")
PY

if cmp -s $O/orig.out $O/port.out; then
    echo "compare: $g $r: the same ($(wc -l < $O/orig.out) frames)"
else
    echo "compare: $g $r: the first difference:"
    diff $O/orig.out $O/port.out | head -4
    exit 1
fi
