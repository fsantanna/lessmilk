# 8. Save the City

Game #8 of lessmilk.com (Thomas Palef, 2014), in Phaser 1.1.3: 176 lines
of JavaScript in three files. The port is in `games/save_the_city/` (194
lines). The student's version (`save_the_city/`) has no written analysis;
this one is ours.

The game: type the sentence at the bottom; each letter typed flies to the
bomb and pushes it up by 20 pixels. From the second sentence on, the bomb
falls at 90 pixels per second. When it reaches the city, the city is gone,
and a button plays again.

## A letter is a task

In the original, a letter is a text in a group, and its life is spread
over four places: `draw_sentence` makes it and starts its fade in;
`update` fires it when its key is typed (`fire_letter` starts its flight);
`update` again tests it against the bomb in each frame, in
`forEachAlive`, and kills it by setting `alive = false` and `alpha = 0`; and
`end` kills all of them.

In the port, the life of a letter is one task:

```
task Letter (t, i, bomb) {
    spawn Motion(t, [alpha=1], 200, nil, nil, i * 20)       ;; fade in
    await :fire until it.i == i                             ;; typed
    spawn Motion(t, [y=bomb.y - 20, x=W/2], (H - bomb.y) * 3)
    await :update until ((t.y + 20) < 0) || ((t.alpha > 0) && ((t.y + 20) < Save.bomb_bottom))
    if (t.y + 20) >= 0 {
        emit @:global :hit                                  ;; the bomb goes up
    }
}
```

and the end of the city aborts the pool of the letters.

## The end is a sequence

`end` starts five tweens and a chain of nine: the explosion grows, then
(`onComplete`) `annimation_ended` changes the frame of the city and starts
the text and the button, each with a delay; the city and the explosion
shake in a group. In the port, after the loop of the update:

```
spawn @tweens Motion(exp, [alpha=0], 2000, nil, nil, 1500)
spawn @tweens Shake(grp)                ;; nine awaits of Motion
await Motion(exp, [sx=1, sy=1], 500)    ;; the onComplete
set city.frame = 1
...
```

and the button is an `await` of the mouse pressed and released over it.

## The flag that stays

`keyReset` turns the level of a key into one shot: a key fires one
letter, and must be up before it fires another. Since it tests the key of
the current letter, which changes when a letter fires, a key that goes
down one frame after the previous letter fired is ignored until it is
pressed again. The port keeps the flag, to keep that behavior
([state.md](../state.md)).
