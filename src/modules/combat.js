import { config } from '../config.js';
import { goTo, fleeFrom, stopMoving } from './movement.js';
import { log, logError } from '../utils/logger.js';

const WEAPON_PRIORITY = [
  'netherite_sword', 'diamond_sword', 'iron_sword', 'stone_sword',
  'golden_sword', 'wooden_sword',
  'netherite_axe', 'diamond_axe', 'iron_axe', 'stone_axe', 'wooden_axe'
];

export const equipBestWeapon = async (bot) => {
  const items = bot.inventory.items();
  for (const w of WEAPON_PRIORITY) {
    const found = items.find(i => i.name === w);
    if (found) {
      try {
        if (bot.heldItem?.name !== w) await bot.equip(found, 'hand');
        return found;
      } catch (err) {
        logError('Combat', err);
      }
    }
  }
  return null;
};

export const equipShield = async (bot) => {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    try { await bot.equip(shield, 'off-hand'); } catch {}
    return true;
  }
  return false;
};

export const shouldFight = (bot, entity) => {
  const health = bot.health ?? 20;
  if (health <= config.combat.fleeHealth) return false;
  const dangerousAlone = ['creeper', 'enderman', 'warden', 'ravager'];
  if (dangerousAlone.includes(entity.name) && health < 14) return false;
  return true;
};

export const attackEntity = async (bot, entity) => {
  if (!entity || !entity.isValid) return false;
  await equipBestWeapon(bot);

  const distance = bot.entity.position.distanceTo(entity.position);
  if (distance > config.combat.attackRange) {
    await goTo(bot, entity.position, 2);
  }

  const newDist = bot.entity.position.distanceTo(entity.position);
  if (newDist <= config.combat.attackRange) {
    bot.lookAt(entity.position.offset(0, entity.height || 1, 0), true);
    bot.attack(entity);
    return true;
  }
  return false;
};

export const retreatFromEntity = async (bot, entity) => {
  stopMoving(bot);
  return fleeFrom(bot, entity.position, 14);
};

export const handleCreeper = async (bot, creeper) => {
  const distance = bot.entity.position.distanceTo(creeper.position);
  if (distance < 4) {
    return fleeFrom(bot, creeper.position, 10);
  }
  return attackEntity(bot, creeper);
};
