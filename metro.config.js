const { getDefaultConfig } = require('expo/metro-config');

// Polyfill for toReversed if not available
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

let config;
try {
  config = getDefaultConfig(__dirname);
} catch (e) {
  console.warn('Error loading default metro config, using minimal config:', e.message);
  config = {
    resolver: {
      sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
      assetExts: []
    },
    transformer: {
      getTransformOptions: async () => ({
        transform: { experimentalImportSupport: false, inlineRequires: true }
      })
    }
  };
}

// Prevent metro from trying to bundle wasm files as JavaScript
const originalGetSourceExts = config.resolver.getSourceExts;
if (originalGetSourceExts) {
  config.resolver.getSourceExts = function () {
    const exts = originalGetSourceExts.apply(this, arguments);
    // Remove wasm from source extensions so it's treated as an asset
    return exts.filter(ext => ext !== 'wasm');
  };
}

// Make sure wasm files are treated as asset extensions
if (!config.resolver.assetExts) {
  config.resolver.assetExts = [];
}
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;

