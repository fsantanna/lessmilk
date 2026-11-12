// Save the City: the sentence (level), the letter (i), the score; the bomb
// (y, velocity), if the city is dead, the letters alive, the alpha of the
// tutorial, and the frame of the city
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (!s.bomb) return '';
    var n = 0;
    s.group_text.forEachAlive(function () { n++; });
    return [s.level, s.i, s.score, s.bomb.y.toFixed(2), s.bomb.body.velocity.y.toFixed(2),
            s.dead ? 1 : 0, n, s.tuto.alpha.toFixed(3), s.city.frame].join(' ');
};
