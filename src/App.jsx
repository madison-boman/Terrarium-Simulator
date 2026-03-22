import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateEcosystemLongevity } from './ecosystemRules';

const SNAIL_COLS = 3;
const SNAIL_ROWS_COUNT = 4;
const SNAIL_ROWS = { moving: 0, turning: 1, idle: 2, dead: 3 };

const PILLBUG_COLS = 3;
const PILLBUG_ROWS_COUNT = 4;
const PILLBUG_ROWS = { moving: 0, turning: 1, idle: 2, dead: 3 };

const ANT_COLS = 3;
const ANT_ROWS_COUNT = 4;
const ANT_ROWS = { moving: 0, turning: 1, idle: 2, dead: 3 };
const PLANT_COLS = 3;
const PLANT_ROWS = 3;
const PLANT_SHEET_BY_TYPE = {
  moss: '/assets/plants/moss.png',
  fern: '/assets/plants/fern.png',
  flower: '/assets/plants/flowering.png',
  tallplant: '/assets/plants/tall plant.png',
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
    phase: 'moving', frame: 0, vitality: randomRange(50, 72),
  };
}

function createPillBug(id) {
  return {
    id, kind: 'pillbug',
    x: randomRange(14, 86), y: randomRange(72, 88),
    vx: Math.random() > 0.5 ? 0.7 : -0.7,
    phase: 'moving', frame: 0, vitality: randomRange(55, 78),
  };
}

function createAnt(id) {
  return {
    id, kind: 'ant',
    x: randomRange(12, 88), y: randomRange(60, 90),
    vx: Math.random() > 0.5 ? 1.2 : -1.2,
    phase: 'moving', frame: 0, vitality: randomRange(42, 62),
  };
}

function createPlant(id, type) {
  const sizeRange = type === 'tallplant'
    ? [0.75, 1.15]
    : [0.55, 0.95];
  return {
    id, type,
    x: randomRange(18, 82),
    size: randomRange(...sizeRange),
    frame: Math.floor(randomRange(0, PLANT_COLS)),
    health: 0,
    age: 0,
  };
}

