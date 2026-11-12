// Man vs Penguins: in Play, the score, the best score, the player (x y,
// velocity, alive, jump count), the enemies that exist (how many, sums of x
// and y), how many are alive, the coin (x y), and the camera (x y)
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play' || !s.player) return '';
    var p = s.player, n = 0, a = 0, sx = 0, sy = 0;
    s.enemies.forEach(function (e) { n++; sx += e.x; sy += e.y; if (e.alive) a++; }, null, true);
    return [s.score, s.bestScore, p.x.toFixed(2), p.y.toFixed(2),
            p.body.velocity.x.toFixed(2), p.body.velocity.y.toFixed(2),
            p.alive ? 1 : 0, s.playerJumpCount, n, a, sx.toFixed(2), sy.toFixed(2),
            s.coin.x.toFixed(2), s.coin.y.toFixed(2), g.camera.x, g.camera.y].join(' ');
};
