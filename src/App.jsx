import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateEcosystemLongevity } from './ecosystemRules';

const SNAIL_COLS = 3;
const SNAIL_ROWS_COUNT = 4;
const SNAIL_ROWS = { moving: 0, turning: 1, idle: 2, dead: 3 };

const PILLBUG_COLS = 3;
const PILLBUG_ROWS_COUNT = 4;
const PILLBUG_ROWS = { moving: 0, turning: 1, idle: 2, dead: 3 };
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


/* ─── Main App ─── */

export default function App() {
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);
  const [score, setScore] = useState(0);
  const [moisture, setMoisture] = useState(0);
  const [lighting, setLighting] = useState(58);
  const [soil, setSoil] = useState(56);

  const nextId = useRef(300);
  function getNextId() { return nextId.current++; }

  const [snails, setSnails] = useState([]);
  const [pillBugs, setPillBugs] = useState([]);
  const [plants, setPlants] = useState([]);
  const [microbes, setMicrobes] = useState([]);
  const [soilLayers, setSoilLayers] = useState(0);
  const [message, setMessage] = useState('Your jar is empty! Add creatures, plants, and substrate to build your terrarium.');
  const [collapsed, setCollapsed] = useState(false);

  const snailSprite = useAsset('/assets/creatures/snail sprite.png');
  const jarSprite = useAsset('/assets/jar/jar.png');

  const livingSnails = useMemo(() => snails.filter(s => s.phase !== 'dead').length, [snails]);
  const livingPillBugs = useMemo(() => pillBugs.filter(b => b.phase !== 'dead').length, [pillBugs]);
  const totalCreatures = livingSnails + livingPillBugs;

  const ecosystemStability = useMemo(() => {
    const moistureFit = moisture === 2 ? 100 : moisture === 1 ? 75 : moisture === 3 ? 60 : 30;
    const lightFit = 100 - Math.abs(lighting - 62) * 1.5;
    const soilFit = 100 - Math.abs(soil - 58) * 1.3;
    const biodiversity = clamp(
      plants.length * 6 + microbes.length * 0.7 +
      livingSnails * 7 + livingPillBugs * 5,
      0, 100
    );
    const organismPressure = Math.max(0, totalCreatures * 6 - plants.length * 4);
    const substrateBenefit = clamp(soilLayers * 8, 0, 20);
    return clamp(
      moistureFit * 0.22 + lightFit * 0.16 + soilFit * 0.16 +
      biodiversity * 0.3 + substrateBenefit * 0.08 -
      organismPressure * 0.28,
      0, 100
    );
  }, [moisture, lighting, soil, plants.length, microbes.length,
      livingSnails, livingPillBugs,
      totalCreatures, soilLayers]);

  const plantHealthRow = useMemo(() => {
    if (ecosystemStability >= 72) return 0;
    if (ecosystemStability >= 42) return 1;
    return 2;
  }, [ecosystemStability]);

  const longevity = useMemo(
    () =>
      calculateEcosystemLongevity({
        plants,
        snails,
        pillBugs,
        moisture,
        lighting,
        soil,
        soilLayers,
      }),
    [plants, snails, pillBugs, moisture, lighting, soil, soilLayers]
  );

  const timelineProgress = useMemo(() => {
    if (day >= 365) return 100;
    return clamp((day / 365) * 100, 0, 100);
  }, [day]);

  /* ── Idle animation: cycle sprite sheet frames when paused ── */
  useEffect(() => {
    if (running) return undefined;
    const idle = setInterval(() => {
      setSnails(current => current.map(snail => {
        if (snail.phase === 'dead') return snail;
        return { ...snail, phase: 'idle', frame: (snail.frame + 1) % SNAIL_COLS };
      }));
      setPillBugs(current => current.map(bug => {
        if (bug.phase === 'dead') return bug;
        return { ...bug, phase: 'idle', frame: (bug.frame + 1) % PILLBUG_COLS };
      }));
      setPlants(current => current.map(plant => ({
        ...plant, frame: (plant.frame + 1) % 4,
      })));
    }, 300);
    return () => clearInterval(idle);
  }, [running]);

  /* ── Simulation (runs when playing) ── */
  useEffect(() => {
    if (!running || collapsed) return undefined;
    const timer = setInterval(() => {
      setDay(prev => {
        const nextDay = prev + 1;
        if (nextDay >= longevity.days) {
          setCollapsed(true);
          setRunning(false);
          setMessage(`Ecosystem collapsed on day ${nextDay}.`);
        }
        return nextDay;
      });

      setSnails(current => current.map(snail => {
        if (snail.phase === 'dead') return snail;
        let { phase, vx, x, vitality } = snail;
        const y = clamp(snail.y + randomRange(-0.2, 0.2), 64, 84);
        const dryPenalty = moisture === 0 ? 0.3 : 0;
        const moldPenalty = moisture === 3 ? 0.1 : 0;
        vitality = clamp(vitality - dryPenalty - moldPenalty + soil * 0.012, 0, 100);
        if (vitality <= 0) return { ...snail, vitality: 0, phase: 'dead', frame: 0 };
        if (Math.random() < 0.03) phase = 'idle';
        else if (phase === 'idle' && Math.random() < 0.3) phase = 'moving';
        if (phase === 'moving') x += vx * (0.46 + moisture * 0.15);
        if (x < 12 || x > 88) { phase = 'turning'; vx = -vx; x = clamp(x, 12, 88); }
        else if (phase === 'turning' && Math.random() < 0.4) phase = 'moving';
        return { ...snail, x, y, vx, phase, frame: (snail.frame + 1) % (phase === 'dead' ? 1 : SNAIL_COLS), vitality };
      }));

      setPillBugs(current => current.map(bug => {
        if (bug.phase === 'dead') return bug;
        let { phase, vx, x, vitality } = bug;
        const y = clamp(bug.y + randomRange(-0.15, 0.15), 72, 90);
        vitality = clamp(vitality - (moisture === 0 ? 0.15 : 0) + soil * 0.015, 0, 100);
        if (vitality <= 0) return { ...bug, vitality: 0, phase: 'dead', frame: 0 };
        if (Math.random() < 0.05) phase = 'idle';
        else if (phase === 'idle' && Math.random() < 0.35) phase = 'moving';
        if (phase === 'moving') x += vx * 0.35;
        if (x < 10 || x > 90) { vx = -vx; x = clamp(x, 10, 90); }
        return { ...bug, x, y, vx, phase, frame: (bug.frame + 1) % PILLBUG_COLS, vitality };
      }));

      setScore(v => {
        const humidityBonus = moisture === 2 ? 24 : moisture === 1 ? 16 : moisture === 3 ? 12 : 0;
        const stabilityBonus = ecosystemStability * 0.8;
        const survivalBonus = totalCreatures * 2;
        return Math.max(0, Math.round(v + 8 + humidityBonus + stabilityBonus + survivalBonus));
      });

      if (ecosystemStability < 35) setMessage('Stress rising — adjust conditions or add more diversity.');
      else if (ecosystemStability > 78) setMessage('Ecosystem thriving — excellent balance!');
      else setMessage('System stable — keep tuning for a higher score.');
    }, 150);
    return () => clearInterval(timer);
  }, [running, collapsed, moisture, soil, ecosystemStability, totalCreatures, longevity.days, longevity.reason]);

  const jarOpen = !running;
  const groundHeight = soilLayers > 0 ? 20 + soilLayers * 4 : 0;

  function addCreature(type) {
    const id = getNextId();
    switch (type) {
      case 'pillbug': setPillBugs(c => [...c, createPillBug(id)]); break;
      case 'snail':   setSnails(c => [...c, createSnail(id)]); break;
    }
  }

  function addPlant(type) {
    setPlants(c => [...c, createPlant(getNextId(), type)]);
  }

  function addMoisture() {
    setMoisture(v => Math.min(v + 1, 3));
  }

  function addSubstrate() {
    setSoilLayers(v => Math.min(v + 1, 5));
    setSoil(v => clamp(v + 6, 0, 100));
  }

  function removeCreature(type) {
    switch (type) {
      case 'pillbug': setPillBugs(c => c.length ? c.slice(0, -1) : c); break;
      case 'snail':   setSnails(c => c.length ? c.slice(0, -1) : c); break;
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
    setMoisture(v => Math.max(v - 1, 0));
  }

  function removeSubstrate() {
    setSoilLayers(v => Math.max(v - 1, 0));
    setSoil(v => clamp(v - 6, 0, 100));
  }

  function handlePlay() {
    const hasLife = snails.some(s => s.phase !== 'dead') ||
                    pillBugs.some(b => b.phase !== 'dead') ||
                    plants.length > 0;
    if (!hasLife) {
      setMessage('Cannot start — the jar is empty!');
      return;
    }
    if (collapsed) {
      setMessage('Ecosystem has collapsed. Reset to try again.');
      return;
    }
    setRunning(v => !v);
  }

  function resetWorld() {
    setRunning(false);
    setCollapsed(false);
    setDay(0);
    setScore(0);
    setMoisture(0);
    setLighting(58);
    setSoil(56);
    setSoilLayers(0);
    setSnails([]);
    setPillBugs([]);
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
              <button className="ctrl-btn minus" disabled={moisture === 0} onClick={removeMoisture}>−</button>
              <span className="ctrl-count">{moisture}</span>
              <button className="ctrl-btn plus" disabled={moisture >= 3} onClick={addMoisture}>+</button>
            </div>
          </div>
        </div>

        {/* Center: Glass Jar */}
        <div className="center-stage">
          <h2 className="center-heading">Glass Jar Simulation View</h2>

          <div className="jar-area">
            <div className={`jar ${jarSprite.ready ? 'jar-image' : 'jar-fallback'} ${jarOpen ? 'open' : 'sealed'}`}>
              {moisture > 0 && (
                <div className="water-level-overlay" style={{
                  backgroundPosition: `0% ${((moisture - 1) / 2) * 100}%`,
                }} />
              )}
              {soilLayers > 0 && <div className="soil-overlay" />}
              <div className="jar-interior">

                {plants.map(plant => (
                  <div key={plant.id} className={`plant ${plant.type}`} style={{
                    left: `${plant.x}%`,
                    transform: `translateX(-50%) scale(${plant.size})`,
                    backgroundImage: `url('${PLANT_SHEET_BY_TYPE[plant.type]}')`,
                    backgroundSize: '400% 300%',
                    backgroundPosition: `${(plant.frame / 3) * 100}% ${(plantHealthRow / 2) * 100}%`,
                  }} />
                ))}

                {microbes.map(m => (
                  <div key={m.id} className="microbe" style={{
                    left: `${m.x}%`, top: `${m.y}%`,
                    transform: `translate(-50%, -50%) scale(${m.scale})`,
                  }} />
                ))}

                {pillBugs.map(bug => {
                  const bugRow = PILLBUG_ROWS[bug.phase] ?? PILLBUG_ROWS.idle;
                  return (
                    <div key={bug.id} className={`pillbug-sprite ${bug.phase === 'dead' ? 'dead' : ''}`} style={{
                      left: `${bug.x}%`, top: `${bug.y}%`,
                      transform: `translate(-50%, -50%) scaleX(${bug.vx < 0 ? -1 : 1})`,
                      backgroundImage: "url('/assets/creatures/pillbug.png')",
                      backgroundSize: `${PILLBUG_COLS * 100}% ${PILLBUG_ROWS_COUNT * 100}%`,
                      backgroundPosition: `${(bug.frame / (PILLBUG_COLS - 1)) * 100}% ${(bugRow / (PILLBUG_ROWS_COUNT - 1)) * 100}%`,
                    }} />
                  );
                })}


                {snails.map(snail => {
                  const flip = snail.vx < 0 ? -1 : 1;
                  const row = SNAIL_ROWS[snail.phase] ?? SNAIL_ROWS.idle;
                  if (!snailSprite.ready) {
                    return (
                      <div key={snail.id} className={`snail-fallback ${snail.phase === 'dead' ? 'dead' : ''}`} style={{
                        left: `${snail.x}%`, top: `${snail.y}%`,
                        transform: `translate(-50%, -50%) scaleX(${flip})`,
                      }}>🐌</div>
                    );
                  }
                  return (
                    <div key={snail.id} className={`snail-sprite ${snail.phase === 'dead' ? 'dead' : ''}`} style={{
                      left: `${snail.x}%`, top: `${snail.y}%`,
                      transform: `translate(-50%, -50%) scaleX(${flip})`,
                      backgroundImage: "url('/assets/creatures/snail sprite.png')",
                      backgroundSize: `${SNAIL_COLS * 100}% ${SNAIL_ROWS_COUNT * 100}%`,
                      backgroundPosition: `${(snail.frame / (SNAIL_COLS - 1)) * 100}% ${(row / (SNAIL_ROWS_COUNT - 1)) * 100}%`,
                    }} />
                  );
                })}
              </div>
              {!jarSprite.ready && <div className="jar-fallback-glass" />}
              <div className="jar-border-overlay" />
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
                  <button className="ctrl-btn minus" disabled={count === 0} onClick={() => type === 'soil' ? removeSubstrate() : removePlant(type)}>−</button>
                  <span className="ctrl-count">{count}</span>
                  <button className="ctrl-btn plus" onClick={() => type === 'soil' ? addSubstrate() : addPlant(type)}>+</button>
                </div>
              </div>
            ))}
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
          <button className={`play-btn ${running ? 'is-playing' : ''}`} onClick={handlePlay} disabled={collapsed}>
            {running ? 'Pause' : 'Play'}{running ? '' : ' ▶'}
          </button>
          <button className="reset-btn" onClick={resetWorld}>Reset</button>
        </div>
      </div>
    </div>
  );
}
