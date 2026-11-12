// I Hate Rabbits: the score, the level, the best score; in Play, the angle
// of the bad one, and the rabbits alive (how many, sums of x, y, and alpha)
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    var r = [score, level, best_score];
    if (g.state.current === 'Play' && s.bad) {
        var n = 0, sx = 0, sy = 0, sa = 0;
        s.rabbits.forEachAlive(function (e) { n++; sx += e.x; sy += e.y; sa += e.alpha; });
        r.push(s.bad.angle.toFixed(2), n, sx.toFixed(2), sy.toFixed(2), sa.toFixed(3));
    }
    return r.join(' ');
};
