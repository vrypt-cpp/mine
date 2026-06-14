import { Vec3 } from 'vec3';

export const dist = (a, b) => a.position.distanceTo(b.position ? b.position : b);

export const distXZ = (a, b) => {
  const dx = a.x - b.x, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
};

export const findNearestEntity = (bot, predicate, maxDist = 32) => {
  let nearest = null, nearestDist = Infinity;
  for (const id in bot.entities) {
    const e = bot.entities[id];
    if (!e || e === bot.entity) continue;
    if (!predicate(e)) continue;
    const d = bot.entity.position.distanceTo(e.position);
    if (d < nearestDist && d <= maxDist) { nearest = e; nearestDist = d; }
  }
  return nearest;
};

export const findBlocksNear = (bot, matcher, maxDistance = 16, count = 5) => {
  return bot.findBlocks({
    matching: matcher,
    maxDistance,
    count
  });
};

export const isPositionSafe = (bot, pos) => {
  const below = bot.blockAt(pos.offset(0, -1, 0));
  const at = bot.blockAt(pos);
  const above = bot.blockAt(pos.offset(0, 1, 0));
  if (!below || !at || !above) return false;
  const dangerous = ['lava', 'fire', 'flowing_lava', 'flowing_water', 'cactus', 'magma_block', 'campfire', 'soul_campfire'];
  if (dangerous.includes(at.name) || dangerous.includes(below.name) || dangerous.includes(above.name)) return false;
  return true;
};

export const vecKey = (v) => `${Math.floor(v.x)},${Math.floor(v.y)},${Math.floor(v.z)}`;

export { Vec3 };
