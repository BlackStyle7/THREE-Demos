const Clock = class {
  constructor() {
    this.totalTime = 0;
    this.frameTime = 0;
  }

  update(time) {
    this.frameTime = (time - this.totalTime) / 1000;
    if (this.frameTime > 0.5) this.frameTime = 0.017;
    this.totalTime = time;
  }
};

export default Clock;
