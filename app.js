const sliderIds = [
  'insects',
  'snails',
  'microbes',
  'moss',
  'ferns',
  'flowers',
  'light',
  'humidity',
  'soil',
  'water',
];

const ui = {
  runButton: document.getElementById('run-button'),
  pauseButton: document.getElementById('pause-button'),
  resetButton: document.getElementById('reset-button'),
  day: document.getElementById('day-value'),
  health: document.getElementById('health-value'),
  balance: document.getElementById('balance-value'),
  score: document.getElementById('score-value'),
  plantsMeter: document.getElementById('plants-meter'),
  pressureMeter: document.getElementById('pressure-meter'),
  moldMeter: document.getElementById('mold-meter'),
  timeline: document.getElementById('timeline'),
  terrariumVisual: document.getElementById('terrarium-visual'),
};

let timer = null;
let hasStarted = false;
let simState = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function closeness(value, target, tolerance) {
  return clamp(1 - Math.abs(value - target) / tolerance, 0, 1);
}

function getConfig() {
  const value = (id) => Number(document.getElementById(id).value);
  return {
    organisms: {
      insects: value('insects'),
      snails: value('snails'),
      microbes: value('microbes'),
    },
    plants: {
      moss: value('moss'),
      ferns: value('ferns'),
      flowers: value('flowers'),
    },
    environment: {
      light: value('light'),
      humidity: value('humidity'),
      soil: value('soil'),
      water: value('water'),
    },
  };
}

function initSimulationState(config) {
  const initialPlants =
    config.plants.moss * 1.1 + config.plants.ferns * 1.4 + config.plants.flowers * 1.6;

  return {
    day: 0,
    score: 0,
    avgBalance: 0,
    health: 70,
    balance: 70,
    lowHealthDays: 0,
    collapseReason: '',
    plants: {
      moss: config.plants.moss,
      ferns: config.plants.ferns,
      flowers: config.plants.flowers,
      biomass: initialPlants,
    },
    organisms: {
      insects: config.organisms.insects,
      snails: config.organisms.snails,
      microbes: config.organisms.microbes,
    },
    mold: clamp((config.environment.humidity - 55) * 0.4, 0, 28),
    nutrients: 35 + config.environment.soil * 0.5,
    env: { ...config.environment },
    finished: false,
  };
}

function calculateDiversity(state) {
  const groups = [
    state.organisms.insects > 0.8,
    state.organisms.snails > 0.8,
    state.organisms.microbes > 0.8,
    state.plants.moss > 0.8,
    state.plants.ferns > 0.8,
    state.plants.flowers > 0.8,
  ];
  return groups.filter(Boolean).length / groups.length;
}

function maybeTriggerEvent(state) {
  if (Math.random() > 0.17) {
    return null;
  }

  const events = [
    {
      type: 'risk',
      message: 'Heatwave spiked light and dropped humidity.',
      apply: () => {
        state.env.light = clamp(state.env.light + randomBetween(5, 12), 0, 100);
        state.env.humidity = clamp(state.env.humidity - randomBetween(7, 16), 0, 100);
      },
    },
    {
      type: 'risk',
      message: 'Heavy mist increased humidity and mold pressure.',
      apply: () => {
        state.env.humidity = clamp(state.env.humidity + randomBetween(8, 18), 0, 100);
        state.mold = clamp(state.mold + randomBetween(3, 8), 0, 100);
      },
    },
    {
      type: 'success',
      message: 'Microbial bloom boosted decomposition efficiency.',
      apply: () => {
        state.organisms.microbes += randomBetween(2, 6);
        state.nutrients = clamp(state.nutrients + randomBetween(4, 11), 0, 200);
      },
    },
    {
      type: 'risk',
      message: 'Insect breeding wave increased consumer pressure.',
      apply: () => {
        state.organisms.insects += randomBetween(2, 6);
      },
    },
  ];

  const selected = events[Math.floor(Math.random() * events.length)];
  selected.apply();
  return selected;
}

