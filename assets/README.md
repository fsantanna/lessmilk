# Assets

Images, sounds, and levels of the twelve games, by Thomas Palef (lessmilk.com,
2014), unchanged, at the paths that each original loads them from. They are
his, not covered by the license of this repository.

- Games 1 and 2: from `www.lessmilk.com/games/<n>/` of
  [leokaplan/lessmilk](https://github.com/leokaplan/lessmilk) at commit
  `bf5ef89`. That copy of the site has no assets for games 3 to 12.
- Games 3 to 12: from the port of Jéssica Oliveira,
  [jessicacoliveira/atmos-lessmilk](https://github.com/jessicacoliveira/atmos-lessmilk)
  at commit `3e24458`: from `<game>/phaser/`, where she kept the original
  game, or else from `<game>/media/`. Where both exist, the 36 files that
  can be compared are the same, byte by byte.

Missing from every source found (the site itself cannot be reached from the
container):

| Game | File | Used for |
|------|------|----------|
| 5, 6, 7, 10, 11, 12 | `images/loading.png`, `images/loading2.png` | the loading bar |
| 6 | `images/orientation.png` | the message to turn a phone |
| 10 | `images/tiles.png` | the tiles of the levels (drawing only) |
| 11 | `levels/map.json` | the map: tiles and objects |
