import { ServerLifecycleLockService } from './server-lifecycle-lock.service';

describe('ServerLifecycleLockService', () => {
  it('serializes operations for the same server', async () => {
    const lock = new ServerLifecycleLockService();
    let releaseFirst!: () => void;
    const firstCanFinish = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let markFirstStarted!: () => void;
    const firstStarted = new Promise<void>((resolve) => {
      markFirstStarted = resolve;
    });
    const calls: string[] = [];

    const first = lock.runExclusive('bed', async () => {
      calls.push('first-start');
      markFirstStarted();
      await firstCanFinish;
      calls.push('first-end');
    });
    const second = lock.runExclusive('bed', async () => {
      calls.push('second');
    });

    await firstStarted;
    expect(calls).toEqual(['first-start']);

    releaseFirst();
    await Promise.all([first, second]);
    expect(calls).toEqual(['first-start', 'first-end', 'second']);
  });

  it('does not block operations for different servers', async () => {
    const lock = new ServerLifecycleLockService();
    let releaseFirst!: () => void;
    const firstCanFinish = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const otherServerRan = jest.fn();

    const first = lock.runExclusive('bed-a', () => firstCanFinish);
    await lock.runExclusive('bed-b', async () => {
      otherServerRan();
    });

    expect(otherServerRan).toHaveBeenCalledTimes(1);
    releaseFirst();
    await first;
  });
});