function stepSimulation(state, config) {
  state.day += 1;

  // Drift environment toward user-selected baseline while allowing random variance.
  state.env.light = clamp(
    state.env.light + (config.environment.light - state.env.light) * 0.18 + randomBetween(-4, 4),
    0,
    100
  );
  state.env.humidity = clamp(
    state.env.humidity +
      (config.environment.humidity - state.env.humidity) * 0.2 +
      randomBetween(-5, 5) +
      (state.day % 12 === 0 ? randomBetween(-8, 8) : 0),
    0,
    100
  );
  state.env.soil = clamp(
    state.env.soil + (config.environment.soil - state.env.soil) * 0.13 + randomBetween(-2.5, 2.5),
    0,
    100
  );
  state.env.water = clamp(
    state.env.water + (config.environment.water - state.env.water) * 0.2 + randomBetween(-4, 4),
    0,
    100
  );

  const event = maybeTriggerEvent(state);

  const totalOrganisms =
    state.organisms.insects * 1.1 + state.organisms.snails * 1.5 + state.organisms.microbes * 0.5;

  const lightFit = closeness(state.env.light, 64, 42);
  const humidityFit = closeness(state.env.humidity, 68, 36);
  const soilFit = closeness(state.env.soil, 60, 35);
  const waterFit = closeness(state.env.water, 62, 37);
  const producerConsumerFit = closeness(
    state.plants.biomass / Math.max(totalOrganisms, 1),
    2.7,
    2.2
  );

  const envPlantBoost = (lightFit + humidityFit + soilFit + waterFit) / 4;
  const grazingLoad = (state.organisms.insects * 0.13 + state.organisms.snails * 0.19) * 0.65;
  const moldDamage = state.mold * 0.06;
  const droughtPenalty = state.env.humidity < 32 ? (32 - state.env.humidity) * 0.16 : 0;
  const waterloggingPenalty = state.env.water > 82 ? (state.env.water - 82) * 0.11 : 0;

  const plantGrowth =
    state.plants.biomass * (0.03 + envPlantBoost * 0.05) +
    state.nutrients * 0.045 -
    grazingLoad -
    moldDamage -
    droughtPenalty -
    waterloggingPenalty;

  state.plants.biomass = clamp(state.plants.biomass + plantGrowth * 0.18, 0, 350);

  const plantFactor = clamp(state.plants.biomass / 120, 0, 1.8);
  const crowding = totalOrganisms > 115 ? (totalOrganisms - 115) / 180 : 0;

  state.organisms.insects = clamp(
    state.organisms.insects *
      (1 + 0.02 * plantFactor + 0.015 * humidityFit - 0.02 * crowding - 0.0018 * state.mold),
    0,
    180
  );

  state.organisms.snails = clamp(
    state.organisms.snails *
      (1 + 0.016 * plantFactor + 0.02 * humidityFit - 0.018 * crowding - 0.0015 * state.env.light),
    0,
    120
  );

  const detritus = clamp(grazingLoad + moldDamage + droughtPenalty, 0, 80);
  state.organisms.microbes = clamp(
    state.organisms.microbes *
      (1 + 0.014 + detritus * 0.0007 + closeness(state.env.humidity, 72, 46) * 0.008),
    0,
    240
  );

  // Plant composition reacts differently to conditions.
  state.plants.moss = clamp(
    state.plants.moss * (1 + 0.009 * humidityFit + 0.007 * waterFit - 0.009 * droughtPenalty),
    0,
    120
  );
  state.plants.ferns = clamp(
    state.plants.ferns *
      (1 + 0.009 * humidityFit + 0.008 * soilFit + 0.006 * lightFit - 0.007 * moldDamage),
    0,
    100
  );
  state.plants.flowers = clamp(
    state.plants.flowers *
      (1 + 0.012 * lightFit + 0.005 * soilFit - 0.009 * waterloggingPenalty - 0.006 * moldDamage),
    0,
    80
  );

  state.mold = clamp(
    state.mold +
      (state.env.humidity - 62) * 0.07 +
      (state.env.water - 65) * 0.06 +
      detritus * 0.015 -
      state.organisms.microbes * 0.016 -
      lightFit * 0.7,
    0,
    100
  );

  state.nutrients = clamp(
    state.nutrients + state.organisms.microbes * 0.034 + detritus * 0.05 - state.plants.biomass * 0.012,
    0,
    220
  );

  const diversity = calculateDiversity(state);
  state.balance = clamp(
    (producerConsumerFit * 34 +
      lightFit * 16 +
      humidityFit * 16 +
      soilFit * 13 +
      waterFit * 11 +
      diversity * 20) *
      (1 - state.mold / 180),
    0,
    100
  );

  const plantHealth = clamp(state.plants.biomass / 1.8, 0, 100);
  const organismHealth = clamp((totalOrganisms / 80) * 100, 0, 100);
  state.health = clamp(
    state.balance * 0.45 + plantHealth * 0.25 + organismHealth * 0.2 + (100 - state.mold) * 0.1,
    0,
    100
  );

  state.avgBalance = ((state.avgBalance * (state.day - 1)) + state.balance) / state.day;
  state.score = Math.max(
    0,
    Math.round(
      state.day * 14 + state.avgBalance * 9 + diversity * 180 + state.health * 3 - state.mold * 2.2
    )
  );

  if (state.health < 22) {
    state.lowHealthDays += 1;
  } else {
    state.lowHealthDays = 0;
  }

  if (state.plants.biomass < 4) {
    state.finished = true;
    state.collapseReason = 'Plant biomass crashed to zero.';
  } else if (state.organisms.insects + state.organisms.snails + state.organisms.microbes < 2) {
    state.finished = true;
    state.collapseReason = 'Organism populations went extinct.';
  } else if (state.mold > 96 && state.health < 30) {
    state.finished = true;
    state.collapseReason = 'Mold overgrowth overwhelmed the terrarium.';
  } else if (state.lowHealthDays >= 5) {
    state.finished = true;
    state.collapseReason = 'Sustained ecosystem stress triggered collapse.';
  } else if (state.day >= 365) {
    state.finished = true;
    state.collapseReason = 'Your ecosystem survived a full simulated year.';
  }

  return event;
}

