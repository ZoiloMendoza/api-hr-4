
class StoragePlugin {

  config = {};
    
  constructor(config, params) {
    for (let param of params) {
        if (!config[param]) {
            throw new Error(`Missing ${param}`);
        }
        this.config[param] = config[param];
    }
  }

  async upload(file) {
    throw new Error('Method "upload" must be implemented');
  }

  async download(fileId, fileStream) {
    throw new Error('Method "download" must be implemented');
  }

    async delete(fileId) {
        throw new Error('Method "delete" must be implemented');
    }
}

module.exports = StoragePlugin;
