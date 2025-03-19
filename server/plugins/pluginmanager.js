const plugins = {};

const PluginManager = {
  name: 'plugin-manager',
  loadPlugin(type, config) {
    if (!plugins[type]) {
      // Dynamically load the plugin based on type
      const PluginClass = require(`../plugins/${type}`);
      plugins[type] = new PluginClass(config);
    }
    return plugins[type];
  },

  getPlugin(type) {
    return plugins[type];
  }
};

module.exports = PluginManager;