function iconsForCount(icon, count, divider) {
  const amount = clamp(Math.round(count / divider), 0, 14);
  return amount > 0 ? icon.repeat(amount) : '—';
}

function renderTerrarium(state) {
  ui.terrariumVisual.innerHTML = `
    <div class="population-row"><strong>Moss</strong><span class="icons">${iconsForCount('🌿', state.plants.moss, 4)}</span><span>${state.plants.moss.toFixed(1)}</span></div>
    <div class="population-row"><strong>Ferns</strong><span class="icons">${iconsForCount('🌱', state.plants.ferns, 3.5)}</span><span>${state.plants.ferns.toFixed(1)}</span></div>
    <div class="population-row"><strong>Flowers</strong><span class="icons">${iconsForCount('🌸', state.plants.flowers, 2.5)}</span><span>${state.plants.flowers.toFixed(1)}</span></div>
    <div class="population-row"><strong>Insects</strong><span class="icons">${iconsForCount('🐞', state.organisms.insects, 4)}</span><span>${state.organisms.insects.toFixed(1)}</span></div>
    <div class="population-row"><strong>Snails</strong><span class="icons">${iconsForCount('🐌', state.organisms.snails, 2.6)}</span><span>${state.organisms.snails.toFixed(1)}</span></div>
    <div class="population-row"><strong>Microbes</strong><span class="icons">${iconsForCount('🦠', state.organisms.microbes, 5.5)}</span><span>${state.organisms.microbes.toFixed(1)}</span></div>
    <div class="population-row"><strong>Mold</strong><span class="icons">${iconsForCount('🫧', state.mold, 7)}</span><span>${state.mold.toFixed(1)}</span></div>
  `;
}

