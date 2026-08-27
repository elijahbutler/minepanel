import { Injectable } from '@nestjs/common';

@Injectable()
export class ServerLifecycleLockService {
  private readonly tails = new Map<string, Promise<void>>();

  async runExclusive<T>(serverId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(serverId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.catch(() => undefined).then(() => current);
    this.tails.set(serverId, tail);

    await previous.catch(() => undefined);
    try {
      return await operation();
    } finally {
      release();
      if (this.tails.get(serverId) === tail) {
        this.tails.delete(serverId);
      }
    }
  }
}
