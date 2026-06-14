import { config } from '../config.js';
import { findNearestEntity, distXZ } from '../utils/helpers.js';

const HOSTILE_MOBS = new Set([
  'zombie', 'skeleton', 'spider', 'cave_spider', 'creeper', 'enderman',
  'witch', 'pillager', 'vindicator', 'evoker', 'ravager', 'phantom',
  'drowned', 'husk', 'stray', 'blaze', 'magma_cube', 'slime', 'silverfish',
  'guardian', 'elder_guardian', 'shulker', 'vex', 'piglin', 'piglin_brute',
  'hoglin', 'zoglin', 'warden', 'wither_skeleton'
]);

export const isHostile = (entity) => {
  if (!entity || entity.type !== 'mob') return false;
  return HOSTILE_MOBS.has(entity.name);
};

export const getNearestHostile = (bot, radius = config.danger.mobCheckRadius) => {
  return findNearestEntity(bot, (e) => isHostile(e), radius);
};

export const checkImmediateLavaDanger = (bot) => {
  const pos = bot.entity.position;
  const checks = [
    pos.offset(1, 0, 0), pos.offset(-1, 0, 0),
    pos.offset(0, 0, 1), pos.offset(0, 0, -1),
    pos.offset(0, -1, 0), pos.offset(1, -1, 0), pos.offset(-1, -1, 0),
    pos.offset(0, -1, 1), pos.offset(0, -1, -1)
  ];
  for (const c of checks) {
    const b = bot.blockAt(c);
    if (b && (b.name === 'lava' || b.name === 'flowing_lava' || b.name === 'fire')) return c;
  }
  return null;
};

export const checkFallDanger = (bot) => {
  const pos = bot.entity.position.floored();
  for (let dy = 1; dy <= 4; dy++) {
    const b = bot.blockAt(pos.offset(0, -dy, 0));
    if (!b || b.boundingBox === 'empty') continue;
    return dy > 3;
  }
  return true;
};

export const checkVoidDanger = (bot) => {
  return bot.entity.position.y < 0;
};

export const getCurrentDangers = (bot) => {
  const dangers = [];
  const lava = checkImmediateLavaDanger(bot);
  if (lava) dangers.push({ type: 'lava', pos: lava });

  const hostile = getNearestHostile(bot);
  if (hostile) {
    const d = bot.entity.position.distanceTo(hostile.position);
    dangers.push({ type: 'hostile', entity: hostile, distance: d });
  }

  if (checkVoidDanger(bot)) dangers.push({ type: 'void' });

  const health = bot.health ?? 20;
  if (health <= config.thresholds.criticalHealth) dangers.push({ type: 'critical_health', value: health });

  return dangers;
};