function pushTimeline(message, type = '') {
  const item = document.createElement('li');
  item.textContent = message;
  if (type) {
    item.classList.add(type);
  }
  ui.timeline.prepend(item);

  while (ui.timeline.children.length > 70) {
    ui.timeline.removeChild(ui.timeline.lastChild);
  }
}

function renderMetrics(state) {
  ui.day.textContent = String(state.day);
  ui.health.textContent = state.health.toFixed(1);
  ui.balance.textContent = state.balance.toFixed(1);
  ui.score.textContent = String(state.score);

  ui.plantsMeter.value = clamp((state.plants.biomass / 220) * 100, 0, 100);
  const pressure =
    state.organisms.insects * 1.1 + state.organisms.snails * 1.4 + state.organisms.microbes * 0.4;
  ui.pressureMeter.value = clamp((pressure / 140) * 100, 0, 100);
  ui.moldMeter.value = state.mold;

  renderTerrarium(state);
}

function summarizeDay(state) {
  if (state.day % 10 !== 0 || state.finished) {
    return;
  }

  if (state.health >= 75 && state.balance >= 70) {
    pushTimeline(`Day ${state.day}: Ecosystem is thriving with strong balance.`, 'success');
  } else if (state.health < 40 || state.balance < 35 || state.mold > 70) {
    pushTimeline(`Day ${state.day}: Warning - stress signals are accumulating.`, 'risk');
  } else {
    pushTimeline(`Day ${state.day}: Conditions remain stable with minor fluctuations.`);
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startSimulation() {
  if (timer) {
    return;
  }

  const config = getConfig();
  if (!hasStarted || simState?.finished) {
    simState = initSimulationState(config);
    hasStarted = true;
    ui.timeline.innerHTML = '';
    pushTimeline('Simulation started. Accelerating time...', 'success');
    renderMetrics(simState);
  }

  timer = setInterval(() => {
    const event = stepSimulation(simState, config);
    renderMetrics(simState);

    if (event) {
      pushTimeline(`Day ${simState.day}: ${event.message}`, event.type);
    }
    summarizeDay(simState);

    if (simState.finished) {
      stopTimer();
      if (simState.day >= 365) {
        pushTimeline(`Day ${simState.day}: ${simState.collapseReason} Final score: ${simState.score}.`, 'success');
      } else {
        pushTimeline(`Day ${simState.day}: ${simState.collapseReason} Final score: ${simState.score}.`, 'collapse');
      }
    }
  }, 300);
}

function pauseSimulation() {
  stopTimer();
  if (hasStarted && simState && !simState.finished) {
    pushTimeline(`Day ${simState.day}: Simulation paused.`);
  }
}

function resetSimulation() {
  stopTimer();
  hasStarted = false;
  simState = initSimulationState(getConfig());
  ui.timeline.innerHTML = '';
  renderMetrics(simState);
  pushTimeline('Simulation reset. Adjust sliders and run again.');
}

function bindSliderOutputs() {
  sliderIds.forEach((id) => {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}-output`);
    output.textContent = input.value;
    input.addEventListener('input', () => {
      output.textContent = input.value;
      if (!timer) {
        hasStarted = false;
        simState = initSimulationState(getConfig());
        renderMetrics(simState);
      }
    });
  });
}

function bindControls() {
  ui.runButton.addEventListener('click', startSimulation);
  ui.pauseButton.addEventListener('click', pauseSimulation);
  ui.resetButton.addEventListener('click', resetSimulation);
}

function bootstrap() {
  bindSliderOutputs();
  bindControls();
  simState = initSimulationState(getConfig());
  renderMetrics(simState);
  pushTimeline('Configure your terrarium and click "Run Simulation".');
}

bootstrap();
