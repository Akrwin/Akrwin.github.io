(function () {
  // Port of "DataFlick Logo Animation v4" (logo-flick-v4.jsx) as a self-contained looping player.
  const R = window.React, h = R.createElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const Ease = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  };
  const animate = (ease) => ({ from, to, start, end }) => (T) => from + (to - from) * ease(clamp((T - start) / (end - start), 0, 1));
  const MOTION = { enter: animate(Ease.outExpo), flow: animate(Ease.inOutQuart), exit: animate(Ease.inExpo) };

  const SCENES = [['Grid', 0.5], ['Build', 1.1], ['Resolve', 0.9], ['Hold', 1.6], ['Out', 0.9]];
  const CUES = {}; let acc = 0; SCENES.forEach(([n, d]) => { CUES[n] = acc; acc += d; });
  const TOTAL = acc;

  const W = 1920, HH = 1080, CELL = 40;
  const THEMES = {
    dark: { bg: '#0A0A0A', line: '#161616', dim: '#1E1E1E', mid: '#5A5A5A', ink: '#FFFFFF' },
    light: { bg: '#F2F2F0', line: '#E4E4E1', dim: '#DCDCD8', mid: '#9A9A9A', ink: '#0A0A0A' },
  };
  const MH = 200, MU = MH / 52, MCELL = 10, FONT = 214, GAP = 58, HERO = 1.8, WORD = 'DataFlick';
  const MCOLS = Math.round(46 * MU / MCELL), MROWS = MH / MCELL;
  const hash = (a, b) => { let x = (a * 374761393 + b * 668265263) | 0; x = (x ^ (x >>> 13)) * 1274126177; return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  const MARK_CELLS = (() => {
    const out = [];
    for (let r = 0; r < MROWS; r++) for (let c = 0; c < MCOLS; c++) {
      const x = 6 + (c + 0.5) * MCELL / MU, y = 6 + (r + 0.5) * MCELL / MU;
      if (x <= 17 || (x >= 23 && (x <= 26 || Math.hypot(x - 26, y - 32) <= 26))) out.push({ c, r, d: hash(c, r + 7) });
    }
    return out;
  })();

  function Grid(T, th, uid) {
    const on = MOTION.enter({ from: 0, to: 1, start: 0, end: 0.5 })(T) * (1 - MOTION.flow({ from: 0, to: 1, start: CUES.Out + 0.4, end: CUES.Out + 0.8 })(T));
    const slot = Math.floor(T * 6);
    const cells = [];
    const n = Math.round(18 * on);
    for (let g = 0; g < n; g++) {
      const c = Math.floor(hash(g, slot) * (W / CELL)), r = Math.floor(hash(slot, g + 11) * (HH / CELL));
      cells.push(h('rect', { key: g, x: c * CELL + 1, y: r * CELL + 1, width: CELL - 2, height: CELL - 2, fill: th.dim }));
    }
    return h('svg', { width: W, height: HH, style: { position: 'absolute', left: 0, top: 0, opacity: on } },
      h('defs', null, h('pattern', { id: uid, width: CELL, height: CELL, patternUnits: 'userSpaceOnUse' },
        h('path', { d: `M ${CELL} 0 L 0 0 0 ${CELL}`, fill: 'none', stroke: th.line, strokeWidth: 2 }))),
      h('rect', { x: 0, y: 0, width: W, height: HH, fill: `url(#${uid})` }), cells);
  }

  function Mark(T, th) {
    const solid = MOTION.enter({ from: 0, to: 1, start: CUES.Resolve, end: CUES.Resolve + 0.3 })(T)
      * (1 - MOTION.exit({ from: 0, to: 1, start: CUES.Out - 0.1, end: CUES.Out + 0.05 })(T));
    const px = [];
    MARK_CELLS.forEach(({ c, r, d }) => {
      const t0 = CUES.Build + c * 0.04 + (MROWS - r) * 0.012;
      const appear = MOTION.enter({ from: 0, to: 1, start: t0, end: t0 + 0.12 })(T);
      const flip = T >= t0 + 0.14 + d * 0.08;
      const o0 = CUES.Out + 0.15 + (MCOLS - c) * 0.025 + d * 0.12;
      const gone = MOTION.exit({ from: 0, to: 1, start: o0, end: o0 + 0.14 })(T);
      const s = (MCELL - 1.5) * appear * (1 - gone);
      if (s <= 0.2) return;
      const fill = gone > 0 ? th.mid : flip ? th.ink : th.mid;
      px.push(h('rect', { key: c + '-' + r, x: c * MCELL + (MCELL - s) / 2, y: r * MCELL + (MCELL - s) / 2, width: s, height: s, fill }));
    });
    return h('div', { style: { position: 'relative', width: 46 * MU, height: MH } },
      h('svg', { width: 46 * MU, height: MH, style: { position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - solid * 0.999 } }, px),
      h('svg', { viewBox: '6 6 46 52', width: 46 * MU, height: MH, style: { position: 'absolute', inset: 0, opacity: solid } },
        h('rect', { x: 6, y: 6, width: 11, height: 52, fill: th.ink }),
        h('path', { d: 'M23 6h3a26 26 0 0 1 0 52h-3z', fill: th.ink })));
  }

  let uidN = 0;
  function DataFlickIntro(props) {
    const th = THEMES[props.theme === 'light' ? 'light' : 'dark'];
    const loop = props.loop !== false;
    const boxRef = R.useRef(null), textRef = R.useRef(null);
    const uid = R.useMemo(() => 'dfgrid4-' + (++uidN), []);
    const [bw, setBw] = R.useState(960);
    const [textW, setTextW] = R.useState(1000);
    const [T, setT] = R.useState(0);
    const [run, setRun] = R.useState(0);
    R.useLayoutEffect(() => {
      const m = () => { boxRef.current && setBw(boxRef.current.offsetWidth); textRef.current && setTextW(textRef.current.offsetWidth); };
      m(); document.fonts && document.fonts.ready.then(m);
      const ro = new ResizeObserver(m); boxRef.current && ro.observe(boxRef.current);
      return () => ro.disconnect();
    }, []);
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    R.useEffect(() => {
      if (reduced) { setT(CUES.Hold + 0.5); return; }
      let raf, start = null;
      const tick = (ts) => {
        if (start == null) start = ts;
        let t = (ts - start) / 1000;
        if (loop) t = t % TOTAL; else t = Math.min(t, CUES.Hold + 0.8);
        setT(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [run, loop]);

    const settle = MOTION.enter({ from: 0, to: 1, start: CUES.Resolve + 0.1, end: CUES.Resolve + 0.7 })(T);
    const word = MOTION.enter({ from: 0, to: 1, start: CUES.Resolve + 0.2, end: CUES.Resolve + 0.8 })(T);
    const wipe = MOTION.flow({ from: 0, to: 100, start: CUES.Out, end: CUES.Out + 0.35 })(T);
    const offset = (textW + GAP) / 2 * (1 - settle);
    const scale = HERO + (1 - HERO) * settle;
    const drift = 1 + MOTION.flow({ from: 0, to: 0.02, start: CUES.Hold, end: CUES.Out })(T);
    const s = bw / W;
    return h('div', { ref: boxRef, onClick: () => setRun((r) => r + 1), 'data-noanim': '', title: 'Replay', style: { position: 'relative', width: '100%', height: HH * s, overflow: 'hidden', cursor: 'pointer', borderRadius: props.radius || 0 } },
      h('div', { style: { position: 'absolute', left: 0, top: 0, width: W, height: HH, transform: `scale(${s})`, transformOrigin: '0 0', background: props.bare ? 'transparent' : th.bg, overflow: 'hidden' } },
        props.bare ? null : Grid(T, th, uid),
        h('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: GAP, transform: `scale(${drift * (props.zoom || 1)})` } },
            h('div', { style: { transform: `translateX(${offset}px) scale(${scale})`, position: 'relative', zIndex: 2 } }, Mark(T, th)),
            h('div', { style: { overflow: 'hidden', padding: '16px 0', clipPath: `inset(0 0 0 max(${wipe}%, ${Math.max(0, offset + (scale - 1) * 23 * MU - GAP + 10)}px))` } },
              h('div', { ref: textRef, style: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: FONT, letterSpacing: '-0.035em', lineHeight: 1, whiteSpace: 'nowrap', color: th.ink, transform: `translateX(${(1 - word) * -(textW + GAP)}px)` } }, WORD))))));
  }
  function DataFlickGrid(props) {
    const th = THEMES[props.theme === 'light' ? 'light' : 'dark'];
    const boxRef = R.useRef(null);
    const uid = R.useMemo(() => 'dfgridbg-' + (++uidN), []);
    const [size, setSize] = R.useState({ w: 1440, h: 900 });
    const [T, setT] = R.useState(0);
    R.useLayoutEffect(() => {
      const m = () => boxRef.current && setSize({ w: boxRef.current.offsetWidth, h: boxRef.current.offsetHeight });
      m(); const ro = new ResizeObserver(m); boxRef.current && ro.observe(boxRef.current);
      return () => ro.disconnect();
    }, []);
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    R.useEffect(() => {
      if (reduced) { setT(CUES.Hold); return; }
      let raf, start = null;
      const tick = (ts) => { if (start == null) start = ts; setT(((ts - start) / 1000) % TOTAL); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    const on = MOTION.enter({ from: 0, to: 1, start: 0, end: 0.5 })(T);
    const cell = props.cell || CELL;
    const cols = Math.ceil(size.w / cell), rows = Math.ceil(size.h / cell);
    const slot = Math.floor(T * 6);
    const n = Math.round((props.count || 26) * on);
    const cells = [];
    for (let g = 0; g < n; g++) {
      const c = Math.floor(hash(g, slot) * cols), r = Math.floor(hash(slot, g + 11) * rows);
      cells.push(h('rect', { key: g, x: c * cell + 1, y: r * cell + 1, width: cell - 2, height: cell - 2, fill: th.dim }));
    }
    return h('div', { ref: boxRef, 'aria-hidden': 'true', style: { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' } },
      h('svg', { width: size.w, height: size.h, style: { display: 'block' } },
        h('defs', null, h('pattern', { id: uid, width: cell, height: cell, patternUnits: 'userSpaceOnUse' },
          h('path', { d: `M ${cell} 0 L 0 0 0 ${cell}`, fill: 'none', stroke: th.line, strokeWidth: 2 }))),
        h('rect', { x: 0, y: 0, width: size.w, height: size.h, fill: `url(#${uid})` }), cells));
  }
  window.DataFlickGrid = DataFlickGrid;
  window.DataFlickIntro = DataFlickIntro;
  window.DataOnIntro = DataFlickIntro;
})();
