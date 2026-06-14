import pathfinderPkg from 'mineflayer-pathfinder';
import { Vec3, isPositionSafe } from '../utils/helpers.js';
import { log, logError } from '../utils/logger.js';

const { pathfinder, Movements, goals } = pathfinderPkg;

export const loadPathfinderPlugin = (bot) => {
  bot.loadPlugin(pathfinder);
};

export const initMovement = (bot) => {
  const movements = new Movements(bot, bot.registry);
  movements.canDig = true;
  movements.allowParkour = true;
  movements.allowSprinting = true;
  bot.pathfinder.setMovements(movements);
};

export const goTo = async (bot, pos, range = 1) => {
  try {
    const goal = new goals.GoalNear(pos.x, pos.y, pos.z, range);
    await bot.pathfinder.goto(goal);
    return true;
  } catch (err) {
    logError('Movement', err);
    return false;
  }
};

export const fleeFrom = async (bot, threatPos, distanceAway = 12) => {
  const botPos = bot.entity.position;
  const dir = botPos.minus(threatPos).normalize();
  let target = botPos.plus(dir.scaled(distanceAway));

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const rotated = new Vec3(
      dir.x * Math.cos(angle) - dir.z * Math.sin(angle),
      0,
      dir.x * Math.sin(angle) + dir.z * Math.cos(angle)
    );
    const candidate = botPos.plus(rotated.scaled(distanceAway));
    if (isPositionSafe(bot, candidate.floored())) { target = candidate; break; }
  }

  try {
    bot.pathfinder.setGoal(new goals.GoalNear(target.x, target.y, target.z, 1), true);
    return true;
  } catch (err) {
    logError('Flee', err);
    return false;
  }
};

export const stopMoving = (bot) => {
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
};

export const moveAwayFromEdge = async (bot) => {
  const pos = bot.entity.position.floored();
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dz === 0) continue;
      const candidate = pos.offset(dx, 0, dz);
      if (isPositionSafe(bot, candidate)) {
        const below = bot.blockAt(candidate.offset(0, -1, 0));
        if (below && below.boundingBox !== 'empty') {
          return goTo(bot, candidate, 0);
        }
      }
    }
  }
  return false;
};
