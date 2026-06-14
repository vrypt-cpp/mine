export const config = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT || '25565'),
  username: process.env.MC_USERNAME || 'SurvivalBot',
  version: process.env.MC_VERSION || false,
  auth: process.env.MC_AUTH || 'offline',
  thresholds: { health: 10, food: 14, lowHealth: 6, criticalHealth: 4 },
  combat: { fleeHealth: 5, attackRange: 3.2, sweepRange: 4 },
  food: { searchRadius: 32, eatThreshold: 17 },
  danger: { lavaCheck: true, mobCheckRadius: 16, fallCheckEnabled: true },
  loop: { tickMs: 500 },
  api: { port: parseInt(process.env.STATS_PORT || '3000') }
};