function createFog(id) {
  const signX = Math.random() > 0.5 ? 1 : -1;
  const signY = Math.random() > 0.5 ? 1 : -1;
  return {
    id,
    x: randomRange(20, 80),
    y: randomRange(15, 50),
    frame: Math.floor(randomRange(0, 6)),
    dx: signX * randomRange(0.4, 1.0),
    dy: signY * randomRange(0.2, 0.6),
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

function AntIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <ellipse cx="28" cy="48" rx="10" ry="7" fill="#3A2A1A" />
      <ellipse cx="46" cy="46" rx="14" ry="9" fill="#4A3A2A" />
      <circle cx="18" cy="44" r="6" fill="#3A2A1A" />
      <circle cx="14" cy="38" r="2" fill="#2A1A0A" />
      <circle cx="20" cy="36" r="2" fill="#2A1A0A" />
      <line x1="14" y1="38" x2="8" y2="28" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="36" x2="18" y2="26" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
      {[24, 32, 42, 50, 56].map((x, i) => (
        <line key={x} x1={x} y1={i < 2 ? 54 : 54} x2={x + (i < 2 ? -6 : i === 2 ? 0 : 6)} y2={66} stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
      ))}
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

function TallPlantIcon() {
  return (
    <svg viewBox="0 0 80 80" className="item-icon">
      <line x1="40" y1="76" x2="40" y2="8" stroke="#3A7A35" strokeWidth="3" />
      <ellipse cx="30" cy="64" rx="10" ry="4" fill="#4A9A45" transform="rotate(-15 30 64)" />
      <ellipse cx="50" cy="56" rx="10" ry="4" fill="#5AAA55" transform="rotate(15 50 56)" />
      <ellipse cx="28" cy="44" rx="12" ry="5" fill="#4A9A45" transform="rotate(-20 28 44)" />
      <ellipse cx="52" cy="34" rx="12" ry="5" fill="#5AAA55" transform="rotate(18 52 34)" />
      <ellipse cx="32" cy="22" rx="10" ry="4.5" fill="#4A9A45" transform="rotate(-15 32 22)" />
      <ellipse cx="40" cy="10" rx="6" ry="8" fill="#5AAA55" />
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
  const [ants, setAnts] = useState([]);
  const [plants, setPlants] = useState([]);
  const [microbes, setMicrobes] = useState([]);
  const [soilLayers, setSoilLayers] = useState(0);
  const [fogs, setFogs] = useState([]);
  const [message, setMessage] = useState('Your jar is empty! Add creatures, plants, and substrate to build your terrarium.');
  const [collapsed, setCollapsed] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  const snailSprite = useAsset('/assets/creatures/snail sprite.png');
  const jarSprite = useAsset('/assets/jar/jar.png');

  const livingSnails = useMemo(() => snails.filter(s => s.phase !== 'dead').length, [snails]);
  const livingPillBugs = useMemo(() => pillBugs.filter(b => b.phase !== 'dead').length, [pillBugs]);
  const livingAnts = useMemo(() => ants.filter(a => a.phase !== 'dead').length, [ants]);
  const totalCreatures = livingSnails + livingPillBugs + livingAnts;

  const ecosystemStability = useMemo(() => {
    const moistureFit = moisture === 2 ? 100 : moisture === 1 ? 75 : moisture === 3 ? 60 : 30;
    const lightFit = 100 - Math.abs(lighting - 62) * 1.5;
    const soilFit = 100 - Math.abs(soil - 58) * 1.3;
    const biodiversity = clamp(
      plants.length * 6 + microbes.length * 0.7 +
      livingSnails * 7 + livingPillBugs * 5 + livingAnts * 4,
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
      livingSnails, livingPillBugs, livingAnts,
      totalCreatures, soilLayers]);


  const longevity = useMemo(
    () =>
      calculateEcosystemLongevity({
        plants,
        snails,
        pillBugs,
        ants,
        moisture,
        lighting,
        soil,
        soilLayers,
      }),
    [plants, snails, pillBugs, ants, moisture, lighting, soil, soilLayers]
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
      setAnts(current => current.map(ant => {
        if (ant.phase === 'dead') return ant;
        return { ...ant, phase: 'idle', frame: (ant.frame + 1) % ANT_COLS };
      }));
    }, 300);
    return () => clearInterval(idle);
  }, [running]);

  useEffect(() => {
    const drift = setInterval(() => {
      setFogs(current => {
        if (current.length === 0) return current;
        return current.map(fog => {
          let { x, y, dx, dy, frame } = fog;
          x += dx;
          y += dy;
          if (x < 10 || x > 90) dx = -dx;
          if (y < 10 || y > 60) dy = -dy;
          x = clamp(x, 10, 90);
          y = clamp(y, 10, 60);
          if (Math.random() < 0.08) dx += randomRange(-0.4, 0.4);
          if (Math.random() < 0.08) dy += randomRange(-0.3, 0.3);
          dx = clamp(dx, -1.2, 1.2);
          dy = clamp(dy, -0.7, 0.7);
          frame = (frame + 1) % 6;
          return { ...fog, x, y, dx, dy, frame };
        });
      });
    }, 180);
    return () => clearInterval(drift);
  }, []);

  /* ── Simulation (runs when playing) ── */
  useEffect(() => {
    if (!running || collapsed) return undefined;
    const timer = setInterval(() => {
      setDay(prev => {
        const nextDay = prev + 1;
        if (nextDay >= longevity.days) {
          setCollapsed(true);
          setRunning(false);
          setTimeout(() => {
            setScore(currentScore => {
              setFinalResults({ day: nextDay, score: currentScore });
              return currentScore;
            });
          }, 3000);
        }
        return nextDay;
      });

      setSnails(current => current.map(snail => {
        if (snail.phase === 'dead') return snail;
        let { phase, vx, x, vitality } = snail;
        const y = clamp(snail.y + randomRange(-0.2, 0.2), 64, 84);
        const dryPenalty = moisture === 0 ? 0.3 : 0;
        const moldPenalty = moisture === 3 ? 0.1 : 0;
        vitality = clamp(vitality - 0.22 - dryPenalty - moldPenalty + soil * 0.003, 0, 100);
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
        vitality = clamp(vitality - 0.25 - (moisture === 0 ? 0.15 : 0) + soil * 0.003, 0, 100);
        if (vitality <= 0) return { ...bug, vitality: 0, phase: 'dead', frame: 0 };
        if (Math.random() < 0.05) phase = 'idle';
        else if (phase === 'idle' && Math.random() < 0.35) phase = 'moving';
        if (phase === 'moving') x += vx * 0.35;
        if (x < 10 || x > 90) { vx = -vx; x = clamp(x, 10, 90); }
        return { ...bug, x, y, vx, phase, frame: (bug.frame + 1) % PILLBUG_COLS, vitality };
      }));

      setAnts(current => current.map(ant => {
        if (ant.phase === 'dead') return ant;
        let { phase, vx, x, vitality } = ant;
        const y = clamp(ant.y + randomRange(-0.3, 0.3), 58, 92);
        vitality = clamp(vitality - 0.24 - (moisture === 0 ? 0.2 : 0) + soil * 0.003, 0, 100);
        if (vitality <= 0) return { ...ant, vitality: 0, phase: 'dead', frame: 0 };
        if (Math.random() < 0.04) phase = 'idle';
        else if (phase === 'idle' && Math.random() < 0.4) phase = 'moving';
        if (phase === 'moving') x += vx * 0.6;
        if (x < 8 || x > 92) { phase = 'turning'; vx = -vx; x = clamp(x, 8, 92); }
        else if (phase === 'turning' && Math.random() < 0.5) phase = 'moving';
        return { ...ant, x, y, vx, phase, frame: (ant.frame + 1) % ANT_COLS, vitality };
      }));

      setPlants(current => current.map(plant => {
        const age = plant.age + 1;
        if (age < 40) return { ...plant, age };
        let targetHealth;
        if (ecosystemStability >= 72) targetHealth = 0;
        else if (ecosystemStability >= 42) targetHealth = 1;
        else targetHealth = 2;
        if (plant.health < targetHealth && Math.random() < 0.03) {
          return { ...plant, age, health: plant.health + 1 };
        }
        if (plant.health > targetHealth && Math.random() < 0.02) {
          return { ...plant, age, health: plant.health - 1 };
        }
        return { ...plant, age };
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

  useEffect(() => {
    if (!running || collapsed) return;
    const allDead = totalCreatures === 0 && plants.every(p => p.health >= 2);
    const hasOrganisms = snails.length > 0 || pillBugs.length > 0 || ants.length > 0 || plants.length > 0;
    if (!hasOrganisms || !allDead) return;

    setCollapsed(true);
    setRunning(false);
    const timeout = setTimeout(() => {
      setScore(currentScore => {
        setFinalResults({ day, score: currentScore });
        return currentScore;
      });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [running, collapsed, totalCreatures, plants, snails.length, pillBugs.length, ants.length, day]);

  const jarOpen = !running;
  const groundHeight = soilLayers > 0 ? 20 + soilLayers * 4 : 0;

  function addCreature(type) {
    const id = getNextId();
    switch (type) {
      case 'pillbug': setPillBugs(c => [...c, createPillBug(id)]); break;
      case 'snail':   setSnails(c => [...c, createSnail(id)]); break;
      case 'ant':     setAnts(c => [...c, createAnt(id)]); break;
    }
  }

  function addPlant(type) {
    setPlants(c => [...c, createPlant(getNextId(), type)]);
  }

  function addMoisture() {
    setMoisture(v => {
      if (v >= 3) {
        setFogs(f => [...f, createFog(getNextId())]);
      }
      return v + 1;
    });
  }

  function toggleSoil() {
    setSoilLayers(v => {
      const next = v > 0 ? 0 : 1;
      setSoil(next > 0 ? 62 : 56);
      return next;
    });
  }

  function removeCreature(type) {
    switch (type) {
      case 'pillbug': setPillBugs(c => c.length ? c.slice(0, -1) : c); break;
      case 'snail':   setSnails(c => c.length ? c.slice(0, -1) : c); break;
      case 'ant':     setAnts(c => c.length ? c.slice(0, -1) : c); break;
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
    setMoisture(v => {
      if (v > 3) {
        setFogs(f => f.slice(0, -1));
      }
      return Math.max(v - 1, 0);
    });
  }


  function handlePlay() {
    const hasLife = snails.some(s => s.phase !== 'dead') ||
                    pillBugs.some(b => b.phase !== 'dead') ||
                    ants.some(a => a.phase !== 'dead') ||
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

  function dismissResults() {
    setFinalResults(null);
    resetWorld();
  }

  function resetWorld() {
    setRunning(false);
    setCollapsed(false);
    setFinalResults(null);
    setDay(0);
    setScore(0);
    setMoisture(0);
    setLighting(58);
    setSoil(56);
    setSoilLayers(0);
    setSnails([]);
    setPillBugs([]);
    setAnts([]);
    setPlants([]);
    setMicrobes([]);
    setFogs([]);
    setMessage('Your jar is empty! Add creatures, plants, and substrate to build your terrarium.');
    nextId.current = 300;
  }

  /* ── Render ── */
  return (
    <div className="game-container">
      {/* Title */}
      <div className="game-hud-bar">
        <span className="hud-title">Terrarium Simulator</span>
        <div className="hud-stats">
          <div className="hud-stat">
            <span className="hud-stat-icon">☀</span>
            <span className="hud-stat-label">Day</span>
            <span className="hud-stat-value">{day}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-stat-icon">★</span>
            <span className="hud-stat-label">Score</span>
            <span className="hud-stat-value">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Row: Sidebar / Jar + Timeline */}
      <div className="main-row">

        <div className="side-panel">
          <h2 className="panel-heading">Add to Jar</h2>
          <div className="item-grid">
            {[
              { type: 'pillbug', icon: <PillBugIcon />, label: 'Pill Bug', count: pillBugs.length, action: () => addCreature('pillbug'), remove: () => removeCreature('pillbug') },
              { type: 'snail', icon: <SnailIcon />, label: 'Snail', count: snails.length, action: () => addCreature('snail'), remove: () => removeCreature('snail') },
              { type: 'ant', icon: <AntIcon />, label: 'Ant', count: ants.length, action: () => addCreature('ant'), remove: () => removeCreature('ant') },
              { type: 'moss', icon: <MossIcon />, label: 'Moss', count: plants.filter(p => p.type === 'moss').length, action: () => addPlant('moss'), remove: () => removePlant('moss') },
              { type: 'fern', icon: <FernIcon />, label: 'Fern', count: plants.filter(p => p.type === 'fern').length, action: () => addPlant('fern'), remove: () => removePlant('fern') },
              { type: 'flower', icon: <FlowerIcon />, label: 'Flower', count: plants.filter(p => p.type === 'flower').length, action: () => addPlant('flower'), remove: () => removePlant('flower') },
              { type: 'tallplant', icon: <TallPlantIcon />, label: 'Tall Plant', count: plants.filter(p => p.type === 'tallplant').length, action: () => addPlant('tallplant'), remove: () => removePlant('tallplant') },
            ].map(({ type, icon, label, count, action, remove }) => (
              <div className="item-card" key={type}>
                {icon}
                <span className="item-name">{label}</span>
                <div className="card-controls">
                  <button className="ctrl-btn minus" disabled={count === 0} onClick={remove}>−</button>
                  <span className="ctrl-count">{count}</span>
                  <button className="ctrl-btn plus" onClick={action}>+</button>
                </div>
              </div>
            ))}
          </div>
          <button className={`toggle-card ${soilLayers > 0 ? 'active' : ''}`} onClick={toggleSoil}>
            <SoilIcon />
            <span className="item-name">Soil</span>
            <span className="toggle-state">{soilLayers > 0 ? 'On' : 'Off'}</span>
          </button>
          <div className="item-card moisture-card">
            <WaterDropIcon />
            <div className="moisture-text">
              <span className="item-name">Moisture</span>
              <span className="item-sub">(Water)</span>
            </div>
            <div className="card-controls">
              <button className="ctrl-btn minus" disabled={moisture === 0} onClick={removeMoisture}>−</button>
              <span className="ctrl-count">{moisture}</span>
              <button className="ctrl-btn plus" onClick={addMoisture}>+</button>
            </div>
          </div>
        </div>

        <div className="jar-column">
          <div className="jar-area">
            <div className={`jar ${jarSprite.ready ? 'jar-image' : 'jar-fallback'} ${jarOpen ? 'open' : 'sealed'}`}>
              {moisture > 0 && (
                <div className="water-level-overlay" style={{
                  backgroundPosition: `0% ${((Math.min(moisture, 3) - 1) / 2) * 100}%`,
                }} />
              )}
              {soilLayers > 0 && <div className="soil-overlay" />}
              <div className="jar-interior">

                {fogs.map(fog => (
                  <div key={fog.id} className="fog-puff" style={{
                    left: `${fog.x}%`,
                    top: `${fog.y}%`,
                    backgroundImage: "url('/assets/jar effects/fog.png')",
                    backgroundSize: '600% 100%',
                    backgroundPosition: `${(fog.frame / 5) * 100}% 0%`,
                  }} />
                ))}

                {plants.map(plant => (
                  <div key={plant.id} className={`plant ${plant.type}`} style={{
                    left: `${plant.x}%`,
                    transform: `translateX(-50%) scale(${plant.size})`,
                    backgroundImage: `url('${PLANT_SHEET_BY_TYPE[plant.type]}')`,
                    backgroundSize: `${PLANT_COLS * 100}% ${PLANT_ROWS * 100}%`,
                    backgroundPosition: `${(plant.health / (PLANT_COLS - 1)) * 100}% ${(plant.frame / (PLANT_ROWS - 1)) * 100}%`,
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

                {ants.map(ant => {
                  const antRow = ANT_ROWS[ant.phase] ?? ANT_ROWS.idle;
                  return (
                    <div key={ant.id} className={`ant-sprite ${ant.phase === 'dead' ? 'dead' : ''}`} style={{
                      left: `${ant.x}%`, top: `${ant.y}%`,
                      transform: `translate(-50%, -50%) scaleX(${ant.vx < 0 ? -1 : 1})`,
                      backgroundImage: "url('/assets/creatures/ant.png')",
                      backgroundSize: `${ANT_COLS * 100}% ${ANT_ROWS_COUNT * 100}%`,
                      backgroundPosition: `${(ant.frame / (ANT_COLS - 1)) * 100}% ${(antRow / (ANT_ROWS_COUNT - 1)) * 100}%`,
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

          <div className="timeline-bar">
            <div className="timeline-left">
              <span className="timeline-label">Timeline</span>
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

      </div>

      {finalResults && (
        <div className="results-overlay" onClick={dismissResults}>
          <div className="results-popup" onClick={e => e.stopPropagation()}>
            <h2 className="results-title">Ecosystem Collapsed</h2>
            <div className="results-stats">
              <div className="results-stat">
                <span className="results-stat-value">{finalResults.day}</span>
                <span className="results-stat-label">Days Survived</span>
              </div>
              <div className="results-stat">
                <span className="results-stat-value">{finalResults.score.toLocaleString()}</span>
                <span className="results-stat-label">Final Score</span>
              </div>
            </div>
            <button className="results-dismiss" onClick={dismissResults}>Try Again</button>
          </div>
        </div>
      )}

    </div>
  );
}
