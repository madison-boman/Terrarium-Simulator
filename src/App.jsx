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

/* ─── SVG Icons ─── */

function PillBugIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <ellipse cx="40" cy="44" rx="26" ry="16" fill="#8B7355" stroke="#5C4A32" strokeWidth="2" />
      {[28, 34, 40, 46, 52].map(x => (
        <line key={x} x1={x} y1={29} x2={x} y2={59} stroke="#5C4A32" strokeWidth="1.5" />
      ))}
      <circle cx="16" cy="44" r="5" fill="#A08868" stroke="#5C4A32" strokeWidth="1.5" />
      <line x1="16" y1="39" x2="10" y2="28" stroke="#7A6548" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="39" x2="6" y2="32" stroke="#7A6548" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="27" r="2" fill="#5C4A32" />
      <circle cx="6" cy="31" r="2" fill="#5C4A32" />
      {[22, 30, 38, 50, 56].map((x, i) => (
        <line key={x} x1={x} y1={59} x2={x + (i < 2 ? -4 : i === 2 ? 0 : 4)} y2={70} stroke="#7A6548" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function SnailIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <ellipse cx="36" cy="58" rx="26" ry="10" fill="#C4A87A" stroke="#8B7355" strokeWidth="2" />
      <circle cx="50" cy="38" r="18" fill="#DCC8A0" stroke="#8B7355" strokeWidth="2.5" />
      <path d="M50 24 C56 28 58 36 50 38 C44 34 48 28 50 24Z" fill="#B09060" opacity="0.6" />
      <circle cx="50" cy="36" r="7" fill="none" stroke="#B09060" strokeWidth="1.5" />
      <circle cx="50" cy="36" r="3" fill="none" stroke="#B09060" strokeWidth="1" />
      <path d="M22 52 Q14 44 18 32" stroke="#C4A87A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M22 52 Q10 48 10 36" stroke="#C4A87A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="30" r="3" fill="#5A4A3A" />
      <circle cx="10" cy="34" r="3" fill="#5A4A3A" />
    </svg>
  );
}

function SpiderIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <ellipse cx="40" cy="36" rx="10" ry="8" fill="#4A4A4A" stroke="#2A2A2A" strokeWidth="1.5" />
      <ellipse cx="40" cy="50" rx="13" ry="10" fill="#3A3A3A" stroke="#2A2A2A" strokeWidth="1.5" />
      <path d="M30 40 Q18 28 8 20" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30 46 Q14 40 4 38" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30 52 Q16 56 6 60" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30 56 Q18 64 10 72" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 40 Q62 28 72 20" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 46 Q66 40 76 38" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 52 Q64 56 74 60" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 56 Q62 64 70 72" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="36" cy="34" r="3" fill="#C0392B" />
      <circle cx="44" cy="34" r="3" fill="#C0392B" />
    </svg>
  );
}

function WormIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <path d="M10 50 Q18 32 30 44 Q42 56 52 38 Q60 24 70 34" stroke="#C27888" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M10 50 Q18 32 30 44 Q42 56 52 38 Q60 24 70 34" stroke="#E0A0B4" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <circle cx="70" cy="34" r="5.5" fill="#C27888" stroke="#A05868" strokeWidth="1.5" />
      <circle cx="67" cy="32" r="2" fill="#3A2020" />
      <circle cx="73" cy="32" r="2" fill="#3A2020" />
    </svg>
  );
}

function WaterDropIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC8E3" />
          <stop offset="100%" stopColor="#3A7BD5" />
        </linearGradient>
      </defs>
      <path d="M40 8 Q24 34 24 50 Q24 68 40 72 Q56 68 56 50 Q56 34 40 8Z" fill="url(#wg)" stroke="#2A6090" strokeWidth="2" />
      <ellipse cx="34" cy="40" rx="5" ry="8" fill="rgba(255,255,255,0.35)" transform="rotate(-12 34 40)" />
    </svg>
  );
}

function MossIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <ellipse cx="40" cy="66" rx="32" ry="10" fill="#3A6B35" stroke="#2A5025" strokeWidth="1.5" />
      <ellipse cx="26" cy="56" rx="14" ry="14" fill="#4A8B45" />
      <ellipse cx="48" cy="52" rx="16" ry="16" fill="#5A9B55" />
      <ellipse cx="34" cy="48" rx="11" ry="11" fill="#6AAB65" />
      <ellipse cx="54" cy="60" rx="10" ry="9" fill="#4A8B45" />
      <circle cx="28" cy="50" r="3" fill="#82C87A" opacity="0.6" />
      <circle cx="44" cy="44" r="3.5" fill="#82C87A" opacity="0.6" />
      <circle cx="52" cy="54" r="2" fill="#82C87A" opacity="0.5" />
    </svg>
  );
}

function FernIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <line x1="40" y1="74" x2="40" y2="14" stroke="#3A7A35" strokeWidth="3" />
      {[
        [40, 22, 18, 14], [40, 22, 62, 14],
        [40, 32, 14, 24], [40, 32, 66, 24],
        [40, 42, 16, 34], [40, 42, 64, 34],
        [40, 52, 20, 44], [40, 52, 60, 44],
        [40, 60, 26, 54], [40, 60, 54, 54],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A9A45" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <ellipse cx="40" cy="12" rx="4" ry="6" fill="#4A9A45" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <line x1="40" y1="72" x2="40" y2="36" stroke="#4A8A40" strokeWidth="3" />
      <ellipse cx="28" cy="60" rx="8" ry="4" fill="#5A9A50" transform="rotate(-25 28 60)" />
      <ellipse cx="52" cy="54" rx="8" ry="4" fill="#5A9A50" transform="rotate(20 52 54)" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse key={angle} cx="40" cy="20" rx="6" ry="13" fill={i % 2 === 0 ? '#E8658A' : '#D4547A'} stroke={i % 2 === 0 ? '#C04868' : '#B03858'} strokeWidth="1" transform={`rotate(${angle} 40 28)`} />
      ))}
      <circle cx="40" cy="28" r="7" fill="#F4D03F" stroke="#D4B020" strokeWidth="1.5" />
    </svg>
  );
}

function SoilIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <path d="M6 50 Q24 28 40 34 Q56 28 74 50 L74 72 L6 72Z" fill="#6B4226" stroke="#4A2A14" strokeWidth="2" />
      <ellipse cx="24" cy="56" rx="5" ry="3" fill="#8B5A36" />
      <ellipse cx="48" cy="52" rx="4" ry="2.5" fill="#7B4A2E" />
      <ellipse cx="58" cy="62" rx="4" ry="2.5" fill="#8B5A36" />
      <circle cx="34" cy="64" r="2.5" fill="#9B6A46" />
      <circle cx="18" cy="66" r="2" fill="#9B6A46" />
      <path d="M30 44 L33 36 L36 44" stroke="#5A8A35" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M50 42 L52 36 L54 42" stroke="#5A8A35" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SandIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <path d="M8 52 Q26 34 40 40 Q54 34 72 52 L72 72 L8 72Z" fill="#E8D5A0" stroke="#B0A070" strokeWidth="2" />
      {[18, 28, 38, 48, 56, 64].map((x, i) => (
        <circle key={x} cx={x} cy={58 + (i % 3) * 2} r={2 + (i % 2)} fill="#C4B078" />
      ))}
      {[24, 44, 56].map((x, i) => (
        <circle key={x} cx={x} cy={66 + (i % 2)} r={1.5} fill="#B8A468" />
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
  function getNextId() { return nextId.current++; }

  const [snails, setSnails] = useState([]);
  const [pillBugs, setPillBugs] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const [worms, setWorms] = useState([]);
  const [plants, setPlants] = useState([]);
  const [microbes, setMicrobes] = useState([]);
  const [soilLayers, setSoilLayers] = useState(0);
  const [sandLayers, setSandLayers] = useState(0);
  const [message, setMessage] = useState('Your jar is empty! Add creatures, plants, and substrate to build your terrarium.');

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


  const timelineProgress = useMemo(() => {
    if (day >= 365) return 100;
    return clamp((day / 365) * 100, 0, 100);
  }, [day]);

  /* ── Simulation ── */
  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setDay(v => v + 1);

      setSnails(current => current.map(snail => {
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
        return { ...snail, x, y, vx, phase, frame: (snail.frame + 1) % (phase === 'dead' ? 1 : 4), vitality };
      }));

      setPillBugs(current => current.map(bug => {
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
      }));

      setSpiders(current => current.map(spider => {
        if (spider.phase === 'dead') return spider;
        let { vitality, x, y } = spider;
        vitality = clamp(vitality - 0.02 + (totalCreatures > 2 ? 0.05 : 0), 0, 100);
        if (vitality <= 0) return { ...spider, vitality: 0, phase: 'dead' };
        x = clamp(x + randomRange(-0.3, 0.3), 15, 85);
        y = clamp(y + randomRange(-0.3, 0.3), 18, 55);
        return { ...spider, x, y, vitality };
      }));

      setWorms(current => current.map(worm => {
        if (worm.phase === 'dead') return worm;
        let { vx, x, vitality } = worm;
        const y = clamp(worm.y + randomRange(-0.1, 0.1), 74, 92);
        vitality = clamp(vitality - (humidity < 35 ? 0.12 : 0) + soil * 0.018 + (sandLayers > 0 ? 0.02 : 0), 0, 100);
        if (vitality <= 0) return { ...worm, vitality: 0, phase: 'dead' };
        x += vx * 0.3;
        if (x < 12 || x > 88) { vx = -vx; x = clamp(x, 12, 88); }
        return { ...worm, x, y, vx, vitality, frame: (worm.frame + 1) % 4 };
      }));

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

  const humidityFogOpacity = clamp((humidity - 50) / 70, 0, 0.8);
  const waterFxOpacity = clamp((humidity - 62) / 38, 0, 0.92);
  const jarOpen = humidity > 72 || running;
  const groundHeight = soilLayers > 0 ? 20 + soilLayers * 4 + sandLayers * 3 : sandLayers * 3;

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

  function removeCreature(type) {
    switch (type) {
      case 'pillbug': setPillBugs(c => c.length ? c.slice(0, -1) : c); break;
      case 'snail':   setSnails(c => c.length ? c.slice(0, -1) : c); break;
      case 'spider':  setSpiders(c => c.length ? c.slice(0, -1) : c); break;
      case 'worm':    setWorms(c => c.length ? c.slice(0, -1) : c); break;
    }
  }

  function removePlant(type) {
    setPlants(c => {
      const idx = c.findLastIndex(p => p.type === type);
      if (idx === -1) return c;
      return [...c.slice(0, idx), ...c.slice(idx + 1)];
    });
  }

  function removeMoisture() {
    setHumidity(v => clamp(v - 8, 0, 100));
  }

  function removeSubstrate(type) {
    if (type === 'soil') {
      setSoilLayers(v => Math.max(v - 1, 0));
      setSoil(v => clamp(v - 6, 0, 100));
    } else {
      setSandLayers(v => Math.max(v - 1, 0));
      setWaterCycle(v => clamp(v - 5, 0, 100));
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
    setSoilLayers(0);
    setSandLayers(0);
    setSnails([]);
    setPillBugs([]);
    setSpiders([]);
    setWorms([]);
    setPlants([]);
    setMicrobes([]);
    setMessage('Your jar is empty! Add creatures, plants, and substrate to build your terrarium.');
    nextId.current = 300;
  }

  /* ── Render ── */
  return (
    <div className="game-container">
      {/* Title */}
      <h1 className="game-title">Terrarium Simulator Game</h1>

      {/* Main Row: Left Panel / Jar / Right Panel */}
      <div className="main-row">

        {/* Left: Creatures & Elements */}
        <div className="side-panel">
          <h2 className="panel-heading">Creatures & Elements</h2>
          <div className="item-grid">
            {[
              { type: 'pillbug', icon: <PillBugIcon />, label: 'Pill Bug', count: pillBugs.length },
              { type: 'snail', icon: <SnailIcon />, label: 'Snail', count: snails.length },
              { type: 'spider', icon: <SpiderIcon />, label: 'Spider', count: spiders.length },
              { type: 'worm', icon: <WormIcon />, label: 'Worm', count: worms.length },
            ].map(({ type, icon, label, count }) => (
              <div className="item-card" key={type}>
                {icon}
                <span className="item-name">{label}</span>
                <div className="card-controls">
                  <button className="ctrl-btn minus" disabled={count === 0} onClick={() => removeCreature(type)}>−</button>
                  <span className="ctrl-count">{count}</span>
                  <button className="ctrl-btn plus" onClick={() => addCreature(type)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="item-card moisture-card">
            <WaterDropIcon />
            <div className="moisture-text">
              <span className="item-name">Moisture</span>
              <span className="item-sub">(Water)</span>
            </div>
            <div className="card-controls">
              <button className="ctrl-btn minus" disabled={humidity <= 0} onClick={removeMoisture}>−</button>
              <span className="ctrl-count">{humidity}%</span>
              <button className="ctrl-btn plus" disabled={humidity >= 100} onClick={addMoisture}>+</button>
            </div>
          </div>
        </div>

        {/* Center: Glass Jar */}
        <div className="center-stage">
          <h2 className="center-heading">Glass Jar Simulation View</h2>
          <div className="jar-area">
            <div className={`jar ${jarSprite.ready ? 'jar-image' : 'jar-fallback'} ${jarOpen ? 'open' : 'sealed'}`}>
              <div className="jar-interior">
                {sandLayers > 0 && (
                  <div className="sand-layer" style={{ height: `${8 + sandLayers * 3}%` }} />
                )}
                {soilLayers > 0 && (
                  <div className="ground" style={{ height: `${groundHeight}%` }} />
                )}
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
                  }}><div className="pillbug-body" /></div>
                ))}

                {worms.map(worm => (
                  <div key={worm.id} className={`creature-sprite worm-sprite ${worm.phase === 'dead' ? 'dead' : ''}`} style={{
                    left: `${worm.x}%`, top: `${worm.y}%`,
                    transform: `translate(-50%, -50%) scaleX(${worm.vx < 0 ? -1 : 1})`,
                  }}><div className="worm-body" /></div>
                ))}

                {spiders.map(spider => (
                  <div key={spider.id} className={`creature-sprite spider-sprite ${spider.phase === 'dead' ? 'dead' : ''}`} style={{
                    left: `${spider.x}%`, top: `${spider.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}><div className="spider-body" /></div>
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
                      }}><img src="/assets/creatures/snail-full.png" alt="" className="snail-single" /></div>
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
        </div>

        {/* Right: Plants & Substrate */}
        <div className="side-panel">
          <h2 className="panel-heading">Plants & Substrate</h2>
          <div className="item-grid">
            {[
              { type: 'moss', icon: <MossIcon />, label: 'Moss', count: plants.filter(p => p.type === 'moss').length },
              { type: 'fern', icon: <FernIcon />, label: 'Fern', count: plants.filter(p => p.type === 'fern').length },
              { type: 'flower', icon: <FlowerIcon />, label: 'Flower', count: plants.filter(p => p.type === 'flower').length },
              { type: 'soil', icon: <SoilIcon />, label: 'Soil', count: soilLayers },
            ].map(({ type, icon, label, count }) => (
              <div className="item-card" key={type}>
                {icon}
                <span className="item-name">{label}</span>
                <div className="card-controls">
                  <button className="ctrl-btn minus" disabled={count === 0} onClick={() => type === 'soil' ? removeSubstrate('soil') : removePlant(type)}>−</button>
                  <span className="ctrl-count">{count}</span>
                  <button className="ctrl-btn plus" onClick={() => type === 'soil' ? addSubstrate('soil') : addPlant(type)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="item-card sand-card">
            <SandIcon />
            <span className="item-name">Sand</span>
            <div className="card-controls">
              <button className="ctrl-btn minus" disabled={sandLayers === 0} onClick={() => removeSubstrate('sand')}>−</button>
              <span className="ctrl-count">{sandLayers}</span>
              <button className="ctrl-btn plus" onClick={() => addSubstrate('sand')}>+</button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom: Simulation Timeline */}
      <div className="timeline-bar">
        <div className="timeline-left">
          <span className="timeline-label">Simulation Timeline</span>
        </div>
        <div className="timeline-center">
          <div className="timeline-markers">
            <span className={day >= 0 ? 'tm active' : 'tm'}>Day 0</span>
            <span className={day >= 7 ? 'tm active' : 'tm'}>Week 1</span>
            <span className={day >= 30 ? 'tm active' : 'tm'}>Month 1</span>
            <span className={day >= 365 ? 'tm active' : 'tm'}>Year 1</span>
          </div>
          <div className="timeline-track">
            <div className="timeline-fill" style={{ width: `${timelineProgress}%` }} />
            <div className="timeline-thumb" style={{ left: `${timelineProgress}%` }} />
          </div>
        </div>
        <div className="timeline-right">
          <button className={`play-btn ${running ? 'is-playing' : ''}`} onClick={() => setRunning(v => !v)}>
            {running ? 'Pause' : 'Play'}{running ? '' : ' ▶'}
          </button>
          <button className="reset-btn" onClick={resetWorld}>Reset</button>
        </div>
      </div>
    </div>
  );
}
