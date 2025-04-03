const VaultClient = require('node-vault-client');
const vaultClient = VaultClient.boot('main', {
    api: { url: process.env.VAULT_SERVER },
    auth: {
        type: 'appRole', // or 'token', 'iam'
        config: {
            role_id: process.env.VAULT_ROLEID,
            secret_id: process.env.VAULT_SECRETID,
        },
    },
});

async function config() {
    logger.info(i18n.__('info.config.start'));
    try {
        const result = await vaultClient.read(process.env.VAULT_SECRET);
        for (let key in result.__data.data) {
            if (!process.env[key]) {
                process.env[key] = result.__data.data[key];
            }
        }
        logger.info(i18n.__('info.config.read'));
    } catch (error) {
        logger.error(i18n.__('error.config.read'));
    }
}

async function addProperty(name, value) {
    try {
        await vaultClient.write(process.env.VAULT_SECRET, { [name]: value });
        logger.info(i18n.__('info.config.added', { name }));
    } catch (error) {
        logger.error(i18n.__('error.config.added', { name }));
    }
}

module.exports = { config, addProperty };
