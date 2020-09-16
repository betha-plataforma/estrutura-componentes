// @ts-nocheck
export function setupBethaEnvs() {
  window.___bth = {
    envs: {}
  };
}

export function setupTestingEnvs() {
  window.___testing = {};
}

export function setupFetch() {
  window.fetch = () => {
    console.debug('[fetch] (mock)');
    return Promise.resolve({
      status: window.___testing?.fetch?.status || 200,
      json: () => Promise.resolve(window.___testing?.fetch?.responseData || { success: true })
    });
  };
}

export function setupLocalStorage() {
  let store = {};
  window.localStorage = (() => {
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => store[key] = value.toString(),
      removeItem: (key) => delete store[key],
      clear: () => store = {}
    };
  })();
}
