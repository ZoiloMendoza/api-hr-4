const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

module.exports = {
  asyncLocalStorage,
  runWithContext: (callback) => {
    asyncLocalStorage.run(new Map(), callback);
  },
  set: (key, value) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  },
  get: (key) => {
    const store = asyncLocalStorage.getStore();
    return store ? store.get(key) : null;
  },
};
