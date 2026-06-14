import { config } from '../config.js';
import { getCurrentDangers, checkImmediateLavaDanger, getNearestHostile } from './danger.js';
import { fleeFrom, stopMoving, moveAwayFromEdge, goTo } from './movement.js';
import { eatFood, hasFood, findHuntableMob, collectNearbyDrops, findCropToHarvest } from './food.js';
import { attackEntity, shouldFight, retreatFromEntity, handleCreeper, equipBestWeapon } from './combat.js';
import { emergencyPillarUp } from './shelter.js';
import { log, logError } from '../utils/logger.js';

export const decideAndAct = async (bot, state) => {
  if (state.busy) return;
  state.busy = true;

  try {
    const dangers = getCurrentDangers(bot);

    const lavaDanger = dangers.find(d => d.type === 'lava');
    if (lavaDanger) {
      state.setMode('avoid_lava');
      stopMoving(bot);
      await fleeFrom(bot, lavaDanger.pos, 6);
      return;
    }

    const criticalHealth = dangers.find(d => d.type === 'critical_health');
    const hostile = dangers.find(d => d.type === 'hostile');

    if (criticalHealth) {
      state.setMode('critical');
      if (hostile) {
        await fleeFrom(bot, hostile.entity.position, 16);
      } else {
        await eatFood(bot);
        await emergencyPillarUp(bot);
      }
      return;
    }

    if (hostile) {
      const entity = hostile.entity;
      if (entity.name === 'creeper') {
        state.setMode('handle_creeper');
        await handleCreeper(bot, entity);
        return;
      }

      if (!shouldFight(bot, entity)) {
        state.setMode('retreat');
        await retreatFromEntity(bot, entity);
        return;
      }

      if (hostile.distance <= config.danger.mobCheckRadius) {
        state.setMode('combat');
        await attackEntity(bot, entity);
        return;
      }
    }

    const health = bot.health ?? 20;
    const food = bot.food ?? 20;

    if (health < config.thresholds.lowHealth && food < config.food.eatThreshold) {
      state.setMode('eat_heal');
      const ate = await eatFood(bot);
      if (ate) return;
    }

    if (food < config.thresholds.food) {
      state.setMode('find_food');

      if (hasFood(bot) && food < config.food.eatThreshold) {
        await eatFood(bot);
        return;
      }

      const crop = findCropToHarvest(bot);
      if (crop) {
        try {
          await goTo(bot, crop.position, 1);
          await bot.dig(bot.blockAt(crop.position));
          return;
        } catch (err) { logError('Brain', err); }
      }

      const mob = findHuntableMob(bot);
      if (mob) {
        await equipBestWeapon(bot);
        await attackEntity(bot, mob);
        return;
      }

      const collected = await collectNearbyDrops(bot);
      if (collected) return;

      state.setMode('idle');
      return;
    }

    if (bot.entity.onGround === false && bot.entity.velocity.y < -0.3) {
      const below = bot.blockAt(bot.entity.position.floored().offset(0, -1, 0));
      if (!below || below.boundingBox === 'empty') {
        state.setMode('fall_recovery');
      }
    }

    if (state.mode !== 'idle' || state.timeSinceModeChange() > 2000) {
      state.setMode('idle');
    }

  } catch (err) {
    logError('Brain', err);
  } finally {
    state.busy = false;
  }
};
