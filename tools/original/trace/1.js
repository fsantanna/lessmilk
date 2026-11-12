// Run!: score, player x y, enemies alive
window.__trace = function (g, f) {
    var s = g.state.states[g.state.current];
    if (g.state.current !== 'Play') return score;
    var n = s.enemies1.countLiving() + s.enemies2.countLiving();
    return [score, s.player.x.toFixed(2), s.player.y.toFixed(2), n].join(' ');
};
