import React, { useEffect, useMemo, useRef, useState } from 'react';

const SNAIL_ROWS = { moving: 0, turning: 1, idle: 2, dead: 3 };
const PLANT_SHEET_BY_TYPE = {
  moss: '/assets/plants/moss.png',
  fern: '/assets/plants/fern.png',
  flower: '/assets/plants/flowering.png',
};

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createSnail(id) {
  return {
    id, kind: 'snail',
    x: randomRange(16, 84), y: randomRange(66, 82),
    vx: Math.random() > 0.5 ? 1 : -1,
    phase: 'moving', frame: 0, vitality: randomRange(70, 96),
  };
}

function createPillBug(id) {
  return {
    id, kind: 'pillbug',
    x: randomRange(14, 86), y: randomRange(72, 88),
    vx: Math.random() > 0.5 ? 0.7 : -0.7,
    phase: 'moving', frame: 0, vitality: randomRange(75, 100),
  };
}

function createSpider(id) {
  return {
    id, kind: 'spider',
    x: randomRange(20, 80), y: randomRange(22, 55),
    vx: 0, phase: 'idle', frame: 0, vitality: randomRange(80, 100),
  };
}

function createWorm(id) {
  return {
    id, kind: 'worm',
    x: randomRange(20, 80), y: randomRange(76, 90),
    vx: Math.random() > 0.5 ? 0.4 : -0.4,
    phase: 'moving', frame: 0, vitality: randomRange(72, 98),
  };
}

function createPlant(id, type) {
  return {
    id, type,
    x: randomRange(18, 82),
    size: randomRange(0.55, 0.95),
    frame: Math.floor(randomRange(0, 4)),
  };
}

function createMicrobe(id) {
  return {
    id,
    x: randomRange(16, 84),
    y: randomRange(42, 88),
    scale: randomRange(0.55, 1.35),
  };
}

function useAsset(path) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    const img = new Image();
    img.onload = () => setStatus('ready');
    img.onerror = () => setStatus('missing');
    img.src = path;
  }, [path]);
  return { ready: status === 'ready', missing: status === 'missing' };
}

/* ─── SVG Icon Components ─── */

function PillBugIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <ellipse cx="32" cy="34" rx="20" ry="13" fill="#9c8468" />
      <ellipse cx="32" cy="34" rx="20" ry="13" fill="none" stroke="#7a6548" strokeWidth="1.5" />
      {[24, 29, 35, 40].map(x => (
        <line key={x} x1={x} y1={22} x2={x} y2={46} stroke="#7a6548" strokeWidth="1.2" />
      ))}
      <circle cx="14" cy="34" r="3" fill="#b09878" />
      <line x1="14" y1="31" x2="10" y2="24" stroke="#9c8468" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="31" x2="8" y2="27" stroke="#9c8468" strokeWidth="1.5" strokeLinecap="round" />
      {[20, 27, 37, 44].map((x, i) => (
        <line key={x} x1={x} y1={46} x2={x + (i < 2 ? -3 : 3)} y2={54} stroke="#9c8468" strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function SnailIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <ellipse cx="28" cy="46" rx="20" ry="8" fill="#c4a87a" />
      <circle cx="38" cy="32" r="14" fill="#d4b88a" stroke="#b09060" strokeWidth="1.5" />
      <path d="M38 22 C42 24 44 30 38 32 C34 28 36 24 38 22Z" fill="#b09060" opacity="0.5" />
      <circle cx="38" cy="30" r="5" fill="none" stroke="#b09060" strokeWidth="1" />
      <path d="M18 42 Q12 36 14 28" stroke="#c4a87a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M18 42 Q10 38 10 30" stroke="#c4a87a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="27" r="2" fill="#5a4a3a" />
      <circle cx="10" cy="29" r="2" fill="#5a4a3a" />
    </svg>
  );
}

function SpiderIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <ellipse cx="32" cy="30" rx="8" ry="6" fill="#5a5a5a" />
      <ellipse cx="32" cy="40" rx="10" ry="8" fill="#484848" />
      <path d="M24 32 Q14 24 8 18" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M24 36 Q12 32 4 30" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M24 40 Q14 42 6 46" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M24 44 Q16 50 10 56" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 32 Q50 24 56 18" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 36 Q52 32 60 30" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 40 Q50 42 58 46" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 44 Q48 50 54 56" stroke="#5a5a5a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="28" r="2.5" fill="#e74c3c" />
      <circle cx="36" cy="28" r="2.5" fill="#e74c3c" />
    </svg>
  );
}

function WormIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <path d="M12 40 Q18 28 26 36 Q34 44 40 32 Q46 22 54 30" stroke="#d4869a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M12 40 Q18 28 26 36 Q34 44 40 32 Q46 22 54 30" stroke="#e8a0b4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="54" cy="30" r="4" fill="#d4869a" />
      <circle cx="52" cy="28" r="1.5" fill="#2a1a1a" />
      <circle cx="56" cy="28" r="1.5" fill="#2a1a1a" />
    </svg>
  );
}

function WaterDropIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec8e3" />
          <stop offset="100%" stopColor="#4a90d9" />
        </linearGradient>
      </defs>
      <path d="M32 8 Q20 28 20 40 Q20 54 32 56 Q44 54 44 40 Q44 28 32 8Z" fill="url(#waterGrad)" />
      <ellipse cx="28" cy="32" rx="4" ry="6" fill="rgba(255,255,255,0.3)" transform="rotate(-15 28 32)" />
    </svg>
  );
}

function MossIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <ellipse cx="32" cy="52" rx="26" ry="8" fill="#3a6b35" />
      <ellipse cx="22" cy="46" rx="10" ry="10" fill="#4a8b45" />
      <ellipse cx="38" cy="44" rx="12" ry="12" fill="#5a9b55" />
      <ellipse cx="28" cy="40" rx="8" ry="8" fill="#6aab65" />
      <ellipse cx="42" cy="48" rx="7" ry="7" fill="#4a8b45" />
      <circle cx="24" cy="42" r="2" fill="#7abb75" opacity="0.7" />
      <circle cx="36" cy="38" r="2.5" fill="#7abb75" opacity="0.7" />
    </svg>
  );
}

function FernIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <line x1="32" y1="58" x2="32" y2="14" stroke="#3a7a35" strokeWidth="2.5" />
      {[
        [32, 20, 18, 16], [32, 20, 46, 16],
        [32, 28, 14, 22], [32, 28, 50, 22],
        [32, 36, 16, 30], [32, 36, 48, 30],
        [32, 44, 20, 38], [32, 44, 44, 38],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a9a45" strokeWidth="2" strokeLinecap="round" />
      ))}
      <ellipse cx="32" cy="12" rx="3" ry="4" fill="#4a9a45" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <line x1="32" y1="56" x2="32" y2="30" stroke="#4a8a40" strokeWidth="2.5" />
      <ellipse cx="24" cy="46" rx="6" ry="3" fill="#5a9a50" transform="rotate(-30 24 46)" />
      <ellipse cx="40" cy="42" rx="6" ry="3" fill="#5a9a50" transform="rotate(20 40 42)" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse key={angle} cx="32" cy="18" rx="5" ry="10" fill={i % 2 === 0 ? '#e8658a' : '#d4547a'} transform={`rotate(${angle} 32 24)`} />
      ))}
      <circle cx="32" cy="24" r="5" fill="#f4d03f" />
    </svg>
  );
}

function SoilIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <path d="M8 40 Q20 24 32 28 Q44 24 56 40 L56 56 L8 56Z" fill="#6b4226" />
      <path d="M8 40 Q20 24 32 28 Q44 24 56 40" fill="none" stroke="#8b5a36" strokeWidth="2" />
      <ellipse cx="20" cy="44" rx="3" ry="2" fill="#8b5a36" />
      <ellipse cx="36" cy="42" rx="2" ry="1.5" fill="#7b4a2e" />
      <ellipse cx="44" cy="48" rx="2.5" ry="1.5" fill="#8b5a36" />
      <circle cx="28" cy="50" r="1.5" fill="#9b6a46" />
      <path d="M24 36 L26 32 L28 36" stroke="#5a8a35" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function SandIcon() {
  return (
    <svg viewBox="0 0 64 64" className="item-icon">
      <path d="M10 44 Q22 30 32 34 Q42 30 54 44 L54 56 L10 56Z" fill="#e8d5a0" />
      <path d="M10 44 Q22 30 32 34 Q42 30 54 44" fill="none" stroke="#d4c088" strokeWidth="2" />
      {[16, 22, 30, 38, 44, 48].map((x, i) => (
        <circle key={x} cx={x} cy={48 + (i % 3)} r={1 + (i % 2) * 0.5} fill="#c4b078" />
      ))}
      {[20, 34, 42].map((x, i) => (
        <circle key={x} cx={x} cy={52 + (i % 2)} r={0.8} fill="#b8a468" />
      ))}
    </svg>
  );
}

