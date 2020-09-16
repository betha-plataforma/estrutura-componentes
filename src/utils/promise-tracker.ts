export class PromiseTracker {

  private counter: number = 0;
  private active: boolean = false;

  constructor(private activeCallback) {
  }

  addPromise(promise): void {
    this.counter++;

    this.updateActive();

    promise.then(() => {
      this.counter--;
      this.updateActive();
    }).catch(() => {
      this.counter--;
      this.updateActive();
    });
  }

  private updateActive(): void {
    const active = this.counter > 0;

    if (active !== this.active) {
      this.active = active;

      this.activeCallback(this.active);
    }
  }
}
