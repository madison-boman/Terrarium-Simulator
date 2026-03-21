import React, { useEffect, useMemo, useState } from 'react';

const SNAIL_ROWS = {
  moving: 0,
  turning: 1,
  idle: 2,
  dead: 3,
};

const PLANT_SHEET_BY_TYPE = {
  moss: '/assets/plants/moss.png',
  fern: '/assets/plants/fern.png',
  flower: '/assets/plants/flowering.png',
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createSnail(id) {
  return {
    id,
    x: randomRange(16, 84),
    y: randomRange(66, 82),
    vx: Math.random() > 0.5 ? 1 : -1,
    phase: 'moving',
    frame: 0,
    vitality: randomRange(70, 96),
  };
}

function createPlant(id, type) {
  return {
    id,
    type,
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
    const image = new Image();
    image.onload = () => setStatus('ready');
    image.onerror = () => setStatus('missing');
    image.src = path;
  }, [path]);

  return {
    ready: status === 'ready',
    missing: status === 'missing',
  };
}

export default function App() {
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);
  const [score, setScore] = useState(0);
  const [humidity, setHumidity] = useState(60);
  const [lighting, setLighting] = useState(58);
  const [soil, setSoil] = useState(56);
  const [waterCycle, setWaterCycle] = useState(52);
  const [nextId, setNextId] = useState(7);

  const [snails, setSnails] = useState(() => Array.from({ length: 5 }, (_, idx) => createSnail(idx + 1)));
  const [plants, setPlants] = useState(() => [
    createPlant(101, 'moss'),
    createPlant(102, 'fern'),
    createPlant(103, 'moss'),
    createPlant(104, 'flower'),
  ]);
  const [microbes, setMicrobes] = useState(() =>
    Array.from({ length: 14 }, (_, idx) => createMicrobe(201 + idx))
  );

  const [message, setMessage] = useState('Build your terrarium, then press Run.');

  const snailSprite = useAsset('/assets/creatures/snail.png');
  const snailSingle = useAsset('/assets/creatures/snail-full.png');
  const jarSprite = useAsset('/assets/jar/jar.png');
  const waterSprite = useAsset('/assets/jar effects/water.png');
  const fogSprite = useAsset('/assets/jar effects/fog.png');
  const flowerSingle = useAsset('/assets/plants/flowering-full.png');

  const livingSnails = useMemo(() => snails.filter((snail) => snail.phase !== 'dead').length, [snails]);

  const ecosystemStability = useMemo(() => {
    const humidityFit = 100 - Math.abs(humidity - 68) * 1.6;
    const lightFit = 100 - Math.abs(lighting - 62) * 1.5;
    const soilFit = 100 - Math.abs(soil - 58) * 1.3;
    const moisturePressure = humidity > 82 ? (humidity - 82) * 2.1 : 0;
    const biodiversity = clamp(plants.length * 6 + microbes.length * 0.7 + livingSnails * 7, 0, 100);
    const organismPressure = Math.max(0, livingSnails * 8 - plants.length * 4);

    return clamp(
      humidityFit * 0.22 +
        lightFit * 0.18 +
        soilFit * 0.18 +
        biodiversity * 0.32 -
        moisturePressure * 0.55 -
        organismPressure * 0.32,
      0,
      100
    );
  }, [humidity, lighting, soil, plants.length, microbes.length, livingSnails]);

  const plantHealthRow = useMemo(() => {
    if (ecosystemStability >= 72) {
      return 0;
    }
    if (ecosystemStability >= 42) {
      return 1;
    }
    return 2;
  }, [ecosystemStability]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timer = setInterval(() => {
      setDay((value) => value + 1);

      setSnails((current) =>
        current.map((snail) => {
          if (snail.phase === 'dead') {
            return snail;
          }

          let phase = snail.phase;
          let vx = snail.vx;
          let x = snail.x;
          const y = clamp(snail.y + randomRange(-0.2, 0.2), 64, 84);
          let vitality = snail.vitality;

          const dryPenalty = humidity < 28 ? (28 - humidity) * 0.18 : 0;
          const moldPenalty = humidity > 86 ? (humidity - 86) * 0.12 : 0;
          vitality = clamp(vitality - dryPenalty - moldPenalty + soil * 0.012, 0, 100);

          if (vitality <= 0) {
            return {
              ...snail,
              vitality: 0,
              phase: 'dead',
              frame: 0,
            };
          }

          if (Math.random() < 0.03) {
            phase = 'idle';
          } else if (phase === 'idle' && Math.random() < 0.3) {
            phase = 'moving';
          }

          if (phase === 'moving') {
            const speed = 0.46 + (humidity / 100) * 0.5;
            x += vx * speed;
          }

          if (x < 12 || x > 88) {
            phase = 'turning';
            vx = -vx;
            x = clamp(x, 12, 88);
          } else if (phase === 'turning' && Math.random() < 0.4) {
            phase = 'moving';
          }

          const frameCount = phase === 'dead' ? 1 : 4;
          const frame = (snail.frame + 1) % frameCount;

          return {
            ...snail,
            x,
            y,
            vx,
            phase,
            frame,
            vitality,
          };
        })
      );

      setScore((value) => {
        const humidityBonus = clamp(24 - Math.abs(humidity - 68), 0, 24);
        const stabilityBonus = ecosystemStability * 0.8;
        const survivalBonus = livingSnails * 2.2;
        return Math.max(0, Math.round(value + 8 + humidityBonus + stabilityBonus + survivalBonus));
      });

      if (ecosystemStability < 35) {
        setMessage('Stress rising: adjust humidity, lighting, or add more plants.');
      } else if (ecosystemStability > 78) {
        setMessage('Terrarium thriving: biodiversity is in balance.');
      } else {
        setMessage('System stable: keep tuning to improve score.');
      }
    }, 150);

    return () => clearInterval(timer);
  }, [running, humidity, soil, ecosystemStability, livingSnails]);

  const humidityFogOpacity = clamp((humidity - 50) / 70, 0, 0.8);
  const waterFxOpacity = clamp((humidity - 62) / 38, 0, 0.92);
  const jarOpen = humidity > 72 || running;

  function addSnail() {
    setSnails((current) => [...current, createSnail(nextId)]);
    setNextId((value) => value + 1);
  }

  function addPlant(type) {
    setPlants((current) => [...current, createPlant(nextId + 1000, type)]);
    setNextId((value) => value + 1);
  }

  function addMicrobes() {
    setMicrobes((current) => [...current, createMicrobe(nextId + 2000), createMicrobe(nextId + 3000)]);
    setNextId((value) => value + 1);
  }

  function resetWorld() {
    setRunning(false);
    setDay(0);
    setScore(0);
    setHumidity(60);
    setLighting(58);
    setSoil(56);
    setWaterCycle(52);
    setSnails(Array.from({ length: 5 }, (_, idx) => createSnail(idx + 1)));
    setPlants([createPlant(101, 'moss'), createPlant(102, 'fern'), createPlant(103, 'moss'), createPlant(104, 'flower')]);
    setMicrobes(Array.from({ length: 14 }, (_, idx) => createMicrobe(201 + idx)));
    setMessage('Terrarium reset. Build your next ecosystem run.');
  }

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <h1>Terrarium Simulator</h1>
        <p className="subtitle">Game-style ecosystem builder</p>

        <div className="hud-block">
          <div className="hud-line">
            <span>Day</span>
            <strong>{day}</strong>
          </div>
          <div className="hud-line">
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div className="hud-line">
            <span>Stability</span>
            <strong>{ecosystemStability.toFixed(0)}%</strong>
          </div>
          <div className="stability-bar">
            <span style={{ width: `${ecosystemStability}%` }} />
          </div>
          <p className="status-text">{message}</p>
        </div>

        <div className="action-group">
          <h2>Add to Jar</h2>
          <div className="button-grid">
            <button onClick={addSnail}>+ Snail</button>
            <button onClick={() => addPlant('moss')}>+ Moss</button>
            <button onClick={() => addPlant('fern')}>+ Fern</button>
            <button onClick={() => addPlant('flower')}>+ Flower</button>
            <button onClick={addMicrobes}>+ Microbes</button>
          </div>
        </div>

        <div className="slider-group">
          <h2>Environment</h2>
          <label>
            Humidity <strong>{humidity}%</strong>
            <input
              type="range"
              min="0"
              max="100"
              value={humidity}
              onChange={(event) => setHumidity(Number(event.target.value))}
            />
          </label>
          <label>
            Lighting <strong>{lighting}%</strong>
            <input
              type="range"
              min="0"
              max="100"
              value={lighting}
              onChange={(event) => setLighting(Number(event.target.value))}
            />
          </label>
          <label>
            Soil Quality <strong>{soil}%</strong>
            <input
              type="range"
              min="0"
              max="100"
              value={soil}
              onChange={(event) => setSoil(Number(event.target.value))}
            />
          </label>
          <label>
            Water Cycle <strong>{waterCycle}%</strong>
            <input
              type="range"
              min="0"
              max="100"
              value={waterCycle}
              onChange={(event) => setWaterCycle(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="run-controls">
          <button className="run" onClick={() => setRunning(true)}>
            Run
          </button>
          <button onClick={() => setRunning(false)}>Pause</button>
          <button onClick={resetWorld}>Reset</button>
        </div>

        <p className="asset-note">
          Sprite paths: <code>public/assets/creatures/snail.png</code>, <code>jar/jar.png</code>,{' '}
          <code>jar effects/water.png</code>. Uncropped display sprites: <code>creatures/snail-full.png</code> and{' '}
          <code>plants/flowering-full.png</code>.
        </p>
      </aside>

      <main className="scene-panel">
        <div className="scene-header">
          <h2>Main Jar</h2>
          <div className="counts">
            <span>Snails: {livingSnails}</span>
            <span>Plants: {plants.length}</span>
            <span>Microbes: {microbes.length}</span>
          </div>
        </div>

        <div className="jar-stage">
          <div className={`jar ${jarSprite.ready ? 'jar-image' : 'jar-fallback'} ${jarOpen ? 'open' : 'sealed'}`}>
            <div className="jar-interior">
              <div className="ground" />
              <div className="humidity-fog" style={{ opacity: humidityFogOpacity }} />
              {fogSprite.ready && humidity > 52 ? (
                <div className="fog-overlay" style={{ opacity: humidityFogOpacity * 0.85 }} />
              ) : null}

              {waterSprite.ready && humidity > 58 ? (
                <div className="water-overlay" style={{ opacity: waterFxOpacity }} />
              ) : null}

              {plants.map((plant) => (
                <div
                  key={plant.id}
                  className={`plant ${plant.type}`}
                  style={{
                    left: `${plant.x}%`,
                    transform: `translateX(-50%) scale(${plant.size})`,
                  }}
                >
                  {plant.type === 'flower' && flowerSingle.ready ? (
                    <img src="/assets/plants/flowering-full.png" alt="" className="plant-single" />
                  ) : (
                    <img
                      src={PLANT_SHEET_BY_TYPE[plant.type]}
                      alt=""
                      className="plant-sheet"
                      style={{
                        transform: `translate(${-(plant.frame / 4) * 100}%, ${-(plantHealthRow / 3) * 100}%)`,
                      }}
                    />
                  )}
                </div>
              ))}

              {microbes.map((microbe) => (
                <div
                  key={microbe.id}
                  className="microbe"
                  style={{
                    left: `${microbe.x}%`,
                    top: `${microbe.y}%`,
                    transform: `translate(-50%, -50%) scale(${microbe.scale})`,
                  }}
                />
              ))}

              {snails.map((snail) => {
                const row = snail.phase === 'dead' ? SNAIL_ROWS.dead : SNAIL_ROWS.moving;
                const flip = snail.vx < 0 ? -1 : 1;

                if (!snailSprite.ready && !snailSingle.ready) {
                  return (
                    <div
                      key={snail.id}
                      className={`snail-fallback ${snail.phase === 'dead' ? 'dead' : ''}`}
                      style={{
                        left: `${snail.x}%`,
                        top: `${snail.y}%`,
                        transform: `translate(-50%, -50%) scaleX(${flip})`,
                      }}
                    >
                      🐌
                    </div>
                  );
                }

                if (snailSingle.ready) {
                  return (
                    <div
                      key={snail.id}
                      className={`snail-sprite ${snail.phase === 'dead' ? 'dead' : ''}`}
                      style={{
                        left: `${snail.x}%`,
                        top: `${snail.y}%`,
                        transform: `translate(-50%, -50%) scaleX(${flip})`,
                      }}
                    >
                      <img src="/assets/creatures/snail-full.png" alt="" className="snail-single" />
                    </div>
                  );
                }

                return (
                  <div
                    key={snail.id}
                    className={`snail-sprite ${snail.phase === 'dead' ? 'dead' : ''}`}
                    style={{
                      left: `${snail.x}%`,
                      top: `${snail.y}%`,
                      transform: `translate(-50%, -50%) scaleX(${flip})`,
                    }}
                  >
                    <img
                      src="/assets/creatures/snail.png"
                      alt=""
                      className="snail-sheet"
                      style={{
                        transform: `translate(${-(snail.frame / 4) * 100}%, ${-(row / 4) * 100}%)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {jarSprite.ready ? <div className="jar-glass" /> : <div className="jar-fallback-glass" />}
          </div>
        </div>
      </main>
    </div>
  );
}
