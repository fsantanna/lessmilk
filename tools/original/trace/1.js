// Run!: score; in Play, the player (x y), and the enemies alive: how many,
// and the sums of their x and of their y (independent of their order)
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play') return '' + score;
    var n = 0, sx = 0, sy = 0;
    [s.enemies1, s.enemies2].forEach(function (grp) {
        grp.forEachAlive(function (e) { n++; sx += e.x; sy += e.y; });
    });
    return [score, s.player.x.toFixed(2), s.player.y.toFixed(2),
            n, sx.toFixed(2), sy.toFixed(2)].join(' ');
};
