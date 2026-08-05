// Browser polyfill for node:async_hooks used by @tanstack/react-start
export class AsyncLocalStorage<T = any> {
  disable() {}
  getStore(): T | undefined { return undefined; }
  run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R {
    return callback(...args);
  }
  exit<R>(callback: (...args: any[]) => R, ...args: any[]): R {
    return callback(...args);
  }
  enterWith(_store: T) {}
}

export class AsyncResource {
  runInAsyncScope(fn: (...args: any[]) => any, ...args: any[]) {
    return fn(...args);
  }
  emitDestroy() {}
  asyncId() { return 0; }
  triggerAsyncId() { return 0; }
}

const asyncHooks = { AsyncLocalStorage, AsyncResource };
export default asyncHooks;
