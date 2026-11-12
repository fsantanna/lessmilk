// Pixel War: the score; in Play, the lives, the evolution, the player (x y),
// the enemies alive (how many, the sums of x and of y), and how many fires,
// bullets, bonuses, and particles exist
function nexist (grp) { var n = 0; grp.forEach(function () { n++; }, null, true); return n; }
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play') return '' + score;
    var n = 0, sx = 0, sy = 0;
    s.enemies.forEach(function (e) { n++; sx += e.x; sy += e.y; }, null, true);
    return [score, s.lives, s.evolution, s.player.x.toFixed(2), s.player.y.toFixed(2),
            n, sx.toFixed(2), sy.toFixed(2),
            nexist(s.fires), nexist(s.bullets), nexist(s.bonuses), nexist(s.emitter)].join(' ');
};
