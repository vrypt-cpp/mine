import { log, logError } from '../utils/logger.js';
import { stopMoving } from './movement.js';

export const registerEvents = (bot, state) => {
  bot.on('spawn', () => log('Event', 'Bot spawned'));

  bot.on('health', () => {
    if (bot.health <= 6) log('Event', `Low health: ${bot.health}`);
  });

  bot.on('death', () => {
    log('Event', 'Bot died, respawning');
    state.setMode('idle');
    stopMoving(bot);
  });

  bot.on('kicked', (reason) => log('Event', `Kicked: ${reason}`));

  bot.on('error', (err) => logError('Bot', err));

  bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) log('Event', `Took damage, health: ${bot.health}`);
  });

  bot.on('playerCollect', () => {});

  bot.on('rain', () => {});

  process.on('unhandledRejection', (err) => logError('UnhandledRejection', err));
  process.on('uncaughtException', (err) => logError('UncaughtException', err));
};
