const i18n = require('i18n');
const fs = require('fs');
const path = require('path');


const translations = {};

function addLocaleFile(locale, file) {
  // get i18n catalog instance
  let catalog = i18n.getCatalog();
  if (!catalog) {
      return;
  }

  // load file
  let localeFile = fs.readFileSync(file);
  let newLocale = JSON.parse(localeFile);
  
  // merge existing with new locales
  catalog[locale] = catalog[locale] ? {...catalog[locale], ...newLocale } : newLocale;
};

i18n.configure({
  locales:  Object.keys(translations),
  directory: path.join(__dirname, '../../'),
  defaultLocale: 'es',
  cookie: 'locale',
  queryParameter: 'lang',
  autoReload: true,
  updateFiles: false,
  syncFiles: true,
});

function loadLocales(dir) {
  if (fs.existsSync(dir)) {
    logger.info(`Loading translations for module ${dir}`);
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.json')) {
        const lang = file.replace('.json', '');
        const filePath = path.join(dir, file);
        addLocaleFile(lang, filePath);
      }
    });
  }
}


console.log(path.join(__dirname, '..', 'locales'));
loadLocales(path.join(__dirname, '..' , 'locales'));
fs.readdirSync(path.join(__dirname, '../../', 'modules')).forEach(moduleName => {
  if (fs.lstatSync(path.join(__dirname, '../../', 'modules', moduleName)).isDirectory()) {
  const moduleTranslations = path.join(__dirname, '../../', 'modules', moduleName, 'locales');
  loadLocales(moduleTranslations);
}
  });

module.exports = i18n;
