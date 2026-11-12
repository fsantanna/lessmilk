// Connected: the score; in Play, the moves, the dots selected (count), the
// type, the width of the progress bar, and the dots alive: how many, the sum
// of their frames, of their y, and of their scale
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play' || !s.dots) return '' + score;
    var n = 0, fr = 0, sy = 0, sc = 0;
    s.dots.forEachAlive(function (e) { n++; fr += e.frame; sy += e.y; sc += e.scale.x; });
    return [score, s.moves, s.count, s.type, s.progress.width.toFixed(2),
            n, fr, sy.toFixed(2), sc.toFixed(3)].join(' ');
};
