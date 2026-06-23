function installExpoGlobalPolyfill() {
  if (globalThis.expo) return;
  globalThis.expo = {
    EventEmitter: class {},
    NativeModule: {},
    SharedObject: class {},
    SharedRef: class {},
    modules: {},
    uuidv4: () => '00000000-0000-0000-0000-000000000000',
    uuidv5: () => '00000000-0000-0000-0000-000000000000',
    getViewConfig: () => { throw new Error('Method not implemented.'); },
    reloadAppAsync: async () => {},
    expoModulesCoreVersion: undefined,
    cacheDir: undefined,
    documentsDir: undefined,
  };
}

module.exports = { installExpoGlobalPolyfill };
