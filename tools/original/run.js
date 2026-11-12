// Runs an original game in Chromium with no screen, stepped by hand.
//
//   node tools/original/run.js <n> <file.run> [outdir]
//
// <n> is the game (1 to 12), read from ext/originals (tools/setup.sh).
// The run file has FRAMES, SEED, INPUT (as RL_INPUT: "f:op,...", applied
// before frame f, the first frame being 1), and SHOTS ("f f ...", saved as
// <outdir>/<f>.png at the end of frame f).
//
// While the states Boot and Load run (all twelve games have them), frames
// run with the clock stopped at T0 and are not counted. Frame 1 is the first
// frame in the next state, at T0; frame f is at T0 + (f-1) * 1000/60 ms.
// So no input can be given at frame 1.
//
// The trace goes to stdout, a line per frame: the frame, the state of
// Phaser, and what tools/original/trace/<n>.js adds for that game.

const fs   = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const [n, runFile, outDir = '.'] = process.argv.slice(2);
if (!n || !runFile) {
    console.error('usage: run.js <n> <file.run> [outdir]');
    process.exit(2);
}

function parseRun (file) {
    const r = { FRAMES: 60, SEED: 1, INPUT: '', SHOTS: '' };
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
        if (m) r[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1');
    }
    const input = {};
    for (const it of r.INPUT.split(',').filter(x => x)) {
        const i = it.indexOf(':');
        const f = +it.slice(0, i);
        (input[f] = input[f] || []).push(it.slice(i + 1));
    }
    const shots = new Set(r.SHOTS.split(/\s+/).filter(x => x).map(Number));
    return { frames: +r.FRAMES, seed: +r.SEED, input, shots };
}

// a page next to the game, with the scripts of its index.html, without the
// rest of the site (analytics, comments), and with the harness around Phaser
function makePage (dir) {
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    const srcs = [...html.matchAll(/<script[^>]*src="([^"]+\.js)"/g)]
        .map(m => m[1]).filter(s => !s.startsWith('//') && !s.startsWith('http'));
    const width = (html.match(/gameContainer" style="width:(\d+)px/) || [])[1];
    const tags = [];
    tags.push(`<script src="file://${__dirname}/harness.js"></script>`);
    for (const s of srcs) {
        // "/js/x.js" is the root of the site
        const src = s.startsWith('/') ? '../..' + s : s;
        tags.push(`<script src="${src}"></script>`);
        if (/phaser/.test(s)) {
            tags.push(`<script src="file://${__dirname}/harness-post.js"></script>`);
        }
    }
    const trace = path.join(__dirname, 'trace', n + '.js');
    if (fs.existsSync(trace)) tags.push(`<script src="file://${trace}"></script>`);
    const page = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>body{margin:0;background:#000}</style>
${tags.join('\n')}
</head><body><div id="gameContainer" style="width:${width}px"></div></body></html>
`;
    const out = path.join(dir, 'harness.html');
    fs.writeFileSync(out, page);
    return out;
}

(async () => {
    const run  = parseRun(runFile);
    const dir  = path.join(ROOT, 'ext/originals/www.lessmilk.com/games', n);
    const page = makePage(dir);
    fs.mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch({
        args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'],
    });
    const ctx = await browser.newContext({ viewport: { width: 800, height: 700 } });
    const pg  = await ctx.newPage();
    pg.on('requestfailed', r => console.error('missing:', r.url()));
    pg.on('pageerror', e => console.error('page error:', e.message));
    pg.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
    await pg.addInitScript(p => { window.__params = p; }, { seed: run.seed });
    await pg.goto('file://' + page);

    // loading: frames with the clock stopped at T0, until a frame starts in
    // a state after Boot and Load; that frame is frame 1. The state is the
    // one in which the frame started: the assets load asynchronously, and
    // the state may change between two frames.
    const ready = () => pg.evaluate(() => {
        const st = window.__ranIn;
        return !!st && !/^(Boot|Load)$/.test(st);
    });
    let waited = 0;
    while (true) {
        await pg.evaluate(() => window.__step(false));
        if (await ready()) break;
        await pg.waitForTimeout(5);
        if (++waited > 2000) throw new Error('run: the game did not load');
    }
    const draws = await pg.evaluate(() => window.__draws);
    console.error(`run: loaded after ${waited} frames, ${draws} random draws`);
    if (run.input[1]) throw new Error('run: no input at frame 1, which runs while loading');
    await pg.evaluate(() => { window.__frame = 1; });

    for (let f = 1; f <= run.frames; f++) {
        const line = await pg.evaluate(([f, ops]) => {
            if (f > 1) {
                for (const op of ops) window.__input(op);
                window.__step(true);
            }
            const g = Phaser.GAMES[0];
            const st = g.state.current;
            const extra = window.__trace ? window.__trace(g, f) : '';
            return f + ' ' + st + (extra !== '' && extra !== undefined ? ' ' + extra : '');
        }, [f, run.input[f] || []]);
        console.log(line);
        if (run.shots.has(f)) {
            // Phaser 1 paints the background as the style of the canvas
            const data = await pg.evaluate(() => {
                const c = Phaser.GAMES[0].canvas;
                const o = document.createElement('canvas');
                o.width = c.width; o.height = c.height;
                const x = o.getContext('2d');
                x.fillStyle = getComputedStyle(c).backgroundColor || '#000';
                x.fillRect(0, 0, o.width, o.height);
                x.drawImage(c, 0, 0);
                return o.toDataURL('image/png');
            });
            fs.writeFileSync(path.join(outDir, f + '.png'),
                             Buffer.from(data.split(',')[1], 'base64'));
        }
    }
    await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
