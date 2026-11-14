// Fill the Holes: the clicks; in Play, the level, the holes to fill, the
// timer of the end of the level, and the boxes that exist (how many, sums of
// x and y, of their velocities, and how many are alive), the walls and holes
// that exist, and the x of the explanation
function nexist (grp) { var n = 0; grp.forEach(function () { n++; }, null, true); return n; }
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play' || !s.boxes) return '' + user_clicks;
    var n = 0, a = 0, sx = 0, sy = 0, sv = 0;
    s.boxes.forEach(function (b) { n++; sx += b.x; sy += b.y; sv += b.body.velocity.x + 2 * b.body.velocity.y; if (b.alive) a++; }, null, true);
    return [user_clicks, s.level, s.holes_to_fill, s.timer_end_level ? 1 : 0, n, a,
            sx.toFixed(2), sy.toFixed(2), sv, nexist(s.walls), nexist(s.holes),
            s.explanation_label.x.toFixed(2)].join(' ');
};