/* ─── Main App ─── */

export default function App() {
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);
  const [score, setScore] = useState(0);
  const [humidity, setHumidity] = useState(60);
  const [lighting, setLighting] = useState(58);
  const [soil, setSoil] = useState(56);
  const [waterCycle, setWaterCycle] = useState(52);

  const nextId = useRef(300);
  function getNextId() {
    return nextId.current++;
  }

  const [snails, setSnails] = useState(() =>
    Array.from({ length: 2 }, (_, i) => createSnail(i + 1))
  );
  const [pillBugs, setPillBugs] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const [worms, setWorms] = useState([]);
  const [plants, setPlants] = useState(() => [
    createPlant(101, 'moss'),
    createPlant(102, 'fern'),
    createPlant(103, 'flower'),
  ]);
  const [microbes, setMicrobes] = useState(() =>
    Array.from({ length: 10 }, (_, i) => createMicrobe(201 + i))
  );
  const [soilLayers, setSoilLayers] = useState(1);
  const [sandLayers, setSandLayers] = useState(0);

  const [message, setMessage] = useState('Build your terrarium, then press Play.');

  const snailSprite = useAsset('/assets/creatures/snail.png');
  const snailSingle = useAsset('/assets/creatures/snail-full.png');
  const jarSprite = useAsset('/assets/jar/jar.png');
  const waterSpriteAsset = useAsset('/assets/jar effects/water.png');
  const fogSprite = useAsset('/assets/jar effects/fog.png');
  const flowerSingle = useAsset('/assets/plants/flowering-full.png');

  const livingSnails = useMemo(() => snails.filter(s => s.phase !== 'dead').length, [snails]);
  const livingPillBugs = useMemo(() => pillBugs.filter(b => b.phase !== 'dead').length, [pillBugs]);
  const livingSpiders = useMemo(() => spiders.filter(s => s.phase !== 'dead').length, [spiders]);
  const livingWorms = useMemo(() => worms.filter(w => w.phase !== 'dead').length, [worms]);
  const totalCreatures = livingSnails + livingPillBugs + livingSpiders + livingWorms;

  const ecosystemStability = useMemo(() => {
    const humidityFit = 100 - Math.abs(humidity - 68) * 1.6;
    const lightFit = 100 - Math.abs(lighting - 62) * 1.5;
    const soilFit = 100 - Math.abs(soil - 58) * 1.3;
    const moisturePressure = humidity > 82 ? (humidity - 82) * 2.1 : 0;
    const biodiversity = clamp(
      plants.length * 6 + microbes.length * 0.7 +
      livingSnails * 7 + livingPillBugs * 5 + livingSpiders * 8 + livingWorms * 6,
      0, 100
    );
    const organismPressure = Math.max(0, totalCreatures * 6 - plants.length * 4);
    const substrateBenefit = clamp(soilLayers * 8 + sandLayers * 5, 0, 20);

    return clamp(
      humidityFit * 0.2 + lightFit * 0.16 + soilFit * 0.16 +
      biodiversity * 0.3 + substrateBenefit * 0.08 -
      moisturePressure * 0.5 - organismPressure * 0.28,
      0, 100
    );
  }, [humidity, lighting, soil, plants.length, microbes.length,
      livingSnails, livingPillBugs, livingSpiders, livingWorms,
      totalCreatures, soilLayers, sandLayers]);

  const plantHealthRow = useMemo(() => {
    if (ecosystemStability >= 72) return 0;
    if (ecosystemStability >= 42) return 1;
    return 2;
  }, [ecosystemStability]);

  const survivalMonths = useMemo(() => {
    if (ecosystemStability >= 95) return 24;
    if (ecosystemStability >= 80) return Math.round(12 + (ecosystemStability - 80) * 0.8);
    if (ecosystemStability >= 50) return Math.round(4 + (ecosystemStability - 50) * 0.27);
    if (ecosystemStability >= 20) return Math.round(1 + (ecosystemStability - 20) * 0.1);
    return 0;
  }, [ecosystemStability]);

  const timelineProgress = useMemo(() => {
    if (day >= 365) return 100;
    return clamp((day / 365) * 100, 0, 100);
  }, [day]);

  /* ── Simulation loop ── */
  useEffect(() => {
    if (!running) return undefined;

    const timer = setInterval(() => {
      setDay(v => v + 1);

      setSnails(current =>
        current.map(snail => {
          if (snail.phase === 'dead') return snail;
          let { phase, vx, x, vitality } = snail;
          const y = clamp(snail.y + randomRange(-0.2, 0.2), 64, 84);
          const dryPenalty = humidity < 28 ? (28 - humidity) * 0.18 : 0;
          const moldPenalty = humidity > 86 ? (humidity - 86) * 0.12 : 0;
          vitality = clamp(vitality - dryPenalty - moldPenalty + soil * 0.012, 0, 100);
          if (vitality <= 0) return { ...snail, vitality: 0, phase: 'dead', frame: 0 };
          if (Math.random() < 0.03) phase = 'idle';
          else if (phase === 'idle' && Math.random() < 0.3) phase = 'moving';
          if (phase === 'moving') x += vx * (0.46 + (humidity / 100) * 0.5);
          if (x < 12 || x > 88) { phase = 'turning'; vx = -vx; x = clamp(x, 12, 88); }
          else if (phase === 'turning' && Math.random() < 0.4) phase = 'moving';
          const frame = (snail.frame + 1) % (phase === 'dead' ? 1 : 4);
          return { ...snail, x, y, vx, phase, frame, vitality };
        })
      );

      setPillBugs(current =>
        current.map(bug => {
          if (bug.phase === 'dead') return bug;
          let { phase, vx, x, vitality } = bug;
          const y = clamp(bug.y + randomRange(-0.15, 0.15), 72, 90);
          vitality = clamp(vitality - (humidity < 30 ? 0.15 : 0) + soil * 0.015, 0, 100);
          if (vitality <= 0) return { ...bug, vitality: 0, phase: 'dead', frame: 0 };
          if (Math.random() < 0.05) phase = 'idle';
          else if (phase === 'idle' && Math.random() < 0.35) phase = 'moving';
          if (phase === 'moving') x += vx * 0.35;
          if (x < 10 || x > 90) { vx = -vx; x = clamp(x, 10, 90); }
          return { ...bug, x, y, vx, phase, frame: (bug.frame + 1) % 4, vitality };
        })
      );

      setSpiders(current =>
        current.map(spider => {
          if (spider.phase === 'dead') return spider;
          let { vitality, x, y } = spider;
          vitality = clamp(vitality - 0.02 + (totalCreatures > 2 ? 0.05 : 0), 0, 100);
          if (vitality <= 0) return { ...spider, vitality: 0, phase: 'dead' };
          x = clamp(x + randomRange(-0.3, 0.3), 15, 85);
          y = clamp(y + randomRange(-0.3, 0.3), 18, 55);
          return { ...spider, x, y, vitality };
        })
      );

      setWorms(current =>
        current.map(worm => {
          if (worm.phase === 'dead') return worm;
          let { vx, x, vitality } = worm;
          const y = clamp(worm.y + randomRange(-0.1, 0.1), 74, 92);
          vitality = clamp(
            vitality - (humidity < 35 ? 0.12 : 0) + soil * 0.018 + (sandLayers > 0 ? 0.02 : 0),
            0, 100
          );
          if (vitality <= 0) return { ...worm, vitality: 0, phase: 'dead' };
          x += vx * 0.3;
          if (x < 12 || x > 88) { vx = -vx; x = clamp(x, 12, 88); }
          return { ...worm, x, y, vx, vitality, frame: (worm.frame + 1) % 4 };
        })
      );

      setScore(v => {
        const humidityBonus = clamp(24 - Math.abs(humidity - 68), 0, 24);
        const stabilityBonus = ecosystemStability * 0.8;
        const survivalBonus = totalCreatures * 2;
        return Math.max(0, Math.round(v + 8 + humidityBonus + stabilityBonus + survivalBonus));
      });

      if (ecosystemStability < 35) setMessage('Stress rising — adjust conditions or add more diversity.');
      else if (ecosystemStability > 78) setMessage('Ecosystem thriving — excellent balance!');
      else setMessage('System stable — keep tuning for a higher score.');
    }, 150);

    return () => clearInterval(timer);
  }, [running, humidity, soil, ecosystemStability, totalCreatures, sandLayers]);

  /* ── Visual helpers ── */
  const humidityFogOpacity = clamp((humidity - 50) / 70, 0, 0.8);
  const waterFxOpacity = clamp((humidity - 62) / 38, 0, 0.92);
  const jarOpen = humidity > 72 || running;
  const groundHeight = 28 + soilLayers * 4 + sandLayers * 3;

  /* ── Actions ── */
  function addCreature(type) {
    const id = getNextId();
    switch (type) {
      case 'pillbug': setPillBugs(c => [...c, createPillBug(id)]); break;
      case 'snail':   setSnails(c => [...c, createSnail(id)]); break;
      case 'spider':  setSpiders(c => [...c, createSpider(id)]); break;
      case 'worm':    setWorms(c => [...c, createWorm(id)]); break;
    }
  }

  function addPlant(type) {
    setPlants(c => [...c, createPlant(getNextId(), type)]);
  }

  function addMoisture() {
    setHumidity(v => clamp(v + 8, 0, 100));
  }

  function addSubstrate(type) {
    if (type === 'soil') {
      setSoilLayers(v => Math.min(v + 1, 5));
      setSoil(v => clamp(v + 6, 0, 100));
    } else {
      setSandLayers(v => Math.min(v + 1, 4));
      setWaterCycle(v => clamp(v + 5, 0, 100));
    }
  }

  function resetWorld() {
    setRunning(false);
    setDay(0);
    setScore(0);
    setHumidity(60);
    setLighting(58);
    setSoil(56);
    setWaterCycle(52);
    setSoilLayers(1);
    setSandLayers(0);
    setSnails(Array.from({ length: 2 }, (_, i) => createSnail(i + 1)));
    setPillBugs([]);
    setSpiders([]);
    setWorms([]);
    setPlants([createPlant(101, 'moss'), createPlant(102, 'fern'), createPlant(103, 'flower')]);
    setMicrobes(Array.from({ length: 10 }, (_, i) => createMicrobe(201 + i)));
    setMessage('Terrarium reset. Build your ecosystem!');
    nextId.current = 300;
  }

  /* ── Render ── */
  return (
    <div className="game-shell">
      {/* ── Header ── */}
      <header className="game-header">
        <h1 className="game-title">Terrarium Simulator</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Day</span>
            <span className="stat-value">{day}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Stability</span>
            <div className="stability-mini">
              <div className="stability-mini-fill" style={{ width: `${ecosystemStability}%` }} />
            </div>
            <span className="stat-value">{ecosystemStability.toFixed(0)}%</span>
          </div>
          <button className="reset-btn" onClick={resetWorld}>Reset</button>
        </div>
      </header>

      {/* ── 3-Column Body ── */}
      <div className="game-body">
        {/* Left panel */}
        <aside className="panel creatures-panel">
          <h2 className="panel-title">Creatures & Elements</h2>
          <div className="card-grid">
            <button className="item-card" onClick={() => addCreature('pillbug')}>
              <div className="card-icon-wrap creature-bg"><PillBugIcon /></div>
              <span className="card-label">Pill Bug</span>
              {livingPillBugs > 0 && <span className="card-count">{livingPillBugs}</span>}
            </button>
            <button className="item-card" onClick={() => addCreature('snail')}>
              <div className="card-icon-wrap creature-bg"><SnailIcon /></div>
              <span className="card-label">Snail</span>
              {livingSnails > 0 && <span className="card-count">{livingSnails}</span>}
            </button>
            <button className="item-card" onClick={() => addCreature('spider')}>
              <div className="card-icon-wrap creature-bg"><SpiderIcon /></div>
              <span className="card-label">Spider</span>
              {livingSpiders > 0 && <span className="card-count">{livingSpiders}</span>}
            </button>
            <button className="item-card" onClick={() => addCreature('worm')}>
              <div className="card-icon-wrap creature-bg"><WormIcon /></div>
              <span className="card-label">Worm</span>
              {livingWorms > 0 && <span className="card-count">{livingWorms}</span>}
            </button>
            <button className="item-card wide-card moisture-card" onClick={addMoisture}>
              <div className="card-icon-wrap water-bg"><WaterDropIcon /></div>
              <div className="card-text">
                <span className="card-label">Add Moisture</span>
                <span className="card-sub">(Water)</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Center viewport */}
        <main className="jar-viewport">
          <div className="viewport-label">Glass Jar Simulation View</div>
          <div className="jar-stage">
            <div className={`jar ${jarSprite.ready ? 'jar-image' : 'jar-fallback'} ${jarOpen ? 'open' : 'sealed'}`}>
              <div className="jar-interior">
                {sandLayers > 0 && (
                  <div className="sand-layer" style={{ height: `${8 + sandLayers * 3}%` }} />
                )}
                <div className="ground" style={{ height: `${groundHeight}%` }} />

                <div className="humidity-fog" style={{ opacity: humidityFogOpacity }} />
                {fogSprite.ready && humidity > 52 && (
                  <div className="fog-overlay" style={{ opacity: humidityFogOpacity * 0.85 }} />
                )}
                {waterSpriteAsset.ready && humidity > 58 && (
                  <div className="water-overlay" style={{ opacity: waterFxOpacity }} />
                )}

                {plants.map(plant => (
                  <div key={plant.id} className={`plant ${plant.type}`} style={{
                    left: `${plant.x}%`,
                    transform: `translateX(-50%) scale(${plant.size})`,
                  }}>
                    {plant.type === 'flower' && flowerSingle.ready ? (
                      <img src="/assets/plants/flowering-full.png" alt="" className="plant-single" />
                    ) : (
                      <img src={PLANT_SHEET_BY_TYPE[plant.type]} alt="" className="plant-sheet" style={{
                        transform: `translate(${-(plant.frame / 4) * 100}%, ${-(plantHealthRow / 3) * 100}%)`,
                      }} />
                    )}
                  </div>
                ))}

                {microbes.map(m => (
                  <div key={m.id} className="microbe" style={{
                    left: `${m.x}%`, top: `${m.y}%`,
                    transform: `translate(-50%, -50%) scale(${m.scale})`,
                  }} />
                ))}

                {pillBugs.map(bug => (
                  <div key={bug.id} className={`creature-sprite pillbug-sprite ${bug.phase === 'dead' ? 'dead' : ''}`} style={{
                    left: `${bug.x}%`, top: `${bug.y}%`,
                    transform: `translate(-50%, -50%) scaleX(${bug.vx < 0 ? -1 : 1})`,
                  }}>
                    <div className="pillbug-body" />
                  </div>
                ))}

                {worms.map(worm => (
                  <div key={worm.id} className={`creature-sprite worm-sprite ${worm.phase === 'dead' ? 'dead' : ''}`} style={{
                    left: `${worm.x}%`, top: `${worm.y}%`,
                    transform: `translate(-50%, -50%) scaleX(${worm.vx < 0 ? -1 : 1})`,
                  }}>
                    <div className="worm-body" />
                  </div>
                ))}

                {spiders.map(spider => (
                  <div key={spider.id} className={`creature-sprite spider-sprite ${spider.phase === 'dead' ? 'dead' : ''}`} style={{
                    left: `${spider.x}%`, top: `${spider.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}>
                    <div className="spider-body" />
                  </div>
                ))}

                {snails.map(snail => {
                  const flip = snail.vx < 0 ? -1 : 1;
                  const row = snail.phase === 'dead' ? SNAIL_ROWS.dead : SNAIL_ROWS.moving;

                  if (!snailSprite.ready && !snailSingle.ready) {
                    return (
                      <div key={snail.id} className={`snail-fallback ${snail.phase === 'dead' ? 'dead' : ''}`} style={{
                        left: `${snail.x}%`, top: `${snail.y}%`,
                        transform: `translate(-50%, -50%) scaleX(${flip})`,
                      }}>🐌</div>
                    );
                  }

                  if (snailSingle.ready) {
                    return (
                      <div key={snail.id} className={`snail-sprite ${snail.phase === 'dead' ? 'dead' : ''}`} style={{
                        left: `${snail.x}%`, top: `${snail.y}%`,
                        transform: `translate(-50%, -50%) scaleX(${flip})`,
                      }}>
                        <img src="/assets/creatures/snail-full.png" alt="" className="snail-single" />
                      </div>
                    );
                  }

                  return (
                    <div key={snail.id} className={`snail-sprite ${snail.phase === 'dead' ? 'dead' : ''}`} style={{
                      left: `${snail.x}%`, top: `${snail.y}%`,
                      transform: `translate(-50%, -50%) scaleX(${flip})`,
                    }}>
                      <img src="/assets/creatures/snail.png" alt="" className="snail-sheet" style={{
                        transform: `translate(${-(snail.frame / 4) * 100}%, ${-(row / 4) * 100}%)`,
                      }} />
                    </div>
                  );
                })}
              </div>
              {!jarSprite.ready && <div className="jar-fallback-glass" />}
            </div>
          </div>
          <p className="status-message">{message}</p>
        </main>

        {/* Right panel */}
        <aside className="panel plants-panel">
          <h2 className="panel-title">Plants & Substrate</h2>
          <div className="card-grid">
            <button className="item-card" onClick={() => addPlant('moss')}>
              <div className="card-icon-wrap plant-bg"><MossIcon /></div>
              <span className="card-label">Moss</span>
              {plants.filter(p => p.type === 'moss').length > 0 && (
                <span className="card-count">{plants.filter(p => p.type === 'moss').length}</span>
              )}
            </button>
            <button className="item-card" onClick={() => addPlant('fern')}>
              <div className="card-icon-wrap plant-bg"><FernIcon /></div>
              <span className="card-label">Fern</span>
              {plants.filter(p => p.type === 'fern').length > 0 && (
                <span className="card-count">{plants.filter(p => p.type === 'fern').length}</span>
              )}
            </button>
            <button className="item-card" onClick={() => addPlant('flower')}>
              <div className="card-icon-wrap plant-bg"><FlowerIcon /></div>
              <span className="card-label">Flower</span>
              {plants.filter(p => p.type === 'flower').length > 0 && (
                <span className="card-count">{plants.filter(p => p.type === 'flower').length}</span>
              )}
            </button>
            <button className="item-card" onClick={() => addSubstrate('soil')}>
              <div className="card-icon-wrap substrate-bg"><SoilIcon /></div>
              <span className="card-label">Soil</span>
              {soilLayers > 1 && <span className="card-count">{soilLayers}</span>}
            </button>
            <button className="item-card wide-card" onClick={() => addSubstrate('sand')}>
              <div className="card-icon-wrap substrate-bg"><SandIcon /></div>
              <span className="card-label">Sand</span>
              {sandLayers > 0 && <span className="card-count">{sandLayers}</span>}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Bottom Timeline ── */}
      <footer className="timeline-bar">
        <div className="timeline-section">
          <span className="timeline-title">Simulation Timeline</span>
          <div className="timeline-track-area">
            <div className="timeline-markers">
              <span className={day >= 0 ? 'marker active' : 'marker'}>Day 0</span>
              <span className={day >= 7 ? 'marker active' : 'marker'}>Week 1</span>
              <span className={day >= 30 ? 'marker active' : 'marker'}>Month 1</span>
              <span className={day >= 365 ? 'marker active' : 'marker'}>Year 1</span>
            </div>
            <div className="timeline-track">
              <div className="timeline-fill" style={{ width: `${timelineProgress}%` }} />
              <div className="timeline-thumb" style={{ left: `${timelineProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="timeline-actions">
          <button
            className={`play-pause-btn ${running ? 'playing' : ''}`}
            onClick={() => setRunning(v => !v)}
          >
            {running ? (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <polygon points="6,4 20,12 6,20" fill="currentColor" />
              </svg>
            )}
            <span>{running ? 'Pause' : 'Play'}</span>
          </button>

          <div className="survival-prediction">
            <span className="prediction-label">Survival Prediction:</span>
            <span className="prediction-value">
              {survivalMonths >= 24
                ? '2+ Years'
                : survivalMonths >= 12
                  ? `${survivalMonths} Months`
                  : `${survivalMonths} Month${survivalMonths !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
