import { Vec3 } from '../utils/helpers.js';
import { log, logError } from '../utils/logger.js';

const BUILDABLE = new Set(['cobblestone', 'stone', 'dirt', 'oak_planks', 'spruce_planks', 'birch_planks', 'netherrack', 'sandstone', 'andesite']);

export const getBuildBlock = (bot) => {
  return bot.inventory.items().find(i => BUILDABLE.has(i.name));
};

export const placeBlockAt = async (bot, refBlockPos, faceVector, item) => {
  try {
    const refBlock = bot.blockAt(refBlockPos);
    if (!refBlock) return false;
    await bot.equip(item, 'hand');
    await bot.placeBlock(refBlock, faceVector);
    return true;
  } catch (err) {
    logError('Shelter', err);
    return false;
  }
};

export const emergencyPillarUp = async (bot) => {
  const block = getBuildBlock(bot);
  if (!block) return false;
  try {
    await bot.equip(block, 'hand');
    bot.setControlState('jump', true);
    await new Promise(r => setTimeout(r, 250));
    const pos = bot.entity.position.floored();
    const below = bot.blockAt(pos.offset(0, -1, 0));
    if (below) {
      await bot.placeBlock(below, new Vec3(0, 1, 0));
    }
    bot.setControlState('jump', false);
    return true;
  } catch (err) {
    bot.setControlState('jump', false);
    logError('Shelter', err);
    return false;
  }
};

export const boxInSelf = async (bot) => {
  const block = getBuildBlock(bot);
  if (!block) return false;
  const pos = bot.entity.position.floored();
  const sides = [
    { off: new Vec3(1, 0, 0), face: new Vec3(-1, 0, 0) },
    { off: new Vec3(-1, 0, 0), face: new Vec3(1, 0, 0) },
    { off: new Vec3(0, 0, 1), face: new Vec3(0, 0, -1) },
    { off: new Vec3(0, 0, -1), face: new Vec3(0, 0, 1) }
  ];
  let placed = 0;
  for (const s of sides) {
    const target = pos.plus(s.off);
    const targetBlock = bot.blockAt(target);
    if (targetBlock && targetBlock.boundingBox === 'empty') {
      const refPos = pos;
      const refBlock = bot.blockAt(refPos);
      try {
        await bot.equip(block, 'hand');
        await bot.placeBlock(refBlock, s.off);
        placed++;
      } catch {}
    }
  }
  return placed > 0;
};
