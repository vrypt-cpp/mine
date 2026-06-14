export class StateManager {
  constructor(bot) {
    this.bot = bot;
    this.mode = 'idle';
    this.lastModeChange = Date.now();
    this.targetEntity = null;
    this.fleeTarget = null;
    this.busy = false;
  }

  setMode(mode) {
    if (this.mode !== mode) {
      this.mode = mode;
      this.lastModeChange = Date.now();
    }
  }

  timeSinceModeChange() {
    return Date.now() - this.lastModeChange;
  }

  isMode(m) { return this.mode === m; }
}
