import mineflayer from 'mineflayer';
import { config } from './config.js';
import { initMovement, loadPathfinderPlugin } from './modules/movement.js';
import { registerEvents } from './modules/events.js';
import { StateManager } from './modules/state.js';
import { decideAndAct } from './modules/brain.js';
import { startStatsServer } from './modules/statsApi.js';
import { log, logError } from './utils/logger.js';

const start = () => {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: config.auth
  });

  loadPathfinderPlugin(bot);
  const state = new StateManager(bot);
  registerEvents(bot, state);

  bot.once('spawn', () => {
    log('Main', `Connected as ${bot.username} on ${config.host}:${config.port}`);
    initMovement(bot);
    startStatsServer(bot, state, config.api.port);
    setInterval(() => {
      decideAndAct(bot, state).catch(err => logError('Loop', err));
    }, config.loop.tickMs);
  });

  bot.on('end', () => {
    log('Main', 'Disconnected, reconnecting in 5s');
    setTimeout(start, 5000);
  });
};

start();
