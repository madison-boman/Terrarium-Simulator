function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Calculate how many days a terrarium ecosystem will last.
 *
 * Three core inputs drive the estimate:
 *   1. Moisture  — discrete level 0-3 (dry → low → optimal → waterlogged)
 *   2. Plants    — count and variety, supported by lighting + soil layers
 *   3. Creatures — snails + pill bugs, balanced against plants
 *
 * An empty jar (no plants AND no living creatures) is an automatic 0-day fail.
 */
export function calculateEcosystemLongevity({
  plants,
  snails,
  pillBugs,
  moisture,
  lighting,
  soil,
  soilLayers,
}) {
  const livingSnails = snails.filter((s) => s.phase !== 'dead').length;
  const livingPillBugs = pillBugs.filter((b) => b.phase !== 'dead').length;
  const totalCreatures = livingSnails + livingPillBugs;
  const plantCount = plants.length;
  const totalOrganisms = totalCreatures + plantCount;

  // ──────────────────────────────────────
  //  AUTOMATIC FAIL: empty jar
  // ──────────────────────────────────────
  if (totalOrganisms === 0) {
    return {
      days: 0,
      verdict: 'FAIL',
      reason: 'Empty jar — nothing alive inside.',
      breakdown: { moisture: 0, plants: 0, creatures: 0, balance: 0 },
    };
  }

  // ──────────────────────────────────────
  //  1. MOISTURE  (weight 0.30)
  //     Level 0 = bone dry (catastrophic)
  //     Level 1 = low (survivable but stressful)
  //     Level 2 = optimal
  //     Level 3 = waterlogged (mold risk)
  // ──────────────────────────────────────
  const MOISTURE_SCORES = [0.05, 0.62, 1.0, 0.50];
  const moistureScore = MOISTURE_SCORES[clamp(moisture, 0, 3)];

  // ──────────────────────────────────────
  //  2. PLANTS  (weight 0.35)
  //     Plants produce O₂, food, and regulate moisture.
  //     Diminishing returns past ~8 plants.
  //     Lighting drives photosynthesis; soil layers feed roots.
  // ──────────────────────────────────────
  let plantScore;
  if (plantCount === 0) {
    plantScore = 0;
  } else {
    plantScore = clamp(1 - Math.exp(-plantCount * 0.32), 0, 1);
  }

  const lightFit = 1 - (Math.abs(lighting - 60) / 60) ** 1.3;
  plantScore *= clamp(lightFit, 0.1, 1);

  const soilBoost = soilLayers > 0 ? 0.75 + (soilLayers / 5) * 0.25 : 0.55;
  plantScore *= clamp(soilBoost, 0.55, 1);

  // ──────────────────────────────────────
  //  3. CREATURES  (weight 0.20)
  //     Both snails and pill bugs consume resources.
  //     Optimal ratio ≈ 1 creature per 2 plants.
  //     Plant-only jars are viable; creature-only jars are not.
  //     Dry conditions (moisture 0) stress creatures directly.
  // ──────────────────────────────────────
  let creatureScore;
  if (totalCreatures === 0) {
    creatureScore = 0.70;
  } else if (plantCount === 0) {
    creatureScore = 0.04;
  } else {
    const ratio = totalCreatures / Math.max(plantCount, 1);
    if (ratio <= 0.75) {
      creatureScore = 0.88 + ratio * 0.16;
    } else if (ratio <= 1.5) {
      creatureScore = 1 - (ratio - 0.75) * 0.45;
    } else {
      creatureScore = Math.max(0.04, 0.66 - (ratio - 1.5) * 0.32);
    }
  }

  if (totalCreatures > 0) {
    const dryStress = moisture === 0 ? 0.55 : 0;
    const moldStress = moisture === 3 ? 0.2 : 0;
    creatureScore *= 1 - dryStress - moldStress;
    creatureScore = clamp(creatureScore, 0, 1);
  }

  // ──────────────────────────────────────
  //  4. BALANCE / BIODIVERSITY  (weight 0.15)
  //     More distinct organism types → more resilient.
  //     Possible types: snail, pillbug, moss, fern, flower = up to 5.
  // ──────────────────────────────────────
  const kinds = new Set();
  if (livingSnails > 0) kinds.add('snail');
  if (livingPillBugs > 0) kinds.add('pillbug');
  plants.forEach((p) => kinds.add(p.type));
  const balanceScore = clamp(kinds.size / 4.5, 0.12, 1);

  // ──────────────────────────────────────
  //  LONGEVITY CALCULATION
  //  Base potential: 1 000 days for an ideal jar.
  //  Weighted average × critical-floor penalty.
  // ──────────────────────────────────────
  const BASE_DAYS = 1000;
  const weightedScore =
    moistureScore * 0.30 +
    plantScore * 0.35 +
    creatureScore * 0.20 +
    balanceScore * 0.15;

  const minCritical = Math.min(moistureScore, plantScore * 1.1);
  const criticalPenalty = minCritical < 0.12 ? minCritical / 0.12 : 1;

  const days = Math.round(BASE_DAYS * weightedScore * criticalPenalty);

  // ──────────────────────────────────────
  //  VERDICT
  // ──────────────────────────────────────
  let verdict, reason;
  if (days === 0) {
    verdict = 'FAIL';
    reason = 'Critical conditions — ecosystem cannot sustain life.';
  } else if (days < 7) {
    verdict = 'CRITICAL';
    reason = 'Severe imbalance. Collapse is imminent.';
  } else if (days < 30) {
    verdict = 'POOR';
    reason = 'Major stress. Add plants and balance moisture.';
  } else if (days < 90) {
    verdict = 'FAIR';
    reason = 'Moderate sustainability. Fine-tune for longer life.';
  } else if (days < 200) {
    verdict = 'GOOD';
    reason = 'Solid ecosystem — well-balanced jar.';
  } else if (days < 450) {
    verdict = 'EXCELLENT';
    reason = 'Thriving, self-sustaining cycles.';
  } else {
    verdict = 'PERFECT';
    reason = 'Near-perfect balance. Could last years.';
  }

  return {
    days,
    verdict,
    reason,
    breakdown: {
      moisture: Math.round(moistureScore * 100),
      plants: Math.round(plantScore * 100),
      creatures: Math.round(creatureScore * 100),
      balance: Math.round(balanceScore * 100),
    },
  };
}

