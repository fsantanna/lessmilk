// Box Jump: level, deaths; in Play, the player (x y angle, velocity), if it
// touches down, if it is alive, the cubes alive, and the particles that exist
function nexist (grp) { var n = 0; grp.forEach(function () { n++; }, null, true); return n; }
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play') return '' + death;
    var p = s.player, b = p.body;
    return [s.level, death, p.x.toFixed(2), p.y.toFixed(2), p.angle.toFixed(2),
            b.velocity.x.toFixed(2), b.velocity.y.toFixed(2),
            b.touching.down ? 1 : 0, p.alive ? 1 : 0,
            s.cubes.countLiving(), nexist(s.emitter)].join(' ');
};
