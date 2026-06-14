import { config } from '../config.js';
import { findNearestEntity, findBlocksNear } from '../utils/helpers.js';
import { goTo } from './movement.js';
import { log, logError } from '../utils/logger.js';

const EDIBLE_ITEMS = new Set([
  'cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'cooked_mutton',
  'cooked_rabbit', 'cooked_cod', 'cooked_salmon', 'bread', 'apple',
  'golden_apple', 'carrot', 'potato', 'baked_potato', 'beetroot',
  'melon_slice', 'sweet_berries', 'glow_berries', 'pumpkin_pie',
  'mushroom_stew', 'rabbit_stew', 'beetroot_soup', 'dried_kelp',
  'cookie', 'beef', 'porkchop', 'chicken', 'mutton', 'rabbit', 'cod', 'salmon'
]);

const PASSIVE_FOOD_MOBS = new Set(['cow', 'pig', 'chicken', 'sheep', 'rabbit']);

export const hasFood = (bot) => {
  return bot.inventory.items().some(i => EDIBLE_ITEMS.has(i.name));
};

export const getBestFood = (bot) => {
  const items = bot.inventory.items().filter(i => EDIBLE_ITEMS.has(i.name));
  const priority = ['cooked_beef', 'cooked_porkchop', 'cooked_chicken', 'cooked_mutton', 'bread', 'baked_potato', 'cooked_salmon', 'cooked_cod', 'cooked_rabbit', 'apple', 'carrot', 'potato'];
  for (const p of priority) {
    const found = items.find(i => i.name === p);
    if (found) return found;
  }
  return items[0] || null;
};

export const eatFood = async (bot) => {
  const food = getBestFood(bot);
  if (!food) return false;
  try {
    if (bot.food >= 20) return false;
    await bot.equip(food, 'hand');
    await bot.consume();
    log('Food', `Ate ${food.name}`);
    return true;
  } catch (err) {
    logError('Food', err);
    return false;
  }
};

export const findHuntableMob = (bot) => {
  return findNearestEntity(bot, (e) => e.type === 'mob' && PASSIVE_FOOD_MOBS.has(e.name), config.food.searchRadius);
};

export const collectNearbyDrops = async (bot) => {
  const drop = findNearestEntity(bot, (e) => e.name === 'item' || e.type === 'object', 8);
  if (!drop) return false;
  try {
    await goTo(bot, drop.position, 0);
    return true;
  } catch {
    return false;
  }
};

export const findCropToHarvest = (bot) => {
  const matured = findBlocksNear(bot, (b) => {
    if (!b) return false;
    if (b.name === 'wheat' && b.metadata === 7) return true;
    if (b.name === 'carrots' && b.metadata === 7) return true;
    if (b.name === 'potatoes' && b.metadata === 7) return true;
    if (b.name === 'beetroots' && b.metadata === 3) return true;
    return false;
  }, 16, 1);
  return matured.length ? matured[0] : null;
};
