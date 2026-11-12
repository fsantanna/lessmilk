// Harness for the original games, loaded in the page before Phaser.
//
// It makes a run deterministic and stepped by hand:
//   - Math.random is a seeded generator (mulberry32), the same as the port's;
//   - the clock (Date.now, performance.now, and the time given to
//     requestAnimationFrame) moves only when the runner steps a frame;
//   - requestAnimationFrame only queues: __step() runs one frame of Phaser;
//   - keys and mouse are dispatched by the runner, by frame (__input);
//   - Phaser.AUTO renders to a 2D canvas, so the canvas can be read back.
//
// The seed and the step come from window.__params, set by run.js.

(function () {
    var P = window.__params || {};
    var STEP = P.step || 1000/60;   // ms per frame
    var T0   = P.t0   || 1000;      // the clock when the first frame runs

    // mulberry32: 32-bit state, a double in [0,1) per call
    var s = (P.seed >>> 0);
    Math.random = function () {
        s = (s + 0x6D2B79F5) >>> 0;
        var t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    var now = T0;
    Date.now = function () { return now; };
    performance.now = function () { return now; };

    var queue = [];
    window.requestAnimationFrame = function (cb) { queue.push(cb); return queue.length; };
    window.cancelAnimationFrame  = function () { queue = []; };

    window.__frame = 0;     // frames counted (0 while loading)

    // one frame of Phaser: `count` false while the game is still loading,
    // when the clock stays at T0
    window.__step = function (count) {
        if (count) {
            window.__frame++;
            now = T0 + (window.__frame - 1) * STEP;
        }
        var q = queue; queue = [];
        for (var i = 0; i < q.length; i++) q[i](now);
    };

    function keyEvent (type, code) {
        var e = new KeyboardEvent(type, { bubbles: true, cancelable: true });
        Object.defineProperty(e, 'keyCode', { get: function () { return code; } });
        Object.defineProperty(e, 'which',   { get: function () { return code; } });
        window.dispatchEvent(e);
        document.dispatchEvent(e);
    }

    var mx = 0, my = 0;
    function mouseEvent (type, button) {
        var c = Phaser.GAMES[0].canvas;
        var r = c.getBoundingClientRect();
        var e = new MouseEvent(type, {
            bubbles: true, cancelable: true, button: button || 0,
            clientX: r.left + mx, clientY: r.top + my,
            screenX: r.left + mx, screenY: r.top + my,
        });
        c.dispatchEvent(e);
    }

    // names as raylib (tools/run format), to the codes of the browser
    var KEYS = { SPACE:32, ENTER:13, ESCAPE:27, LEFT:37, UP:38, RIGHT:39, DOWN:40,
                 TAB:9, BACKSPACE:8, SHIFT:16, LEFT_SHIFT:16, CONTROL:17 };
    function code (k) {
        if (KEYS[k] !== undefined) return KEYS[k];
        if (/^[A-Z0-9]$/.test(k)) return k.charCodeAt(0);
        return parseInt(k);
    }

    // op as in RL_INPUT: dn:KEY, up:KEY, mv:X:Y, md:B, mu:B
    window.__input = function (op) {
        var a = op.split(':');
        switch (a[0]) {
            case 'dn': keyEvent('keydown', code(a[1])); break;
            case 'up': keyEvent('keyup',   code(a[1])); break;
            case 'mv': mx = +a[1]; my = +a[2]; mouseEvent('mousemove'); break;
            case 'md': mouseEvent('mousedown', +a[1]); break;
            case 'mu': mouseEvent('mouseup',   +a[1]); break;
            default: throw new Error('harness: unknown input ' + op);
        }
    };

    // after Phaser is loaded (harness-post.js)
    window.__post = function () {
        Phaser.AUTO = Phaser.CANVAS;
    };
})();
