# Mineflayer Survival Bot

AI survival bot: cari makan, hindari bahaya (lava, jurang, mob), bertarung, healing. Murni mineflayer + pathfinder (library navigasi, bukan plugin behavior).

## Setup
```
npm install
```

## Run
```
MC_HOST=localhost MC_PORT=25565 MC_USERNAME=Bot1 MC_VERSION=1.20.4 npm start
```

## Struktur
- `src/config.js` - konfigurasi & threshold
- `src/modules/danger.js` - deteksi bahaya
- `src/modules/movement.js` - navigasi & flee
- `src/modules/food.js` - makan, hunting, panen
- `src/modules/combat.js` - bertarung
- `src/modules/shelter.js` - shelter darurat
- `src/modules/brain.js` - decision loop prioritas
- `src/modules/events.js` - event handler
- `src/modules/state.js` - state management
