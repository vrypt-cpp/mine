import http from 'http';
import { log, logError } from '../utils/logger.js';

export const startStatsServer = (bot, state, port = 3000) => {
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const pos = bot.entity?.position;
      res.end(JSON.stringify({
        status: 'ok',
        username: bot.username,
        health: bot.health ?? null,
        food: bot.food ?? null,
        oxygen: bot.oxygenLevel ?? null,
        experience: bot.experience?.level ?? null,
        position: pos ? { x: pos.x, y: pos.y, z: pos.z } : null,
        dimension: bot.game?.dimension ?? null,
        mode: state.mode,
        timeSinceModeChange: state.timeSinceModeChange(),
        gameTime: bot.time?.timeOfDay ?? null,
        isRaining: bot.isRaining ?? null,
        inventoryCount: bot.inventory?.items().length ?? 0,
        heldItem: bot.heldItem?.name ?? null,
        ping: bot.player?.ping ?? null,
        uptime: process.uptime()
      }, null, 2));
      return;
    }

    if (req.url === '/inventory') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const items = bot.inventory?.items().map(i => ({
        name: i.name,
        count: i.count,
        slot: i.slot
      })) ?? [];
      res.end(JSON.stringify({ items }, null, 2));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found', routes: ['/health', '/stats', '/inventory'] }));
  });

  server.listen(port, () => log('StatsAPI', `Listening on port ${port}`));
  server.on('error', (err) => logError('StatsAPI', err));

  return server;
};
