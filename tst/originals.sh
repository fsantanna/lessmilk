#!/bin/sh
# Runs tst/originals/smoke.run on every original in the browser and compares
# the trace with the stored one (tst/originals/<n>.out). UPDATE=1 stores it.
# Game 11 is skipped until its map is rebuilt (assets/README.md).

cd "$(dirname "$0")/.."
OUT=out/originals
mkdir -p $OUT
fail=0
for n in 1 2 3 4 5 6 7 8 9 10 12; do
    node tools/original/run.js $n tst/originals/smoke.run $OUT/$n > $OUT/$n.out 2> $OUT/$n.err \
        || { echo "originals: $n failed (see $OUT/$n.err)"; fail=1; continue; }
    if [ -n "$UPDATE" ]; then
        cp $OUT/$n.out tst/originals/$n.out
    elif ! cmp -s $OUT/$n.out tst/originals/$n.out; then
        echo "originals: $n differs:"; diff tst/originals/$n.out $OUT/$n.out | head -5; fail=1
    fi
done
[ $fail = 0 ] && echo "originals: ok"
exit $fail
